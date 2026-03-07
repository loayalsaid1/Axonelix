'use client';

import { useState, useEffect } from 'react';
import type { RecentMaterial } from '@/lib/admin-db';

export function useRecentMaterials(limit: number = 10) {
  const [materials, setMaterials] = useState<RecentMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/materials/recent?limit=${limit}`);
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Failed to fetch recent materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [limit]);

  return { materials, loading, refetch: fetchMaterials };
}
