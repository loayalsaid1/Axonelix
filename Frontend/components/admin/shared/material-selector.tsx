'use client';

import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Module {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  type: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  name: string;
}

interface MaterialSelectorProps {
  modules: Module[];
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
  selectedModule: string;
  selectedSubject: string;
  selectedChapter: string;
  lessonId: string;
  isMisc: boolean;
  onModuleChange: (moduleId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onChapterChange: (chapterId: string) => void;
  onLessonChange: (lessonId: string) => void;
  onIsMiscChange: (isMisc: boolean) => void;
}

export function MaterialSelector({
  modules,
  subjects,
  chapters,
  lessons,
  selectedModule,
  selectedSubject,
  selectedChapter,
  lessonId,
  isMisc,
  onModuleChange,
  onSubjectChange,
  onChapterChange,
  onLessonChange,
  onIsMiscChange,
}: MaterialSelectorProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-muted/50 min-w-0">
      <h3 className="text-sm font-semibold">Link to Material</h3>

      {/* Module Selection */}
      <div className="space-y-2">
        <Label htmlFor="module">Module</Label>
        <Select value={selectedModule} onValueChange={onModuleChange}>
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

      {/* Subject Selection */}
      {selectedModule && (
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chapter Selection */}
      {selectedSubject && (
        <div className="space-y-2">
          <Label htmlFor="chapter">Chapter</Label>
          <Select value={selectedChapter} onValueChange={onChapterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lesson Selection */}
      {selectedChapter && (
        <>
          <div className="space-y-2">
            <Label htmlFor="lesson">Lesson (Optional)</Label>
            <Select
              value={lessonId || 'none'}
              onValueChange={(val) => {
                onLessonChange(val === 'none' ? '' : val);
                onIsMiscChange(val === 'none');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Misc question (no specific lesson)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Misc (Chapter-wide)</SelectItem>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!lessonId && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_misc"
                checked={isMisc}
                onCheckedChange={(checked) => onIsMiscChange(!!checked)}
              />
              <Label htmlFor="is_misc" className="text-sm text-muted-foreground">
                Mark as miscellaneous (not tied to specific lesson)
              </Label>
            </div>
          )}
        </>
      )}
    </div>
  );
}
