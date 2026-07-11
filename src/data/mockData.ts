import type { AtlasDataset, CapitalEvent, Company, CompanyRelationship, DemoStep, IndustryTheme } from './types';

const companies: Company[] = [
  { id: 'sk-hynix', name: 'SK hynix', shortName: 'SK海力士', ticker: '000660', exchange: 'KRX', country: '韩国', city: '利川', coordinates: { longitude: 127.44, latitude: 37.27 }, industry: '存储芯片', themes: ['storage'], marketCap: 128.4, priceChange: 4.82, activity: 93, marketStatus: 'open', heat: 98 },
  { id: 'samsung-elec', name: 'Samsung Electronics', shortName: '三星电子', ticker: '005930', exchange: 'KRX', country: '韩国', city: '水原', coordinates: { longitude: 127.03, latitude: 37.26 }, industry: '存储芯片', themes: ['storage', 'semiconductor'], marketCap: 381.2, priceChange: 2.16, activity: 81, marketStatus: 'open', heat: 91 },
  { id: 'micron', name: 'Micron Technology', shortName: '美光科技', ticker: 'MU', exchange: 'NASDAQ', country: '美国', city: '博伊西', coordinates: { longitude: -116.2, latitude: 43.62 }, industry: '存储芯片', themes: ['storage'], marketCap: 117.8, priceChange: 3.47, activity: 88, marketStatus: 'open', heat: 86 },
  { id: 'tsmc', name: 'Taiwan Semiconductor', shortName: '台积电', ticker: 'TSM', exchange: 'TWSE', country: '中国台湾', city: '新竹', coordinates: { longitude: 120.96, latitude: 24.78 }, industry: '晶圆制造', themes: ['semiconductor', 'storage'], marketCap: 1020.5, priceChange: 1.05, activity: 76, marketStatus: 'open', heat: 80 },
  { id: 'asml', name: 'ASML Holding', shortName: 'ASML', ticker: 'ASML', exchange: 'NASDAQ', country: '荷兰', city: '埃因霍温', coordinates: { longitude: 5.47, latitude: 51.44 }, industry: '半导体设备', themes: ['semiconductor', 'storage'], marketCap: 286.4, priceChange: -0.72, activity: 54, marketStatus: 'open', heat: 68 },
  { id: 'tokyo-electron', name: 'Tokyo Electron', shortName: '东京电子', ticker: '8035', exchange: 'TSE', country: '日本', city: '东京', coordinates: { longitude: 139.69, latitude: 35.68 }, industry: '半导体设备', themes: ['semiconductor', 'storage'], marketCap: 109.7, priceChange: 1.89, activity: 66, marketStatus: 'closed', heat: 72 },
  { id: 'shin-etsu', name: 'Shin-Etsu Chemical', shortName: '信越化学', ticker: '4063', exchange: 'TSE', country: '日本', city: '东京', coordinates: { longitude: 139.76, latitude: 35.67 }, industry: '半导体材料', themes: ['storage'], marketCap: 81.3, priceChange: 0.44, activity: 47, marketStatus: 'closed', heat: 56 },
  { id: 'naura', name: 'NAURA Technology', shortName: '北方华创', ticker: '002371', exchange: 'SZSE', country: '中国', city: '北京', coordinates: { longitude: 116.41, latitude: 39.9 }, industry: '半导体设备', themes: ['semiconductor', 'storage'], marketCap: 34.5, priceChange: 2.73, activity: 71, marketStatus: 'closed', heat: 64 },
  { id: 'cxmt', name: 'ChangXin Memory Technologies', shortName: '长鑫存储', ticker: 'CXMT', exchange: 'Private', country: '中国', city: '合肥', coordinates: { longitude: 117.23, latitude: 31.82 }, industry: '存储芯片', themes: ['storage'], marketCap: 22.1, priceChange: 0, activity: 39, marketStatus: 'closed', heat: 51 },
  { id: 'lam-research', name: 'Lam Research', shortName: '泛林集团', ticker: 'LRCX', exchange: 'NASDAQ', country: '美国', city: '弗里蒙特', coordinates: { longitude: -121.99, latitude: 37.55 }, industry: '半导体设备', themes: ['semiconductor', 'storage'], marketCap: 74.8, priceChange: 1.26, activity: 62, marketStatus: 'open', heat: 61 },
  { id: 'western-digital', name: 'Western Digital', shortName: '西部数据', ticker: 'WDC', exchange: 'NASDAQ', country: '美国', city: '圣何塞', coordinates: { longitude: -121.89, latitude: 37.34 }, industry: '存储芯片', themes: ['storage'], marketCap: 24.6, priceChange: 2.08, activity: 75, marketStatus: 'open', heat: 58 },
  { id: 'kioxia', name: 'Kioxia Holdings', shortName: '铠侠', ticker: '285A', exchange: 'TSE', country: '日本', city: '东京', coordinates: { longitude: 139.65, latitude: 35.45 }, industry: '存储芯片', themes: ['storage'], marketCap: 35.9, priceChange: 2.64, activity: 77, marketStatus: 'closed', heat: 73 },
  { id: 'nvidia', name: 'NVIDIA', shortName: '英伟达', ticker: 'NVDA', exchange: 'NASDAQ', country: '美国', city: '圣克拉拉', coordinates: { longitude: -121.96, latitude: 37.35 }, industry: 'AI算力', themes: ['ai'], marketCap: 3410.2, priceChange: 0.81, activity: 68, marketStatus: 'open', heat: 74 },
  { id: 'novo-nordisk', name: 'Novo Nordisk', shortName: '诺和诺德', ticker: 'NVO', exchange: 'NYSE', country: '丹麦', city: '哥本哈根', coordinates: { longitude: 12.57, latitude: 55.68 }, industry: '医药', themes: ['healthcare'], marketCap: 317.6, priceChange: -1.18, activity: 52, marketStatus: 'open', heat: 48 },
  { id: 'catl', name: 'CATL', shortName: '宁德时代', ticker: '300750', exchange: 'SZSE', country: '中国', city: '宁德', coordinates: { longitude: 119.52, latitude: 26.66 }, industry: '新能源', themes: ['ev'], marketCap: 163.8, priceChange: 1.32, activity: 59, marketStatus: 'closed', heat: 62 },
  { id: 'spacex', name: 'SpaceX', shortName: 'SpaceX', ticker: 'Private', exchange: 'Private', country: '美国', city: '霍桑', coordinates: { longitude: -118.35, latitude: 33.92 }, industry: '商业航天', themes: ['space'], marketCap: 210.0, priceChange: 0, activity: 32, marketStatus: 'closed', heat: 43 },
];

