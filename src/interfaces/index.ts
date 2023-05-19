import {BasePeriod, Event, OrganisationUnit} from "@hisptz/dhis2-utils";

export interface AnalyticsData {
    dx: string;
    ou: {
        id: string;
        name: string;
        level?: number;
    }
    pe: BasePeriod,
    value: number
}

export interface OvcServData {
    orgUnit: {
        id: string;
        path: string;
    }
    events: Event[],
    attributes: Record<string, any>
}

export type VisualizationType = "table" | "stackedColumn" | "column"

export type Dimension = "pe" | "dx" | "ou";

export interface VisualizationLayout {
    category: Dimension[];
    filter: Dimension[],
    series: Dimension[]
}

export interface OrgUnit {
    name: string;
    id: string;
    level?: number
}

export interface OrgUnitConfig {
    type: "ous" | "level",
    level?: number,
    ous?: {
        name: string;
        id: string
    }[];
    orgUnit?: OrganisationUnit
}

export interface VisualizationDefaultConfig {
    id: string;
    title: string;
    type?: "Analytics" | "Data";
    defaultVisualizationType: VisualizationType;
    allowedVisualizationTypes: VisualizationType[];
    defaultLayout: VisualizationLayout;
    data: {
        title: string;
        filter?: (data: OvcServData[]) => OvcServData[];
        dx?: string
    }[],
    orgUnitConfig: OrgUnitConfig;
    dimensionNames?: {
        ou?: string;
        pe?: string;
        dx?: string;
    }
}

export interface VisualizationConfig {
    id: string;
    title: string;
    type?: "Analytics" | "Data";
    visualizationType: VisualizationType,
    orgUnitConfig: OrgUnitConfig
    allowedVisualizationTypes: VisualizationType[];
    layout: VisualizationLayout;
    data: {
        title: string;
        filter?: (data: OvcServData[]) => OvcServData[]
    }[],
    dimensionNames?: {
        ou?: string;
        pe?: string;
        dx?: string;
    }
}
