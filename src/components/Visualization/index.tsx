import {VisualizationDefaultConfig} from "../../interfaces";
import {Button, IconMore16} from "@dhis2/ui"
import {useRecoilValueLoadable} from "recoil";
import {VisualizationData} from "../../states/visualization";

export default function Visualization({config}: { config: VisualizationDefaultConfig }) {
    const {title} = config ?? {};
    const data = useRecoilValueLoadable(VisualizationData(config.id))

    console.log(data.contents)

    return (
        <div className="container-bordered p-8">
            <div className="row space-between gap-16">
                <h3 style={{margin: 0}}>{title}</h3>
                <Button small icon={<IconMore16/>}/>
            </div>
        </div>
    )
}
