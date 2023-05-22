import MainContainer from "./components/MainContainer";
import {DataStoreProvider} from "@dhis2/app-service-datastore"
import Loader from "./components/Loader";
import {MutableSnapshot, RecoilRoot} from "recoil";
import {useDataEngine} from "@dhis2/app-runtime";
import {EngineState} from "./states/engine";
import HighChartsExport from "highcharts/modules/exporting";
import HighCharts from "highcharts";
import {DATA_STORE_NAMESPACE} from "./constants";
import {OVCDataProvider} from "./components/OVCDataProvider";

HighChartsExport(HighCharts);


function App() {
    const engine = useDataEngine();
    const initState = (snapshot: MutableSnapshot) => {
        snapshot.set(EngineState, engine);
    }

    return <DataStoreProvider namespace={DATA_STORE_NAMESPACE} loadingComponent={<Loader/>}>
        <RecoilRoot initializeState={initState}>
            <OVCDataProvider>
                <MainContainer/>
            </OVCDataProvider>
        </RecoilRoot>
    </DataStoreProvider>;
}

export default App
