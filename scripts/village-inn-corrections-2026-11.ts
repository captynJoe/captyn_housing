// One-off corrections for Village Inn agreed with the owner on 25 Nov 2026:
// deposits per house, rent corrections (with December re-charged at the right
// rent), and house 40's water payment that was keyed as rent.
//
//   tsx scripts/village-inn-corrections-2026-11.ts            (dry run)
//   tsx scripts/village-inn-corrections-2026-11.ts --apply    (housing API stopped)
//
// Each house is checked against the figures seen on 25 Nov first; a house that
// has changed since is skipped and reported, never overwritten.

import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BUILDING = "CAPTYN-BLDG-00002";
const ACTOR = { actorRole: "landlord", actorName: "Owner (via support)" };
const apply = process.argv.includes("--apply");

// house: [deposit needed, deposit paid]
const DEPOSITS: Record<string, [number, number]> = {
  "3": [5000, 5000], "5": [4000, 4000], "6": [4500, 1500], "10": [5000, 3000],
  "12": [5500, 2500], "13": [5000, 4500], "15": [3500, 2000], "19": [4000, 1500],
  "22": [4000, 2000], "23": [4000, 4000], "25": [5000, 1000], "26": [4500, 0],
  "31": [4500, 2500], "33": [4500, 1500], "34": [5000, 1000], "37": [3500, 1500],
  "43": [5500, 4000], "45": [5000, 3500]
};

// Rent corrections. Balance = November still owed + December at the new rent.
const RENTS: Record<string, { rent: number; expectBalance: number; balance: number; why: string }> = {
  "2": { rent: 5500, expectBalance: 5000, balance: 6000, why: "rent is 5,500: November 500 still owed + December 5,500" },
  "5": { rent: 4000, expectBalance: 3500, balance: 4500, why: "rent is 4,000: paid 3,500 for November, 500 owed + December 4,000" },
  "6": { rent: 4500, expectBalance: 4000, balance: 4500, why: "rent is 4,500: November paid + December 4,500" },
  "12": { rent: 5500, expectBalance: 10000, balance: 8500, why: "rent is 5,500: November 3,000 owed + December 5,500; the other 2,500 was deposit" }
};

type LedgerRecord = { buildingId: string; houseNumber: string; monthlyRentKsh: number; balanceKsh: number; payments: Array<{ id: string; paidAt: string; amountKsh: number; rentAmountKsh?: number }> };
type Bill = { buildingId: string; houseNumber: string; utilityType: string; billingMonth: string; balanceKsh: number; status: string; updatedAt: string; payments?: unknown[] };

const report: string[] = [];
const skipped: string[] = [];
const audits: Array<{ houseNumber: string; action: string; summary: string; metadata: object }> = [];

