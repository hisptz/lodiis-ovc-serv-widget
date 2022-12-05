import * as Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import {useRef} from "react";
import {useRecoilValue} from "recoil";
import {VisualizationConfiguration, VisualizationData} from "../../../../states/visualization";
import {getDimensionValues} from "../CustomDataTable";
import {find, flatten, head} from "lodash";
import {Dimension, VisualizationType} from "../../../../interfaces";


function getChartType(visualizationType: VisualizationType): string {
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

    const {layout, visualizationType} = config;

    const categories = getDimensionValues(head(layout.category) as Dimension, data);
    const chartType = getChartType(visualizationType);

    const chartSeries: Highcharts.SeriesOptionsType[] = flatten(layout.series.map((dimension) => {
        const dimensionItem = getDimensionValues(dimension, data);
        return dimensionItem.map((item) => {
            return {
                type: chartType,
                name: item.name,
                data: categories.map((category) => {
                    return find(data, (datum) => {
                        const categoryValue = datum[head(layout.category) as Dimension];
                        const seriesValue = datum[dimension as Dimension];

                        const categoryId = categoryValue?.id ?? categoryValue;
                        const seriesId = seriesValue.id ?? seriesValue;

                        return categoryId === category.id && seriesId === item.id;
                    })?.value as number
                })
            }
        })
    }));

    const chartCategories = categories.map((category) => {
        return category.name;
    })

    return {
        chart: {
            renderTo: configId,
            type: "column"
        },
        plotOptions: {
            column: {
                stacking: "normal"
            }
        },
        title: {
            text: ""
        },
        credits: {
            enabled: false
        },
        series: chartSeries,
        colors: ["#2f7ed8", "#0d233a", "#8bbc21", "#910000", "#1aadce", "#492970", "#f28f43", "#77a1e5", "#c42525", "#a6c96a"],
        xAxis: {
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

    const options = useChartOptions(configId);

    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    return (
        <HighchartsReact
            containerProps={{
                id: configId
            }}
            highcharts={Highcharts}
            options={options}
            ref={chartComponentRef}
        />
    );
}