const events: CapitalEvent[] = [
  { id: 'memory-capex', title: 'SK海力士上调 HBM 与 DRAM 资本开支', summary: '公司宣布加速扩充先进封装与下一代存储产能，市场预期 2025—2026 年 AI 服务器供应链将继续紧平衡。', type: 'capex', occurredAt: '2025-02-18T08:40:00Z', location: '韩国 · 利川', coordinates: { longitude: 127.44, latitude: 37.27 }, importance: 'high', heat: 98, state: 'developing', companyIds: ['sk-hynix', 'samsung-elec', 'micron', 'tsmc'], themes: ['storage'], sourceCount: 38 },
  { id: 'us-export', title: '美国更新先进存储设备出口审查', summary: '政策边界变化重新定价半导体设备订单节奏，设备与材料企业出现分化反馈。', type: 'policy', occurredAt: '2025-02-18T06:15:00Z', location: '美国 · 华盛顿', coordinates: { longitude: -77.04, latitude: 38.91 }, importance: 'high', heat: 82, state: 'diverging', companyIds: ['asml', 'lam-research', 'naura'], themes: ['semiconductor', 'storage'], sourceCount: 25 },
  { id: 'kioxia-demand', title: '铠侠上调企业级 SSD 需求展望', summary: '数据中心客户补库带动 NAND 价格与出货预期同步改善，供应链热度由日本向亚洲扩散。', type: 'earnings', occurredAt: '2025-02-17T23:20:00Z', location: '日本 · 东京', coordinates: { longitude: 139.69, latitude: 35.68 }, importance: 'medium', heat: 73, state: 'developing', companyIds: ['kioxia', 'shin-etsu', 'samsung-elec'], themes: ['storage'], sourceCount: 19 },
  { id: 'ev-price', title: '亚洲电动车电池材料价格回落', summary: '原材料价格变化让新能源车产业链的利润预期出现重新分配。', type: 'supply', occurredAt: '2025-02-18T03:00:00Z', location: '中国 · 宁德', coordinates: { longitude: 119.52, latitude: 26.66 }, importance: 'medium', heat: 61, state: 'cooling', companyIds: ['catl'], themes: ['ev'], sourceCount: 12 },
];

