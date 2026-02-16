import { modules } from "./entities/modules";
import { subjects } from "./entities/subjects";
import { universities } from "./entities/universities";
import { oldExams } from "./entities/old-exams";
import { chapters } from "./entities/chapters";
import { lessons } from "./entities/lessons";
import { questions } from "./entities/questions";
import { questionOptions } from "./entities/question-options";
import * as relations from "./relations";

// This is for Drizzle kit to work
export {
	modules,
	subjects,
	universities,
	oldExams,
	chapters,
	lessons,
	questions,
	questionOptions,
};

export const schema = {
	modules,
	subjects,
	universities,
	oldExams,
	chapters,
	lessons,
	questions,
	questionOptions,
	...relations,
};

export type Schema = typeof schema;
