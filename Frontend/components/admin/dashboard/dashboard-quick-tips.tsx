import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function DashboardQuickTips() {
  return (
    <Card className="h-full bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl">Getting Started</CardTitle>
          <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <CardDescription className="text-base">Quick Tips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">1. Create Materials First</p>
          <p className="text-muted-foreground text-xs">Start by setting up your course structure</p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">2. Add Questions</p>
          <p className="text-muted-foreground text-xs">Create assessment questions for your content</p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">3. Organize Exams</p>
          <p className="text-muted-foreground text-xs">Group questions into old exam collections</p>
        </div>
      </CardContent>
    </Card>
  );
}
