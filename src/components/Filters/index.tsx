import classes from "./Filters.module.css"
import PeriodSelector from "./components/PeriodSelector";

export default function Filters() {

    return (
        <div className={classes['container']}>
            <div className={classes['periodContainer']}>
                <PeriodSelector/>
            </div>
        </div>
    )
}
