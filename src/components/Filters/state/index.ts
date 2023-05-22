import {atom, selector,} from "recoil";
import {BasePeriod, OrganisationUnit, PeriodUtility} from "@hisptz/dhis2-utils";
import {UserOrgUnitState} from "../../../states/metadata";
import {head, sortBy} from "lodash";


const DEFAULT_PERIOD = `${new Date().getFullYear()}S1`;

export const OrgUnitFilterState = atom<OrganisationUnit | undefined>({
    key: "org-unit-filter",
    default: selector({
        key: "org-unit-filter-default",
        get: ({get}) => {
            const {ou, dataOu} = get(UserOrgUnitState);
            return head(sortBy(dataOu, 'level')) ?? head(sortBy(ou, 'level'));
        }
    })
});
export const AccessibleOrgUnits = selector<OrganisationUnit[] | undefined>({
    key: "accessible-orgUnits",
    get: ({get}) => {
        const {ou, dataOu} = get(UserOrgUnitState);
        const orgUnits = [...(dataOu ?? ou)];
        const children = orgUnits.map(({children}) => children).flat();

        return [
            ...orgUnits,
            ...children
        ]
    }
})
export const PeriodFilterState = atom<BasePeriod | undefined>({
    key: "period-filter-state",
    default: PeriodUtility.getPeriodById(DEFAULT_PERIOD),
})
