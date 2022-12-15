import {SingleSelectField, SingleSelectOption} from "@dhis2/ui";
import {useRecoilState, useRecoilValue} from "recoil";
import {AccessibleOrgUnits, OrgUnitFilterState} from "../../state";
import {head} from "lodash";
import {LOWEST_LEVEL} from "../../../../constants";
import {OrganisationUnit} from "@hisptz/dhis2-utils";


export default function OrgUnitSelector() {
    const [selectedOrgUnit, setSelectedOrgUnit] = useRecoilState(OrgUnitFilterState);
    const orgUnits = useRecoilValue(AccessibleOrgUnits);
    const ouLevel = head(orgUnits)?.level ?? 0;

    return (
        <>
            {
                ouLevel < LOWEST_LEVEL && (
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
                )
            }
        </>
    )
}
