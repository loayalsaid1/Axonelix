import React, { useState, useRef } from 'react';
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

interface CreateLessonDialogProps {
  chapterId?: string;
  subjectId?: string;
  isMisc?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonCreated: () => void;
}

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

export default function CreateLessonDialog({
  chapterId,
  subjectId,
  isMisc,
  open,
  onOpenChange,
  onLessonCreated,
}: CreateLessonDialogProps) {
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<SimpleEditorRefHandler>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');

  const resetForm = () => {
    setName('');
    setDescription('');
    setOrderIndex('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const content = editorRef.current?.getJSON() || {};

      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          content,
          order_index: parseInt(orderIndex) || 0,
          chapterId,
          subjectId,
          isMisc,
        }),
      });

      if (response.ok) {
        resetForm();
        onOpenChange(false);
        onLessonCreated();
      }
    } catch (error) {
      console.error('Failed to create lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
          <DialogDescription>Add a new lesson with content and description</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lesson Name</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Functions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border rounded-lg overflow-hidden">
              {/* <SimpleEditor ref={editorRef} /> */}
              <div />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
