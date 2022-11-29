import {CenteredContent, CircularLoader, LinearLoader} from "@dhis2/ui";


export default function Loader({progress, text}: { progress?: number, text?: string }) {


    return (
        <div style={{minHeight: 300}}>
            <CenteredContent>
                {progress ? <LinearLoader amount={progress}/> : <CircularLoader small/>}
                {text && <h3>{text}</h3>}
            </CenteredContent>
        </div>
    )
}
