const koreanCollator = new Intl.Collator('ko-KR', {
    sensitivity: 'base',
});

export function sortKoreanItems(items) {
    return [...items].sort(koreanCollator.compare);
}
