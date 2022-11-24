import {useDataQuery} from "@dhis2/app-runtime";
import {CenteredContent, CircularLoader} from "@dhis2/ui";

const query = {
    me: {
        resource: "me",
    }
}

function App() {
    const {loading, data, error} = useDataQuery(query);

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader/>
            </CenteredContent>
        )
    }

    if (error) {
        return (
            <CenteredContent>
                <h1>{error.message}</h1>
            </CenteredContent>
        )
    }

    if (data) {
        return (
            <CenteredContent>
                <h1>Hello, {(data?.me as any)?.displayName}</h1>
            </CenteredContent>
        )
    }

    return null;
}

export default App
