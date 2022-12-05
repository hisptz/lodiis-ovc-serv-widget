import {Button, IconMore16} from "@dhis2/ui"
import {useRecoilValue} from "recoil";
import {VisualizationConfiguration} from "../../states/visualization";
import {Suspense} from "react";
import Loader from "../Loader";
import Chart from "./components/Chart";

export function Visualization({configId}: { configId: string }) {
    return (
        <div className="column gap-8 w-100">
            <Chart configId={configId}/>
        </div>
    )
}

export default function VisualizationContainer({configId}: { configId: string }) {
    const config = useRecoilValue(VisualizationConfiguration(configId))
    const {title} = config;
    return (
        <div className="container-bordered p-8 column gap-16">
            <div className="row space-between gap-16">
                <h3 style={{margin: 0}}>{title}</h3>
                <Button small icon={<IconMore16/>}/>
            </div>
            <Suspense fallback={<Loader/>}>
                <Visualization configId={configId}/>
            </Suspense>
        </div>
    )
}
