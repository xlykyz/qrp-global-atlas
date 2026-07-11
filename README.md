# QRP Global Atlas

**QRP Global Atlas｜全球上市公司与资本事件动态感知系统**，将资本事件、上市公司行情反馈和产业关系组织在同一颗三维地球上，以空间、时间和关系叙事表达“事件发生 → 公司反馈 → 产业扩散 → 全球联动”。

首期页面为 `/global-atlas`，面向 1920×1080、2560×1440 桌面全屏、大屏路演和视频录制场景。

## 技术栈

- React 18、TypeScript strict
- Vite 6
- CesiumJS 1.126+
- Vitest

## 安装与启动

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/global-atlas`。

生产构建与预览：

```bash
npm run build
npm run preview
```

运行基础测试：

```bash
npm test
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
VITE_DATA_MODE=mock
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CESIUM_ION_TOKEN=
```

- `VITE_DATA_MODE=mock`：通过统一数据访问层加载 Mock 数据。
- `VITE_DATA_MODE=api`：请求 `${VITE_API_BASE_URL}/atlas/snapshot`。
- `VITE_CESIUM_ION_TOKEN`：可选。留空时使用椭球地形和 OpenStreetMap 影像；生产环境应配置合规地图服务、缓存策略和来源标注。

请求支持超时和取消；Mock 与 API 返回均经过数据结构、引用 ID 和经纬度校验。页面统一处理加载、错误、重试和空数据状态。

## 产品交互

- **今日热点**：默认突出最近资本事件；选择事件后展开地点、关联公司、行情反馈和传播路径。
- **公司分布**：展示上市公司空间分布，Cesium 点图层支持聚合，并以缩放距离控制标签和市值柱体密度。
- **产业链**：按产业主题收敛公司与事件，按当前上下文逐步激活供应、竞争、技术和市场关系弧线。
- **地图选取**：公司与事件实体可直接选择，详情面板与镜头飞行同步更新。
- **历史回放**：七个叙事节点描述事件出现、韩国反馈、欧洲设备、日本材料、美国重估、亚洲制造和全球收束。
- **自动演示**：支持开始、暂停、继续、重播、上一步、下一步、速度调整和退出；退出后恢复手动操作与全球视角。

## Cesium 架构

`GlobeView` 只负责将控制器状态映射为 Cesium 表达。公司、事件和关系分别使用独立 `CustomDataSource`，可单独显隐和更新；Viewer 只初始化一次，监听器、旋转回调、输入处理器和数据源在卸载时统一释放。

公司聚合、按需标签、距离显示、上下文关系加载和相机请求修订号共同限制无效渲染。影像底图保留 Cesium 与 OSM attribution。

## 数据对象与接口约定

类型定义位于 `src/data/types.ts`：

- `Company`：标识、证券信息、国家/城市、总部坐标、行业主题、市值、涨跌、活跃度、开闭市状态和热度。
- `CapitalEvent`：标题、摘要、类型、时间、地点、重要程度、热度、生命周期、关联公司/主题和来源数。
- `CompanyRelationship`：源公司、目标公司、类型、方向、强度和说明。
- `IndustryTheme`：主题名称、语义色及公司/事件数量。
- `DemoScenario` / `DemoStep`：节点时序、镜头目标与高度、持续时长、事件、公司高亮和激活关系。

真实 API 当前采用统一快照接口：

```http
GET /api/atlas/snapshot
```

返回结构为 `AtlasDataset`。组件不依赖 Mock 文件；后续可在 `AtlasRepository` 下拆分概览、列表、详情、关系、主题和演示场景请求，而无需改变页面组件。

## 如何扩展

- 新增公司、事件、关系或产业主题：修改 `src/data/mockData.ts`，保持关联 ID、主题 ID 和坐标有效；数据校验器会在加载时检查引用完整性。
- 新增演示场景：在数据集中提供 `DemoScenario`，每个 `DemoStep` 声明镜头、持续时间、事件、公司和关系，不直接操作 Cesium。
- 接入真实 API：实现 `AtlasRepository`，或调整 `ApiAtlasRepository.load` 的协议。
- 新增地图表达：集中修改 `src/components/GlobeView.tsx`，不要在业务面板中持有或操作 Viewer。

## 当前边界

- Mock 数据包含 16 家代表性公司、4 个事件、11 条关系、6 个产业主题和 1 个完整七步演示场景，用于产品闭环展示，不代表实时行情。
- 首期按代表性数据规模渲染；扩展到 500—1000 家公司时可继续接入按视口分块、服务端聚合和增量关系接口。
- API 模式要求后端返回匹配 `AtlasDataset` 的数据，并负责鉴权、限流、缓存和实时数据质量。
- 正式部署应使用符合授权条款的地图服务与 Cesium 资源配置。
