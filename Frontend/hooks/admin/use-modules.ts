import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

export interface Module {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Module[]>('/materials/modules');
      setModules(data.map((m) => ({ ...m, id: String(m.id) })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
      console.error('Failed to fetch modules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModule = useCallback(async (moduleId: string) => {
    try {
      await apiFetch(`/materials/modules/${moduleId}`, { method: 'DELETE' });
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      return true;
    } catch (err) {
      console.error('Failed to delete module:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    modules,
    loading,
    error,
    refetch: fetchModules,
    deleteModule,
  };
}
