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

interface EditModuleDialogProps {
  moduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModuleUpdated: () => void;
}

export default function EditModuleDialog({
  moduleId,
  open,
  onOpenChange,
  onModuleUpdated,
}: EditModuleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', order_index: 0 });

  useEffect(() => {
    if (moduleId && open) {
      fetchModule();
    }
  }, [moduleId, open]);

  const fetchModule = async () => {
    if (!moduleId) return;
    
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`);
      const data = await response.json();
      if (data.module) {
        setFormData({
          name: data.module.name,
          description: data.module.description || '',
          order_index: data.module.order_index || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onOpenChange(false);
        onModuleUpdated();
      }
    } catch (error) {
      console.error('Failed to update module:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogDescription>Update the module details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Module Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics 101"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the module content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
