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
// import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import type { JSONContent } from '@tiptap/react';

interface EditLessonDialogProps {
  lessonId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonUpdated: () => void;
}

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

export default function EditLessonDialog({
  lessonId,
  open,
  onOpenChange,
  onLessonUpdated,
}: EditLessonDialogProps) {
  const editorRef = useRef<SimpleEditorRefHandler>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order_index: 0
  });
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(undefined);

  useEffect(() => {
    if (lessonId && open) {
      fetchLesson();
    }
  }, [lessonId, open]);

  const fetchLesson = async () => {
    if (!lessonId) return;

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`);
      const data = await response.json();
      console.log('Fetched lesson data:', data);
      if (data.lesson) {
        setFormData({
          name: data.lesson.name,
          description: data.lesson.description || '',
          order_index: data.lesson.order_index || 0,
        });

        if (data.lesson.content) {
          try {
            const content = typeof data.lesson.content === 'string'
              ? JSON.parse(data.lesson.content)
              : data.lesson.content;
            setInitialContent(content);
          } catch (e) {
            setInitialContent(undefined);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId) return;

    setLoading(true);

    try {
      const content = editorRef.current?.getJSON() || {};

      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        onLessonUpdated();
      }
    } catch (error) {
      console.error('Failed to update lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>Update the lesson details and content</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lesson Name</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Variables"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the lesson content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2 border rounded-lg p-4">
            <Label>Lesson Content</Label>
            <div className="border rounded-lg overflow-hidden">
              {/* <SimpleEditor ref={editorRef} initialContent={initialContent} key={lessonId} /> */}
              <div className="p-4 text-sm text-gray-500">
                Content will be displayed here
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
