import {BasePeriod, Enrollment, Event} from "@hisptz/dhis2-utils";

export interface AnalyticsData {
    dx: string;
    ou: {
        id: string;
        name: string;
    }
    pe: BasePeriod,
    value: number
}

export interface OvcServData {
    enrollment: Enrollment,
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
}

export interface OrgUnitConfig {
    type: "ous" | "level",
    level?: number,
    ous?: {
        name: string;
        id: string
    }[]
}

export interface VisualizationDefaultConfig {
    id: string;
    title: string;
    defaultVisualizationType: VisualizationType;
    allowedVisualizationTypes: VisualizationType[];
    defaultLayout: VisualizationLayout;
    data: {
        title: string;
        filter: (data: OvcServData[]) => OvcServData[]
    }[],
    orgUnitConfig: OrgUnitConfig
}

export interface VisualizationConfig {
    id: string;
    title: string;
    visualizationType: VisualizationType,
    allowedVisualizationTypes: VisualizationType[];
    layout: VisualizationLayout;
    ou: { name: string; id: string }[];
    data: {
        title: string;
        filter: (data: OvcServData[]) => OvcServData[]
    }[]
}
