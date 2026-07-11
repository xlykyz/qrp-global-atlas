import * as Cesium from 'cesium';

export type GlobeImagerySource = 'cesium-ion' | 'esri-world-imagery' | 'natural-earth';

const ESRI_WORLD_IMAGERY_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';

const imageryGrades: Record<GlobeImagerySource, Pick<Cesium.ImageryLayer, 'brightness' | 'contrast' | 'saturation' | 'gamma' | 'hue'>> = {
  'cesium-ion': { brightness: 0.95, contrast: 1.05, saturation: 0.88, gamma: 1, hue: -0.005 },
  'esri-world-imagery': { brightness: 0.95, contrast: 1.05, saturation: 0.85, gamma: 1, hue: -0.005 },
  'natural-earth': { brightness: 0.9, contrast: 1.05, saturation: 0.8, gamma: 1, hue: -0.005 },
};

export const GLOBE_VISUALS = {
  background: Cesium.Color.fromCssColorString('#020712'),
  baseColor: Cesium.Color.fromCssColorString('#071c31'),
  initialAltitude: 24_500_000,
  maxDevicePixelRatio: 1.25,
} as const;

export function configureCinematicScene(viewer: Cesium.Viewer) {
  const { scene } = viewer;
  scene.backgroundColor = GLOBE_VISUALS.background;
  scene.globe.baseColor = GLOBE_VISUALS.baseColor;

  // A stable, evenly lit daytime globe: no sun-driven terminator or time simulation.
  scene.globe.enableLighting = false;
  scene.globe.dynamicAtmosphereLighting = false;
  scene.globe.dynamicAtmosphereLightingFromSun = false;
  scene.globe.showGroundAtmosphere = true;
  scene.globe.atmosphereLightIntensity = 11;
  scene.globe.atmosphereRayleighCoefficient = new Cesium.Cartesian3(4.4e-6, 9.5e-6, 21e-6);
  scene.globe.atmosphereMieCoefficient = new Cesium.Cartesian3(8e-6, 8e-6, 8e-6);
  scene.globe.atmosphereMieScaleHeight = 2_300;
  scene.globe.atmosphereRayleighScaleHeight = 9_000;

  if (scene.skyAtmosphere) {
    scene.skyAtmosphere.show = true;
    scene.skyAtmosphere.perFragmentAtmosphere = true;
    scene.skyAtmosphere.atmosphereLightIntensity = 12;
    scene.skyAtmosphere.atmosphereRayleighCoefficient = new Cesium.Cartesian3(4.6e-6, 10.5e-6, 25e-6);
    scene.skyAtmosphere.atmosphereMieCoefficient = new Cesium.Cartesian3(7e-6, 8e-6, 9e-6);
    scene.skyAtmosphere.atmosphereMieScaleHeight = 2_100;
    scene.skyAtmosphere.atmosphereRayleighScaleHeight = 9_200;
    scene.skyAtmosphere.atmosphereMieAnisotropy = 0.82;
    scene.skyAtmosphere.hueShift = -0.015;
    scene.skyAtmosphere.saturationShift = 0.02;
    scene.skyAtmosphere.brightnessShift = -0.36;
  }

  if (scene.skyBox) scene.skyBox.show = true;
  if (scene.sun) scene.sun.show = false;
  if (scene.moon) scene.moon.show = false;
  scene.sunBloom = false;
  scene.fog.enabled = true;
  scene.fog.density = 0.00004;
  scene.fog.minimumBrightness = 0.02;

  // Satellite basemaps are already display-referred imagery. Running those
  // tiles through Cesium's HDR/tonemapping path can introduce channel clipping
  // and false colour on some WebGL/GPU combinations as higher-detail levels
  // stream in, so keep the globe on the stable LDR path.
  scene.highDynamicRange = false;
  scene.gamma = 2.2;
  scene.msaaSamples = scene.msaaSupported ? 4 : 1;
  scene.postProcessStages.fxaa.enabled = true;

  // Cesium's full-frame bloom bright-pass can push high-frequency satellite
  // tiles into false colour at regional zoom levels. Keep it disabled and use
  // the atmosphere plus localized point/polyline glow materials instead.
  scene.postProcessStages.bloom.enabled = false;

  viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, GLOBE_VISUALS.maxDevicePixelRatio);
  scene.screenSpaceCameraController.enableTilt = true;
  scene.screenSpaceCameraController.minimumZoomDistance = 180_000;
  scene.screenSpaceCameraController.maximumZoomDistance = 40_000_000;
}

export function applyImageryGrade(layer: Cesium.ImageryLayer, source: GlobeImagerySource) {
  Object.assign(layer, imageryGrades[source]);
  layer.alpha = 1;
  layer.show = true;
}

export async function createIonImageryProvider() {
  return Cesium.createWorldImageryAsync({ style: Cesium.IonWorldImageryStyle.AERIAL });
}

export async function createEsriImageryProvider() {
  return Cesium.ArcGisMapServerImageryProvider.fromUrl(ESRI_WORLD_IMAGERY_URL, { enablePickFeatures: false });
}

export async function createNaturalEarthImageryProvider() {
  return Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'));
}
