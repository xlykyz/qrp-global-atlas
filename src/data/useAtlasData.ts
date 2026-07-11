import { useEffect, useState } from 'react';
import type { AtlasDataset } from './types';
import { createRepository } from './api';

export function useAtlasData() {
  const [data, setData] = useState<AtlasDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    setLoading(true);
    setError(null);
    createRepository().load(controller.signal)
      .then((dataset) => { if (!disposed) setData(dataset); })
      .catch((reason: unknown) => {
        if (!disposed && (reason as Error)?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : '数据加载失败');
      })
      .finally(() => { if (!disposed) setLoading(false); });
    return () => { disposed = true; controller.abort(); };
  }, [requestVersion]);

  return { data, loading, error, reload: () => setRequestVersion((version) => version + 1) };
}
