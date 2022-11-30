import {DateTime} from "luxon";
import {VisualizationDefaultConfig} from "../interfaces";

export const PROGRAM = "em38qztTI8s";
export const SERVICE_PROVISION_PROGRAM_STAGE = "CHFwighOquA";
export const DISTRICT_LEVEL = "2";


export const ATTRIBUTES: Record<string, string | { attribute: string; getter: (value?: string) => any }> = {
    sex: "vIX4GTSCX4P",
    active: "PN92g65TkVI",
    age: {
        attribute: "qZP982qpSPS",
        getter: (value?: string) => {
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


export const VISUALIZATIONS: VisualizationDefaultConfig[] = [
    {
        id: "ovc_serv_by_sex",
        title: "OVC SERV by Sex",
        defaultLayout: {
            filter: ["pe"],
            category: ["ou"],
            series: ["dx"]
        },
        data: [
            {
                title: "OVC SERV Male",
                filter: (data) => data.filter(datum => datum.attributes.sex === "Male")
            },
            {
                title: "OVC SERV Female",
                filter: (data) => data.filter(datum => datum.attributes.sex === "Female")
            },
        ],
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedBar"
        ],
        defaultVisualizationType: "table"
    }
]
