'use client';

import { useState } from 'react';
import { useModules } from '@/hooks/admin/use-modules';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import CreateModuleDialog from '@/components/admin/dialogs/create-module-dialog';
import EditModuleDialog from '@/components/admin/dialogs/edit-module-dialog';

export function ModulesList() {
  const { modules, loading, deleteModule, refetch } = useModules();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    await deleteModule(moduleId);
  };

  const handleModuleCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleEditModule = (moduleId: string) => {
    setEditingModuleId(moduleId);
    setShowEditDialog(true);
  };

  const handleModuleUpdated = () => {
    setShowEditDialog(false);
    setEditingModuleId(null);
    refetch();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All Modules</h2>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
        >
          New Module
        </button>
      </div>

      <CreateModuleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onModuleCreated={handleModuleCreated}
      />

      <EditModuleDialog
        moduleId={editingModuleId}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onModuleUpdated={handleModuleUpdated}
      />

      {loading ? (
        <AdminLoadingGrid />
      ) : modules.length === 0 ? (
        <AdminEmptyState
          title="No modules yet"
          description="Create your first module to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <AdminResourceCard
              key={module.id}
              title={module.name}
              description={module.description}
              href={`/admin/materials/${module.id}`}
              date={new Date(module.created_at).toLocaleDateString()}
              onEdit={() => handleEditModule(module.id)}
              onDelete={() => handleDeleteModule(module.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
