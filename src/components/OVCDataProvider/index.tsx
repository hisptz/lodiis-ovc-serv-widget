import {RecoilSync} from "recoil-sync";
import React, {useCallback} from "react";
import {DATA_STORE_NAMESPACE} from "../../constants";
import {useDataEngine, useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import {DateTime} from "luxon";
import {PeriodUtility} from "@hisptz/dhis2-utils";
import {getOVCSERVData} from "../../services";
import {OvcServData} from "../../interfaces";
import {useSetting} from "@dhis2/app-service-datastore";


export interface OVCDataProviderProps {
    children: React.ReactNode
}

const dataStoreQuery = {
    data: {
        resource: `dataStore/${DATA_STORE_NAMESPACE}`,
        id: ({periodId}: any) => periodId
    },
    info: {
        resource: `system/info`
    }
}

interface DataStoreResponse {
    data: { data: OvcServData[], lastUpdated: string },
    info: { lastAnalyticsTableSuccess: string }
}

const getCreateDataStoreMutation = (id: string) => ({
    resource: `dataStore/${DATA_STORE_NAMESPACE}/${id}`,
    type: "create",
    data: ({data}) => data
})


async function uploadNewData(engine: any, data: any, period: string) {
    const query = getCreateDataStoreMutation(period);

    return await engine.mutate(query, {
        variables: {
            data: {
                data,
                lastUpdated: DateTime.now().toISO()
            }
        }
    })
}


async function createNewData(engine: any, periodId: string) {
    const period = PeriodUtility.getPeriodById(periodId);
    const data = await getOVCSERVData(engine, {period});

    if (data) {
        await uploadNewData(engine, data, periodId);
    }
    return data ?? [];
}

const updateDataStoreMutation: any = {
    resource: `dataStore/${DATA_STORE_NAMESPACE}`,
    id: ({id}) => id,
    type: "update",
    data: ({data}) => data
}

export function OVCDataProvider({children}: OVCDataProviderProps) {
    const [expireDays] = useSetting('expireAfter', {global: true});

    const engine = useDataEngine();
    const {refetch} = useDataQuery<DataStoreResponse>(dataStoreQuery, {
        lazy: true,
        onError: (error) => {
            console.log(error)
        }
    });
    const [update, {loading: updating}] = useDataMutation(updateDataStoreMutation);
    const updateData = useCallback(async (data: OvcServData[], periodId: string) => {
        return update({
            id: periodId,
            data: {
                data,
                lastUpdated: DateTime.now().toISO()
            }
        })
    }, [update]);


    const read = useCallback(
        async (itemKey) => {
            try {
                if (!itemKey) {
                    return [];
                }
                const data = await engine.query(dataStoreQuery, {
                    variables: {
                        periodId: itemKey
                    }
                }) as unknown as DataStoreResponse;

                const lastAnalyticsRun = DateTime.fromISO(data?.info?.lastAnalyticsTableSuccess);
                const lastUpdated = DateTime.fromISO(data.data.lastUpdated);

                const shouldUpdate = lastAnalyticsRun.diff(lastUpdated).normalize().as("hours") > 1;

                if (shouldUpdate) {
                    const period = PeriodUtility.getPeriodById(itemKey);
                    const updatedData = await getOVCSERVData(engine, {period});
                    if (!updatedData) {
                        return []
                    }
                    await updateData(updatedData, itemKey);
                    return updatedData;
                }
                return data?.data?.data;
            } catch (e) {
                console.log({e})
                //Data not saved create new data
                console.info(`Creating new data`);
                return await createNewData(engine, itemKey);
            }
        },
        [refetch],
    );


    return (
        <RecoilSync
            storeKey="ovc-data"
            read={read}
        >
            {children}
        </RecoilSync>
    )
}
