import {CircularLoader, LinearLoader} from "@dhis2/ui";


export default function Loader({progress, text}: { progress?: number, text?: string }) {


    return (
        <div className="column center align-items-center" style={{minHeight: 600}}>
            {progress ? <LinearLoader amount={progress}/> : <CircularLoader small/>}
            {text && <h3>{text}</h3>}
        </div>
    )
}
