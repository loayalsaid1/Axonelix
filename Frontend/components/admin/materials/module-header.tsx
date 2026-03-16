'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';

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

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/admin/modules/${moduleId}`);
        const data = await response.json();
        setModule(data.module);
      } catch (error) {
        console.error('Failed to fetch module:', error);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

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
