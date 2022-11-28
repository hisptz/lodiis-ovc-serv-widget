import {BasePeriod, Enrollment, Event, TrackedEntityInstance} from "@hisptz/dhis2-utils"
import {OvcServData} from "../interfaces";
import {chunk, find, flatten, fromPairs, groupBy, head, isEmpty, remove, uniqBy} from "lodash";
import {ATTRIBUTES, PROGRAM, SERVICE_PROVISION_DATA_ELEMENTS} from "../constants";
import {DateTime, Duration} from "luxon";
import {asyncify, filter, map} from "async";

export interface FilterOptions {
    period: BasePeriod;
    engine: any;
}


interface EnrollmentData {
    enrollment: string;
    events: Event[]
}

function eventHasAtLeastOneService(event: Event): boolean {
    const serviceValues = SERVICE_PROVISION_DATA_ELEMENTS.map((service) => event?.dataValues?.find((dataValue) => dataValue.dataElement === service)?.value === 'true' ?? false);
    return serviceValues.reduce((acc, value) => acc || value, false)
}

export function filterEventsByEnrollmentAndService(events: Event[], {period}: FilterOptions): Event[] {
    //We need enrollment data to pull this one off
    return [];
}

export function enrollmentHasEventsOnBothQuarters({events}: EnrollmentData, {period}: FilterOptions): boolean {

    const [firstQuarter] = period.interval.splitBy(Duration.fromObject({months: 3}));
    const lastQuarterEvents = [...events];
    const firstQuarterEvents = remove(lastQuarterEvents, (event) => {
        const date = DateTime.fromISO(event.eventDate);
        return firstQuarter.contains(date);
    })
    return !isEmpty(firstQuarterEvents) && !isEmpty(lastQuarterEvents)
}


const enrollmentQuery = {
    enrollment: {
        resource: "enrollments",
        id: ({id}: any) => id,
        params: {
            fields: [
                'enrollmentDate',
                'enrollment'
            ]
        }
    }
}

export async function getFilteredEnrollments(events: Event[], options: FilterOptions,): Promise<EnrollmentData[]> {
    console.log(events)
    const eventsWithServices = events?.filter(eventHasAtLeastOneService);

    const groupedEvents = groupBy(eventsWithServices, 'enrollment');
    const enrollments: EnrollmentData[] = Object.keys(groupedEvents).map((key) => {
        return {
            enrollment: key,
            events: groupedEvents[key]
        }
    })
    //This removes all enrollments that satisfy first condition grom the enrollments array. The remaining have to be filtered for the second condition;
    const enrollmentsWithEventsOnBothQuarters = remove(enrollments, (enrollment) => enrollmentHasEventsOnBothQuarters(enrollment, options));
    const [, lastQuarter] = options.period.interval.splitBy(Duration.fromObject({months: 3}));
    const enrollmentsWithRegistrationOnLastQuarter = await filter(enrollments, asyncify(async (enrollment: EnrollmentData) => {
        const enrollmentData = await options.engine.query(enrollmentQuery, {
            variables: {
                id: enrollment.enrollment
            }
        })
        const data = enrollmentData?.enrollment;
        if (data) {
            try {
                const enrollmentDate = DateTime.fromISO(data.enrollmentDate);
                return lastQuarter.contains(enrollmentDate);
            } catch (e) {
                console.error("Yep! try again", e);
            }
        }
        return false;
    }))

    return uniqBy([...enrollmentsWithEventsOnBothQuarters, ...enrollmentsWithRegistrationOnLastQuarter], 'enrollment')
}

const teiQuery = {
    tei: {
        resource: "trackedEntityInstances",
        params: ({ids}: any) => {
            return {
                trackedEntityInstance: ids.join(';'),
                fields: [
                    'trackedEntityInstance',
                    'attributes[attribute,value]',
                    'enrollments[enrollment,enrollmentDate]'
                ],
                program: PROGRAM,
            }
        }
    }
}


function getOvcData(enrollmentData: EnrollmentData, teiData: TrackedEntityInstance): OvcServData {
    const enrollment = head(teiData?.enrollments) ?? {} as Enrollment;
    const events = enrollmentData.events;
    const attributesData = teiData?.attributes;
    const pairs = Object.keys(ATTRIBUTES).map((attribute) => {
        const config = ATTRIBUTES[attribute];

        if (typeof config === "string") {
            return [attribute, find(attributesData, ['attribute', ATTRIBUTES[attribute]])?.value];
        }
        const attributeValue = find(attributesData, ['attribute', config?.attribute])?.value;
        const value = config.getter(attributeValue)
        return [attribute, value]

    })
    console.log(pairs)
    const attributes = fromPairs(pairs);
    return {
        enrollment,
        events,
        attributes
    }
}

export async function transformEvents(enrollments: EnrollmentData[], engine: any): Promise<OvcServData[]> {
    return flatten(await map(chunk(enrollments, 20), asyncify(async (enrollmentBatch: EnrollmentData[]) => {
        const teiIds = enrollmentBatch.map((enrollment) => head(enrollment.events)?.trackedEntityInstance)
        const teiData = await engine.query(teiQuery, {
            variables: {
                ids: teiIds
            }
        })
        const data = teiData?.tei?.trackedEntityInstances;

        return enrollmentBatch.map((enrollment) => {
            const tei = find(data, (tei) => head(tei?.enrollments as Enrollment[])?.enrollment === enrollment.enrollment);
            return getOvcData(enrollment, tei);
        })
    })))
}