const relationships: CompanyRelationship[] = [
  { id: 'sk-asml', sourceCompanyId: 'sk-hynix', targetCompanyId: 'asml', type: 'supplier', strength: 0.8, direction: 'mutual', description: '先进光刻设备合作与扩产订单' },
  { id: 'sk-tel', sourceCompanyId: 'sk-hynix', targetCompanyId: 'tokyo-electron', type: 'supplier', strength: 0.68, direction: 'mutual', description: '刻蚀与涂胶显影设备' },
  { id: 'sk-shin', sourceCompanyId: 'sk-hynix', targetCompanyId: 'shin-etsu', type: 'supplier', strength: 0.56, direction: 'forward', description: '硅片及关键材料供应' },
  { id: 'sk-micron', sourceCompanyId: 'sk-hynix', targetCompanyId: 'micron', type: 'competitor', strength: 0.76, direction: 'mutual', description: 'HBM 与 DRAM 全球竞争' },
  { id: 'sk-tsmc', sourceCompanyId: 'sk-hynix', targetCompanyId: 'tsmc', type: 'technology', strength: 0.62, direction: 'mutual', description: '先进封装技术协同' },
  { id: 'sk-samsung', sourceCompanyId: 'sk-hynix', targetCompanyId: 'samsung-elec', type: 'competitor', strength: 0.85, direction: 'mutual', description: '韩国存储产业核心竞争' },
  { id: 'micron-lam', sourceCompanyId: 'micron', targetCompanyId: 'lam-research', type: 'supplier', strength: 0.72, direction: 'forward', description: '存储制造设备订单' },
  { id: 'micron-wdc', sourceCompanyId: 'micron', targetCompanyId: 'western-digital', type: 'customer', strength: 0.5, direction: 'forward', description: '企业级存储产品协同' },
  { id: 'kioxia-shin', sourceCompanyId: 'kioxia', targetCompanyId: 'shin-etsu', type: 'supplier', strength: 0.66, direction: 'forward', description: 'NAND 制造材料' },
  { id: 'naura-cxmt', sourceCompanyId: 'naura', targetCompanyId: 'cxmt', type: 'supplier', strength: 0.57, direction: 'forward', description: '本土存储设备供应' },
  { id: 'tsmc-asml', sourceCompanyId: 'tsmc', targetCompanyId: 'asml', type: 'supplier', strength: 0.9, direction: 'mutual', description: 'EUV 光刻设备合作' },
];

const themes: IndustryTheme[] = [
  { id: 'storage', name: '存储芯片', color: '#ffb454', companyCount: 9, eventCount: 3 },
  { id: 'semiconductor', name: '半导体', color: '#63d6ff', companyCount: 7, eventCount: 1 },
  { id: 'ai', name: 'AI算力', color: '#a58bff', companyCount: 1, eventCount: 0 },
  { id: 'ev', name: '新能源汽车', color: '#62d6a5', companyCount: 1, eventCount: 1 },
  { id: 'healthcare', name: '医药', color: '#f287a2', companyCount: 1, eventCount: 0 },
  { id: 'space', name: '商业航天', color: '#75a8ff', companyCount: 1, eventCount: 0 },
];

