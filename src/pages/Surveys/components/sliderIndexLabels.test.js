import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Slider supports optional positioned index labels', async () => {
  const source = await readFile(
    new URL('./Slider.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /indexLabels/);
  assert.match(source, /indexLabels\[item\]/);
  assert.match(source, /text-\[10px\]/);
  assert.match(source, /whitespace-nowrap/);
});

test('SurveySleep maps bedtime values 2, 3, and 4 to time ranges', async () => {
  const source = await readFile(
    new URL('../SurveySleep.jsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /indexLabels=\{\{\s*2: '10시~11시',\s*3: '11시~12시',\s*4: '12시~1시',?\s*\}\}/,
  );
});
