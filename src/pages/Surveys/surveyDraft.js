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

export function replaceSurveyDraft(nextDraft) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    return nextDraft;
}

export function clearSurveyDraft() {
    sessionStorage.removeItem(STORAGE_KEY);
}

export function getSurveyPath(path, isEditMode) {
    return isEditMode ? `${path}?mode=edit` : path;
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

export function getFirstIncompleteSurveyPath(draft, isEditMode = false) {
    const incompletePage = REQUIRED_FIELDS_BY_PAGE.find(({ fields }) =>
        fields.some(([field, minimum, maximum]) => !isValidNumber(draft[field], minimum, maximum)),
    );

    return incompletePage ? getSurveyPath(incompletePage.path, isEditMode) : null;
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

const ANSWER_FIELD_MAP = {
    bedtime: 'BEDTIME',
    snoring: 'SNORING',
    sleepTalking: 'SLEEP_TALKING',
    organizingStyle: 'ORGANIZING_STYLE',
    eatingInRoom: 'EATING_IN_ROOM',
    temperaturePreference: 'TEMPERATURE_PREFERENCE',
    showerFrequency: 'SHOWER_FREQUENCY',
    speakerStyle: 'SPEAKER_STYLE',
    callInRoom: 'CALL_IN_ROOM',
};

function toIntegerOrNull(value) {
    const numberValue = Number(value);
    return Number.isInteger(numberValue) ? numberValue : null;
}

function findAnswerValue(survey, fieldName) {
    const answers = survey?.answers ?? {};
    const enumName = ANSWER_FIELD_MAP[fieldName];
    const preferredAnswer = Array.isArray(survey?.preferredAnswers)
        ? survey.preferredAnswers.find((answer) => answer?.field === enumName)
        : null;

    return answers[fieldName] ?? survey?.[fieldName] ?? preferredAnswer?.value ?? null;
}

export function mapSurveyResponseToDraft(survey) {
    return {
        bedtime: toIntegerOrNull(findAnswerValue(survey, 'bedtime')),
        snoring: toIntegerOrNull(findAnswerValue(survey, 'snoring')),
        sleepTalking: toIntegerOrNull(findAnswerValue(survey, 'sleepTalking')),
        organizingStyle: toIntegerOrNull(findAnswerValue(survey, 'organizingStyle')),
        eatingInRoom: toIntegerOrNull(findAnswerValue(survey, 'eatingInRoom')),
        temperaturePreference: toIntegerOrNull(findAnswerValue(survey, 'temperaturePreference')),
        showerFrequency: toIntegerOrNull(findAnswerValue(survey, 'showerFrequency')),
        speakerStyle: toIntegerOrNull(findAnswerValue(survey, 'speakerStyle')),
        callInRoom: toIntegerOrNull(findAnswerValue(survey, 'callInRoom')),
        smokingStatus: toIntegerOrNull(survey?.smokingStatus),
        introduce: typeof survey?.introduce === 'string' ? survey.introduce : '',
        visibleProfileFields: Array.isArray(survey?.visibleProfileFields)
            ? survey.visibleProfileFields
            : [],
    };
}
