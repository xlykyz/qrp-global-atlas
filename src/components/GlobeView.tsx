import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import type { CapitalEvent, Company, CompanyRelationship, Coordinates, RelationshipType } from '../data/types';
import type { AtlasMode, CameraRequest } from '../features/atlas/useAtlasController';
import {
  applyImageryGrade,
  configureCinematicScene,
  createEsriImageryProvider,
  createIonImageryProvider,
  createNaturalEarthImageryProvider,
  GLOBE_VISUALS,
  type GlobeImagerySource,
} from './globeVisualConfig';

type Props = {
  mode: AtlasMode;
  companies: Company[];
  events: CapitalEvent[];
  relationships: CompanyRelationship[];
  selectedCompanyId: string | null;
  selectedEventId: string | null;
  activeTheme: string;
  showCompanies: boolean;
  showEvents: boolean;
  showRelationships: boolean;
  highlightCompanyIds: string[];
  activeRelationshipIds: string[];
  cameraRequest: CameraRequest;
  autoRotate?: boolean;
  onSelectCompany: (id: string) => void;
  onSelectEvent: (id: string) => void;
};

type AtlasSources = { companies: Cesium.CustomDataSource; events: Cesium.CustomDataSource; relationships: Cesium.CustomDataSource };

const COLORS = {
  positive: Cesium.Color.fromCssColorString('#63d6a5'),
  negative: Cesium.Color.fromCssColorString('#ff7b88'),
  event: Cesium.Color.fromCssColorString('#ffb454'),
  secondary: Cesium.Color.fromCssColorString('#63d6ff'),
  background: Cesium.Color.fromCssColorString('#020712'),
  white: Cesium.Color.fromCssColorString('#f4fbfc'),
};

const relationshipColors: Record<RelationshipType, Cesium.Color> = {
  supplier: COLORS.event,
  customer: COLORS.secondary,
  upstream: Cesium.Color.fromCssColorString('#a58bff'),
  downstream: Cesium.Color.fromCssColorString('#62d6a5'),
  competitor: COLORS.negative,
  investment: Cesium.Color.fromCssColorString('#f287a2'),
  technology: COLORS.secondary,
};

function arcPositions(from: Coordinates, to: Coordinates) {
  const start = Cesium.Cartographic.fromDegrees(from.longitude, from.latitude, 50_000);
  const end = Cesium.Cartographic.fromDegrees(to.longitude, to.latitude, 50_000);
  const geodesic = new Cesium.EllipsoidGeodesic(start, end);
  const distance = geodesic.surfaceDistance;
  return Array.from({ length: 28 }, (_, index) => {
    const fraction = index / 27;
    const point = geodesic.interpolateUsingFraction(fraction, new Cesium.Cartographic());
    const lift = Math.sin(fraction * Math.PI) * Math.min(1_200_000, distance * 0.18) + 50_000;
    return Cesium.Cartesian3.fromRadians(point.longitude, point.latitude, lift);
  });
}

function configureCompanyClustering(source: Cesium.CustomDataSource) {
  source.clustering.enabled = true;
  source.clustering.pixelRange = 48;
  source.clustering.minimumClusterSize = 3;
  return source.clustering.clusterEvent.addEventListener((entities, cluster) => {
    cluster.billboard.show = false;
    cluster.point.show = true;
    cluster.point.pixelSize = Math.min(42, 22 + Math.log2(entities.length) * 5);
    cluster.point.color = COLORS.secondary.withAlpha(0.32);
    cluster.point.outlineColor = COLORS.secondary.withAlpha(0.92);
    cluster.point.outlineWidth = 2;
    cluster.label.show = true;
    cluster.label.text = String(entities.length);
    cluster.label.font = '500 12px Inter, sans-serif';
    cluster.label.fillColor = COLORS.white;
    cluster.label.outlineColor = COLORS.background;
    cluster.label.outlineWidth = 3;
    cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
  });
}

