'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { University } from '@/hooks/admin/use-universities';

interface UniversitySelectorProps {
  universities: University[];
  value: string;
  onValueChange: (value: string) => void;
  onCreateUniversity: (name: string) => Promise<void>;
  disabled?: boolean;
}

export function UniversitySelector({
  universities,
  value,
  onValueChange,
  onCreateUniversity,
  disabled = false,
}: UniversitySelectorProps) {
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert('Please enter university name');
      return;
    }

    setCreating(true);
    try {
      await onCreateUniversity(newName.trim());
      setNewName('');
      setShowNewInput(false);
    } catch (error) {
      console.error('Failed to create university:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setShowNewInput(false);
    setNewName('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="university">University</Label>
      {!showNewInput ? (
        <div className="flex gap-2">
          <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewInput(true)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter university name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleCreate} disabled={creating}>
            {creating ? 'Adding...' : 'Add'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={creating}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
