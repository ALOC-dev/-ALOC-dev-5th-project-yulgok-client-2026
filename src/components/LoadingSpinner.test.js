import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import LoadingSpinner from './LoadingSpinner.js';

test('renders an accessible loading status with a hidden label', () => {
  const markup = renderToStaticMarkup(
    LoadingSpinner({ label: '채팅방을 불러오는 중입니다.' }),
  );

  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /animate-spin/);
  assert.match(markup, /sr-only/);
  assert.match(markup, /채팅방을 불러오는 중입니다\./);
});

test('supports small and large spinner sizes', () => {
  const smallMarkup = renderToStaticMarkup(
    LoadingSpinner({ label: '처리 중입니다.', size: 'sm' }),
  );
  const largeMarkup = renderToStaticMarkup(
    LoadingSpinner({ label: '확인 중입니다.', size: 'lg' }),
  );

  assert.match(smallMarkup, /h-4 w-4/);
  assert.match(largeMarkup, /h-10 w-10/);
});
