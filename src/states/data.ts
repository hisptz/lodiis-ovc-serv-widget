import {selector, selectorFamily} from "recoil";
import {Dimension, OvcServData} from "../interfaces";
import {PROGRAM, SERVICE_PROVISION_PROGRAM_STAGE} from "../constants";
import {PeriodFilterState} from "../components/Filters/state";
import {EngineState} from "./engine";
import {Analytics, BasePeriod, Event} from "@hisptz/dhis2-utils";
import {getFilteredEnrollments, transformEvents} from "../utils/data";
import {flatten, fromPairs} from "lodash";
import {asyncify, mapLimit} from "async";


const dataQuery = {
    events: {
        resource: "events",
        params: ({startDate, endDate, page}: any) => ({
            program: PROGRAM,
            startDate,
            endDate,
            ouMode: `ACCESSIBLE`,
            programStage: SERVICE_PROVISION_PROGRAM_STAGE,
            totalPages: true,
            page,
            pageSize: 100,
            fields: [
                `event`,
                `enrollment`,
                `eventDate`,
                `dataValues[dataElement,value]`,
                `trackedEntityInstance`,
                `orgUnit`,
                `programStage`
            ]
        })
    }
}


async function getOVCSERVData(engine: any, {period}: { period?: BasePeriod }) {

    if (!period) return;

    async function getPagination(): Promise<any> {
        const data = await engine.query(dataQuery, {
            variables: {
                startDate: period?.start?.toFormat('yyyy-MM-dd'),
                endDate: period?.end?.toFormat('yyyy-MM-dd')
            },
        });
        return data?.events as any;
    }

    async function getData(page: number): Promise<OvcServData[] | undefined> {
        if (!period) {
            return;
        }
        const data = await engine.query(dataQuery, {
            variables: {
                startDate: period?.start?.toFormat('yyyy-MM-dd'),
                endDate: period?.end?.toFormat('yyyy-MM-dd'),
                page
            }
        });
        const pageEvents = data?.events as any;
        const events = pageEvents?.events as Event[];
        return await transformEvents(await getFilteredEnrollments(events, {
            engine,
            period
        }), engine);
    }

    async function getAllData(): Promise<OvcServData[] | undefined> {
        if (!period) {
            return;
        }
        const {pager: {pageCount}, events} = await getPagination() ?? {};
        if (!pageCount) return;
        if (pageCount === 1) {
            const firstPageData = events as any;
            return await transformEvents(await getFilteredEnrollments(firstPageData, {
                engine,
                period
            }), engine);
        }
        return flatten(await mapLimit(Array.from(Array(pageCount).keys()), 1, asyncify(async (index: number) => getData(index + 1).then((data) => {
            return data;
        }))));
    }

    return await getAllData();
}

export const OVCServData = selector<OvcServData[] | undefined>({
    key: "ovc-data",
    get: async ({get}) => {
        const period = get(PeriodFilterState);
        const engine = get(EngineState);
        return getOVCSERVData(engine, {period})
    }
});


const analyticsQuery = {
    analytics: {
        resource: "analytics",
        params: ({dimensions, filters}) => {
            return {
                dimension: dimensions.map(({key, value}) => `${key}:${value.join(';')}`),
                filter: filters.map(({key, value}) => `${key}:${value.join(';')}`)
            }
        }
    }
}

export interface AnalyticsParams {
    dimensions: { key: Dimension, value: string[], }[],
    filters?: { key: Dimension, value: string[], }[]
}

async function getAnalyticsData(engine, {
    dimensions,
    filters
}: AnalyticsParams) {
    const response = await engine.query(analyticsQuery, {
        variables: {
            dimensions,
            filters
        }
    });

    return response?.analytics;
}


function getDataFromAnalytics(analytics: Analytics): Record<string, any>[] {
    const {rows, headers} = analytics;
    return rows?.map((row: any) => {
        return fromPairs(row.map((value, index) => ([headers?.[index]?.name, value])))
    }) ?? []
}

export const AnalyticsData = selectorFamily<Record<string, any>[], AnalyticsParams>({
    key: "analytics-data",
    get: (config: AnalyticsParams) => async ({get}) => {
        const engine = get(EngineState);
        const data = await getAnalyticsData(engine, config);
        if (!data) {
            return [];
        }
        return getDataFromAnalytics(data);
    }
})
