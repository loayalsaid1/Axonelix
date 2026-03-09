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
import { apiFetch } from '@/lib/api/client';

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
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    examType: 'final' as 'final' | 'midterm' | 'tpl' | 'flipped',
    moduleId: '',
    moduleType: 'theoretical' as 'theoretical' | 'practical',
    universityId: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (open) {
      fetchModules();
      fetchUniversities();
    }
  }, [open]);

  const fetchModules = async () => {
    const data = await apiFetch<any[]>('/materials/modules');
    setModules(data.map((m) => ({ id: String(m.id), name: m.name })));
  };

  const fetchUniversities = async () => {
    const data = await apiFetch<any[]>('/questions/universities');
    setUniversities(data.map((u) => ({ id: String(u.id), name: u.name })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moduleId || !formData.universityId) {
      alert('Please select module and university');
      return;
    }
    setLoading(true);

    try {
      await apiFetch('/questions/old-exams', {
        method: 'POST',
        body: { examType: formData.examType, moduleId: Number(formData.moduleId), moduleType: formData.moduleType, universityId: Number(formData.universityId), year: formData.year },
      });
      onOpenChange(false);
      onExamCreated();
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
              value={formData.examType}
              onValueChange={(value: any) => setFormData({ ...formData, examType: value })}
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
              value={formData.moduleId}
              onValueChange={(value) => setFormData({ ...formData, moduleId: value })}
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
              value={formData.moduleType}
              onValueChange={(value: any) => setFormData({ ...formData, moduleType: value })}
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
              value={formData.universityId}
              onValueChange={(value) => setFormData({ ...formData, universityId: value })}
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
