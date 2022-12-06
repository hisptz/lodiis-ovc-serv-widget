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

function useChartOptions(configId: string): Highcharts.Options {
    const config = useRecoilValue(VisualizationConfiguration(configId));
    const data = useRecoilValue(VisualizationData(configId));
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

    const categoryDimensionTitle = getDimensionName(head(layout.category) as Dimension);
    const seriesDimensionTitle = getDimensionName(head(layout.series) as Dimension);

    return {
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
        colors: ["#2f7ed8", "#0d233a", "#8bbc21", "#910000", "#1aadce", "#492970", "#f28f43", "#77a1e5", "#c42525", "#a6c96a"],
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
    }
}
export default function Chart({configId}: { configId: string }) {
    const chartComponentRef = useSetRecoilState(VisualizationRef(configId))
    const options = useChartOptions(configId);

    return (
        <HighchartsReact
            immutable
            containerProps={{
                id: configId,
                style: {
                    height: "100%"
                }
            }}
            highcharts={Highcharts}
            options={options}
            ref={chartComponentRef as any}
        />
    );
}
