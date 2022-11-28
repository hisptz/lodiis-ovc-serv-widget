import {useRecoilValue} from "recoil";
import {PeriodFilterState} from "../components/Filters/state";
import {DISTRICT_LEVEL, PROGRAM, SERVICE_PROVISION_PROGRAM_STAGE} from "../constants";
import {useDataEngine, useDataQuery} from "@dhis2/app-runtime";
import {useEffect, useState} from "react";
import {Event} from "@hisptz/dhis2-utils";
import {asyncify, mapLimit} from "async";
import {getFilteredEnrollments, transformEvents} from "../utils/data";
import {OvcServData} from "../interfaces";

const dataQuery = {
    events: {
        resource: "events",
        params: ({startDate, endDate, page}: any) => ({
            program: PROGRAM,
            startDate,
            endDate,
            ouMode: `DESCENDANTS`,
            ou: `LEVEL-${DISTRICT_LEVEL}`,
            programStage: SERVICE_PROVISION_PROGRAM_STAGE,
            totalPages: true,
            page,
            pageSize: 10,
            fields: [
                `event`,
                `enrollment`,
                `dataValues[dataElement,value]`,
                `trackedEntityInstance`
            ]
        })
    }
}

export const abortController = new AbortController();

export function useData() {
    const period = useRecoilValue(PeriodFilterState);
    const engine = useDataEngine();
    const [progress, setProgress] = useState<number>(0);
    const [rawData, setRawData] = useState<OvcServData[]>([]);
    const {data, loading, error, refetch} = useDataQuery(dataQuery, {
        variables: {
            startDate: period?.start?.toFormat('yyyy-MM-dd'),
            endDate: period?.end?.toFormat('yyyy-MM-dd')
        },
        lazy: true
    });

    async function getPagination(): Promise<any> {
        const data = await refetch();
        return data?.events as any;
    }

    async function getData(page: number) {
        if (!period) {
            return;
        }

        const data = await refetch({
            startDate: period?.start?.toFormat('yyyy-MM-dd'),
            endDate: period?.end?.toFormat('yyyy-MM-dd'),
            page
        });
        const pageEvents = data?.events as any;
        const events = pageEvents?.events as Event[];
        const sanitizedData = await transformEvents(await getFilteredEnrollments(events, {
            engine,
            period
        }), engine);

        console.log(sanitizedData)
        setRawData((prevState: OvcServData[]) => {
            return [...prevState, ...(sanitizedData ?? [])]
        })
    }


    async function get() {
        if (!period) {
            return;
        }
        const {pager: {pageCount, total}, events} = await getPagination() ?? {};
        if (!pageCount) return;
        if (pageCount === 1) {
            const firstPageData = events as any;
            setRawData(await transformEvents(await getFilteredEnrollments(firstPageData, {
                engine,
                period
            }), engine));
            setProgress(100);
            console.log(rawData)
            return;
        }
        const done = await mapLimit(Array.from(Array(pageCount - 1).keys()), 1, asyncify(async (index: number) => getData(index + 1).then(() => setProgress((index + 1) / pageCount))));
        console.log(rawData)
    }

    useEffect(() => {
        if (period) {
            get()
        }
        return () => {
            abortController.abort();
        }
    }, [period]);


    return {
        loading,
        progress,
        error,
        data: rawData
    };

}
