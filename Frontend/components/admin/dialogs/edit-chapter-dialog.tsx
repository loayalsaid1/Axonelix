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
import { Checkbox } from '@/components/ui/checkbox';

interface EditChapterDialogProps {
  chapterId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChapterUpdated: () => void;
}

export default function EditChapterDialog({
  chapterId,
  open,
  onOpenChange,
  onChapterUpdated,
}: EditChapterDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    is_miscellaneous: false,
    order_index: 0 
  });

  useEffect(() => {
    if (chapterId && open) {
      fetchChapter();
    }
  }, [chapterId, open]);

  const fetchChapter = async () => {
    if (!chapterId) return;
    
    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`);
      const data = await response.json();
      if (data.chapter) {
        setFormData({
          name: data.chapter.name,
          description: data.chapter.description || '',
          is_miscellaneous: data.chapter.is_miscellaneous || false,
          order_index: data.chapter.order_index || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch chapter:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterId) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onOpenChange(false);
        onChapterUpdated();
      }
    } catch (error) {
      console.error('Failed to update chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>Update the chapter details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chapter Name</Label>
            <Input
              id="name"
              placeholder="e.g., Linear Equations"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the chapter content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="is_miscellaneous"
              checked={formData.is_miscellaneous}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_miscellaneous: checked as boolean })
              }
            />
            <Label htmlFor="is_miscellaneous" className="cursor-pointer">
              Miscellaneous Chapter
            </Label>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Chapter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
