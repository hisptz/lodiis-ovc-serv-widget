import {useRecoilValue, useSetRecoilState} from "recoil";
import {VisualizationConfiguration, VisualizationData, VisualizationRef} from "../../../../states/visualization";
import {AnalyticsData, Dimension, VisualizationLayout} from "../../../../interfaces";
import {find, head, uniqBy} from "lodash";
import {DataTable, DataTableCell, DataTableColumnHeader, DataTableRow, TableBody, TableHead} from "@dhis2/ui"
import classes from "./CustomDataTable.module.css"
import React from "react";

export function getDimensionName(dimension: Dimension, dimensionNames?: { ou: string; pe?: string; dx?: string }): string {
    switch (dimension) {
        case "dx":
            return dimensionNames?.dx ?? "Number of beneficiaries served";
        case "pe":
            return dimensionNames?.pe ?? "Period";
        case "ou":
            return dimensionNames?.ou ?? "Districts"
    }
}

function getRowHeader(layout: VisualizationLayout, dimensionNames?: { ou: string }) {
    const {category, series} = layout;
    const categoryNames = category.map((category) => getDimensionName(category, dimensionNames));
    const seriesNames = series.map(series => getDimensionName(series, dimensionNames));

    return [categoryNames.join(', '), seriesNames.join(', ')].join('/');
}

export function getDimensionValues(dimension: Dimension, data: AnalyticsData[]): { id: string, name: string; level?: number }[] {
    switch (dimension) {
        case "pe":
            return uniqBy(data.map(({pe}) => ({id: pe.id, name: pe.name})), 'id');
        case "dx":
            return uniqBy(data.map(({dx}) => ({id: dx, name: dx})), 'id')
        case "ou":
            return uniqBy(data.map(({ou}) => ou), 'id')
    }
}

export default function CustomDataTable({configId}: { configId: string; }) {
    const config = useRecoilValue(VisualizationConfiguration(configId));
    const {data, ouDimensionName} = useRecoilValue(VisualizationData({configId}));
    const ref = useSetRecoilState(VisualizationRef(configId));
    const {layout} = config;
    const columns = getDimensionValues(head(layout.series) as Dimension, data);
    const rows = getDimensionValues(head(layout.category) as Dimension, data);

    const rowHeader = getRowHeader(layout, {...(config.dimensionNames ?? {}), ou: ouDimensionName ?? ""});

    return (
        <DataTable ref={ref}>
            <TableHead>
                <DataTableRow>
                    {
                        <DataTableColumnHeader>
                            {rowHeader}
                        </DataTableColumnHeader>
                    }
                    {
                        columns.map(({id, name}) => (
                            <DataTableColumnHeader className={classes['columnHeader']} align="center"
                                                   key={`${id}-column-header`}>{name}</DataTableColumnHeader>))
                    }
                </DataTableRow>
            </TableHead>
            <TableBody>
                {
                    rows.map((row) => {
                        return (
                            <DataTableRow
                                key={`${row.id}-row`}
                            >
                                <DataTableCell bordered>
                                    {row.name}
                                </DataTableCell>
                                {
                                    columns.map((column) => {
                                        const value = find(data, (datum) => {
                                            const categoryValue = datum[head(layout.category) as Dimension];
                                            const seriesValue = datum[head(layout.series) as Dimension];

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
                                            return categoryId === row.id && seriesId === column.id;

                                        })?.value;

                                        return (
                                            <DataTableCell align="center" bordered key={`${column.id}-${row.id}-data`}>
                                                {value}
                                            </DataTableCell>
                                        )
                                    })
                                }
                            </DataTableRow>
                        )
                    })
                }
            </TableBody>
        </DataTable>
    );
}
