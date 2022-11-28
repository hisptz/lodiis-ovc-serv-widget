import {DateTime} from "luxon";

export const PROGRAM = "em38qztTI8s";
export const SERVICE_PROVISION_PROGRAM_STAGE = "CHFwighOquA";
export const DISTRICT_LEVEL = "2";


export const ATTRIBUTES: Record<string, string | { attribute: string; getter: (value?: string) => any }> = {
    sex: "vIX4GTSCX4P",
    active: "PN92g65TkVI",
    age: {
        attribute: "qZP982qpSPS",
        getter: (value?: string) => {
            console.log(value)
            if (value) {
                const dateOfBirth = DateTime.fromISO(value);
                return dateOfBirth.diffNow().negate().shiftTo("years").years;
            }
        }
    },
    primaryVulnerability: "mTv9eZZq0Nz"
}


export const SERVICE_PROVISION_DATA_ELEMENTS = [
    'HzI5X2yHef6',
    'mRoO7kgpgVg',
    'GNQ3gDA2CTI',
    'gSp9bgPW52L',
    'mY7GqOTKtsQ',
    'FRWCmEerPic',
    'qL9c5r7c6kK',
    'gV77yUM8NK8',
    'otd2tndsE4Z',
    'mY7GqOTKtsQ',
    'r8wPQAog7PJ',
    'ESIjwQ9S6Ic',
    'KkqMjxjAR7g',
    'UKczyQWCB0L',
    'YFgrURiwirq',
    'JnqldNamliR',
    'zK7kMYpgPQn',
    'tnspdPfpuXm',
    'DoU7AeHDsUs',
    'QnFYeBNZlbf',
    'eqhzeRBMftZ',
]
