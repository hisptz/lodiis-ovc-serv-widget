import {atomFamily, selectorFamily} from "recoil";
import {AnalyticsData, OrgUnit, OrgUnitConfig, VisualizationConfig, VisualizationDefaultConfig} from "../interfaces";
import {find, flatten} from "lodash";
import {VISUALIZATIONS} from "../constants";
import {PeriodFilterState} from "../components/Filters/state";
import {OVCServData} from "./data";
import {EngineState} from "./engine";

const orgUnitQuery = {
    orgUnits: {
        resource: "organisationUnits",
        params: ({level}: any) => {
            return {
                level,
                fields: [
                    'id',
                    'displayName~rename(name)'
                ]
            }
        }
    }
}

export const OrgUnitState = selectorFamily<OrgUnit[], any>({
    key: "org-unit-state",
    get: (config: OrgUnitConfig) => async ({get}) => {
        const engine = get(EngineState)
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
                data
            } = find(VISUALIZATIONS, ['id', id]) as VisualizationDefaultConfig;

            const ou = get(OrgUnitState(orgUnitConfig))
            return {
                id,
                title,
                data,
                layout: defaultLayout,
                visualizationType: defaultVisualizationType,
                ou
            }
        }
    })
})
export const VisualizationData = selectorFamily<AnalyticsData[], string>({
    key: "visualization-data",
    get: (id: string) => ({get}) => {
        const {ou, data} = get(VisualizationConfiguration(id))
        const period = get(PeriodFilterState);
        const ovcServData = get(OVCServData);

        if (!ovcServData) return [];
        if (!period) return [];

        return flatten(data.map(datum => {
            return ou.map(orgUnit => {
                const orgUnitData = ovcServData.filter(data => data.orgUnit.path.includes(orgUnit.id))?.length;
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
