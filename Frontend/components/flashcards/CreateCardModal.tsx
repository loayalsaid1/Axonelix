"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { CreateCardDto, CreateDeckDto, FlashcardDeck, Flashcard } from "@/lib/types/flashcards";

interface CreateCardModalProps {
  lessonId: number;
  existingDeckId?: number;
  deckType?: "PERSONAL" | "ADMIN";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCard: Flashcard, newDeckId?: number) => void;
}

const formSchema = z.object({
  front: z.string().min(1, "Question is required."),
  back: z.string().min(1, "Answer is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCardModal({
  lessonId,
  existingDeckId,
  deckType = "PERSONAL",
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCardModalProps) {
  const authFetch = useApiFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      let targetDeckId = existingDeckId;
      let newDeckIdAssigned: number | undefined = undefined;

      // 1. implicitly create the deck if it doesn't exist yet
      if (!targetDeckId) {
        const createDeckPayload: CreateDeckDto = {
          lessonId,
          deckType: deckType,
          name: deckType === "ADMIN" ? "Axonelix Master Deck" : "My Personal Deck",
        };
        const newDeck = await authFetch<FlashcardDeck>("/flashcards/decks", {
          method: "POST",
          body: createDeckPayload,
        });
        targetDeckId = newDeck.id;
        newDeckIdAssigned = newDeck.id;
      }

      // 2. create the card within the deck
      const createCardPayload: CreateCardDto = { front: values.front, back: values.back };
      const newCards = await authFetch<Flashcard[]>(`/flashcards/decks/${targetDeckId}/cards`, {
        method: "POST",
        body: { cards: [createCardPayload] },
      });

      // Reset form and notify parent
      form.reset();
      onSuccess(newCards[0], newDeckIdAssigned);
      onOpenChange(false);

      toast.success("Flashcard added successfully.");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Flashcard</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front (Question)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is the definition of..."
                      className="resize-none h-24"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back (Answer)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The definition is..."
                      className="resize-none h-32"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
