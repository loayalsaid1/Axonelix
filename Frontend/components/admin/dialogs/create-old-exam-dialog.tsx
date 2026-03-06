'use client';

import React, { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Module, University } from "@/lib/types";

interface CreateOldExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExamCreated: () => void;
}

export default function CreateOldExamDialog({
  open,
  onOpenChange,
  onExamCreated,
}: CreateOldExamDialogProps) {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [formData, setFormData] = useState({
    exam_type: 'final' as 'final' | 'midterm' | 'tpl' | 'flipped',
    module_id: '',
    module_type: 'theoretical' as 'theoretical' | 'practical',
    university_id: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (open) {
      fetchModules();
      fetchUniversities();
    }
  }, [open]);

  const fetchModules = async () => {
    const res = await fetch('/api/admin/modules');
    const data = await res.json();
    setModules(data.modules || []);
  };

  const fetchUniversities = async () => {
    const res = await fetch('/api/admin/universities');
    const data = await res.json();
    setUniversities(data.universities || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_id || !formData.university_id) {
      alert('Please select module and university');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/admin/old-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onOpenChange(false);
        onExamCreated();
      }
    } catch (error) {
      console.error('Failed to create old exam:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Old Exam</DialogTitle>
          <DialogDescription>Create a collection for old exam questions</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam_type">Exam Type</Label>
            <Select 
              value={formData.exam_type} 
              onValueChange={(value: any) => setFormData({ ...formData, exam_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="midterm">Midterm</SelectItem>
                <SelectItem value="tpl">TPL</SelectItem>
                <SelectItem value="flipped">Flipped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select 
              value={formData.module_id} 
              onValueChange={(value) => setFormData({ ...formData, module_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module_type">Module Type</Label>
            <Select 
              value={formData.module_type} 
              onValueChange={(value: any) => setFormData({ ...formData, module_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">Theoretical</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Select 
              value={formData.university_id} 
              onValueChange={(value) => setFormData({ ...formData, university_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              min={2000}
              max={2100}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
