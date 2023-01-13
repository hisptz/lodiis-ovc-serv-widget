import {SingleSelectField, SingleSelectOption} from "@dhis2/ui"
import {PeriodTypeCategory, PeriodTypeEnum, PeriodUtility} from "@hisptz/dhis2-utils";
import {useMemo, useState} from "react";
import {useRecoilState, useResetRecoilState} from "recoil";
import {PeriodFilterState} from "../../state";
import {find} from "lodash";
import {DateTime} from "luxon";


const MIN_YEAR = 2020;

const years = Array.from(Array(new Date().getFullYear() + 1 - MIN_YEAR).keys()).map((value) => MIN_YEAR + value)

export default function PeriodSelector() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [period, setPeriod] = useRecoilState(PeriodFilterState);
    const resetPeriod = useResetRecoilState(PeriodFilterState);
    const periods = useMemo(() => PeriodUtility.fromObject({
        year,
        preference: {allowFuturePeriods: false},
        category: PeriodTypeCategory.FIXED
    }).getPeriodType(PeriodTypeEnum.SIXMONTHLY)?.periods.filter(period => {
        return period.end.diffNow('days').days < 0 || period.interval.contains(DateTime.now())
    }), [year]);

    return (
        <div className="row gap-16 w-100">
            <div className="w-100">
                <SingleSelectField
                    fullWidth
                    selected={year.toString()}
                    onChange={({selected}: { selected: string }) => {
                        resetPeriod();
                        setYear(parseInt(selected))
                    }}
                    label={"Year"}
                >
                    {
                        years.map((year) => (<SingleSelectOption key={`${year}-option`} value={year.toString()}
                                                                 label={year.toString()}/>))
                    }

                </SingleSelectField>
            </div>
            <div className="w-100">
                <SingleSelectField
                    selected={find(periods, ['id', period?.id]) ? period?.id : undefined}
                    onChange={({selected}: { selected: string }) => setPeriod(PeriodUtility.getPeriodById(selected))}
                    fullWidth
                    label={"Period"}>
                    {
                        periods?.map((period) => (
                            <SingleSelectOption value={period.id} key={`${period.id}-option`} label={period.name}/>))
                    }
                </SingleSelectField>
            </div>
        </div>
    )
}
