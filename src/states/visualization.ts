import {atomFamily, selector, selectorFamily} from "recoil";
import {
    AnalyticsData as AnalyticsDataInterface,
    OrgUnit,
    VisualizationConfig,
    VisualizationDefaultConfig,
    VisualizationLayout,
    VisualizationType as VisualizationTypeInterface
} from "../interfaces";
import {find, flatten, head, sortBy} from "lodash";
import {VISUALIZATIONS} from "../constants";
import {OrgUnitFilterState, PeriodFilterState} from "../components/Filters/state";
import {AnalyticsData, AnalyticsParams, OVCServData} from "./data";
import {EngineState} from "./engine";
import React from "react";
import {OrganisationUnitLevel} from "@hisptz/dhis2-utils";

const drillDownQuery = {
    orgUnit: {
        resource: "organisationUnits",
        id: ({id}) => id,
        params: {
            fields: [
                'id',
                'level',
                'displayName~rename(name)',
                'children[id,displayName~rename(name),level]'
            ]
        }
    }
}

export const OrgUnitState = selector<OrgUnit[]>({
    key: "org-unit-state",
    get: async ({get}) => {
        const engine = get(EngineState);
        const orgUnit = get(OrgUnitFilterState);

        if (!orgUnit) {
            return [];
        }

        const data = await engine.query(drillDownQuery, {
            variables: {
                id: orgUnit?.id
            }
        })
        return sortBy([...(data?.orgUnit?.children ?? [])], 'name')

    }
});


const orgUnitLevelQuery = {
    level: {
        resource: "organisationUnitLevels",
        params: ({level}: any) => {

            return {
                filter: [
                    `level:eq:${level}`
                ]
            }
        }
    }
}
export const OrgUnitLevel = selectorFamily<OrganisationUnitLevel | undefined, string | undefined>({
    key: "org-unit-level",
    get: (level?: string) => async ({get}) => {
        if (!level) return;
        const engine = get(EngineState);

        const response = await engine.query(orgUnitLevelQuery, {
            variables: {
                level
            }
        })
        return head(response?.level?.organisationUnitLevels) as OrganisationUnitLevel
    }
})

export const VisualizationConfiguration = atomFamily<VisualizationConfig, string>({
    key: "visualization-config",
    default: selectorFamily({
        key: "visualization-config-default",
        get: (id: string) => ({get}) => {
            const {
                title,
                defaultLayout,
                defaultVisualizationType,
                orgUnitConfig,
                data,
                type,
                dimensionNames,
                allowedVisualizationTypes
            } = find(VISUALIZATIONS, ['id', id]) as VisualizationDefaultConfig;

            const orgUnit = get(OrgUnitFilterState);

            const orgUnitConfiguration = {
                ...orgUnitConfig,
                orgUnit: orgUnit
            }

            return {
                id,
                title,
                data,
                type,
                orgUnitConfig: orgUnitConfiguration,
                layout: defaultLayout,
                visualizationType: defaultVisualizationType,
                allowedVisualizationTypes,
                dimensionNames
            }
        }
    })
})

function getAnalyticsConfig(data, layout: VisualizationLayout, {
    periods,
    orgUnits
}: { periods: string[], orgUnits: string[] }): AnalyticsParams {
    const dimensionValues = {
        dx: data.map(({dx}) => dx),
        pe: periods,
        ou: orgUnits
    }

    const filters = layout.filter.map((dimension) => {
        return {
            key: dimension,
            value: dimensionValues[dimension]
        }
    });
    const dimensions = [...layout.category, ...layout.series].map((dimension) => {
        return {
            key: dimension,
            value: dimensionValues[dimension]
        }
    });

    return {
        dimensions,
        filters
    }
}

export const VisualizationData = selectorFamily<{ data: AnalyticsDataInterface[], ouDimensionName: string | undefined }, { configId: string }>({
    key: "visualization-data",
    get: ({configId}: { configId: string, }) => ({get}) => {
        const {data, type, layout} = get(VisualizationConfiguration(configId))
        const period = get(PeriodFilterState);
        const ovcServData = get(OVCServData(period?.id));

        const ou = get(OrgUnitState);
        const orgUnitLevel = get(OrgUnitLevel(head(ou)?.level?.toString()));


        if (!period) return [];

        if (type === "Analytics") {
            const config = getAnalyticsConfig(data, layout, {periods: [period?.id], orgUnits: ou.map(({id}) => id)});
            const analyticsData = get(AnalyticsData(config));
            const chartData = ou.map(orgUnit => {
                const orgUnitData = analyticsData.find(datum => datum.ou === orgUnit.id);
                return data.map((datum) => {
                    return {
                        ou: orgUnit,
                        value: parseFloat(orgUnitData?.value ?? '0') ?? 0,
                        pe: period,
                        dx: datum.title
                    }
                })
            }).flat()
            return {
                data: chartData,
                ouDimensionName: orgUnitLevel?.displayName
            }
        }
        if (!ovcServData) return [];


        const sanitizedData = flatten(data.map(datum => {
            const filteredData = datum.filter ? datum.filter(ovcServData) : ovcServData;
            return ou.map(orgUnit => {
                const orgUnitData = filteredData.filter(data => data.orgUnit.path.includes(orgUnit.id))?.length;
                return {
                    ou: orgUnit,
                    value: orgUnitData,
                    pe: period,
                    dx: datum.title
                }
            })
        }));

        return {
            data: sanitizedData,
            ouDimensionName: orgUnitLevel?.displayName
        } as any;

    }
})

export const VisualizationType = atomFamily<VisualizationTypeInterface, string>({
    key: "visualization-layout-state",
    default: (id: string) => {
        const {
            defaultVisualizationType
        } = find(VISUALIZATIONS, ['id', id]) as VisualizationDefaultConfig;
        return defaultVisualizationType;
    }
})

export const VisualizationRef = atomFamily<React.Ref<any>, string>({
    key: "visualization-ref",
    default: null,
    dangerouslyAllowMutability: true,
})
