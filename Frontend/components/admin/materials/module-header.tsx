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
    <>
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <AdminPageHeader
        title={module.name}
        description={module.description}
        className="mb-8"
      />
    </>
  );
}
