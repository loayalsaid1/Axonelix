// 'use client';

import { BookOpen, FileText, Layers, Users, CreditCard } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { DashboardNavCard } from '@/components/admin/dashboard/dashboard-nav-card';
import { DashboardQuickTips } from '@/components/admin/dashboard/dashboard-quick-tips';

const ADMIN_NAVIGATION_CARDS = [
  {
    href: "/admin/materials",
    title: "Materials",
    description: "Organize Learning Content",
    content: "Create and manage modules, subjects, chapters, and lessons in a hierarchical structure.",
    footer: "Modules → Subjects → Chapters → Lessons",
    icon: BookOpen,
    variant: "blue" as const,
  },
  {
    href: "/admin/questions",
    title: "Questions",
    description: "Build Assessments",
    content: "Create multiple-choice questions and organize them into old exam collections.",
    footer: "Questions & Old Exams",
    icon: FileText,
    variant: "green" as const,
  },
  {
    href: "/admin/flashcards",
    title: "Flashcards",
    description: "Manage Active Recall Decks",
    content: "Create and maintain official lesson flashcards, then edit and reorder cards for the best review flow.",
    footer: "Official Lesson Decks",
    icon: Layers,
    variant: "default" as const,
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Manage Students & Staff",
    content: "View user profiles, manage roles, and track student activity across the platform.",
    footer: "User Management & Roles",
    icon: Users,
    variant: "default" as const,
  },
  {
    href: "/admin/subscriptions",
    title: "Subscriptions",
    description: "Payments & Student Access",
    content: "Review payment requests, grant manual module access, and manage student subscriptions.",
    footer: "Payment Verification & Access Control",
    icon: CreditCard,
    variant: "blue" as const,
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="Welcome Back"
        description="Manage your educational materials and assessment questions from one place"
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_NAVIGATION_CARDS.map((card) => (
          <DashboardNavCard
            key={card.href}
            {...card}
          />
        ))}

        <div className="lg:col-start-3">
          <DashboardQuickTips />
        </div>
      </div>
    </div>
  );
}
