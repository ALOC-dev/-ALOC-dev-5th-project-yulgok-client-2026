const STORAGE_KEY = 'surveyDraft';

export function loadSurveyDraft() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
}

export function saveSurveyDraft(partialDraft) {
    const draft = { ...loadSurveyDraft(), ...partialDraft };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return draft;
}

export function clearSurveyDraft() {
    sessionStorage.removeItem(STORAGE_KEY);
}

const REQUIRED_FIELDS_BY_PAGE = [
    {
        path: '/surveys/sleep',
        fields: [
            ['bedtime', 1, 5],
            ['snoring', 1, 5],
            ['sleepTalking', 1, 5],
        ],
    },
    {
        path: '/surveys/clean',
        fields: [
            ['organizingStyle', 1, 5],
            ['showerFrequency', 1, 4],
        ],
    },
    {
        path: '/surveys/living',
        fields: [
            ['smokingStatus', 0, 1],
            ['eatingInRoom', 1, 3],
            ['temperaturePreference', 1, 3],
            ['speakerStyle', 1, 3],
            ['callInRoom', 1, 3],
        ],
    },
];

function isValidNumber(value, minimum, maximum) {
    return Number.isInteger(value) && value >= minimum && value <= maximum;
}

export function getFirstIncompleteSurveyPath(draft) {
    const incompletePage = REQUIRED_FIELDS_BY_PAGE.find(({ fields }) =>
        fields.some(([field, minimum, maximum]) => !isValidNumber(draft[field], minimum, maximum)),
    );

    return incompletePage?.path ?? null;
}

export function buildSurveyRequestBody(draft) {
    return {
        smokingStatus: draft.smokingStatus,
        introduce: draft.introduce.trim(),
        answers: {
            bedtime: draft.bedtime,
            snoring: draft.snoring,
            sleepTalking: draft.sleepTalking,
            organizingStyle: draft.organizingStyle,
            eatingInRoom: draft.eatingInRoom,
            temperaturePreference: draft.temperaturePreference,
            showerFrequency: draft.showerFrequency,
            speakerStyle: draft.speakerStyle,
            callInRoom: draft.callInRoom,
        },
        visibleProfileFields: draft.visibleProfileFields,
    };
}
