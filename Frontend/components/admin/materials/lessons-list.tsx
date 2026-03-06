'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLessons } from '@/hooks/admin/use-lessons';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import CreateLessonDialog from '@/components/admin/dialogs/create-lesson-dialog';

interface LessonsListProps {
  moduleId: string;
  subjectId: string;
  chapterId: string;
}

export function LessonsList({ moduleId, subjectId, chapterId }: LessonsListProps) {
  const router = useRouter();
  const { lessons, loading, deleteLesson, refetch } = useLessons(chapterId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    await deleteLesson(lessonId);
  };

  const handleLessonCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleEditLesson = (lessonId: string) => {
    router.push(`/admin/lessons/${lessonId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Lessons</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Lesson
        </Button>
      </div>

      <CreateLessonDialog
        chapterId={chapterId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onLessonCreated={handleLessonCreated}
      />

      {loading ? (
        <AdminLoadingGrid count={4} className="grid grid-cols-1 md:grid-cols-2 gap-6" />
      ) : lessons.length === 0 ? (
        <AdminEmptyState
          title="No lessons yet"
          description="Create your first lesson to deliver content"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <AdminResourceCard
              key={lesson.id}
              title={lesson.name}
              description={lesson.description}
              href={`/admin/lessons/${lesson.id}`}
              date={new Date(lesson.created_at).toLocaleDateString()}
              order={lesson.order_index}
              onEdit={() => handleEditLesson(lesson.id)}
              onDelete={() => handleDeleteLesson(lesson.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
