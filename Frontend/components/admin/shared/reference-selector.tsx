'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxList,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

export interface ReferenceValue {
  id?: number;
  text: string;
}

interface ReferenceSelectorProps {
  references: { id: number; name: string }[];
  value: ReferenceValue;
  onChange: (value: ReferenceValue) => void;
  loading?: boolean;
}

export function ReferenceSelector({
  references,
  value,
  onChange,
  loading = false,
}: ReferenceSelectorProps) {
  const [inputValue, setInputValue] = React.useState(value.text || '');

  // Keep internal input value in sync with external value
  React.useEffect(() => {
    setInputValue(value.text || '');
  }, [value.text]);

  const handleSelect = (val: string | null) => {
    if (!val) {
      onChange({ text: '' });
      return;
    }
    // If val matches a reference name, we send the ID too
    const matched = references.find((r) => r.name === val);
    if (matched) {
      onChange({ id: matched.id, text: matched.name });
    } else {
      onChange({ text: val });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Question Reference (Optional)</Label>
      <Combobox
        value={value.text || null}
        onValueChange={handleSelect}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      >
        <ComboboxInput
          placeholder={loading ? 'Loading references...' : 'Search or type a new reference...'}
          className="w-full"
          showClear
          onBlur={() => {
            // If the user typed something and blurred without selecting, 
            // treat the current input as the text reference.
            // Only update if it's different to avoid redundant onChange calls
            if (inputValue.trim() !== (value.text || '').trim()) {
              handleSelect(inputValue.trim());
            }
          }}
        />
        <ComboboxContent>
          {references?.length === 0 && !inputValue && (
            <ComboboxEmpty>
              {loading ? 'Loading...' : 'No references found.'}
            </ComboboxEmpty>
          )}
          <ComboboxList className="pointer-events-auto">
            {references.map((ref) => (
              <ComboboxItem
                key={ref.id}
                value={ref.name}
                className="flex items-center justify-between"
              >
                {ref.name}
                {(value.id === ref.id || value.text === ref.name) && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </ComboboxItem>
            ))}
            {inputValue && !references.some((r) => r.name === inputValue) && (
              <ComboboxItem value={inputValue} className="italic text-muted-foreground justify-between">
                <span>Add new: "{inputValue}"</span>
                <CheckIcon className="h-4 w-4 opacity-50" />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-[12px] text-muted-foreground">
        Use this to group questions by book, source, or custom label.
      </p>
    </div>
  );
}
