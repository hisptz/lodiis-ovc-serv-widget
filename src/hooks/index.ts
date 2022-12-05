import {useRecoilValueLoadable} from "recoil";
import {OVCServData} from "../states/data";

export function useData() {
    const ovcDataState = useRecoilValueLoadable(OVCServData);

    return {
        loading: ovcDataState.state === "loading",
        error: ovcDataState.state === "hasError" ? ovcDataState.contents : undefined
    }
}
