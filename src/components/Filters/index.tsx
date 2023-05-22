import classes from "./Filters.module.css"
import PeriodSelector from "./components/PeriodSelector";
import OrgUnitSelector from "./components/OrgUnitSelector";

export default function Filters() {

    return (
        <div className={classes['container']}>
            <div className={classes['periodContainer']}>
                <PeriodSelector/>
            </div>
            <div className={classes['orgUnitContainer']}>
                <OrgUnitSelector/>
            </div>
        </div>
    )
}
