'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface Props {
  moduleId: string;
  subjectId: string;
  chapterId: string;
  isMisc?: boolean;
  onModuleChange: (id: string) => void;
  onSubjectChange: (id: string) => void;
  onChapterChange: (id: string) => void;
  onIsMiscChange?: (isMisc: boolean) => void;
  open?: boolean;
  required?: boolean;
}

export default function MaterialHierarchySelect({
  moduleId,
  subjectId,
  chapterId,
  isMisc = false,
  onModuleChange,
  onSubjectChange,
  onChapterChange,
  onIsMiscChange,
  open,
  required = true,
}: Props) {
  const [modules, setModules] = useState<any[]>([]);
  const authFetch = useApiFetch();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const prevModuleRef = useRef<string | null>(null);
  const prevSubjectRef = useRef<string | null>(null);
  useEffect(() => {
    if (open) fetchModules();
  }, [open]);

  useEffect(() => {
    if (moduleId) {
      fetchSubjects(moduleId);
      // Only clear downstream selections if module actually changed (not on initial mount)
      if (prevModuleRef.current !== null && prevModuleRef.current !== moduleId) {
        onSubjectChange('');
        onChapterChange('');
      }
      prevModuleRef.current = moduleId;
    } else {
      setSubjects([]);
      setChapters([]);
    }
  }, [moduleId]);

  useEffect(() => {
    if (subjectId) {
      fetchChapters(subjectId);
      // Only clear chapter if subject actually changed (not on initial mount)
      if (prevSubjectRef.current !== null && prevSubjectRef.current !== subjectId) {
        onChapterChange('');
      }
      prevSubjectRef.current = subjectId;
    } else {
      setChapters([]);
    }
  }, [subjectId]);

  const fetchModules = async () => {
    try {
      const data = await authFetch<any[]>('/materials/modules');
      setModules(data.map((m) => ({ ...m, id: String(m.id) })));
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchSubjects = async (moduleId: string) => {
    try {
      const data = await authFetch<any[]>(`/materials/subjects?moduleId=${moduleId}`);
      setSubjects(data.map((s) => ({ ...s, id: String(s.id) })));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const data = await authFetch<any[]>(`/materials/subjects/${subjectId}/chapters`);
      setChapters(data.map((c) => ({ ...c, id: String(c.id) })));
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Module *</Label>
        <Select value={moduleId} onValueChange={onModuleChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Subject *</Label>
        <Select value={subjectId} onValueChange={onSubjectChange} disabled={!moduleId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Chapter *</Label>
        <Select
          value={isMisc ? '' : chapterId}
          onValueChange={onChapterChange}
          disabled={!subjectId || isMisc}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={isMisc ? "Miscellaneous (auto)" : "Select chapter"} />
          </SelectTrigger>
          <SelectContent>
            {chapters.filter((c) => !c.isMiscellaneous).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {subjectId && onIsMiscChange && (
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="is_misc_lesson"
              checked={isMisc}
              onCheckedChange={(checked) => {
                onIsMiscChange(!!checked);
                if (checked) {
                  onChapterChange('');
                } else {
                  onChapterChange(chapterId);
                }
              }}
            />
            <Label htmlFor="is_misc_lesson" className="text-xs text-muted-foreground cursor-pointer">
              Miscellaneous (not part of any chapter)
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
