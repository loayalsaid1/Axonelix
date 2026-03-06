// 'use client';

import { BookOpen, FileText } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { DashboardNavCard } from '@/components/admin/dashboard/dashboard-nav-card';
import { DashboardQuickTips } from '@/components/admin/dashboard/dashboard-quick-tips';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="Welcome Back"
        description="Manage your educational materials and assessment questions from one place"
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardNavCard
          href="/admin/materials"
          title="Materials"
          description="Organize Learning Content"
          content="Create and manage modules, subjects, chapters, and lessons in a hierarchical structure."
          footer="Modules → Subjects → Chapters → Lessons"
          icon={BookOpen}
          variant="blue"
        />

        <DashboardNavCard
          href="/admin/questions"
          title="Questions"
          description="Build Assessments"
          content="Create multiple-choice questions and organize them into old exam collections."
          footer="Questions & Old Exams"
          icon={FileText}
          variant="green"
        />

        <div>
          <DashboardQuickTips />
        </div>
      </div>
    </div>
  );
}
