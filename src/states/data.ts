import {selector, selectorFamily} from "recoil";
import {Dimension, OvcServData} from "../interfaces";
import {ATTRIBUTES, PROGRAM, SERVICE_PROVISION_DATA_ELEMENTS, SERVICE_PROVISION_PROGRAM_STAGE} from "../constants";
import {PeriodFilterState} from "../components/Filters/state";
import {EngineState} from "./engine";
import {Analytics, AnalyticsHeader, BasePeriod} from "@hisptz/dhis2-utils";
import {flatten, fromPairs} from "lodash";
import {asyncify, mapLimit} from "async";
import {getFilteredEnrollments, transformEvents} from "../utils/data";

const signal = new AbortSignal();

const dataQuery = {
    events: {
        resource: "analytics/events/query",
        id: PROGRAM,
        params: ({startDate, endDate, page, skipData, skipMeta}: any) => ({
            program: PROGRAM,
            skipData,
            skipMeta,
            startDate,
            endDate,
            ouMode: `ACCESSIBLE`,
            stage: SERVICE_PROVISION_PROGRAM_STAGE,
            totalPages: true,
            hierarchyMeta: true,
            dimension: [
                ...SERVICE_PROVISION_DATA_ELEMENTS,
                ...Object.values(ATTRIBUTES).map((value: any) => value.attribute ?? value),
            ],
            page,
            pageSize: 1000,
            columns: [
                "enrollment"
            ]
        })
    }
}

async function getOVCSERVData(engine: any, {period}: { period?: BasePeriod }) {

    if (!period) return;

    async function getMetadata(): Promise<any> {
        const data = await engine.query(dataQuery, {
            variables: {
                startDate: period?.start?.toFormat('yyyy-MM-dd'),
                endDate: period?.end?.toFormat('yyyy-MM-dd'),
                skipData: true,
                skipMeta: false
            },
        });
        return {
            metaData: data?.events?.metaData,
            headers: data?.events?.headers
        } as any;
    }

    function getEventsPayload(eventRows: string[][], headers: AnalyticsHeader[]) {
        return eventRows.map((row) => {
            return {
                ...fromPairs([...row.map((value, index) => ([headers[index].name, value]))])
            }
        })
    }

    async function getData(page: number, metaData: {
        headers: AnalyticsHeader[],
        metaData: Record<string, any>
    }): Promise<OvcServData[] | undefined> {
        if (!period) {
            return;
        }
        const data = await engine.query(dataQuery, {
            variables: {
                startDate: period?.start?.toFormat('yyyy-MM-dd'),
                endDate: period?.end?.toFormat('yyyy-MM-dd'),
                page,
                skipData: false,
                skipMeta: true
            }
        });

        const eventRows = data?.events?.rows as any;
        const events = getEventsPayload(eventRows, metaData.headers);

        return await transformEvents(await getFilteredEnrollments(events, {
            engine,
            period
        }), engine);
    }

    async function getAllData(): Promise<OvcServData[] | undefined> {
        if (!period) {
            return;
        }
        const meta = await getMetadata() ?? {};
        const {pageCount} = meta?.metaData?.pager ?? {};
        if (!pageCount) return;
        return flatten(await mapLimit(Array.from(Array(pageCount).keys()), 1, asyncify(async (index: number) => getData(index + 1, meta).then((data) => {
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

export const AnalyticsData = selectorFamily<Record<string, any>[], any>({
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
