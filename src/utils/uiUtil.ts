// ====================== Mode ======================
export function getRealPlacement(placement: string, rtl: boolean) {
  if (placement !== undefined) {
    return placement;
  }
  return rtl ? 'bottomRight' : 'bottomLeft';
}