const demoSteps: DemoStep[] = [
  { id: 'signal', label: '事件发生', time: '09:00', caption: '韩国存储企业上调资本开支', detail: 'SK海力士宣布扩充 HBM 与 DRAM 产能，全球存储供需预期被重新定价。', focus: { longitude: 127.44, latitude: 37.27 }, cameraAltitude: 6_800_000, durationMs: 4_200, highlightCompanyIds: ['sk-hynix'], activeRelationshipIds: [], activeEventId: 'memory-capex' },
  { id: 'korea', label: '韩国反馈', time: '09:18', caption: '核心公司率先出现市场反馈', detail: 'SK海力士与三星电子成交活跃度同步抬升，事件由单一公司扩展为区域产业信号。', focus: { longitude: 127.1, latitude: 37.3 }, cameraAltitude: 4_800_000, durationMs: 3_800, highlightCompanyIds: ['sk-hynix', 'samsung-elec'], activeRelationshipIds: ['sk-samsung'], activeEventId: 'memory-capex' },
  { id: 'netherlands', label: '设备扩散', time: '09:42', caption: '资本开支预期传导至欧洲设备端', detail: '镜头转向荷兰，ASML 的先进光刻设备订单预期被产业链重新评估。', focus: { longitude: 5.47, latitude: 51.44 }, cameraAltitude: 5_600_000, durationMs: 3_800, highlightCompanyIds: ['sk-hynix', 'asml'], activeRelationshipIds: ['sk-asml'], activeEventId: 'memory-capex' },
  { id: 'japan', label: '材料联动', time: '10:02', caption: '日本设备与材料企业依次响应', detail: '东京电子、信越化学与铠侠进入传播路径，设备、材料和 NAND 需求预期形成联动。', focus: { longitude: 139.69, latitude: 35.68 }, cameraAltitude: 5_200_000, durationMs: 4_000, highlightCompanyIds: ['sk-hynix', 'tokyo-electron', 'shin-etsu', 'kioxia'], activeRelationshipIds: ['sk-tel', 'sk-shin', 'kioxia-shin'], activeEventId: 'memory-capex' },
  { id: 'united-states', label: '美国重估', time: '10:28', caption: '美国存储与设备公司同步重估', detail: '美光、泛林集团和西部数据出现价格反馈，存储周期预期跨越太平洋。', focus: { longitude: -116.2, latitude: 40.5 }, cameraAltitude: 7_600_000, durationMs: 4_000, highlightCompanyIds: ['sk-hynix', 'micron', 'lam-research', 'western-digital'], activeRelationshipIds: ['sk-micron', 'micron-lam', 'micron-wdc'], activeEventId: 'memory-capex' },
  { id: 'greater-china', label: '亚洲制造', time: '10:48', caption: '制造、设备与本土存储继续扩散', detail: '台积电、北方华创与长鑫存储进入链路，先进封装与本土设备成为新的观察节点。', focus: { longitude: 119.2, latitude: 31.0 }, cameraAltitude: 6_800_000, durationMs: 4_200, highlightCompanyIds: ['sk-hynix', 'tsmc', 'naura', 'cxmt'], activeRelationshipIds: ['sk-tsmc', 'naura-cxmt', 'tsmc-asml'], activeEventId: 'memory-capex' },
  { id: 'cooling', label: '全球收束', time: '11:20', caption: '事件热度回落，全球视角恢复', detail: '随着新增信息被市场吸收，关系脉冲逐渐减弱，镜头回到全球资本地图并恢复缓慢旋转。', focus: { longitude: 112, latitude: 22 }, cameraAltitude: 24_500_000, durationMs: 4_600, highlightCompanyIds: [], activeRelationshipIds: [], activeEventId: 'memory-capex' },
];

export const mockDataset: AtlasDataset = { companies, events, relationships, themes, demo: { id: 'storage-capex', title: '全球存储产业资本开支变化', steps: demoSteps } };
