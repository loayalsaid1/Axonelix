"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuestionType } from "@/lib/types/questions";

interface OldExamQuestionTypeFilterProps {
  questionType?: QuestionType;
}

const ALL_VALUE = "__all__";

export function OldExamQuestionTypeFilter({
  questionType,
}: OldExamQuestionTypeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setQuestionType = (type: QuestionType | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("qType", type);
    } else {
      params.delete("qType");
    }

    params.set("page", "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex justify-end items-center">
      <Field className="w-full sm:w-56 min-w-0">
        <FieldLabel>Question Type</FieldLabel>
        <Select
          value={questionType ?? ALL_VALUE}
          onValueChange={(value) =>
            setQuestionType(
              value === ALL_VALUE ? undefined : (value as QuestionType),
            )
          }
        >
          <SelectTrigger className="w-full min-w-0 h-9 text-sm">
            <SelectValue placeholder="All question types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All question types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="written">Written</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
