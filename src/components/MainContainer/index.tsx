import classes from "./MainContainer.module.css"
import Filters from "../Filters";
import {useData} from "../../hooks";
import Loader from "../Loader";
import {VISUALIZATIONS} from "../../constants";
import {lazy, Suspense} from "react";
import {useRecoilValue} from "recoil";
import {PeriodFilterState} from "../Filters/state";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "../Error";

const VisualizationContainer = lazy(() => import("../Visualization"));

export function Visualizations() {
    const {loading, error} = useData();
    const period = useRecoilValue(PeriodFilterState)


    if (loading) {
        return (
            <Loader text={`Loading data, please wait...`}/>
        )
    }

    if (error) {
        throw Error(error?.message)
    }

    if (!period) {
        return (
            <div style={{minHeight: 400}} className="column w-100 h-100 align-items-center center">
                <h3>Select period to start</h3>
            </div>
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
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Loader/>}>
                    <Visualizations/>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}
