import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  hasMissingSurveyIntroduceFields,
  isSurveyBadRequest,
} from './surveyIntroduceValidation.js';

const completeFields = {
  nickname: '이룸매',
  introduce: '안녕하세요.',
  visibleProfileFields: ['BEDTIME'],
};

test('detects missing SurveyIntroduce required fields', () => {
  assert.equal(hasMissingSurveyIntroduceFields(completeFields), false);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, nickname: '   ' }), true);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, introduce: '' }), true);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, visibleProfileFields: [] }), true);
});

test('recognizes only HTTP 400 as a SurveyIntroduce bad request', () => {
  assert.equal(isSurveyBadRequest({ response: { status: 400 } }), true);
  assert.equal(isSurveyBadRequest({ response: { status: 500 } }), false);
  assert.equal(isSurveyBadRequest(new Error('network failure')), false);
});

test('SurveyIntroduce opens the required modal before requests and on HTTP 400', async () => {
  const source = await readFile(
    new URL('./SurveyIntroduce.jsx', import.meta.url),
    'utf8',
  );
  const missingCheckIndex = source.indexOf('hasMissingSurveyIntroduceFields({');
  const incompleteDraftIndex = source.indexOf('if (incompletePagePath)');
  const firstRequestIndex = source.indexOf('await changeNickname');

  assert.match(source, /<RequiredFieldsModal/);
  assert.match(source, /isSurveyBadRequest\(error\)/);
  assert.doesNotMatch(source, /navigate\(incompletePagePath\)/);
  assert.ok(missingCheckIndex >= 0 && missingCheckIndex < firstRequestIndex);
  assert.ok(incompleteDraftIndex >= 0 && incompleteDraftIndex < firstRequestIndex);
});
