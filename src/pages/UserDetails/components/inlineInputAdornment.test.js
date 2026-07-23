import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('nickname dice uses the optional inline input adornment area', async () => {
    const inlineInputSource = await readFile(
        new URL('./InlineInput.jsx', import.meta.url),
        'utf8',
    );
    const surveySource = await readFile(
        new URL('../../Surveys/SurveyIntroduce.jsx', import.meta.url),
        'utf8',
    );

    assert.match(inlineInputSource, /endAdornment/);
    assert.match(inlineInputSource, /endAdornment \? "pr-12" : ""/);
    assert.match(inlineInputSource, /absolute inset-y-0 right-1 flex items-center/);
    assert.match(surveySource, /endAdornment=\{/);
    assert.match(surveySource, /aria-label="무작위 닉네임 생성"/);
    assert.doesNotMatch(surveySource, /flex items-end gap-2/);
});
