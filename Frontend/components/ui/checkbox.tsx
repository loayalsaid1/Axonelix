"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary/30 dark:bg-input/30 dark:data-[state=checked]:bg-primary disabled:opacity-50 shadow-xs border border-input data-[state=checked]:border-primary data-[state=indeterminate]:border-primary aria-invalid:border-destructive focus-visible:border-ring rounded-sm outline-none aria-invalid:ring-destructive/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 size-4 data-[state=checked]:text-primary-foreground transition-shadow disabled:cursor-not-allowed shrink-0",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator place-content-center grid text-current transition-none"
      >
        <CheckIcon className="group-data-[state=indeterminate]/indicator:hidden size-3.5" />
        <MinusIcon className="hidden group-data-[state=indeterminate]/indicator:block size-3.5 text-primary" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