export default function GlobeView(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const sourcesRef = useRef<AtlasSources | null>(null);
  const handlersRef = useRef({ onSelectCompany: props.onSelectCompany, onSelectEvent: props.onSelectEvent });
  const [ready, setReady] = useState(false);
  handlersRef.current = { onSelectCompany: props.onSelectCompany, onSelectEvent: props.onSelectEvent };

  useEffect(() => {
    if (!containerRef.current) return;
    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || '';
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      baseLayer: false,
      shouldAnimate: true,
      msaaSamples: 4,
    });
    configureCinematicScene(viewer);

    let disposed = false;
    let activeImagery: Cesium.ImageryLayer | undefined;
    let removeImageryErrorListener: (() => void) | undefined;
    let fallbackStarted = false;
    let naturalEarthStarted = false;
    let esriErrorCount = 0;

    const installImagery = (provider: Cesium.ImageryProvider, source: GlobeImagerySource) => {
      if (disposed) return;
      removeImageryErrorListener?.();
      if (activeImagery && viewer.imageryLayers.contains(activeImagery)) viewer.imageryLayers.remove(activeImagery, true);
      activeImagery = viewer.imageryLayers.addImageryProvider(provider, 0);
      applyImageryGrade(activeImagery, source);
      containerRef.current?.setAttribute('data-imagery-source', source);
      removeImageryErrorListener = provider.errorEvent.addEventListener(() => {
        if (source === 'cesium-ion') void installFallbackImagery();
        if (source === 'esri-world-imagery' && ++esriErrorCount >= 3) void installNaturalEarthImagery();
      });
    };

    const installNaturalEarthImagery = async () => {
      if (naturalEarthStarted || disposed) return;
      naturalEarthStarted = true;
      installImagery(await createNaturalEarthImageryProvider(), 'natural-earth');
    };

    const installFallbackImagery = async () => {
      if (fallbackStarted || disposed) return;
      fallbackStarted = true;
      try {
        installImagery(await createEsriImageryProvider(), 'esri-world-imagery');
      } catch {
        if (disposed) return;
        await installNaturalEarthImagery();
      }
    };

    if (Cesium.Ion.defaultAccessToken) {
      void createIonImageryProvider()
        .then((provider) => installImagery(provider, 'cesium-ion'))
        .catch(() => installFallbackImagery());
    } else {
      void installFallbackImagery();
    }

    const sources: AtlasSources = {
      companies: new Cesium.CustomDataSource('listed-companies'),
      events: new Cesium.CustomDataSource('capital-events'),
      relationships: new Cesium.CustomDataSource('company-relationships'),
    };
    const removeClusterListener = configureCompanyClustering(sources.companies);
    void viewer.dataSources.add(sources.relationships);
    void viewer.dataSources.add(sources.companies);
    void viewer.dataSources.add(sources.events);
    sourcesRef.current = sources;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(112, 22, GLOBE_VISUALS.initialAltitude),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
    });
    viewer.screenSpaceEventHandler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(movement.position);
      const entity = picked?.id as Cesium.Entity | undefined;
      const kind = entity?.properties?.kind?.getValue(Cesium.JulianDate.now()) as string | undefined;
      const id = entity?.properties?.itemId?.getValue(Cesium.JulianDate.now()) as string | undefined;
      if (kind === 'company' && id) handlersRef.current.onSelectCompany(id);
      if (kind === 'event' && id) handlersRef.current.onSelectEvent(id);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;
    setReady(true);
    return () => {
      disposed = true;
      removeImageryErrorListener?.();
      removeClusterListener();
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      if (!viewer.isDestroyed()) viewer.destroy();
      viewerRef.current = null;
      sourcesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const sources = sourcesRef.current;
    if (!ready || !sources) return;
    sources.companies.entities.removeAll();
    const highlightedIds = new Set(props.highlightCompanyIds);
    const themeIds = props.activeTheme === 'all' ? null : new Set(props.companies.filter((company) => company.themes.includes(props.activeTheme)).map((company) => company.id));
    const topCompanyIds = new Set([...props.companies].sort((a, b) => b.marketCap - a.marketCap).slice(0, 60).map((company) => company.id));

    props.companies.forEach((company) => {
      const highlighted = highlightedIds.has(company.id) || props.selectedCompanyId === company.id;
      if (themeIds && !themeIds.has(company.id) && !highlighted) return;
      if (!props.showCompanies && !highlighted) return;
      const color = company.priceChange >= 0 ? COLORS.positive : COLORS.negative;
      const position = Cesium.Cartesian3.fromDegrees(company.coordinates.longitude, company.coordinates.latitude, 3_000);
      sources.companies.entities.add({
        id: `company-${company.id}`,
        position,
        properties: { kind: 'company', itemId: company.id },
        point: {
          pixelSize: highlighted ? 14 : 8,
          color: highlighted ? COLORS.white : color.withAlpha(0.94),
          outlineColor: highlighted ? color : COLORS.background.withAlpha(0.92),
          outlineWidth: highlighted ? 4 : 2,
          scaleByDistance: new Cesium.NearFarScalar(1_000_000, 1.2, 25_000_000, 0.65),
        },
        ellipse: highlighted ? { semiMajorAxis: 140_000, semiMinorAxis: 140_000, material: color.withAlpha(0.065), outline: true, outlineColor: color.withAlpha(0.62), height: 1_000 } : undefined,
        label: highlighted ? { text: `${company.shortName}  ${company.priceChange >= 0 ? '+' : ''}${company.priceChange.toFixed(2)}%`, font: '600 13px Inter, sans-serif', fillColor: COLORS.white, outlineColor: COLORS.background, outlineWidth: 5, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -22), showBackground: true, backgroundColor: COLORS.background.withAlpha(0.72), backgroundPadding: new Cesium.Cartesian2(8, 5), scaleByDistance: new Cesium.NearFarScalar(1_200_000, 1, 25_000_000, 0.55) } : undefined,
      });
      if (highlighted) {
        const pulseEpoch = Cesium.JulianDate.now();
        const pulseRadius = new Cesium.CallbackProperty((time) => {
          const seconds = Cesium.JulianDate.secondsDifference(time ?? pulseEpoch, pulseEpoch);
          return 110_000 + (Math.sin(seconds * 3.8) + 1) * 45_000;
        }, false);
        sources.companies.entities.add({ position, ellipse: { semiMajorAxis: pulseRadius, semiMinorAxis: pulseRadius, material: color.withAlpha(0.018), outline: true, outlineColor: color.withAlpha(0.58), height: 2_000 } });
      }
      if (props.mode === 'companies' && props.showCompanies && topCompanyIds.has(company.id)) {
        const height = Math.min(850_000, 90_000 + Math.log10(company.marketCap + 1) * 160_000);
        sources.companies.entities.add({
          id: `company-column-${company.id}`,
          position: Cesium.Cartesian3.fromDegrees(company.coordinates.longitude, company.coordinates.latitude, height / 2),
          cylinder: { length: height, topRadius: 8_000, bottomRadius: 16_000, material: color.withAlpha(0.3), outline: true, outlineColor: color.withAlpha(0.7), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12_000_000) },
        });
      }
    });
  }, [props.activeTheme, props.companies, props.highlightCompanyIds, props.mode, props.selectedCompanyId, props.showCompanies, ready]);

  useEffect(() => {
    const source = sourcesRef.current?.events;
    if (!ready || !source) return;
    source.entities.removeAll();
    props.events.forEach((event) => {
      const selected = event.id === props.selectedEventId;
      if (!props.showEvents && !selected) return;
      if (props.activeTheme !== 'all' && !event.themes.includes(props.activeTheme) && !selected) return;
      const position = Cesium.Cartesian3.fromDegrees(event.coordinates.longitude, event.coordinates.latitude, 20_000);
      const color = event.importance === 'high' ? COLORS.event : COLORS.secondary;
      source.entities.add({
        id: `event-${event.id}`,
        position,
        properties: { kind: 'event', itemId: event.id },
        point: { pixelSize: selected ? new Cesium.CallbackProperty(() => 15 + (Math.sin(Date.now() / 320) + 1) * 3, false) : 11, color, outlineColor: COLORS.background.withAlpha(0.96), outlineWidth: selected ? 4 : 3, scaleByDistance: new Cesium.NearFarScalar(1_000_000, 1.3, 25_000_000, 0.76) },
        ellipse: { semiMajorAxis: selected ? 260_000 : 150_000, semiMinorAxis: selected ? 260_000 : 150_000, material: color.withAlpha(selected ? 0.075 : 0.025), outline: true, outlineColor: color.withAlpha(selected ? 0.72 : 0.56), height: 30_000 },
        label: selected ? { text: event.title, font: '600 14px Inter, sans-serif', fillColor: Cesium.Color.fromCssColorString('#ffe4ba'), outlineColor: COLORS.background, outlineWidth: 5, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -30), showBackground: true, backgroundColor: COLORS.background.withAlpha(0.76), backgroundPadding: new Cesium.Cartesian2(9, 5), scaleByDistance: new Cesium.NearFarScalar(1_000_000, 1, 26_000_000, 0.5) } : undefined,
      });
    });
  }, [props.activeTheme, props.events, props.selectedEventId, props.showEvents, ready]);

  useEffect(() => {
    const source = sourcesRef.current?.relationships;
    if (!ready || !source) return;
    source.entities.removeAll();
    if (!props.showRelationships || !props.activeRelationshipIds.length) return;
    const activeIds = new Set(props.activeRelationshipIds);
    const companyById = new Map(props.companies.map((company) => [company.id, company]));
    props.relationships.forEach((relationship) => {
      if (!activeIds.has(relationship.id)) return;
      const from = companyById.get(relationship.sourceCompanyId);
      const to = companyById.get(relationship.targetCompanyId);
      if (!from || !to) return;
      const color = relationshipColors[relationship.type];
      source.entities.add({
        id: `relationship-${relationship.id}`,
        polyline: { positions: arcPositions(from.coordinates, to.coordinates), width: 2.4 + relationship.strength * 2, material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.16, taperPower: 0.8, color: color.withAlpha(0.96) }), clampToGround: false },
      });
    });
  }, [props.activeRelationshipIds, props.companies, props.relationships, props.showRelationships, ready]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!ready || !viewer) return;
    const { coordinates, altitude, preserveScale } = props.cameraRequest;
    const targetAltitude = preserveScale ? viewer.camera.positionCartographic.height : altitude;
    viewer.camera.cancelFlight();
    if (!preserveScale && altitude > 18_000_000) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, altitude),
        duration: 1.8,
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
      });
      return;
    }

    // Keep the camera on the radial line above the selected location and look
    // straight through it towards the globe centre. This matches the global
    // modes, so subsequent zoom and orbit gestures retain a stable globe
    // centre instead of continuing to pivot around the surface event.
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, targetAltitude),
      duration: preserveScale ? 1.05 : 1.35,
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
    });
  }, [props.cameraRequest.revision, ready]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!ready || !viewer || !props.autoRotate) return;
    const remove = viewer.clock.onTick.addEventListener(() => viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00018));
    return remove;
  }, [props.autoRotate, ready]);

  return <div className="globe-shell"><div ref={containerRef} className="globe-container" role="application" aria-label="全球资本事件三维地球" /><div className="globe-vignette" /><div className="globe-caption"><span className="live-dot" /> LIVE CAPITAL SIGNALS <span className="caption-divider" /> MOCK SCENARIO · CST</div></div>;
}
