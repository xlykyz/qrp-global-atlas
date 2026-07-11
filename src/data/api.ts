import { mockDataset } from './mockData';
import type { AtlasDataset } from './types';
import { validateAtlasDataset } from './validateDataset';

const timeoutMs = 8000;

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
    return await response.json() as T;
  } catch (error) {
    if (timedOut) throw new Error(`请求超时（${timeoutMs / 1000} 秒）`);
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}

export interface AtlasRepository {
  load(signal?: AbortSignal): Promise<AtlasDataset>;
}

export class MockAtlasRepository implements AtlasRepository {
  async load(signal?: AbortSignal): Promise<AtlasDataset> {
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
      const onAbort = () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
      const timer = window.setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, 220);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
    return validateAtlasDataset(mockDataset);
  }
}

export class ApiAtlasRepository implements AtlasRepository {
  constructor(private readonly baseUrl: string) {}

  load(signal?: AbortSignal): Promise<AtlasDataset> {
    return request<unknown>(`${this.baseUrl.replace(/\/$/, '')}/atlas/snapshot`, signal).then(validateAtlasDataset);
  }
}

export const createRepository = (): AtlasRepository => import.meta.env.VITE_DATA_MODE === 'api'
  ? new ApiAtlasRepository(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  : new MockAtlasRepository();
