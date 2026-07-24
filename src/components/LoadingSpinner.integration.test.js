import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('pending MyPage menu actions are disabled and keep accessible names', async () => {
  const source = await readSource('../pages/MyPage/MyPage.jsx');

  assert.match(source, /function MenuRow\(\{[^}]*disabled[^}]*ariaLabel/);
  assert.match(source, /disabled=\{isLoggingOut\}/);
  assert.match(source, /ariaLabel=\{isLoggingOut \? '로그아웃을 처리하는 중입니다\.'/);
});

test('inline loading buttons preserve their width while showing a spinner', async () => {
  const [adminSource, messageListSource] = await Promise.all([
    readSource('../pages/Admin/Admin.jsx'),
    readSource('../pages/Chat/components/MessageList.jsx'),
  ]);

  assert.match(adminSource, /min-w-20/);
  assert.match(messageListSource, /min-w-\[138px\]/);
});
