import type { Prisma, PrismaClient } from "@prisma/client";

export class AppStateService {
  private readonly writeChains = new Map<string, Promise<void>>();

  constructor(private readonly prisma: PrismaClient) {}

  async getJson<T>(key: string): Promise<T | null> {
    const row = await this.prisma.appState.findUnique({
      where: { key },
      select: { value: true }
    });

    return (row?.value as T | undefined) ?? null;
  }

  async setJson(key: string, value: unknown): Promise<void> {
    const jsonValue = value as Prisma.InputJsonValue;
    await this.prisma.appState.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue }
    });
  }

  queueSetJson(key: string, value: unknown): Promise<void> {
    const previous = this.writeChains.get(key) ?? Promise.resolve();

    const next = previous
      .catch(() => {
        // Keep queue alive after an earlier failure.
      })
      .then(async () => {
        await this.setJson(key, value);
      });

    this.writeChains.set(key, next);
    return next;
  }
}
