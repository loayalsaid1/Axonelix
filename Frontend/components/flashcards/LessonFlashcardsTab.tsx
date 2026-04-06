"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeckView } from "./DeckView";

interface LessonFlashcardsTabProps {
  lessonId: number;
}

export function LessonFlashcardsTab({ lessonId }: LessonFlashcardsTabProps) {
  return (
    <div className="w-full h-full flex flex-col space-y-6 pt-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Flashcards</h2>
        <p className="text-muted-foreground">
          Review official Axonelix cards or practice with your own custom deck.
        </p>
      </div>

      <Tabs defaultValue="axonelix" className="w-full hidden-scrollbar flex-1">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="axonelix">Axonelix Cards</TabsTrigger>
          <TabsTrigger value="personal">My Personal Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="axonelix" className="flex-1 border-none p-0 outline-none">
          <DeckView lessonId={lessonId} deckType="ADMIN" />
        </TabsContent>
        
        <TabsContent value="personal" className="flex-1 border-none p-0 outline-none">
          <DeckView lessonId={lessonId} deckType="PERSONAL" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
