import { useState, useEffect, useCallback } from 'react';

export interface Module {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/modules');
      const data = await response.json();
      setModules(data.modules || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch modules'));
      console.error('Failed to fetch modules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModule = useCallback(async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        return true;
      }
      return false;
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
