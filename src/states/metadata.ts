import {selector} from "recoil";
import {DHIS2User, OrganisationUnit} from "@hisptz/dhis2-utils";
import {EngineState} from "./engine";


const userQuery = {
    me: {
        resource: "me",
        params: {
            fields: [
                'id',
                'displayName',
                'organisationUnits[id,level]',
                'dataViewOrganisationUnits[id,level]'
            ]
        }
    }
}
export const UserState = selector<DHIS2User>({
    key: "user-state",
    get: async ({get}) => {
        const engine = get(EngineState);
        const user = await engine.query(userQuery);
        return user?.me;
    }
})

export const UserOrgUnitState = selector<{ ou: OrganisationUnit[], dataOu: OrganisationUnit[] }>({
    key: "user-org-unit-state",
    get: ({get}) => {
        const user = get(UserState);

        return {
            ou: user?.organisationUnits ?? [],
            dataOu: user?.dataViewOrganisationUnits ?? []
        }
    }
})
