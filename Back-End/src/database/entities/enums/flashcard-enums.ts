import { pgEnum } from "drizzle-orm/pg-core";

export const deckTypeEnum = pgEnum("deck_type", ["ADMIN", "PERSONAL"]);
