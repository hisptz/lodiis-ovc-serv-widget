import {DateTime} from "luxon";
import {VisualizationDefaultConfig} from "../interfaces";

export const PROGRAM = "em38qztTI8s";
export const SERVICE_PROVISION_PROGRAM_STAGE = "CHFwighOquA";
export const DISTRICT_LEVEL = "2";
export const LOWEST_LEVEL = 3;

export const VULNERABILITY_CRITERIA = [
    'Child of a sex worker (FSW)',
    'Child exposed/experiencing violence and abuse (Survivors of Vac)',
    'Child living with disability',
    'Orphan',
    'HIV exposed infants',
    'Child of PLHIV',
    'Child living with HIV'
]


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
        id: "ovc_serv",
        title: "OVC SERV",
        defaultLayout: {
            filter: ["pe"],
            category: ["ou"],
            series: ["dx"]
        },
        data: [{
            title: "OVC SERV",
            filter: (data) => data
        }],
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedColumn",
            "column"
        ],
        defaultVisualizationType: "stackedColumn"
    },
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
                title: "Male",
                filter: (data) => data.filter(datum => datum.attributes.sex === "Male")
            },
            {
                title: "Female",
                filter: (data) => data.filter(datum => datum.attributes.sex === "Female")
            },
        ],
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedColumn",
            "column"
        ],
        defaultVisualizationType: "stackedColumn"
    },
    {
        id: "ovc_serv_by_status",
        title: "OVC SERV by Status",
        defaultLayout: {
            filter: ["pe"],
            category: ["ou"],
            series: ["dx"]
        },
        data: [
            {
                title: "Active",
                filter: (data) => data.filter(datum => datum.attributes.active)
            },
            {
                title: "Graduated",
                filter: (data) => data.filter(datum => !datum.attributes.active)
            },
        ],
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedColumn",
            "column"
        ],
        defaultVisualizationType: "stackedColumn"
    },
    {
        id: "ovc_serv_by_age",
        title: "OVC SERV by Age",
        defaultLayout: {
            filter: ["pe"],
            category: ["ou"],
            series: ["dx"]
        },
        data: [
            {
                title: "< 1",
                filter: (data) => data.filter(datum => datum.attributes.age < 1)
            },
            {
                title: "1 - 4",
                filter: (data) => data.filter(datum => datum.attributes.age >= 1 && datum.attributes.age < 5)
            },
            {
                title: "5 - 9",
                filter: (data) => data.filter(datum => datum.attributes.age >= 5 && datum.attributes.age < 10)
            },
            {
                title: "10 - 14",
                filter: (data) => data.filter(datum => datum.attributes.age >= 10 && datum.attributes.age < 15)
            },
            {
                title: "15 - 17",
                filter: (data) => data.filter(datum => datum.attributes.age >= 15 && datum.attributes.age < 18)
            },
            {
                title: "18+",
                filter: (data) => data.filter(datum => datum.attributes.age >= 18)
            },
        ],
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedColumn",
            "column"
        ],
        defaultVisualizationType: "stackedColumn"
    },
    {
        id: "ovc_serv_by_vulnerability_criteria",
        title: "OVC SERV by Vulnerability Criteria",
        defaultLayout: {
            filter: ["pe"],
            category: ["ou"],
            series: ["dx"]
        },
        data: VULNERABILITY_CRITERIA.map((criteria) => ({
            title: criteria,
            filter: (data) => data.filter(datum => datum.attributes.primaryVulnerability === criteria)
        })),
        orgUnitConfig: {
            type: "level",
            level: 2
        },
        allowedVisualizationTypes: [
            "table",
            "stackedColumn",
            "column"
        ],
        defaultVisualizationType: "stackedColumn"
    },
]
