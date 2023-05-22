import {BasePeriod, Event} from "@hisptz/dhis2-utils"
import {OvcServData} from "../interfaces";
import {chunk, find, flatten, fromPairs, groupBy, head, isEmpty, remove, uniqBy} from "lodash";
import {ATTRIBUTES, SERVICE_PROVISION_DATA_ELEMENTS} from "../constants";
import {DateTime, Duration} from "luxon";
import {asyncify, map} from "async";


export interface FilterOptions {
    period: BasePeriod;
    engine: any;
}


interface EnrollmentData {
    enrollment: string;
    events: Event[]
}

function eventHasAtLeastOneService(event: Record<string, any>): boolean {
    const serviceValues = SERVICE_PROVISION_DATA_ELEMENTS.map((service) => {
        return Boolean(event[service]);
    });
    return serviceValues.some((value) => value);
}

export function enrollmentHasEventsOnBothQuarters({events}: EnrollmentData, {period}: FilterOptions): boolean {
    const [firstQuarter] = period.interval.splitBy(Duration.fromObject({months: 3}));
    const lastQuarterEvents = [...events];
    const firstQuarterEvents = remove(lastQuarterEvents, (event) => {
        const date = DateTime.fromISO(event.eventdate);
        return firstQuarter.contains(date);
    })
    return !isEmpty(firstQuarterEvents) && !isEmpty(lastQuarterEvents)
}

const enrollmentQuery = {
    enrollment: {
        resource: "enrollments",
        params: ({ids}: any) => {
            return {
                fields: [
                    'enrollmentDate',
                    'enrollment',
                ],
                ouMode: "ACCESSIBLE",
                enrollment: `${ids.join(';')}`
            }
        }
    }
}


async function getEnrollmentWithRegistrationOnLastQuarter(enrollments: EnrollmentData[], options: FilterOptions) {
    const enrollmentIds = enrollments.map(({enrollment}) => enrollment)
    if (isEmpty(enrollmentIds)) {
        return [];
    }
    const [, lastQuarter] = options.period.interval.splitBy(Duration.fromObject({months: 3}));


    return enrollments.filter((enrollmentData) => {
        const enrollmentDate = head(enrollmentData.events)?.enrollmentdate;
        if (enrollmentDate) {
            try {

                const enrollmentDateTime = DateTime.fromJSDate(new Date(enrollmentDate));
                return lastQuarter.contains(enrollmentDateTime);
            } catch (e) {
                console.error("Yep! try again", e);
            }
        }
        return false;
    })
}

export async function getFilteredEnrollments(events: Record<string, any>, options: FilterOptions,): Promise<EnrollmentData[]> {
    const eventsWithServices = events?.filter(eventHasAtLeastOneService);

    const groupedEvents = groupBy(eventsWithServices, 'pi');
    const enrollments: EnrollmentData[] = Object.keys(groupedEvents).map((key) => {
        return {
            enrollment: key,
            events: groupedEvents[key]
        }
    })

    //This removes all enrollments that satisfy first condition from the enrollments array. The remaining have to be filtered for the second condition;
    const enrollmentsWithEventsOnBothQuarters = remove(enrollments, (enrollment) => enrollmentHasEventsOnBothQuarters(enrollment, options));

    const enrollmentsWithRegistrationOnLastQuarter = await getEnrollmentWithRegistrationOnLastQuarter(enrollments, options);
    return uniqBy([...enrollmentsWithEventsOnBothQuarters, ...enrollmentsWithRegistrationOnLastQuarter], 'enrollment')
}

const orgUnitsQuery = {
    ou: {
        resource: "organisationUnits",
        params: ({ous}: any) => {
            return {
                fields: [
                    'id',
                    'path',
                    'code',
                    'name'
                ],
                filter: `name:in:[${ous.join(',')}]`
            }
        }

    }
}


function getOvcData(enrollmentData: EnrollmentData, orgUnit: {
    id: string;
    path: string
}): OvcServData {

    const events = enrollmentData.events;
    const pairs = Object.keys(ATTRIBUTES).map((attribute) => {
        const config = ATTRIBUTES[attribute];

        if (typeof config === "string") {
            return [attribute, head(events)?.[config]];
        }
        const attributeValue = head(events)?.[config.attribute]
        const value = config.getter(attributeValue)
        return [attribute, value]

    })
    const attributes = fromPairs(pairs);
    return {
        events,
        attributes,
        orgUnit
    }
}

export async function transformEvents(enrollments: EnrollmentData[], engine: any): Promise<OvcServData[]> {
    return flatten(await map(chunk(enrollments, 20), asyncify(async (enrollmentBatch: EnrollmentData[]) => {
        const ouNames = enrollmentBatch.map((enrollment) => head(enrollment.events)?.ouname);
        const ouData = await engine.query(orgUnitsQuery, {
            variables: {
                ous: ouNames
            }
        })
        const orgUnits = ouData?.ou?.organisationUnits;
        return enrollmentBatch.map((enrollment) => {
            const orgUnit = find(orgUnits, (ou) => ou.name === head(enrollment.events)?.ouname);
            return getOvcData(enrollment, orgUnit);
        })
    })))
}
