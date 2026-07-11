export type Coordinates = { longitude: number; latitude: number };
export type MarketStatus = 'open' | 'closed' | 'preopen';
export type EventState = 'new' | 'developing' | 'diverging' | 'cooling' | 'ended';
export type EventType = 'capex' | 'earnings' | 'policy' | 'm&a' | 'supply' | 'technology';
export type RelationshipType = 'supplier' | 'customer' | 'upstream' | 'downstream' | 'competitor' | 'investment' | 'technology';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  exchange: string;
  country: string;
  city: string;
  coordinates: Coordinates;
  industry: string;
  themes: string[];
  marketCap: number;
  priceChange: number;
  activity: number;
  marketStatus: MarketStatus;
  heat: number;
}

export interface CapitalEvent {
  id: string;
  title: string;
  summary: string;
  type: EventType;
  occurredAt: string;
  location: string;
  coordinates: Coordinates;
  importance: 'high' | 'medium' | 'low';
  heat: number;
  state: EventState;
  companyIds: string[];
  themes: string[];
  sourceCount: number;
}

export interface CompanyRelationship {
  id: string;
  sourceCompanyId: string;
  targetCompanyId: string;
  type: RelationshipType;
  strength: number;
  direction: 'forward' | 'mutual';
  description: string;
}

export interface IndustryTheme {
  id: string;
  name: string;
  color: string;
  companyCount: number;
  eventCount: number;
}

export interface DemoStep {
  id: string;
  label: string;
  time: string;
  caption: string;
  detail: string;
  focus?: Coordinates;
  highlightCompanyIds: string[];
  activeRelationshipIds: string[];
  activeEventId?: string;
  cameraAltitude?: number;
  durationMs?: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  steps: DemoStep[];
}

export interface AtlasDataset {
  companies: Company[];
  events: CapitalEvent[];
  relationships: CompanyRelationship[];
  themes: IndustryTheme[];
  demo: DemoScenario;
}
