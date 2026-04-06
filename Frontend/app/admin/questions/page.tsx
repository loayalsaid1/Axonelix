'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { QuestionsList } from '@/components/admin/questions/questions-list';
import { OldExamsList } from '@/components/admin/questions/old-exams-list';

export default function QuestionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'exams' ? 'exams' : 'questions';

  const handleTabChange = useCallback(
    (nextTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', nextTab);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, pathname, router],
  );

  return (
    <div className="p-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <AdminPageHeader
          title="Assessment Management"
          description="Create and organize questions and old exams"
          className="mb-8"
        />

        <TabsList className="mb-6">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="exams">Old Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <QuestionsList />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <OldExamsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
