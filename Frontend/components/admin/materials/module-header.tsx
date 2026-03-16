'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { API_BASE_URL } from '@/lib/constants';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface Module {
  id: string;
  name: string;
  description: string;
}

interface ModuleHeaderProps {
  moduleId: string;
  backHref?: string;
  backLabel?: string;
}

export function ModuleHeader({ moduleId, backHref, backLabel = 'Back' }: ModuleHeaderProps) {
  const [module, setModule] = useState<Module | null>(null);
  const authFetch = useApiFetch();

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await authFetch<Module>(`/materials/modules/${moduleId}`);
        setModule(data);
      } catch (error) {
        console.error('Failed to fetch module:', error);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId, authFetch]);

  if (!module) return null;

  return (
    <AdminPageHeader
      title={module.name}
      description={module.description}
      backHref={backHref}
      backLabel={backLabel}
      className="mb-8"
    />
  );
}
