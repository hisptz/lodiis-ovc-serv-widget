import {atomFamily, selectorFamily} from "recoil";
import {Dimension, OvcServData} from "../interfaces";
import {EngineState} from "./engine";
import {getAnalyticsData, getDataFromAnalytics} from "../services";
import {syncEffect} from "recoil-sync";
import {custom, voidable} from "@recoiljs/refine";


export const OVCServData = atomFamily<OvcServData[] | undefined, string | undefined>({
    key: "ovc-data",
    effects: param => [
        syncEffect({
            storeKey: "ovc-data",
            itemKey: param,
            refine: voidable(custom(value => value))
        })
    ]
});


export interface AnalyticsParams {
    dimensions: { key: Dimension, value: string[], }[],
    filters?: { key: Dimension, value: string[], }[]
}

export const AnalyticsData = selectorFamily<Record<string, any>[], any>({
    key: "analytics-data",
    get: (config: AnalyticsParams) => async ({get}) => {
        const engine = get(EngineState);
        const data = await getAnalyticsData(engine, config);
        if (!data) {
            return [];
        }
        return getDataFromAnalytics(data);
    }
})
