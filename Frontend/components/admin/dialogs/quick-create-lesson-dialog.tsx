'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import type { JSONContent } from '@tiptap/react';
import MaterialHierarchySelect from '@/components/admin/dialogs/material-hierarchy-select';
import { apiFetch } from '@/lib/api/client';

interface QuickCreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonCreated?: () => void;
}

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

export default function QuickCreateLessonDialog({
  open,
  onOpenChange,
  onLessonCreated,
}: QuickCreateLessonDialogProps) {
  const router = useRouter();
  const editorRef = useRef<SimpleEditorRefHandler>(null);
  const [loading, setLoading] = useState(false);

  const [lessonName, setLessonName] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');

  const [moduleId, setModuleId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [isMisc, setIsMisc] = useState(false);


  const resetForm = () => {
    setLessonName('');
    setLessonDescription('');
    setOrderIndex('0');
    setModuleId('');
    setSubjectId('');
    setChapterId('');
    setIsMisc(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const content = editorRef.current?.getJSON() || {};

      const actualChapterId = isMisc ? '' : chapterId;

      const data = await apiFetch<any>('/materials/lessons', {
        method: 'POST',
        body: {
          name: lessonName,
          description: lessonDescription,
          content,
          orderIndex: parseInt(orderIndex) || 0,
          chapterId: actualChapterId ? Number(actualChapterId) : null,
          subjectId: Number(subjectId),
          isMisc,
        },
      });

      resetForm();
      onOpenChange(false);
      onLessonCreated?.();

      if (data?.chapterId) {
        router.push(`/admin/materials/${moduleId}/${subjectId}/${data.chapterId}`);
      }
    } catch (error) {
      console.error('Failed to create lesson:', error);
      alert('Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Create Lesson</DialogTitle>
          <DialogDescription>
            Create a lesson by selecting existing module, subject, and chapter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Lesson Details</h3>
            <div className="space-y-2">
              <Label htmlFor="lessonName">Lesson Name *</Label>
              <Input
                id="lessonName"
                placeholder="e.g., Introduction to Variables"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDescription">Description *</Label>
              <Textarea
                id="lessonDescription"
                placeholder="Brief description of the lesson..."
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderIndex">Order Index</Label>
              <Input
                id="orderIndex"
                type="number"
                placeholder="0"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Select Hierarchy</h3>
            <MaterialHierarchySelect
              moduleId={moduleId}
              subjectId={subjectId}
              chapterId={chapterId}
              isMisc={isMisc}
              onModuleChange={(id) => setModuleId(id)}
              onSubjectChange={(id) => setSubjectId(id)}
              onChapterChange={(id) => setChapterId(id)}
              onIsMiscChange={(misc) => setIsMisc(misc)}
              open={open}
            />
          </div>

          <div className="space-y-2 border rounded-lg p-4">
            <Label>Lesson Content</Label>
            <div className="border rounded-lg overflow-hidden">
              <SimpleEditor ref={editorRef} />
              <div className="p-4 text-sm text-gray-500" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isMisc && !chapterId)}>
              {loading ? 'Creating...' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
