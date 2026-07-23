import test from 'node:test';
import assert from 'node:assert/strict';

import {
    NICKNAME_FIRST_WORDS,
    NICKNAME_SECOND_WORDS,
    generateRandomNickname,
} from './nicknameGenerator.js';

test('각 목록에서 한 단어씩 골라 공백으로 연결한다', () => {
    const nickname = generateRandomNickname(() => 0);

    assert.equal(
        nickname,
        `${NICKNAME_FIRST_WORDS[0]} ${NICKNAME_SECOND_WORDS[0]}`,
    );
});

test('생성되는 모든 닉네임은 8자 이내다', () => {
    for (const firstWord of NICKNAME_FIRST_WORDS) {
        for (const secondWord of NICKNAME_SECOND_WORDS) {
            assert.ok(`${firstWord} ${secondWord}`.length <= 8);
        }
    }
});
