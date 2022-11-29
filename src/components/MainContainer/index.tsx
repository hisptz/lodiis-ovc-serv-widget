import classes from "./MainContainer.module.css"
import Filters from "../Filters";
import Visualization from "../Visualization";
import {useData} from "../../hooks";
import Loader from "../Loader";
import Error from "../Error"


export function Visualizations() {
    const {loading, error, data, progress} = useData();


    if (loading) {
        return (
            <Loader progress={progress} text={`Loading data, please wait...`}/>
        )
    }

    if (error) {
        return (
            <Error error={error?.message}/>
        )
    }

    return (
        <div className={`${classes['visualizationContainer']}`}>
            {
                Array.from(Array(10).keys()).map((index) => (
                    <Visualization key={`${index}-option`} name={index.toString()}/>
                ))
            }
        </div>
    )
}

export default function MainContainer() {


    return (
        <div className={classes['container']}>
            <Filters/>
            <Visualizations/>
        </div>
    )
}
