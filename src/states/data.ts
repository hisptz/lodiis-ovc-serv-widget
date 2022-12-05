import {selector} from "recoil";
import {OvcServData} from "../interfaces";
import {DISTRICT_LEVEL, PROGRAM, SERVICE_PROVISION_PROGRAM_STAGE} from "../constants";
import {PeriodFilterState} from "../components/Filters/state";
import {EngineState} from "./engine";
import {Event} from "@hisptz/dhis2-utils";
import {getFilteredEnrollments, transformEvents} from "../utils/data";
import {flatten} from "lodash";
import {asyncify, mapLimit} from "async";


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
            pageSize: 100,
            fields: [
                `event`,
                `enrollment`,
                `eventDate`,
                `dataValues[dataElement,value]`,
                `trackedEntityInstance`,
                `orgUnit`
            ]
        })
    }
}

export const OVCServData = selector<OvcServData[] | undefined>({
    key: "ovc-data",
    get: async ({get}) => {
        const period = get(PeriodFilterState);
        const engine = get(EngineState);

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
})
