'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UniversitySelector } from './university-selector';
import { University } from '@/hooks/admin/use-universities';

interface Module {
  id: string;
  name: string;
}

interface OldExamFormData {
  universityId: string;
  moduleId: string;
  moduleType: 'theoretical' | 'practical';
  examType: 'final' | 'midterm' | 'tpl' | 'flipped';
  year: number;
}

interface OldExamFormProps {
  data: OldExamFormData;
  onChange: (data: OldExamFormData) => void;
  modules: Module[];
  universities: University[];
  onCreateUniversity: (name: string) => Promise<void>;
}

export function OldExamForm({
  data,
  onChange,
  modules,
  universities,
  onCreateUniversity,
}: OldExamFormProps) {
  const updateField = <K extends keyof OldExamFormData>(field: K, value: OldExamFormData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
      <h3 className="text-sm font-semibold">Old Exam Details</h3>

      {/* University Selection */}
      <UniversitySelector
        universities={universities}
        value={data.universityId}
        onValueChange={(val) => updateField('universityId', val)}
        onCreateUniversity={onCreateUniversity}
      />

      {/* Module Selection */}
      <div className="space-y-2">
        <Label htmlFor="old-exam-module">Module</Label>
        <Select value={data.moduleId} onValueChange={(val) => updateField('moduleId', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.id} value={module.id}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module Type */}
      <div className="space-y-2">
        <Label htmlFor="module-type">Module Type</Label>
        <Select
          value={data.moduleType}
          onValueChange={(val: 'theoretical' | 'practical') => updateField('moduleType', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theoretical">Theoretical</SelectItem>
            <SelectItem value="practical">Practical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exam Type */}
      <div className="space-y-2">
        <Label htmlFor="exam-type">Exam Type</Label>
        <Select
          value={data.examType}
          onValueChange={(val: 'final' | 'midterm' | 'tpl' | 'flipped') =>
            updateField('examType', val)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select exam type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="midterm">Mid-Term</SelectItem>
            <SelectItem value="tpl">TBL</SelectItem>
            <SelectItem value="flipped">Flipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          value={data.year}
          onChange={(e) => updateField('year', parseInt(e.target.value))}
        />
      </div>

      <div className="text-xs text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded">
        <strong>Note:</strong> If an old exam with these exact parameters already exists, the
        question will be added to it. Otherwise, a new old exam will be created.
      </div>
    </div>
  );
}
