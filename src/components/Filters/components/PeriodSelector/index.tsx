import {SingleSelectField, SingleSelectOption} from "@dhis2/ui"
import {PeriodTypeCategory, PeriodTypeEnum, PeriodUtility} from "@hisptz/dhis2-utils";
import {useMemo, useState} from "react";


const MIN_YEAR = 2020;

const years = Array.from(Array(new Date().getFullYear() + 1 - MIN_YEAR).keys()).map((value) => MIN_YEAR + value)

export default function PeriodSelector() {
    const [year, setYear] = useState(new Date().getFullYear());
    const periods = useMemo(() => PeriodUtility.fromObject({
        year,
        preference: {allowFuturePeriods: true},
        category: PeriodTypeCategory.FIXED
    }).getPeriodType(PeriodTypeEnum.SIXMONTHLY)?.periods, [year]);

    return (
        <div className="row gap-16 w-100">
            <div className="w-100">
                <SingleSelectField
                    fullWidth
                    selected={year.toString()}
                    onChange={({selected}: { selected: string }) => setYear(parseInt(selected))}
                    label={"Year"}
                >
                    {
                        years.map((year) => (<SingleSelectOption value={year.toString()} label={year.toString()}/>))
                    }

                </SingleSelectField>
            </div>
            <div className="w-100">
                <SingleSelectField fullWidth label={"Period"}>
                    {
                        periods?.map((period) => (<SingleSelectOption key={`${period.id}-option`} label={period.name}/>
                        ))
                    }
                </SingleSelectField>
            </div>
        </div>
    )
}
