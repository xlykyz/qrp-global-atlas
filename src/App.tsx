import { useEffect } from 'react';
import GlobeView from './components/GlobeView';
import Header from './components/Header';
import ExplorerPanel from './components/ExplorerPanel';
import EventFeed from './components/EventFeed';
import DetailPanel from './components/DetailPanel';
import TimelineBar from './components/TimelineBar';
import { useAtlasData } from './data/useAtlasData';
import type { AtlasDataset } from './data/types';
import { useAtlasController } from './features/atlas/useAtlasController';

function App() {
  const { data, loading, error, reload } = useAtlasData();

  if (loading) return <div className="app-state" role="status"><div className="state-orbit" /><span>正在接入全球资本信号…</span></div>;
  if (error) return <div className="app-state app-state-error" role="alert"><span className="state-mark">!</span><strong>数据接入失败</strong><span>{error}</span><button onClick={reload}>重新连接</button></div>;
  if (!data || (!data.companies.length && !data.events.length)) return <div className="app-state"><span className="state-mark">○</span><strong>当前没有可展示的数据</strong><span>请更换时间范围或检查数据源。</span><button onClick={reload}>重新加载</button></div>;

  return <AtlasWorkspace data={data} />;
}

function AtlasWorkspace({ data }: { data: AtlasDataset }) {
  const atlas = useAtlasController(data);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && atlas.demoActive) atlas.exitDemo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [atlas.demoActive, atlas.exitDemo]);

  return <div className="atlas-app">
    <Header
      mode={atlas.mode}
      dataMode={import.meta.env.VITE_DATA_MODE === 'api' ? 'API' : 'MOCK'}
      relationshipsVisible={atlas.layers.relationships}
      demoActive={atlas.demoActive}
      onToggleRelationships={() => atlas.toggleLayer('relationships')}
      onStartDemo={atlas.startDemo}
      onExitDemo={atlas.exitDemo}
    />
    <main className="atlas-main">
      <GlobeView
        mode={atlas.mode}
        companies={data.companies}
        events={data.events}
        relationships={data.relationships}
        selectedCompanyId={atlas.selectedCompanyId}
        selectedEventId={atlas.selectedEventId}
        activeTheme={atlas.activeTheme}
        showCompanies={atlas.layers.companies}
        showEvents={atlas.layers.events}
        showRelationships={atlas.layers.relationships}
        highlightCompanyIds={atlas.highlightedCompanyIds}
        activeRelationshipIds={atlas.activeRelationshipIds}
        cameraRequest={atlas.cameraRequest}
        autoRotate={atlas.demoActive && atlas.activeStep?.id === 'cooling'}
        onSelectCompany={(id) => {
          const company = data.companies.find((item) => item.id === id);
          if (company) atlas.selectCompany(company, 'pan');
        }}
        onSelectEvent={(id) => {
          const event = data.events.find((item) => item.id === id);
          if (event) atlas.selectEvent(event, 'pan');
        }}
      />
      <ExplorerPanel
        mode={atlas.mode}
        activeTheme={atlas.activeTheme}
        themes={data.themes}
        layers={atlas.layers}
        companyCount={data.companies.length}
        marketCount={new Set(data.companies.map((company) => company.exchange)).size}
        onMode={atlas.setMode}
        onTheme={atlas.setActiveTheme}
        onToggleLayer={atlas.toggleLayer}
      />
      <EventFeed
        events={data.events}
        activeTheme={atlas.activeTheme}
        selectedEventId={atlas.selectedEventId}
        onSelect={atlas.selectEvent}
      />
      <DetailPanel
        event={atlas.selectedEvent}
        company={atlas.selectedCompany}
        companies={data.companies}
        relationships={data.relationships}
        onCompany={atlas.selectCompany}
        onClose={atlas.closeDetail}
        onReplay={atlas.startDemo}
      />
      <TimelineBar
        title={data.demo.title}
        steps={data.demo.steps}
        activeIndex={atlas.demoStepIndex}
        active={atlas.demoActive}
        playing={atlas.demoPlaying}
        speed={atlas.demoSpeed}
        onPlay={atlas.playDemo}
        onPause={atlas.pauseDemo}
        onRestart={atlas.restartDemo}
        onPrevious={atlas.previousDemoStep}
        onNext={atlas.nextDemoStep}
        onStep={atlas.goToDemoStep}
        onSpeed={atlas.setDemoSpeed}
        onExit={atlas.exitDemo}
      />
    </main>
  </div>;
}

export default App;
