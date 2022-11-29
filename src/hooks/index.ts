import {useRecoilValue} from "recoil";
import {PeriodFilterState} from "../components/Filters/state";
import {DISTRICT_LEVEL, PROGRAM, SERVICE_PROVISION_PROGRAM_STAGE} from "../constants";
import {useDataEngine, useDataQuery} from "@dhis2/app-runtime";
import {useState} from "react";
import {Event} from "@hisptz/dhis2-utils";
import {asyncify, mapLimit} from "async";
import {getFilteredEnrollments, transformEvents} from "../utils/data";
import {OvcServData} from "../interfaces";
import {useQuery} from "react-query";
import {flatten} from "lodash";

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
            pageSize: 2,
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
    const {refetch} = useDataQuery(dataQuery, {
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

    async function getData(page: number): Promise<OvcServData[] | undefined> {
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
        return await transformEvents(await getFilteredEnrollments(events, {
            engine,
            period
        }), engine);
    }

    async function get() {
        if (!period) {
            return;
        }
        const {pager: {pageCount}, events} = await getPagination() ?? {};
        if (!pageCount) return;
        if (pageCount === 1) {
            const firstPageData = events as any;
            setProgress(100);
            return await transformEvents(await getFilteredEnrollments(firstPageData, {
                engine,
                period
            }), engine);
        }
        return flatten(await mapLimit(Array.from(Array(pageCount).keys()), 1, asyncify(async (index: number) => getData(index + 1).then((data) => {
            setProgress(((index + 1) / pageCount) * 100);
            return data;
        }))));
    }

    const {isLoading, data, error,} = useQuery([period], get)

    return {
        loading: isLoading,
        progress,
        error,
        data
    };

}
