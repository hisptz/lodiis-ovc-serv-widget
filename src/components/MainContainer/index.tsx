import classes from "./MainContainer.module.css"
import Filters from "../Filters";
import {useData} from "../../hooks";
import Loader from "../Loader";
import Error from "../Error"
import {VISUALIZATIONS} from "../../constants";
import {lazy, Suspense} from "react";

const VisualizationContainer = lazy(() => import("../Visualization"));

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
                    <VisualizationContainer configId={config.id} key={`${config.id}-container`}/>
                ))
            }
        </div>
    )
}

export default function MainContainer() {


    return (
        <div className={classes['container']}>
            <Filters/>
            <Suspense fallback={<Loader/>}>
                <Visualizations/>
            </Suspense>
        </div>
    )
}