async function main() {
  const ledgerRow = await prisma.appState.findUniqueOrThrow({ where: { key: "rent_ledger_v1" } });
  const utilityRow = await prisma.appState.findUniqueOrThrow({ where: { key: "utility_billing_v1" } });
  const ledger = ledgerRow.value as { records: LedgerRecord[] };
  const utility = utilityRow.value as { bills: Bill[] };
  const record = (house: string) => ledger.records.find((r) => r.buildingId === BUILDING && r.houseNumber === house);

  // Active tenancy agreement per house.
  const agreements = await prisma.tenantAgreement.findMany({
    where: { buildingId: BUILDING, tenancy: { active: true } },
    select: { id: true, houseNumber: true, monthlyRentKsh: true, depositKsh: true, depositPaidKsh: true }
  });
  const agreementOf = (house: string) => agreements.find((a) => a.houseNumber === house);

  const agreementUpdates: Array<{ id: string; data: Record<string, number> }> = [];
  const defaultUpdates: Array<{ house: string; rent: number }> = [];

  for (const [house, [needed, paid]] of Object.entries(DEPOSITS)) {
    const agreement = agreementOf(house);
    if (!agreement) { skipped.push(`${house}: no active tenant agreement`); continue; }
    if (Number(agreement.depositKsh ?? 0) > 0) { skipped.push(`${house}: deposit already set (${agreement.depositKsh}/${agreement.depositPaidKsh})`); continue; }
    agreementUpdates.push({ id: agreement.id, data: { depositKsh: needed, depositPaidKsh: paid } });
    report.push(`${house}: deposit ${needed}, paid ${paid}, due ${needed - paid}`);
    audits.push({ houseNumber: house, action: "deposit.paid.corrected", summary: `Deposit set: KSh ${needed.toLocaleString("en-US")} needed, KSh ${paid.toLocaleString("en-US")} paid, KSh ${(needed - paid).toLocaleString("en-US")} still due.`, metadata: { needed, paid } });
  }

  for (const [house, fix] of Object.entries(RENTS)) {
    const r = record(house);
    const agreement = agreementOf(house);
    if (!r || !agreement) { skipped.push(`${house}: no rent record or agreement`); continue; }
    if (r.balanceKsh !== fix.expectBalance) { skipped.push(`${house}: balance is ${r.balanceKsh}, expected ${fix.expectBalance}`); continue; }
    report.push(`${house}: rent ${r.monthlyRentKsh} -> ${fix.rent}, balance ${r.balanceKsh} -> ${fix.balance}`);
    audits.push({ houseNumber: house, action: "balance.rent.adjusted", summary: `Rent corrected from KSh ${r.monthlyRentKsh.toLocaleString("en-US")} to KSh ${fix.rent.toLocaleString("en-US")}; balance KSh ${r.balanceKsh.toLocaleString("en-US")} to KSh ${fix.balance.toLocaleString("en-US")} (${fix.why}).`, metadata: { previousRent: r.monthlyRentKsh, rent: fix.rent, previousKsh: r.balanceKsh, newKsh: fix.balance } });
    r.monthlyRentKsh = fix.rent;
    r.balanceKsh = fix.balance;
    const existing = agreementUpdates.find((u) => u.id === agreement.id);
    if (existing) existing.data.monthlyRentKsh = fix.rent;
    else agreementUpdates.push({ id: agreement.id, data: { monthlyRentKsh: fix.rent } });
    defaultUpdates.push({ house, rent: fix.rent });
  }

  // House 40: one 500 was the November water bill, the other a duplicate.
  const h40 = record("40");
  const water40 = utility.bills.find((b) => b.buildingId === BUILDING && b.houseNumber === "40" && b.utilityType === "water" && b.billingMonth === "2026-11");
  const fiveHundreds = (h40?.payments ?? []).filter((p) => Number(p.rentAmountKsh ?? p.amountKsh) === 500 && (p.paidAt.startsWith("2026-11-19") || p.paidAt.startsWith("2026-11-24")));
  if (!h40 || !water40 || fiveHundreds.length !== 2 || water40.balanceKsh !== 500 || h40.balanceKsh !== 3500) {
    skipped.push(`40: not as expected (rent ${h40?.balanceKsh}, 500s ${fiveHundreds.length}, water ${water40?.balanceKsh})`);
  } else {
    const [first, second] = fiveHundreds.sort((a, b) => a.paidAt.localeCompare(b.paidAt));
    h40.payments = h40.payments.filter((p) => p.id !== first.id && p.id !== second.id);
    water40.payments = [
      ...(water40.payments ?? []),
      { id: randomUUID(), note: "Moved from rent: keyed as rent on 19 Nov.", paidAt: first.paidAt, source: "manual", provider: "cash", amountKsh: 500, createdAt: new Date().toISOString(), buildingId: BUILDING, houseNumber: "40", utilityType: "water", billingMonth: "2026-11" }
    ];
    water40.balanceKsh = 0;
    water40.status = "clear";
    water40.updatedAt = new Date().toISOString();
    report.push("40: 500 (19 Nov) moved from rent to November water (now paid); duplicate 500 (24 Nov) removed; rent balance stays 3,500");
    audits.push({ houseNumber: "40", action: "rent.payment.corrected", summary: "Rent receipt of KSh 500 (19 Nov) was the November water bill: moved to water, now paid. Duplicate KSh 500 (24 Nov) removed.", metadata: { movedPaymentId: first.id, removedPaymentId: second.id } });
  }

  console.log(report.join("\n"));
  if (skipped.length) console.log(`\nSKIPPED:\n${skipped.join("\n")}`);
  if (!apply) { console.log("\nDry run. Stop the housing API, then re-run with --apply."); return; }

  await prisma.$transaction(async (tx) => {
    await tx.appState.update({ where: { key: "rent_ledger_v1" }, data: { value: ledger as object } });
    await tx.appState.update({ where: { key: "utility_billing_v1" }, data: { value: utility as object } });
    for (const update of agreementUpdates) await tx.tenantAgreement.update({ where: { id: update.id }, data: update.data });
    for (const item of defaultUpdates) {
      await tx.roomRentDefault.updateMany({ where: { buildingId: BUILDING, houseNumber: item.house }, data: { monthlyRentKsh: item.rent } });
    }
    for (const audit of audits) {
      await tx.roomAccountAuditEvent.create({ data: { buildingId: BUILDING, ...ACTOR, ...audit } });
    }
  });
  console.log("\nApplied. Start the housing API.");
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
