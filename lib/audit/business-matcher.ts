function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|corp|co|ltd|pllc|pc)\b/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalizeName(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalizeName(b).split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1;
  }

  return overlap / Math.max(tokensA.size, tokensB.size);
}

export function findBusinessPosition(
  businesses: string[],
  targetName: string,
): { mentioned: boolean; position: number | null } {
  const normalizedTarget = normalizeName(targetName);

  for (let i = 0; i < businesses.length; i += 1) {
    const business = businesses[i];
    const normalizedBusiness = normalizeName(business);

    if (
      normalizedBusiness === normalizedTarget ||
      normalizedBusiness.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedBusiness) ||
      tokenOverlap(business, targetName) >= 0.6
    ) {
      return { mentioned: true, position: i + 1 };
    }
  }

  return { mentioned: false, position: null };
}
