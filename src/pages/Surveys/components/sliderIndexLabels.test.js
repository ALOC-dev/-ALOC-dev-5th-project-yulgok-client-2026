import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Slider supports optional positioned index labels', async () => {
  const source = await readFile(
    new URL('./Slider.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /indexLabels/);
  assert.match(source, /Array\.isArray\(indexLabel\)/);
  assert.match(source, /indexLabel\.map/);
  assert.match(source, /className="block"/);
  assert.match(source, /const displayedIndexLabels = \{/);
  assert.match(source, /1: leftDescription/);
  assert.match(source, /\[lastValue\]: rightDescription/);
  assert.match(source, /\.\.\.indexLabels/);
  assert.match(source, /displayedIndexLabels\[item\]/);
  assert.doesNotMatch(source, /\{\(leftDescription \|\| rightDescription\) && \(/);
  assert.match(source, /text-\[10px\]/);
  assert.match(source, /whitespace-nowrap/);
  assert.match(source, /-translate-x-1\/2/);
  assert.match(source, /h-8/);
});

test('SurveySleep aligns all bedtime descriptions through one index label map', async () => {
  const source = await readFile(
    new URL('../SurveySleep.jsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /label="취침 시간대"\s*indexLabels=\{\{\s*1: \['10시', '이전'\],\s*2: '10시~11시',\s*3: '11시~12시',\s*4: '12시~1시',\s*5: \['새벽 1시', '이후'\],?\s*\}\}/,
  );
});

test('sleep and clean survey sliders label value 3 as average', async () => {
  const sleepSource = await readFile(
    new URL('../SurveySleep.jsx', import.meta.url),
    'utf8',
  );
  const cleanSource = await readFile(
    new URL('../SurveyClean.jsx', import.meta.url),
    'utf8',
  );

  assert.match(
    sleepSource,
    /value=\{snoring\}[\s\S]*?indexLabels=\{\{\s*3: '보통',?\s*\}\}/,
  );
  assert.match(
    sleepSource,
    /value=\{sleepTalking\}[\s\S]*?indexLabels=\{\{\s*3: '보통',?\s*\}\}/,
  );
  assert.match(
    cleanSource,
    /value=\{organizingStyle\}[\s\S]*?indexLabels=\{\{\s*3: '보통',?\s*\}\}/,
  );
});
