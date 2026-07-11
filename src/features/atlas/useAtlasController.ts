import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AtlasDataset, CapitalEvent, Company, Coordinates } from '../../data/types';

export type AtlasMode = 'hotspots' | 'companies' | 'industry';
export type LayerKey = 'companies' | 'events' | 'relationships';
export type CameraBehavior = 'focus' | 'pan';

export interface CameraRequest {
  coordinates: Coordinates;
  altitude: number;
  preserveScale: boolean;
  revision: number;
}

const GLOBAL_VIEW: Coordinates = { longitude: 112, latitude: 22 };

export function useAtlasController(data: AtlasDataset) {
  const [mode, setModeState] = useState<AtlasMode>('hotspots');
  const [activeTheme, setActiveThemeState] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(data.events[0]?.id ?? null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ companies: false, events: true, relationships: false });
  const [demoActive, setDemoActive] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [cameraRequest, setCameraRequest] = useState<CameraRequest>({ coordinates: GLOBAL_VIEW, altitude: 24_500_000, preserveScale: false, revision: 0 });

  const selectedEvent = data.events.find((event) => event.id === selectedEventId) ?? null;
  const selectedCompany = data.companies.find((company) => company.id === selectedCompanyId) ?? null;
  const activeStep = demoActive ? data.demo.steps[demoStepIndex] : undefined;

  const requestCamera = useCallback((coordinates: Coordinates, altitude = 10_500_000, preserveScale = false) => {
    setCameraRequest((current) => ({ coordinates, altitude, preserveScale, revision: current.revision + 1 }));
  }, []);

  useEffect(() => {
    if (!activeStep) return;
    if (activeStep.focus) requestCamera(activeStep.focus, activeStep.cameraAltitude ?? 10_500_000);
    setSelectedCompanyId(null);
    setSelectedEventId(activeStep.activeEventId ?? null);
    setLayers((current) => ({
      ...current,
      companies: activeStep.highlightCompanyIds.length > 0,
      events: true,
      relationships: activeStep.activeRelationshipIds.length > 0,
    }));
  }, [activeStep, requestCamera]);

  useEffect(() => {
    if (!demoActive || !demoPlaying) return;
    if (demoStepIndex >= data.demo.steps.length - 1) {
      setDemoPlaying(false);
      return;
    }
    const delay = (data.demo.steps[demoStepIndex]?.durationMs ?? 3_800) / demoSpeed;
    const timer = window.setTimeout(() => setDemoStepIndex((index) => Math.min(index + 1, data.demo.steps.length - 1)), delay);
    return () => window.clearTimeout(timer);
  }, [data.demo.steps, demoActive, demoPlaying, demoSpeed, demoStepIndex]);

  const selectEvent = useCallback((event: CapitalEvent, cameraBehavior: CameraBehavior = 'focus') => {
    setDemoActive(false);
    setDemoPlaying(false);
    setSelectedEventId(event.id);
    setSelectedCompanyId(null);
    setLayers((current) => ({ ...current, companies: true, events: true }));
    requestCamera(event.coordinates, event.importance === 'high' ? 5_600_000 : 4_800_000, cameraBehavior === 'pan');
  }, [requestCamera]);

  const selectCompany = useCallback((company: Company, cameraBehavior: CameraBehavior = 'focus') => {
    setDemoActive(false);
    setDemoPlaying(false);
    setSelectedCompanyId(company.id);
    setSelectedEventId(null);
    setLayers((current) => ({ ...current, companies: true }));
    requestCamera(company.coordinates, 3_800_000, cameraBehavior === 'pan');
  }, [requestCamera]);

  const setMode = useCallback((nextMode: AtlasMode) => {
    setModeState(nextMode);
    setDemoActive(false);
    setDemoPlaying(false);
    if (nextMode === 'hotspots') {
      setActiveThemeState('all');
      setLayers({ companies: false, events: true, relationships: false });
      requestCamera(GLOBAL_VIEW, 24_500_000);
    } else if (nextMode === 'companies') {
      setActiveThemeState('all');
      setLayers({ companies: true, events: false, relationships: false });
      requestCamera(GLOBAL_VIEW, 22_000_000);
    } else {
      setActiveThemeState((theme) => theme === 'all' ? 'storage' : theme);
      setLayers({ companies: true, events: true, relationships: true });
    }
  }, [requestCamera]);

  const setActiveTheme = useCallback((theme: string) => {
    setActiveThemeState(theme);
    if (theme !== 'all') {
      setModeState('industry');
      setLayers({ companies: true, events: true, relationships: true });
    }
  }, []);

  const toggleLayer = useCallback((layer: LayerKey) => {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }, []);

  const startDemo = useCallback(() => {
    setDemoActive(true);
    setDemoPlaying(true);
    setDemoStepIndex(0);
    setModeState('industry');
    setActiveThemeState('storage');
    setSelectedCompanyId(null);
  }, []);

  const playDemo = useCallback(() => {
    setDemoActive(true);
    setModeState('industry');
    setActiveThemeState('storage');
    setDemoStepIndex((index) => index >= data.demo.steps.length - 1 ? 0 : index);
    setDemoPlaying(true);
  }, [data.demo.steps.length]);

  const pauseDemo = useCallback(() => setDemoPlaying(false), []);
  const restartDemo = useCallback(() => {
    setDemoActive(true);
    setDemoStepIndex(0);
    setDemoPlaying(true);
    setModeState('industry');
    setActiveThemeState('storage');
  }, []);
  const previousDemoStep = useCallback(() => {
    setDemoActive(true);
    setDemoPlaying(false);
    setDemoStepIndex((index) => Math.max(0, index - 1));
  }, []);
  const nextDemoStep = useCallback(() => {
    setDemoActive(true);
    setDemoPlaying(false);
    setDemoStepIndex((index) => Math.min(data.demo.steps.length - 1, index + 1));
  }, [data.demo.steps.length]);
  const goToDemoStep = useCallback((index: number) => {
    setDemoActive(true);
    setDemoPlaying(false);
    setModeState('industry');
    setActiveThemeState('storage');
    setDemoStepIndex(Math.max(0, Math.min(data.demo.steps.length - 1, index)));
  }, [data.demo.steps.length]);
  const exitDemo = useCallback(() => {
    setDemoActive(false);
    setDemoPlaying(false);
    setModeState('hotspots');
    setActiveThemeState('all');
    setSelectedCompanyId(null);
    setSelectedEventId(data.events[0]?.id ?? null);
    setLayers({ companies: false, events: true, relationships: false });
    requestCamera(GLOBAL_VIEW, 24_500_000);
  }, [data.events, requestCamera]);

  const highlightedCompanyIds = useMemo(() => activeStep?.highlightCompanyIds ?? selectedEvent?.companyIds ?? (selectedCompany ? [selectedCompany.id] : []), [activeStep, selectedCompany, selectedEvent]);

  const activeRelationshipIds = useMemo(() => {
    if (activeStep) return activeStep.activeRelationshipIds;
    if (selectedCompany) return data.relationships.filter((relation) => relation.sourceCompanyId === selectedCompany.id || relation.targetCompanyId === selectedCompany.id).map((relation) => relation.id);
    if (selectedEvent) {
      const companyIds = new Set(selectedEvent.companyIds);
      return data.relationships.filter((relation) => companyIds.has(relation.sourceCompanyId) || companyIds.has(relation.targetCompanyId)).map((relation) => relation.id);
    }
    if (activeTheme !== 'all') {
      const companyIds = new Set(data.companies.filter((company) => company.themes.includes(activeTheme)).map((company) => company.id));
      return data.relationships.filter((relation) => companyIds.has(relation.sourceCompanyId) || companyIds.has(relation.targetCompanyId)).map((relation) => relation.id);
    }
    return [];
  }, [activeStep, activeTheme, data.companies, data.relationships, selectedCompany, selectedEvent]);

  return {
    mode, activeTheme, selectedEvent, selectedCompany, selectedEventId, selectedCompanyId,
    layers, demoActive, demoPlaying, demoStepIndex, demoSpeed, activeStep, cameraRequest,
    highlightedCompanyIds, activeRelationshipIds,
    setMode, setActiveTheme, toggleLayer, selectEvent, selectCompany,
    closeDetail: () => { setSelectedEventId(null); setSelectedCompanyId(null); },
    startDemo, playDemo, pauseDemo, restartDemo, previousDemoStep, nextDemoStep,
    goToDemoStep, setDemoSpeed, exitDemo,
  };
}
