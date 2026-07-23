import assert from 'node:assert/strict';
import test from 'node:test';
import { sortKoreanItems } from './sortKoreanItems.js';

test('학부와 학과를 한국어 오름차순으로 정렬한다', () => {
    const items = ['컴퓨터과학부', '건축학부', '경영학부', '국어국문학과'];

    assert.deepEqual(
        sortKoreanItems(items),
        ['건축학부', '경영학부', '국어국문학과', '컴퓨터과학부'],
    );
});

test('전달받은 원본 배열을 변경하지 않는다', () => {
    const items = ['컴퓨터과학부', '건축학부'];

    sortKoreanItems(items);

    assert.deepEqual(items, ['컴퓨터과학부', '건축학부']);
});
