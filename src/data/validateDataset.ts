import type { AtlasDataset, Coordinates } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isCoordinates = (value: unknown): value is Coordinates => isRecord(value)
  && typeof value.longitude === 'number' && value.longitude >= -180 && value.longitude <= 180
  && typeof value.latitude === 'number' && value.latitude >= -90 && value.latitude <= 90;

export function validateAtlasDataset(value: unknown): AtlasDataset {
  if (!isRecord(value) || !Array.isArray(value.companies) || !Array.isArray(value.events) || !Array.isArray(value.relationships) || !Array.isArray(value.themes) || !isRecord(value.demo) || !Array.isArray(value.demo.steps)) {
    throw new Error('Atlas 数据结构不完整');
  }

  const companyIds = new Set<string>();
  value.companies.forEach((company, index) => {
    if (!isRecord(company) || !isString(company.id) || !isString(company.name) || !isCoordinates(company.coordinates) || !Array.isArray(company.themes)) throw new Error(`公司数据无效：index ${index}`);
    if (companyIds.has(company.id)) throw new Error(`公司标识重复：${company.id}`);
    companyIds.add(company.id);
  });

  const eventIds = new Set<string>();
  value.events.forEach((event, index) => {
    if (!isRecord(event) || !isString(event.id) || !isString(event.title) || !isCoordinates(event.coordinates) || !Array.isArray(event.companyIds) || !Array.isArray(event.themes)) throw new Error(`事件数据无效：index ${index}`);
    if (eventIds.has(event.id)) throw new Error(`事件标识重复：${event.id}`);
    eventIds.add(event.id);
    event.companyIds.forEach((id) => { if (!companyIds.has(String(id))) throw new Error(`事件关联了未知公司：${String(id)}`); });
  });

  const relationshipIds = new Set<string>();
  value.relationships.forEach((relationship, index) => {
    if (!isRecord(relationship) || !isString(relationship.id) || !isString(relationship.sourceCompanyId) || !isString(relationship.targetCompanyId)) throw new Error(`关系数据无效：index ${index}`);
    if (relationshipIds.has(relationship.id)) throw new Error(`关系标识重复：${relationship.id}`);
    if (!companyIds.has(relationship.sourceCompanyId) || !companyIds.has(relationship.targetCompanyId)) throw new Error(`关系关联了未知公司：${relationship.id}`);
    relationshipIds.add(relationship.id);
  });

  value.demo.steps.forEach((step, index) => {
    if (!isRecord(step) || !isString(step.id) || !isString(step.label) || !Array.isArray(step.highlightCompanyIds) || !Array.isArray(step.activeRelationshipIds)) throw new Error(`演示步骤无效：index ${index}`);
    if (step.focus !== undefined && !isCoordinates(step.focus)) throw new Error(`演示镜头坐标无效：${step.id}`);
    step.highlightCompanyIds.forEach((id) => { if (!companyIds.has(String(id))) throw new Error(`演示步骤关联了未知公司：${String(id)}`); });
    step.activeRelationshipIds.forEach((id) => { if (!relationshipIds.has(String(id))) throw new Error(`演示步骤关联了未知关系：${String(id)}`); });
    if (step.activeEventId !== undefined && !eventIds.has(String(step.activeEventId))) throw new Error(`演示步骤关联了未知事件：${String(step.activeEventId)}`);
  });

  return value as unknown as AtlasDataset;
}
