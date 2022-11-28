import {CenteredContent} from "@dhis2/ui";


export default function Error({error}: { error: string }) {


    return (
        <CenteredContent>
            <h3>{error}</h3>
        </CenteredContent>
    )
}
