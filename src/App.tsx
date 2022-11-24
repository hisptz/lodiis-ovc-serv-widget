import MainContainer from "./components/MainContainer";
import {DataStoreProvider} from "@dhis2/app-service-datastore"
import Loader from "./components/Loader";

function App() {
    return <DataStoreProvider namespace='kb-ovc-serv-widget' loadingComponent={<Loader/>}>
        <MainContainer/>
    </DataStoreProvider>;
}

export default App
