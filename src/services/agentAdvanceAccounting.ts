export function getAgentAdvanceOutstandingKsh(
  amountIssuedKsh: number,
  amountSettledKsh: number
): number {
  return Math.max(0, Number(amountIssuedKsh || 0) - Number(amountSettledKsh || 0));
}
