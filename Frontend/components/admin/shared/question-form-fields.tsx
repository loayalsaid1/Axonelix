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

interface QuestionOption {
  option_text: string;
  is_correct: boolean;
}

interface QuestionFormData {
  question_type: 'mcq' | 'written';
  statement: string;
  explanation: string;
  options: QuestionOption[];
}

interface QuestionFormFieldsProps {
  data: QuestionFormData;
  onChange: (data: QuestionFormData) => void;
}

export function QuestionFormFields({ data, onChange }: QuestionFormFieldsProps) {
  const updateField = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[index].option_text = value;
    updateField('options', newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = data.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    updateField('options', newOptions);
  };

  const handleAddOption = () => {
    updateField('options', [...data.options, { option_text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (data.options.length <= 2) return;
    const wasCorrect = data.options[index].is_correct;
    const newOptions = data.options.filter((_, i) => i !== index);
    if (wasCorrect && newOptions.length > 0) {
      newOptions[0].is_correct = true;
    }
    updateField('options', newOptions);
  };

  return (
    <>
      {/* Question Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="question_type">Question Type</Label>
          <Select
            value={data.question_type}
            onValueChange={(val: 'mcq' | 'written') => updateField('question_type', val)}
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
      {data.question_type === 'mcq' && (
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
            value={data.options.findIndex((o) => o.is_correct).toString()}
            onValueChange={(val) => handleCorrectChange(parseInt(val))}
          >
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <RadioGroupItem value={index.toString()} id={`opt-${index}`} />
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.option_text}
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
    </>
  );
}
