import {DropdownButton, IconFilter24} from "@dhis2/ui"

export default function Filters() {

    return (
        <div className="row">
            <DropdownButton icon={<IconFilter24/>}>
                Filter
            </DropdownButton>
        </div>
    )
}
