import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('DropDownMenu smoothly scrolls only when its opened listbox overflows', async () => {
  const source = await readFile(
    new URL('./DropDownMenu.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /getDropdownScrollOffset/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /getBoundingClientRect\(\)\.bottom/);
  assert.match(
    source,
    /window\.scrollBy\(\{\s*top: scrollOffset,\s*behavior: "smooth"/s,
  );
  assert.match(source, /cancelAnimationFrame/);
});
