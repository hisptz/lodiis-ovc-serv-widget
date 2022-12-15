import MainContainer from "./components/MainContainer";
import {DataStoreProvider} from "@dhis2/app-service-datastore"
import Loader from "./components/Loader";
import {MutableSnapshot, RecoilRoot} from "recoil";
import {useDataEngine} from "@dhis2/app-runtime";
import {EngineState} from "./states/engine";
import HighChartsExport from "highcharts/modules/exporting";
import HighCharts from "highcharts";

HighChartsExport(HighCharts);


function App() {
    const engine = useDataEngine();
    const initState = (snapshot: MutableSnapshot) => {
        snapshot.set(EngineState, engine);
    }

    return <DataStoreProvider namespace='kb-ovc-serv-widget' loadingComponent={<Loader/>}>
        <RecoilRoot initializeState={initState}>
            <MainContainer/>
        </RecoilRoot>
    </DataStoreProvider>;
}

export default App
