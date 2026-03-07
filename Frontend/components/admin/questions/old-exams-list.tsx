'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOldExams } from '@/hooks/admin/use-old-exams';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import CreateOldExamDialog from '@/components/admin/dialogs/create-old-exam-dialog';

export function OldExamsList() {
  const { exams, loading, refetch } = useOldExams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleExamCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <CreateOldExamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onExamCreated={handleExamCreated}
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
              title={`${exam.exam_type.toUpperCase()} ${exam.year}`}
              description={`${exam.module_name || 'Module'} - ${exam.university_name || 'University'}`}
              href={'/admin/questions/exams/' + exam.id}
              badge={
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {exam.module_type}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
