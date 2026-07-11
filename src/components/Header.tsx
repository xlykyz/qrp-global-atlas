import type { AtlasMode } from '../features/atlas/useAtlasController';

const descriptions: Record<AtlasMode, string> = {
  hotspots: '最近 24 小时的全球资本信号',
  companies: '按市场与信息密度探索公司',
  industry: '沿供应、技术与竞争关系展开',
};

type Props = {
  mode: AtlasMode;
  dataMode: 'MOCK' | 'API';
  relationshipsVisible: boolean;
  demoActive: boolean;
  onToggleRelationships: () => void;
  onStartDemo: () => void;
  onExitDemo: () => void;
};

export default function Header(props: Props) {
  return <header className="topbar">
    <div className="brand-block"><div className="brand-mark" aria-hidden="true"><span>Q</span><i /></div><div><div className="brand-name">QRP <span>GLOBAL ATLAS</span></div><div className="brand-subtitle">全球上市公司与资本事件动态感知系统</div></div></div>
    <div className="topbar-center"><span className="mode-kicker">{descriptions[props.mode]}</span><span className="location-chip"><i className="live-dot" /> 全球视角</span></div>
    <div className="topbar-actions"><span className="data-status"><i className="status-dot" /> {props.dataMode} DATA <small>v1.0</small></span><button className="top-action" aria-pressed={props.relationshipsVisible} onClick={props.onToggleRelationships}>{props.relationshipsVisible ? '隐藏关系' : '显示关系'}</button>{props.demoActive ? <button className="top-action exit-action" onClick={props.onExitDemo}>退出演示 <span>ESC</span></button> : <button className="top-action" onClick={props.onStartDemo}><span className="play-triangle">▶</span> 自动演示</button>}</div>
  </header>;
}
