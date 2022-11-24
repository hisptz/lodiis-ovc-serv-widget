import {atom, DefaultValue, selector,} from "recoil";
import {BasePeriod, PeriodUtility} from "@hisptz/dhis2-utils";


const DEFAULT_PERIOD = `${new Date().getFullYear()}S1`;

export const FilterState = atom<{ period?: string }>({
    key: "filter-state",
    default: {
        period: DEFAULT_PERIOD
    }
})

export const PeriodFilterState = selector<BasePeriod | undefined>({
    key: "period-filter-state",
    get: ({get}) => {
        const periodId = get(FilterState)?.period;
        if (!periodId) return;
        return PeriodUtility.getPeriodById(periodId);
    },
    set: ({set}, value) => {
        set(FilterState, (prevValue) => {

            if (value instanceof DefaultValue) {
                return {
                    ...prevValue,
                    period: undefined
                }
            }

            return {
                ...(prevValue),
                period: value?.id
            }
        })
    },
})
