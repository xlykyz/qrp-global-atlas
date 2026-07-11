import type { CSSProperties } from 'react';
import type { DemoStep } from '../data/types';

type Props = {
  title: string;
  steps: DemoStep[];
  activeIndex: number;
  active: boolean;
  playing: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStep: (index: number) => void;
  onSpeed: (speed: number) => void;
  onExit: () => void;
};

export default function TimelineBar(props: Props) {
  const current = props.steps[props.activeIndex];
  const trackStyle = { '--timeline-columns': props.steps.length } as CSSProperties;
  return <section className={`timeline-bar ${props.active ? 'is-active' : ''}`} aria-label="历史回放控制">
    <div className="timeline-head"><div><span className="eyebrow">HISTORICAL REPLAY</span><strong>{props.title}</strong></div><div className="timeline-actions"><button className="icon-button" onClick={props.onRestart} aria-label="重播">↺</button><button className="icon-button" onClick={props.onPrevious} disabled={props.activeIndex === 0} aria-label="上一步">‹</button><button className="play-button" onClick={props.playing ? props.onPause : props.onPlay} aria-label={props.playing ? '暂停' : '播放'}>{props.playing ? 'Ⅱ' : '▶'}</button><button className="icon-button" onClick={props.onNext} disabled={props.activeIndex === props.steps.length - 1} aria-label="下一步">›</button><select value={props.speed} onChange={(event) => props.onSpeed(Number(event.target.value))} aria-label="播放速度"><option value="0.6">0.6×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select><span className={props.playing ? 'status-pill is-playing' : 'status-pill'}>{props.playing ? '演示中' : props.active ? '已暂停' : '待播放'}</span>{props.active && <button className="timeline-exit" onClick={props.onExit}>退出</button>}</div></div>
    <div className="timeline-track" style={trackStyle}>{props.steps.map((step, index) => <button key={step.id} aria-current={props.active && index === props.activeIndex ? 'step' : undefined} className={`timeline-node ${props.active && index === props.activeIndex ? 'is-current' : ''} ${props.active && index < props.activeIndex ? 'is-past' : ''}`} onClick={() => props.onStep(index)}><span className="node-line" /><span className="node-dot" /><span className="node-label">{step.label}</span><span className="node-time">{step.time}</span></button>)}</div>
    <div className="timeline-caption" aria-live="polite"><span className="caption-index">{String(props.activeIndex + 1).padStart(2, '0')}</span><span>{current?.caption}</span><span className="caption-detail">{current?.detail}</span></div>
  </section>;
}
