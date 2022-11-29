import {Enrollment, Event} from "@hisptz/dhis2-utils";

export interface OvcServData {
    enrollment: Enrollment,
    events: Event[],
    attributes: Record<string, any>
}
