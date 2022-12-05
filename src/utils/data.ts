import {BasePeriod, Enrollment, Event, TrackedEntityInstance} from "@hisptz/dhis2-utils"
import {OvcServData} from "../interfaces";
import {chunk, find, flatten, fromPairs, groupBy, head, isEmpty, remove, uniq, uniqBy} from "lodash";
import {ATTRIBUTES, PROGRAM, SERVICE_PROVISION_DATA_ELEMENTS} from "../constants";
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

function eventHasAtLeastOneService(event: Event): boolean {
    const serviceValues = SERVICE_PROVISION_DATA_ELEMENTS.map((service) => event?.dataValues?.find((dataValue) => dataValue.dataElement === service)?.value === 'true' ?? false);
    return serviceValues.reduce((acc, value) => acc || value, false)
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
    const enrollmentsWithEnrollmentDate = (await options.engine.query(enrollmentQuery, {
        variables: {
            ids: enrollmentIds
        }
    }))?.enrollment?.enrollments;

    return enrollments.filter((enrollmentData) => {
        const enrollmentDate = find(enrollmentsWithEnrollmentDate, ['enrollment', enrollmentData.enrollment])?.enrollmentDate;
        if (enrollmentDate) {
            try {
                const enrollmentDateTime = DateTime.fromISO(enrollmentDate);
                return lastQuarter.contains(enrollmentDateTime);
            } catch (e) {
                console.error("Yep! try again", e);
            }
        }
        return false;
    })
}

export async function getFilteredEnrollments(events: Event[], options: FilterOptions,): Promise<EnrollmentData[]> {
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
    const enrollmentsWithRegistrationOnLastQuarter = await getEnrollmentWithRegistrationOnLastQuarter(enrollments, options);

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
                    'enrollments[enrollment,enrollmentDate,orgUnit]'
                ],
                program: PROGRAM,
            }
        }
    },
    ou: {
        resource: "organisationUnits",
        params: ({ous}: any) => {
            return {
                fields: [
                    'id',
                    'path'
                ],
                filter: `id:in:[${ous.join(',')}]`
            }
        }

    }
}


function getOvcData(enrollmentData: EnrollmentData, teiData: TrackedEntityInstance, orgUnit: { id: string; path: string }): OvcServData {
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
    const attributes = fromPairs(pairs);
    return {
        enrollment,
        events,
        attributes,
        orgUnit
    }
}

export async function transformEvents(enrollments: EnrollmentData[], engine: any): Promise<OvcServData[]> {
    return flatten(await map(chunk(enrollments, 20), asyncify(async (enrollmentBatch: EnrollmentData[]) => {
        const teiAndOrgUnitIds = enrollmentBatch.map((enrollment) => ({
            tei: head(enrollment.events)?.trackedEntityInstance,
            ou: head(enrollment.events)?.orgUnit
        }));
        const teiData = await engine.query(teiQuery, {
            variables: {
                ous: uniq(teiAndOrgUnitIds.map(({ou}) => ou)),
                ids: teiAndOrgUnitIds.map(({tei}) => tei)
            }
        })
        const data = teiData?.tei?.trackedEntityInstances;
        const orgUnits = teiData?.ou?.organisationUnits;

        return enrollmentBatch.map((enrollment) => {
            const tei = find(data, (tei) => head(tei?.enrollments as Enrollment[])?.enrollment === enrollment.enrollment);
            const orgUnit = find(orgUnits, (ou) => ou.id === head(enrollment.events)?.orgUnit)
            return getOvcData(enrollment, tei, orgUnit);
        })
    })))
}
