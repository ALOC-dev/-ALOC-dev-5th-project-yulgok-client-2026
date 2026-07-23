import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = [
    new URL('../UserDetails/UserDetails.jsx', import.meta.url),
    new URL('./SurveySleep.jsx', import.meta.url),
    new URL('./SurveyClean.jsx', import.meta.url),
    new URL('./SurveyLiving.jsx', import.meta.url),
    new URL('./SurveyIntroduce.jsx', import.meta.url),
];

test('pages keep progress and navigation outside a bounded scrolling body', async () => {
    for (const pagePath of pagePaths) {
        const source = await readFile(pagePath, 'utf8');
        const progressIndex = source.indexOf('<ProgressBar');
        const scrollIndex = source.indexOf('data-survey-scroll-region');
        const moveIndex = source.indexOf('<MoveBtnGroup');

        assert.match(source, /h-dvh/);
        assert.match(source, /overflow-hidden/);
        assert.match(source, /min-h-0 flex-1 overflow-y-auto/);
        assert.match(source, /shrink-0 bg-brand-background pt-3/);
        assert.ok(progressIndex >= 0 && progressIndex < scrollIndex);
        assert.ok(scrollIndex >= 0 && scrollIndex < moveIndex);
    }
});
