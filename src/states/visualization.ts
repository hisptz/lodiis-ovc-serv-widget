import {atomFamily, selectorFamily} from "recoil";
import {
    AnalyticsData,
    OrgUnit,
    OrgUnitConfig,
    VisualizationConfig,
    VisualizationDefaultConfig,
    VisualizationType as VisualizationTypeInterface
} from "../interfaces";
import {find, flatten, head} from "lodash";
import {VISUALIZATIONS} from "../constants";
import {PeriodFilterState} from "../components/Filters/state";
import {OVCServData} from "./data";
import {EngineState} from "./engine";
import React from "react";
import {OrganisationUnitLevel} from "@hisptz/dhis2-utils";

const orgUnitQuery = {
    orgUnits: {
        resource: "organisationUnits",
        params: ({level}: any) => {
            return {
                level,
                fields: [
                    'id',
                    'level',
                    'displayName~rename(name)'
                ]
            }
        }
    }
}
const drillDownQuery = {
    orgUnit: {
        resource: "organisationUnits",
        id: ({id}) => id,
        params: {
            fields: [
                'id',
                'level',
                'children[id,displayName~rename(name),level]'
            ]
        }
    }
}

export const OrgUnitState = selectorFamily<OrgUnit[], any>({
    key: "org-unit-state",
    get: ({config, orgUnitId}: { config?: OrgUnitConfig, orgUnitId?: string }) => async ({get}) => {
        const engine = get(EngineState);

        if (orgUnitId) {
            const data = await engine.query(drillDownQuery, {
                variables: {
                    id: orgUnitId
                }
            })
            return data?.orgUnit?.children ?? []
        }

        const {type, ous, level} = config ?? {}
        if (type === "level") {
            //get level orgUnits by analytics api
            const data = await engine.query(orgUnitQuery, {
                variables: {
                    level
                }
            })
            return data?.orgUnits?.organisationUnits;
        } else {
            return ous ?? [];
        }
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
export const OrgUnitLevel = selectorFamily<OrganisationUnitLevel | undefined, string>({
    key: "org-unit-level",
    get: (level: string) => async ({get}) => {
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
                allowedVisualizationTypes
            } = find(VISUALIZATIONS, ['id', id]) as VisualizationDefaultConfig;
            return {
                id,
                title,
                data,
                orgUnitConfig,
                layout: defaultLayout,
                visualizationType: defaultVisualizationType,
                allowedVisualizationTypes
            }
        }
    })
})
export const VisualizationData = selectorFamily<AnalyticsData[], { configId: string, orgUnitId?: string }>({
    key: "visualization-data",
    get: ({configId, orgUnitId}: { configId: string, orgUnitId?: string }) => ({get}) => {
        const {data, orgUnitConfig} = get(VisualizationConfiguration(configId))
        const period = get(PeriodFilterState);
        const ovcServData = get(OVCServData);
        const ou = get(OrgUnitState({orgUnitId, config: orgUnitConfig}))

        if (!ovcServData) return [];
        if (!period) return [];

        return flatten(data.map(datum => {
            const filteredData = datum.filter(ovcServData);
            return ou.map(orgUnit => {
                const orgUnitData = filteredData.filter(data => data.orgUnit.path.includes(orgUnit.id))?.length;
                return {
                    ou: orgUnit,
                    value: orgUnitData,
                    pe: period,
                    dx: datum.title
                }
            })
        }))

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
