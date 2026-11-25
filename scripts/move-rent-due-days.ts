// Moves every house in a building to one rent due day, except named houses.
// Fixes houses whose due day was set from the date a setup sheet was saved.
//
//   tsx scripts/move-rent-due-days.ts --building CAPTYN-BLDG-00002 --day 1 --except 37:26
//   ... --apply      (only with the housing API stopped: it keeps the ledger in
//                     memory and would write the old due dates back)
//
// Each house keeps its balance and its current billing month; only the day
// changes. If the new day means next month's rent is already within its
// 7-day window, the API adds it when it starts, as for any other house.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const RENT_LEDGER_STATE_KEY = "rent_ledger_v1";

type LedgerRecord = { buildingId?: string; houseNumber?: string; dueDate?: string; balanceKsh?: number; monthlyRentKsh?: number };

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function withDay(dueDate: string, day: number): string {
  const date = new Date(dueDate);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}

async function main() {
  const buildingId = String(argument("building") ?? "").trim().toUpperCase();
  const day = Number(argument("day") ?? 1);
  const apply = process.argv.includes("--apply");
  if (!buildingId || !Number.isInteger(day) || day < 1 || day > 28) {
    throw new Error("Use --building <id> --day <1-28> [--except house:day,...] [--apply]");
  }
  const exceptions = new Map<string, number>();
  for (const item of String(argument("except") ?? "").split(",").filter(Boolean)) {
    const [house, houseDay] = item.split(":");
    const parsed = Number(houseDay);
    if (!house || !Number.isInteger(parsed) || parsed < 1 || parsed > 28) {
      throw new Error(`Bad exception "${item}". Use house:day, e.g. 37:26.`);
    }
    exceptions.set(house.trim().toUpperCase(), parsed);
  }

  const row = await prisma.appState.findUnique({ where: { key: RENT_LEDGER_STATE_KEY } });
  if (!row) throw new Error("Rent ledger state not found.");
  const state = row.value as { records?: LedgerRecord[] };
  const records = (state.records ?? []).filter(
    (record) => String(record.buildingId ?? "").toUpperCase() === buildingId && record.dueDate
  );

  const changes: Array<{ house: string; from: string; to: string; day: number }> = [];
  for (const record of records) {
    const house = String(record.houseNumber ?? "").toUpperCase();
    const targetDay = exceptions.get(house) ?? day;
    const next = withDay(String(record.dueDate), targetDay);
    if (next !== record.dueDate) {
      changes.push({ house, from: String(record.dueDate).slice(0, 10), to: next.slice(0, 10), day: targetDay });
      if (apply) record.dueDate = next;
    }
  }
  changes.sort((a, b) => a.house.localeCompare(b.house, undefined, { numeric: true }));
  console.table(changes);
  console.log(`${changes.length} of ${records.length} houses change due date.`);
  const missing = [...exceptions.keys()].filter((house) => !records.some((r) => String(r.houseNumber).toUpperCase() === house));
  if (missing.length) console.log(`Not in the ledger: ${missing.join(", ")}`);

  if (!apply) {
    console.log("Dry run. Stop the housing API, then re-run with --apply.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.appState.update({ where: { key: RENT_LEDGER_STATE_KEY }, data: { value: state as object } });
    await tx.buildingConfiguration.updateMany({ where: { buildingId }, data: { defaultRentDueDay: day } });
    // Saved per-house due days would put the old day back on the next setup save.
    for (const record of records) {
      const house = String(record.houseNumber ?? "");
      const targetDay = exceptions.get(house.toUpperCase()) ?? day;
      await tx.roomRentDefault.updateMany({ where: { buildingId, houseNumber: house }, data: { paymentDueDay: targetDay } });
      await tx.tenantAgreement.updateMany({ where: { buildingId, houseNumber: house }, data: { paymentDueDay: targetDay } });
    }
  });
  console.log("Applied. Start the housing API.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
