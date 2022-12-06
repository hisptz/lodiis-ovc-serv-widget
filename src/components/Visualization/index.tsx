import {Button, Divider, IconMore24, MenuItem, Popover} from "@dhis2/ui"
import {useRecoilState, useRecoilValue} from "recoil";
import {VisualizationConfiguration, VisualizationRef, VisualizationType} from "../../states/visualization";
import {Suspense, useCallback, useState} from "react";
import Loader from "../Loader";
import Chart from "./components/Chart";
import CustomDataTable from "./components/CustomDataTable";
import {utils as xlsx, writeFile} from "xlsx";
import {PeriodFilterState} from "../Filters/state";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "../Error";

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
        <div className="column gap-8 w-100 h-100">
            {['column', 'stackedColumn'].includes(type) && (<Chart configId={configId}/>)}
            {type === "table" && (<CustomDataTable configId={configId}/>)}
        </div>
    )
}

export function downloadExcelFromTable(tableRef: any, title: string) {
    const sheet = xlsx.table_to_sheet(tableRef);
    const workbook = xlsx.book_new();
    xlsx.book_append_sheet(workbook, sheet, `${title.substring(0, 31)}`); //TODO: Notify user if title is too long
    writeFile(workbook, `${title}.${"xlsx"}`);
}

function useExport(configId: string) {
    const visualizationRef: any = useRecoilValue(VisualizationRef(configId));
    const period = useRecoilValue(PeriodFilterState)

    return useCallback(
        (type: string) => {
            const name = `OVC_SERV_${period?.name}`;
            if (type === "table") {
                downloadExcelFromTable(visualizationRef, name)
            } else {
                visualizationRef?.chart?.exportChart({type: "image/png", filename: name, sourceWidth: 1200}, {})
            }
        },
        [visualizationRef],
    );

}

export function VisualizationSwitchIcon({configId}: { configId: string }) {
    const [type, setType] = useRecoilState(VisualizationType(configId));
    const [ref, setRef] = useState(null);
    const exportMenu: { label: string, onClick: () => void }[] = [];

    const onDownload = useExport(configId);

    if (type === "table") {
        exportMenu.push({
            onClick: () => {
                onDownload(type);
            },
            label: `Download Excel`
        })
    } else {
        exportMenu.push({
            onClick: () => {
                onDownload(type)
            },
            label: `Download PNG`
        })
    }

    const config = useRecoilValue(VisualizationConfiguration(configId));

    const allowedTypes = config.allowedVisualizationTypes.filter((allowedType) => allowedType !== type);

    const typeSwitchMenu = allowedTypes.map((type) => ({
        onClick: () => setType(type),
        label: `Switch to ${decamelize(type, ' ').toLowerCase()}`
    }))

    return (<>
        <Button onClick={(_, event) => {
            setRef(prevRef => {

                if (prevRef) {
                    return null;
                } else {
                    return event.target
                }
            })
        }} icon={<IconMore24/>}/>
        {
            ref && <Popover reference={ref} onClickOutside={() => setRef(null)}>
                {
                    typeSwitchMenu.map((menu) => (
                        <MenuItem key={`${menu.label}-menu-item`} onClick={() => {
                            setRef(null);
                            menu.onClick()
                        }
                        } label={menu.label}/>))
                }
                <Divider/>
                {
                    exportMenu.map((menu) => (
                        <MenuItem key={`${menu.label}-menu-item`} onClick={() => {
                            setRef(null);
                            menu.onClick()
                        }} label={menu.label}/>))
                }
            </Popover>
        }

    </>)
}

export default function VisualizationContainer({configId}: { configId: string }) {
    const config = useRecoilValue(VisualizationConfiguration(configId));


    const {title} = config;
    return (
        <div className="container-bordered p-8 column gap-16">
            <div className="row space-between gap-16 align-items-center">
                <h3 style={{margin: 0}}>{title}</h3>
                <div className="row gap-16">
                    <VisualizationSwitchIcon configId={configId}/>
                </div>
            </div>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Loader/>}>
                    <Visualization configId={configId}/>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}
