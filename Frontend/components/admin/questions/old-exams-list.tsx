'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOldExams, OldExam } from '@/hooks/admin/use-old-exams';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import OldExamDialog from '@/components/admin/dialogs/old-exam-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function OldExamsList() {
  const { exams, loading, refetch, deleteExam } = useOldExams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [examToEdit, setExamToEdit] = useState<OldExam | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const handleExamCreatedOrUpdated = () => {
    setShowCreateDialog(false);
    setExamToEdit(null);
    refetch();
  };

  const handleEdit = (exam: OldExam) => {
    setExamToEdit(exam);
    setShowCreateDialog(true);
  };

  const handleDelete = (examId: string) => {
    setExamToDelete(examId);
  };

  const confirmDelete = async () => {
    if (examToDelete) {
      await deleteExam(examToDelete);
      setExamToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <OldExamDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setExamToEdit(null);
        }}
        onExamCreated={handleExamCreatedOrUpdated}
        examToEdit={examToEdit}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Old Exam Collections</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Old Exam
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <AdminResourceCard
              key={exam.id}
              title={`${exam.examType.toUpperCase()} ${exam.year}`}
              description={`${exam.module?.name || 'Module'} - ${exam.university?.name || 'University'}`}
              href={'/admin/questions/exams/' + exam.id}
              onEdit={() => handleEdit(exam)}
              onDelete={() => handleDelete(exam.id)}
              badge={
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {exam.moduleType}
                </span>
              }
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the old exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
