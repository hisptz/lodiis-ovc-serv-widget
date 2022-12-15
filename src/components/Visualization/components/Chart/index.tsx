import * as Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {
    VisualizationConfiguration,
    VisualizationData,
    VisualizationRef,
    VisualizationType
} from "../../../../states/visualization";
import {getDimensionName, getDimensionValues} from "../CustomDataTable";
import {find, flatten, head} from "lodash";
import {Dimension, VisualizationType as VisualizationTypeInterface} from "../../../../interfaces";
import {Suspense} from "react";
import Loader from "../../../Loader";
import {OrgUnitFilterState} from "../../../Filters/state";

function getChartType(visualizationType: VisualizationTypeInterface): string {
    switch (visualizationType) {
        case "column":
            return "column";
        case "stackedColumn":
            return "column";
        default:
            return "column"
    }
}

function useChartOptions(configId: string, orgUnit?: string): { options: Highcharts.Options } {
    const config = useRecoilValue(VisualizationConfiguration(configId));
    const {data, ouDimensionName} = useRecoilValue(VisualizationData({configId, orgUnitId: orgUnit}));
    const visualizationType = useRecoilValue(VisualizationType(configId))
    const {layout} = config;
    const categories = getDimensionValues(head(layout.category) as Dimension, data);
    const chartType = getChartType(visualizationType);

    const chartSeries: any = flatten(layout.series.map((dimension) => {
        const dimensionItem = getDimensionValues(dimension, data);
        return dimensionItem.map((item) => {
            return {
                type: chartType,
                name: item.name,
                data: categories.map((category) => {
                    return find(data, (datum) => {
                        const categoryValue = datum[head(layout.category) as Dimension];
                        const seriesValue = datum[dimension as Dimension];
                        let categoryId;
                        let seriesId;

                        if (typeof categoryValue === "string") {
                            categoryId = categoryValue;
                        } else {
                            categoryId = categoryValue?.id;
                        }

                        if (typeof seriesValue === "string") {
                            seriesId = seriesValue;
                        } else {
                            seriesId = seriesValue?.id;
                        }
                        return categoryId === category.id && seriesId === item.id;
                    })?.value;
                })
            }
        })
    }));

    const chartCategories = categories.map((category) => {
        return category.name;
    });

    const categoryDimensionTitle = getDimensionName(head(layout.category) as Dimension, {ou: ouDimensionName ?? ''});
    const seriesDimensionTitle = getDimensionName(head(layout.series) as Dimension, {ou: ouDimensionName ?? ''});
    const options = {
        chart: {
            renderTo: configId,
            type: "column",

        },
        plotOptions: {
            column: {
                stacking: visualizationType === "stackedColumn" ? "normal" : undefined
            }
        },
        title: {
            text: ""
        },
        credits: {
            enabled: false
        },
        yAxis: [
            {
                allowDecimals: false,
                title: {
                    text: seriesDimensionTitle,
                    style: {color: "#000000", fontWeight: "normal", fontSize: "14px"}
                }
            }
        ],
        series: chartSeries,
        colors: [
            "#8bbc21",
            "#77a1e5",
            "#f28f43",
            "#910000",
            "#a6c96a",
            "#2f7ed8",
            "#c42525",
            "#1aadce",
            "#492970",
            "#0d233a",
        ],
        exporting: {
            buttons: {
                contextButton: {enabled: false}
            }
        },
        xAxis: {
            title: {
                text: categoryDimensionTitle,
                style: {color: "#000000", fontWeight: "normal", fontSize: "14px"}
            },
            type: "category",
            categories: chartCategories,
            crosshair: true,
            labels: {
                enabled: true
            }
        }
    };

    return {
        options: options as Highcharts.Options,
    }
}


function ChartComponent({configId}: { configId: string }) {
    const orgUnit = useRecoilValue(OrgUnitFilterState)
    const {options} = useChartOptions(configId, orgUnit?.id);
    const chartComponentRef = useSetRecoilState(VisualizationRef(configId))

    return (
        <HighchartsReact
            immutable
            containerProps={{
                id: `${configId}-${orgUnit}`,
                style: {
                    height: "100%"
                }
            }}
            highcharts={Highcharts}
            options={options}
            ref={chartComponentRef as any}
        />
    )
}

export default function Chart({configId}: { configId: string }) {
    return (
        <div className="column gap-8 w-100 h-100">
            <div className="w-100 h-100">
                <Suspense fallback={<Loader/>}>
                    <ChartComponent configId={configId}/>
                </Suspense>
            </div>
        </div>
    );
}
