'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { JSONContent } from '@tiptap/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import MaterialHierarchySelect from '@/components/admin/dialogs/material-hierarchy-select';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

interface LessonWithHierarchy {
  id: string;
  chapterId: number;
  name: string;
  description: string;
  content: JSONContent;
  orderIndex: number;
  isMisc?: boolean;
  createdAt: string;
  updatedAt: string;
  chapter: {
    id: number;
    name: string;
    subject: {
      id: number;
      name: string;
      type: string;
      module: {
        id: number;
        name: string;
      };
    };
  };
}

export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const authFetch = useApiFetch();
  const editorRef = useRef<SimpleEditorRefHandler>(null);

  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonWithHierarchy | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [moduleId, setModuleId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [isMisc, setIsMisc] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        const lessonData = await authFetch<LessonWithHierarchy>(`/materials/lessons/${lessonId}`);

        // Parse content if it's a string
        if (typeof lessonData.content === 'string') {
          lessonData.content = JSON.parse(lessonData.content);
        }

        setLesson(lessonData);
        setName(lessonData.name);
        setDescription(lessonData.description);
        setOrderIndex(String(lessonData.orderIndex || 0));
        setModuleId(String(lessonData.chapter?.subject?.module?.id || ''));
        setSubjectId(String(lessonData.chapter?.subject?.id || ''));
        setChapterId(String(lessonData.chapterId || ''));
        setIsMisc(lessonData.isMisc || false);
      } catch (error: unknown) {
        console.error('Error fetching lesson:', error);
        toast.error('Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get content from editor
      const content = editorRef.current?.getJSON();

      if (!name.trim()) {
        toast.error('Lesson name is required');
        return;
      }

      const actualChapterId = isMisc ? null : Number(chapterId || lesson?.chapterId);

      const updated = await authFetch<LessonWithHierarchy>(`/materials/lessons/${lessonId}`, {
        method: 'PATCH',
        body: {
          name,
          description,
          content,
          orderIndex: parseInt(orderIndex) || 0,
          chapterId: actualChapterId,
          subjectId: Number(subjectId),
          isMisc,
        },
      });

      setLesson(updated);
      setName(updated.name);
      setDescription(updated.description);
      setOrderIndex(String(updated.orderIndex || 0));
      setModuleId(String(updated.chapter?.subject?.module?.id || ''));
      setSubjectId(String(updated.chapter?.subject?.id || ''));
      setChapterId(String(updated.chapterId || ''));
      setIsMisc(updated.isMisc || false);

      toast.success('Lesson saved successfully');
    } catch (error: unknown) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Not Found</CardTitle>
            <CardDescription>The requested lesson could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/materials">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Materials
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const backUrl = `/admin/materials/${lesson.chapter.subject.module.id}/${lesson.chapter.subject.id}/${lesson.chapter.id}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href={backUrl}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lessons
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-2">
            <span>{lesson.chapter.subject.module.name}</span>
            <span className="mx-2">/</span>
            <span>{lesson.chapter.subject.name}</span>
            <span className="mx-2">/</span>
            <span>{lesson.chapter.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Lesson Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>Edit the lesson details and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lesson Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter lesson name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter lesson description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderIndex">Order Index</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-4">
                <Label>Hierarchy</Label>
                <MaterialHierarchySelect
                  moduleId={moduleId}
                  subjectId={subjectId}
                  chapterId={chapterId}
                  isMisc={isMisc}
                  onModuleChange={(id) => setModuleId(id)}
                  onSubjectChange={(id) => setSubjectId(id)}
                  onChapterChange={(id) => setChapterId(id)}
                  onIsMiscChange={(misc) => setIsMisc(misc)}
                  open={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Editor Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
              <CardDescription>Edit the lesson content using the rich text editor</CardDescription>
            </CardHeader>
            <CardContent>
              {lesson.content ? (
                <div className="border rounded-lg overflow-hidden">
                  <SimpleEditor
                    key={lesson.id}
                    ref={editorRef}
                    initialContent={lesson.content}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
