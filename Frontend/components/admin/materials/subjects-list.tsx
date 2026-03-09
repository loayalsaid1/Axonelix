'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/admin/use-subjects';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import CreateSubjectDialog from '@/components/admin/dialogs/create-subject-dialog';
import EditSubjectDialog from '@/components/admin/dialogs/edit-subject-dialog';

interface SubjectsListProps {
  moduleId: string;
}

export function SubjectsList({ moduleId }: SubjectsListProps) {
  const { subjects, loading, deleteSubject, refetch } = useSubjects(moduleId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    await deleteSubject(subjectId);
  };

  const handleSubjectCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleEditSubject = (subjectId: string) => {
    setEditingSubjectId(subjectId);
    setShowEditDialog(true);
  };

  const handleSubjectUpdated = () => {
    setShowEditDialog(false);
    setEditingSubjectId(null);
    refetch();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Subjects</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Subject
        </Button>
      </div>

      <CreateSubjectDialog
        moduleId={moduleId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubjectCreated={handleSubjectCreated}
      />

      <EditSubjectDialog
        subjectId={editingSubjectId}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubjectUpdated={handleSubjectUpdated}
      />

      {loading ? (
        <AdminLoadingGrid />
      ) : subjects.length === 0 ? (
        <AdminEmptyState
          title="No subjects yet"
          description="Create your first subject to organize chapters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <AdminResourceCard
              key={subject.id}
              title={subject.name}
              description={subject.description ?? undefined}
              href={`/admin/materials/${moduleId}/${subject.id}`}
              date={new Date(subject.createdAt).toLocaleDateString()}
              order={subject.orderIndex ?? undefined}
              badge={
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground shrink-0">
                  {subject.type}
                </span>
              }
              onEdit={() => handleEditSubject(subject.id)}
              onDelete={() => handleDeleteSubject(subject.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
