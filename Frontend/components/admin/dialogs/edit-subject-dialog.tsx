'use client';

import React, { useState, useEffect } from 'react';
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
import { apiFetch } from '@/lib/api/client';

interface EditSubjectDialogProps {
  subjectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectUpdated: () => void;
}

export default function EditSubjectDialog({
  subjectId,
  open,
  onOpenChange,
  onSubjectUpdated,
}: EditSubjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'theoretical' as 'theoretical' | 'practical',
    orderIndex: 0
  });

  useEffect(() => {
    if (subjectId && open) {
      fetchSubject();
    }
  }, [subjectId, open]);

  const fetchSubject = async () => {
    if (!subjectId) return;

    try {
      const data = await apiFetch<any>(`/materials/subjects/${subjectId}`);
      setFormData({
        name: data.name,
        description: data.description || '',
        type: data.type,
        orderIndex: data.orderIndex || 0,
      });
    } catch (error) {
      console.error('Failed to fetch subject:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    setLoading(true);

    try {
      await apiFetch(`/materials/subjects/${subjectId}`, {
        method: 'PATCH',
        body: { name: formData.name, description: formData.description, type: formData.type, orderIndex: formData.orderIndex },
      });
      onOpenChange(false);
      onSubjectUpdated();
    } catch (error) {
      console.error('Failed to update subject:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>Update the subject details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g., Algebra Basics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the subject content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">Theoretical</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="orderIndex"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Subject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
