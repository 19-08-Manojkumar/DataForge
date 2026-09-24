// Shared shape for every two-round database course (MySQL, PostgreSQL, MongoDB, ...).
// Each course file (mysql-course.ts, postgresql-course.ts, ...) builds its own steps
// with these types and exports a `Course`; page.tsx only knows this generic shape.

export type CourseBasicStep = {
  kind: "mcq";
  section: "basics";
  sectionTitle: string;
  stepNumber: number;
  stepTotal: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
};

// "sql" answers are matched with keyword/whitespace-insensitive SQL normalization
// (works for any SQL-shaped language: T-SQL, CQL, Redis commands, ...).
// "code" answers are matched case-sensitively after only trimming whitespace and
// quote style, for languages where case carries meaning (Mongo shell, Firestore JS).
export type CourseQueryLanguage = "sql" | "code";

export type CourseQueryStep = {
  kind: "query";
  section: "practice";
  topicKey: string;
  topicTitle: string;
  stepNumber: number;
  stepTotal: number;
  prompt: string;
  starter: string;
  acceptedAnswers: string[];
  explanation: string;
  hint: string;
  language: CourseQueryLanguage;
};

export type CourseStep = CourseBasicStep | CourseQueryStep;

export type CourseRound = {
  number: number;
  title: string;
  summary: string;
  topics: string[];
  steps: CourseStep[];
};

export type Course = {
  rounds: CourseRound[];
};

export function makeMcqBuilder(sectionTitle: string) {
  return (
    stepNumber: number,
    stepTotal: number,
    prompt: string,
    options: string[],
    correctIndex: number,
    explanation: string,
    hint: string,
  ): CourseBasicStep => ({
    kind: "mcq",
    section: "basics",
    sectionTitle,
    stepNumber,
    stepTotal,
    prompt,
    options,
    correctIndex,
    explanation,
    hint,
  });
}

export function makeQueryBuilder(language: CourseQueryLanguage) {
  return (
    topicKey: string,
    topicTitle: string,
    stepNumber: number,
    stepTotal: number,
    prompt: string,
    starter: string,
    acceptedAnswers: string[],
    explanation: string,
    hint: string,
  ): CourseQueryStep => ({
    kind: "query",
    section: "practice",
    topicKey,
    topicTitle,
    stepNumber,
    stepTotal,
    prompt,
    starter,
    acceptedAnswers,
    explanation,
    hint,
    language,
  });
}
