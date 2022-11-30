import classes from "./MainContainer.module.css"
import Filters from "../Filters";
import Visualization from "../Visualization";
import {useData} from "../../hooks";
import Loader from "../Loader";
import Error from "../Error"
import {VISUALIZATIONS} from "../../constants";


export function Visualizations() {
    const {loading, error} = useData();


    if (loading) {
        return (
            <Loader text={`Loading data, please wait...`}/>
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
                VISUALIZATIONS.map((config) => (
                    <Visualization config={config} key={`${config.id}-container`}/>
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
