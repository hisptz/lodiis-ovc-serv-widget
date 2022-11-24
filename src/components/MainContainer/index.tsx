import classes from "./MainContainer.module.css"
import Filters from "../Filters";
import Visualization from "../Visualization";


export default function MainContainer() {

    return (
        <div className={classes['container']}>
            <Filters/>
            <div className={`${classes['visualizationContainer']}`}>
                {
                    Array.from(Array(10).keys()).map((index) => (
                        <Visualization name={index}/>
                    ))
                }
            </div>
        </div>
    )
}
