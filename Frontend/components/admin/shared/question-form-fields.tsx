'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X } from 'lucide-react';
import {
  ReferenceSelector,
  ReferenceValue,
} from '@/components/admin/shared/reference-selector';
import { useQuestionReferences } from '@/hooks/admin/use-question-references';

interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
}

interface QuestionFormData {
  questionType: 'mcq' | 'written';
  statement: string;
  explanation: string;
  options: QuestionOption[];
  reference?: ReferenceValue;
}

interface QuestionFormFieldsProps {
  data: QuestionFormData;
  onChange: (data: Partial<QuestionFormData>) => void;
}

export function QuestionFormFields({ data, onChange }: QuestionFormFieldsProps) {
  const { references, loading } = useQuestionReferences();

  const updateField = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K]
  ) => {
    onChange({ [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[index].optionText = value;
    updateField('options', newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = data.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    updateField('options', newOptions);
  };

  const handleAddOption = () => {
    updateField('options', [...data.options, { optionText: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (data.options.length <= 2) return;
    const wasCorrect = data.options[index].isCorrect;
    const newOptions = data.options.filter((_, i) => i !== index);
    if (wasCorrect && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    updateField('options', newOptions);
  };

  return (
    <>
      {/* Question Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="questionType">Question Type</Label>
          <Select
            value={data.questionType}
            onValueChange={(val: 'mcq' | 'written') => updateField('questionType', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="written">Written</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question Statement */}
      <div className="space-y-2">
        <Label htmlFor="statement">Question Statement</Label>
        <Textarea
          id="statement"
          placeholder="Enter the question statement..."
          value={data.statement}
          onChange={(e) => updateField('statement', e.target.value)}
          required
          rows={4}
        />
      </div>

      {/* MCQ Options */}
      {data.questionType === 'mcq' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="h-8 gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </div>

          <RadioGroup
            value={data.options.findIndex((o) => o.isCorrect).toString()}
            onValueChange={(val) => handleCorrectChange(parseInt(val))}
          >
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <RadioGroupItem value={index.toString()} id={`opt-${index}`} />
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.optionText}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Explanation */}
      {/* <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          placeholder="Provide an explanation for the correct answer..."
          value={data.explanation}
          onChange={(e) => updateField('explanation', e.target.value)}
          rows={3}
        />
      </div> */}

      <div className="pt-4 border-t">
        <ReferenceSelector
          references={references}
          value={data.reference || { text: '' }}
          onChange={(val) => updateField('reference', val)}
          loading={loading}
        />
      </div>
    </>
  );
}
