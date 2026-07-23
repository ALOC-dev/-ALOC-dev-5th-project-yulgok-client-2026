export const NICKNAME_FIRST_WORDS = [
    '맛있는',
    '용감한',
    '졸린',
    '침착한',
    '귀여운',
    '레전드',
    '밤티',
    '야르한',
    '행복한',
    '맛없는',
    '예쁜',
    '잘생긴',
    '힘센',
];

export const NICKNAME_SECOND_WORDS = [
    '개구리',
    '감자',
    '핫도그',
    '이루매',
    '참새',
    '햄스터',
    '돼지',
    '아저씨',
    '아줌마',
    '토마토',
    '돈까스',
    '양배추',
    '마법사',
];

export function generateRandomNickname(random = Math.random) {
    const firstWord = NICKNAME_FIRST_WORDS[
        Math.floor(random() * NICKNAME_FIRST_WORDS.length)
    ];
    const secondWord = NICKNAME_SECOND_WORDS[
        Math.floor(random() * NICKNAME_SECOND_WORDS.length)
    ];

    return `${firstWord} ${secondWord}`;
}
