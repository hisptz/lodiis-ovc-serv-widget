import {Button, IconTable24, IconVisualizationColumn24, IconVisualizationColumnStacked24, Tooltip} from "@dhis2/ui"
import {useRecoilState, useRecoilValue} from "recoil";
import {VisualizationConfiguration, VisualizationType} from "../../states/visualization";
import {VisualizationType as VisualizationTypeInterface} from "../../interfaces"
import {Suspense} from "react";
import Loader from "../Loader";
import Chart from "./components/Chart";
import CustomDataTable from "./components/CustomDataTable";
import {head,} from "lodash";

function decamelize(str: string, separator: string): string {
    separator = typeof separator === 'undefined' ? '_' : separator;

    return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase();
}

export function Visualization({configId}: { configId: string }) {
    const type = useRecoilValue(VisualizationType(configId));

    return (
        <div className="column gap-8 w-100">
            {['column', 'stackedColumn'].includes(type) && (<Chart configId={configId}/>)}
            {type === "table" && (<CustomDataTable configId={configId}/>)}
        </div>
    )
}

function ActionIcon({type, onClick}: { type: VisualizationTypeInterface, onClick: () => void }) {
    function getIcon() {
        switch (type) {
            case "column":
                return (<IconVisualizationColumn24/>);
            case "stackedColumn":
                return (<IconVisualizationColumnStacked24/>);
            case "table":
                return (<IconTable24/>)
        }
    }

    return <Tooltip content={`Switch to ${decamelize(type, ' ').toLowerCase()}`}>
        <Button onClick={onClick} icon={getIcon()}/>
    </Tooltip>
}

export function VisualizationSwitchIcon({configId}: { configId: string }) {
    const [type, setType] = useRecoilState(VisualizationType(configId));
    const config = useRecoilValue(VisualizationConfiguration(configId));

    const allowedTypes = config.allowedVisualizationTypes.filter((allowedType) => allowedType !== type);

    if (allowedTypes.length === 1) {
        const allowedType = head(allowedTypes) as VisualizationTypeInterface;
        return (
            <ActionIcon onClick={() => {
                setType(allowedType)
            }
            } type={allowedType}/>
        )
    }
    return null
}

export default function VisualizationContainer({configId}: { configId: string }) {
    const config = useRecoilValue(VisualizationConfiguration(configId))
    const {title} = config;
    return (
        <div className="container-bordered p-8 column gap-16">
            <div className="row space-between gap-16 align-items-center">
                <h3 style={{margin: 0}}>{title}</h3>
                <VisualizationSwitchIcon configId={configId}/>
            </div>
            <Suspense fallback={<Loader/>}>
                <Visualization configId={configId}/>
            </Suspense>
        </div>
    )
}
