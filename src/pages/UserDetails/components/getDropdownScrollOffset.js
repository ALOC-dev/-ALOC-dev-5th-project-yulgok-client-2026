export function getDropdownScrollOffset(
  menuBottom,
  viewportHeight,
  bottomMargin = 16,
) {
  return Math.max(0, menuBottom + bottomMargin - viewportHeight);
}
