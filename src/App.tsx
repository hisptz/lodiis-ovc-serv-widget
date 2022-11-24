import MainContainer from "./components/MainContainer";
import {DataStoreProvider} from "@dhis2/app-service-datastore"
import Loader from "./components/Loader";
import {RecoilRoot} from "recoil";

function App() {
    return <DataStoreProvider namespace='kb-ovc-serv-widget' loadingComponent={<Loader/>}>
        <RecoilRoot>
            <MainContainer/>
        </RecoilRoot>
    </DataStoreProvider>;
}

export default App
