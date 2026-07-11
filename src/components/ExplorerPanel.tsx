import type { IndustryTheme } from '../data/types';
import type { AtlasMode, LayerKey } from '../features/atlas/useAtlasController';

const modes: Array<{ id: AtlasMode; label: string; icon: string; meta: string }> = [
  { id: 'hotspots', label: '热点事件', icon: '◉', meta: '24H' },
  { id: 'companies', label: '公司分布', icon: '✦', meta: 'GLOBAL' },
  { id: 'industry', label: '产业链', icon: '⌘', meta: 'THEMES' },
];

type Props = {
  mode: AtlasMode;
  activeTheme: string;
  themes: IndustryTheme[];
  layers: Record<LayerKey, boolean>;
  companyCount: number;
  marketCount: number;
  onMode: (mode: AtlasMode) => void;
  onTheme: (theme: string) => void;
  onToggleLayer: (layer: LayerKey) => void;
};

export default function ExplorerPanel(props: Props) {
  return <aside className="left-rail" aria-label="资本视角控制">
    <div className="rail-heading"><span className="eyebrow">EXPLORER</span><strong>资本视角</strong></div>
    <div className="mode-list">{modes.map((item) => <button aria-pressed={props.mode === item.id} className={`mode-item ${props.mode === item.id ? 'is-active' : ''}`} key={item.id} onClick={() => props.onMode(item.id)}><span className="mode-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span><small>{item.meta}</small></button>)}</div>
    <div className="rail-section"><div className="section-label">产业主题 <span>THEMES</span></div><div className="theme-list"><button aria-pressed={props.activeTheme === 'all'} className={`theme-chip ${props.activeTheme === 'all' ? 'is-active' : ''}`} onClick={() => props.onTheme('all')}><i className="theme-dot" /> 全部市场 <span>{props.companyCount}</span></button>{props.themes.map((theme) => <button aria-pressed={props.activeTheme === theme.id} className={`theme-chip ${props.activeTheme === theme.id ? 'is-active' : ''}`} key={theme.id} onClick={() => props.onTheme(theme.id)}><i className="theme-dot" style={{ background: theme.color }} /> {theme.name} <span>{theme.companyCount}</span></button>)}</div></div>
    <div className="rail-section layers-section"><div className="section-label">地图图层 <span>LAYERS</span></div><LayerToggle id="events-layer" checked={props.layers.events} label="资本事件" legend="legend-pulse" onChange={() => props.onToggleLayer('events')} /><LayerToggle id="companies-layer" checked={props.layers.companies} label="上市公司" legend="legend-company" onChange={() => props.onToggleLayer('companies')} /><LayerToggle id="relations-layer" checked={props.layers.relationships} label="产业关系" legend="legend-line" onChange={() => props.onToggleLayer('relationships')} /></div>
    <div className="rail-footer"><span className="coord-grid" aria-hidden="true">◎</span><div><strong>数据覆盖</strong><span>{props.companyCount} 家公司 · {props.marketCount} 个市场</span></div></div>
  </aside>;
}

function LayerToggle({ id, checked, label, legend, onChange }: { id: string; checked: boolean; label: string; legend: string; onChange: () => void }) {
  return <label className="layer-toggle" htmlFor={id}><input id={id} type="checkbox" checked={checked} onChange={onChange} /><span className="toggle-track" /><span>{label}</span><b className={legend} /></label>;
}
