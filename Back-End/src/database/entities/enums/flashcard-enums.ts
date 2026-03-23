import { pgEnum } from "drizzle-orm/pg-core";

export enum DeckType {
	ADMIN = "ADMIN",
	PERSONAL = "PERSONAL",
}

export const deckTypeEnum = pgEnum("deck_type", [DeckType.ADMIN, DeckType.PERSONAL]);
