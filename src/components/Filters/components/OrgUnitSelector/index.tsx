import {SingleSelectField, SingleSelectOption} from "@dhis2/ui";
import {useRecoilState, useRecoilValue} from "recoil";
import {AccessibleOrgUnits, OrgUnitFilterState} from "../../state";
import {OrganisationUnit} from "@hisptz/dhis2-utils";


export default function OrgUnitSelector() {
    const [selectedOrgUnit, setSelectedOrgUnit] = useRecoilState(OrgUnitFilterState);
    const orgUnits = useRecoilValue(AccessibleOrgUnits);

    return (
        <>
            <SingleSelectField
                label="Organisation unit"
                selected={selectedOrgUnit?.id}
                onChange={({selected}) => setSelectedOrgUnit(orgUnits?.find(({id}) => id === selected) as OrganisationUnit)}
                filterable>
                {
                    orgUnits?.map(({name, id}) => (
                        <SingleSelectOption key={`${id}-option`} label={name} value={id}/>
                    ))
                }
            </SingleSelectField>
        </>
    )
}
