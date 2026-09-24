'use client';

import {useCallback, useEffect, useRef, useState, type FormEvent} from "react";
import {Toaster, toast} from "react-hot-toast";
import {type Course, type CourseRound, type CourseStep} from "./course-types";
import {MYSQL_COURSE} from "./mysql-course";
import {POSTGRESQL_COURSE} from "./postgresql-course";
import {SQLSERVER_COURSE} from "./sqlserver-course";
import {SQLITE_COURSE} from "./sqlite-course";
import {MONGODB_COURSE} from "./mongodb-course";
import {FIREBASE_COURSE} from "./firebase-course";
import {CASSANDRA_COURSE} from "./cassandra-course";
import {REDIS_COURSE} from "./redis-course";

type CategoryKey = "sql" | "nosql";

type SubPathKey =
  | "mysql"
  | "postgresql"
  | "sqlserver"
  | "sqlite"
  | "mongodb"
  | "firebase"
  | "cassandra"
  | "redis";

type SubPathConfig = {
  id: SubPathKey;
  title: string;
  subtitle: string;
  intro: string;
  badge: string;
  gradient: string;
  panel: string;
  border: string;
  chip: string;
  examples: string[];
  course: Course;
};

type CategoryConfig = {
  title: string;
  subtitle: string;
  intro: string;
  badge: string;
  gradient: string;
  panel: string;
  border: string;
  chip: string;
  subpaths: SubPathConfig[];
};

type FeedbackState = {
  kind: "correct" | "wrong" | "revealed";
  message: string;
};

type FireworksState = {
  id: number;
  mainCount: number;
  littleCount: number;
};

type CourseProgressSnapshot = {
  roundIndex: number;
  roundStartCredits: number;
  stepOrder: number[];
  optionOrders: Record<string, number[]>;
  courseStepIndex: number;
  queryDraft: string;
  revealUsed: boolean;
  credits: number;
  streak: number;
  wrongAttempts: number;
  completed: boolean;
};

function getCourseStorageKey(subPathId: SubPathKey) {
  return `${subPathId}-course-progress-v2`;
}

const LEARNING_TRACKS: Record<CategoryKey, CategoryConfig> = {
  sql: {
    title: "SQL",
    subtitle: "Structured data, rows, columns, and query language",
    intro:
      "Choose a SQL database flavor and practice how relational systems behave in the real world.",
    badge: "Relational path",
    gradient: "from-cyan-400 via-sky-500 to-indigo-500",
    panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(8,145,178,0.16)]",
    border: "border-cyan-300/20",
    chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-50",
    subpaths: [
      {
        id: "mysql",
        title: "MySQL",
        subtitle: "Popular, friendly, and common in web apps",
        intro:
          "A two-round MySQL course. Round 1 covers basics plus DDL, DML, DCL, TCL, and DQL. Finish it to unlock Round 2 with JOINs, subqueries, functions, and advanced queries.",
        badge: "Beginner friendly",
        gradient: "from-cyan-400 via-blue-500 to-sky-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(8,145,178,0.16)]",
        border: "border-cyan-300/20",
        chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-50",
        examples: ["Round 1", "Round 2", "JOINs", "Subqueries"],
        course: MYSQL_COURSE,
      },
      {
        id: "postgresql",
        title: "PostgreSQL",
        subtitle: "Feature-rich SQL with strong data integrity",
        intro:
          "A two-round PostgreSQL course. Round 1 covers tables, inserts, and filtering. Round 2 unlocks CTEs, window functions, and JSONB upserts.",
        badge: "Advanced SQL",
        gradient: "from-sky-400 via-cyan-500 to-indigo-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(56,189,248,0.14)]",
        border: "border-sky-300/20",
        chip: "border-sky-300/20 bg-sky-400/10 text-sky-50",
        examples: ["Round 1", "Round 2", "JSONB", "Window functions"],
        course: POSTGRESQL_COURSE,
      },
      {
        id: "sqlserver",
        title: "Microsoft SQL Server",
        subtitle: "Enterprise SQL with a familiar business stack",
        intro:
          "A two-round SQL Server course. Round 1 covers TOP, tables, and filtering. Round 2 unlocks paging, ranking, and MERGE.",
        badge: "Enterprise path",
        gradient: "from-blue-400 via-sky-500 to-cyan-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(14,165,233,0.15)]",
        border: "border-blue-300/20",
        chip: "border-blue-300/20 bg-blue-400/10 text-blue-50",
        examples: ["Round 1", "Round 2", "T-SQL", "MERGE"],
        course: SQLSERVER_COURSE,
      },
      {
        id: "sqlite",
        title: "SQLite",
        subtitle: "Lightweight, embedded, and perfect for small projects",
        intro:
          "A two-round SQLite course. Round 1 covers tables, inserts, and filtering. Round 2 unlocks upserts, pragmas, and joins.",
        badge: "Embedded database",
        gradient: "from-violet-400 via-sky-500 to-cyan-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(59,130,246,0.14)]",
        border: "border-violet-300/20",
        chip: "border-violet-300/20 bg-violet-400/10 text-violet-50",
        examples: ["Round 1", "Round 2", "Upserts", "Joins"],
        course: SQLITE_COURSE,
      },
    ],
  },
  nosql: {
    title: "NoSQL",
    subtitle: "Flexible schema, documents, key-value data, and distributed storage",
    intro:
      "Choose a NoSQL database flavor and explore how modern data systems trade strict tables for flexibility.",
    badge: "Flexible path",
    gradient: "from-fuchsia-400 via-pink-500 to-amber-400",
    panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(217,70,239,0.14)]",
    border: "border-fuchsia-300/20",
    chip: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-50",
    subpaths: [
      {
        id: "mongodb",
        title: "MongoDB",
        subtitle: "Document-based and flexible for changing data",
        intro:
          "A two-round MongoDB course. Round 1 covers documents, CRUD, and simple queries. Round 2 unlocks aggregation and $lookup joins.",
        badge: "Document database",
        gradient: "from-fuchsia-400 via-pink-500 to-amber-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(217,70,239,0.14)]",
        border: "border-fuchsia-300/20",
        chip: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-50",
        examples: ["Round 1", "Round 2", "Aggregation", "$lookup"],
        course: MONGODB_COURSE,
      },
      {
        id: "firebase",
        title: "Firebase",
        subtitle: "Cloud-backed and useful for real-time apps",
        intro:
          "A two-round Firebase course. Round 1 covers documents, CRUD, and simple queries. Round 2 unlocks live listeners and structure.",
        badge: "Realtime cloud",
        gradient: "from-amber-400 via-orange-500 to-fuchsia-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(249,115,22,0.16)]",
        border: "border-amber-300/20",
        chip: "border-amber-300/20 bg-amber-400/10 text-amber-50",
        examples: ["Round 1", "Round 2", "onSnapshot", "Subcollections"],
        course: FIREBASE_COURSE,
      },
      {
        id: "cassandra",
        title: "Cassandra",
        subtitle: "Distributed and built for large-scale availability",
        intro:
          "A two-round Cassandra course. Round 1 covers keyspaces, tables, and filtering. Round 2 unlocks clustering, TTLs, and batches.",
        badge: "Distributed data",
        gradient: "from-indigo-400 via-fuchsia-500 to-pink-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(129,140,248,0.15)]",
        border: "border-indigo-300/20",
        chip: "border-indigo-300/20 bg-indigo-400/10 text-indigo-50",
        examples: ["Round 1", "Round 2", "Clustering", "TTL"],
        course: CASSANDRA_COURSE,
      },
      {
        id: "redis",
        title: "Redis",
        subtitle: "In-memory key-value speed for caching and sessions",
        intro:
          "A two-round Redis course. Round 1 covers strings, keys, and expiry. Round 2 unlocks lists, hashes, sets, and pub/sub.",
        badge: "Fast key-value",
        gradient: "from-emerald-400 via-teal-500 to-cyan-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(16,185,129,0.14)]",
        border: "border-emerald-300/20",
        chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
        examples: ["Round 1", "Round 2", "Data structures", "Pub/Sub"],
        course: REDIS_COURSE,
      },
    ],
  },
};

function getSubPath(category: CategoryKey | null, subPathId: SubPathKey | null) {
  if (!category || !subPathId) {
    return null;
  }

  return LEARNING_TRACKS[category].subpaths.find((subPath) => subPath.id === subPathId) ?? null;
}

function shuffleArray<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function buildOptionOrder(optionCount: number) {
  return shuffleArray(Array.from({length: optionCount}, (_, index) => index));
}

function buildCourseStepOrder(round: CourseRound) {
  const indexedSteps = round.steps.map((step, index) => ({step, index}));
  const basics = indexedSteps.filter(({step}) => step.kind === "mcq").map(({index}) => index);
  const topicKeys = [
    ...new Set(indexedSteps.flatMap(({step}) => (step.kind === "query" ? [step.topicKey] : []))),
  ];
  const topicGroups = topicKeys.map((topicKey) =>
    indexedSteps
      .filter(({step}) => step.kind === "query" && step.topicKey === topicKey)
      .map(({index}) => index),
  );

  return [...shuffleArray(basics), ...topicGroups.flatMap((group) => shuffleArray(group))];
}

function buildCourseOptionOrders(round: CourseRound, stepOrder: number[]) {
  return stepOrder.reduce<Record<string, number[]>>((orders, stepIndex) => {
    const step = round.steps[stepIndex];

    if (step.kind === "mcq") {
      orders[String(stepIndex)] = buildOptionOrder(step.options.length);
    }

    return orders;
  }, {});
}

function buildCourseRoundSnapshot(
  course: Course,
  roundIndex: number,
  carry: {credits: number; streak: number},
): CourseProgressSnapshot {
  const round = course.rounds[roundIndex];
  const stepOrder = buildCourseStepOrder(round);

  return {
    roundIndex,
    roundStartCredits: carry.credits,
    stepOrder,
    optionOrders: buildCourseOptionOrders(round, stepOrder),
    courseStepIndex: 0,
    queryDraft: "",
    revealUsed: false,
    credits: carry.credits,
    streak: carry.streak,
    wrongAttempts: 0,
    completed: false,
  };
}

function readCourseProgressSnapshot(subPathId: SubPathKey, course: Course) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getCourseStorageKey(subPathId));
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<CourseProgressSnapshot>;
    if (
      !Array.isArray(parsed.stepOrder) ||
      typeof parsed.optionOrders !== "object" ||
      parsed.optionOrders === null ||
      typeof parsed.courseStepIndex !== "number"
    ) {
      return null;
    }

    // Saves from before rounds existed have no roundIndex and belong to round 1.
    const roundIndex = parsed.roundIndex ?? 0;
    const round = Number.isInteger(roundIndex) ? course.rounds[roundIndex] : undefined;
    if (!round) {
      return null;
    }

    const stepOrder = parsed.stepOrder.filter((item): item is number => Number.isInteger(item));
    const optionOrders =
      parsed.optionOrders && typeof parsed.optionOrders === "object"
        ? Object.entries(parsed.optionOrders).reduce<Record<string, number[]>>((orders, [key, value]) => {
            if (Array.isArray(value) && value.every((item) => Number.isInteger(item))) {
              orders[key] = value;
            }
            return orders;
          }, {})
        : {};

    const uniqueStepOrder = new Set(stepOrder);
    const isValidStepOrder =
      stepOrder.length === round.steps.length &&
      uniqueStepOrder.size === round.steps.length &&
      stepOrder.every((item) => item >= 0 && item < round.steps.length);

    if (!isValidStepOrder) {
      return null;
    }

    for (const [key, order] of Object.entries(optionOrders)) {
      const stepIndex = Number(key);
      const step = round.steps[stepIndex];
      if (!step || step.kind !== "mcq") {
        return null;
      }

      if (
        order.length !== step.options.length ||
        new Set(order).size !== step.options.length ||
        !order.every((item) => item >= 0 && item < step.options.length)
      ) {
        return null;
      }
    }

    return {
      roundIndex,
      roundStartCredits: typeof parsed.roundStartCredits === "number" ? parsed.roundStartCredits : 0,
      stepOrder,
      optionOrders,
      courseStepIndex: Math.max(0, parsed.courseStepIndex),
      queryDraft: typeof parsed.queryDraft === "string" ? parsed.queryDraft : "",
      revealUsed: Boolean(parsed.revealUsed),
      credits: typeof parsed.credits === "number" ? parsed.credits : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      wrongAttempts: typeof parsed.wrongAttempts === "number" ? parsed.wrongAttempts : 0,
      completed: Boolean(parsed.completed),
    } satisfies CourseProgressSnapshot;
  } catch {
    return null;
  }
}

function saveCourseProgressSnapshot(subPathId: SubPathKey, snapshot: CourseProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getCourseStorageKey(subPathId), JSON.stringify(snapshot));
}

function clearCourseProgressSnapshot(subPathId: SubPathKey) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getCourseStorageKey(subPathId));
}

function describeCourseStep(step: CourseStep | null, round?: CourseRound | null) {
  if (!step) {
    return round?.title ?? "Course";
  }

  const stepLabel =
    step.kind === "mcq"
      ? `${step.sectionTitle} ${step.stepNumber} of ${step.stepTotal}`
      : `${step.topicTitle} ${step.stepNumber} of ${step.stepTotal}`;

  return round ? `${round.title} · ${stepLabel}` : stepLabel;
}

function getSnapshotStep(course: Course, snapshot: CourseProgressSnapshot) {
  const round = course.rounds[snapshot.roundIndex] ?? null;
  const step = round?.steps[snapshot.stepOrder[snapshot.courseStepIndex] ?? -1] ?? null;
  return {round, step};
}

function canonicalizeSqlQuery(query: string) {
  return query
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/;+/g, "")
    .trim();
}

function normalizeSqlAnswerForComparison(query: string) {
  const typeLengthPattern =
    /\b(varchar|char|varbinary|binary|decimal|numeric|float|double|tinyint|smallint|mediumint|int|integer|bigint)\s*\(\s*\d+(?:\s*,\s*\d+)?\s*\)/g;

  return canonicalizeSqlQuery(query)
    .replace(/"/g, "'")
    .replace(typeLengthPattern, "$1")
    .replace(/\s+/g, " ")
    .replace(/\binner join\b/g, "join")
    .replace(/\b(left|right) outer join\b/g, "$1 join")
    // Aliases may be written with or without AS; keep the AS in "VIEW v AS SELECT" and "WITH cte AS (".
    .replace(/ as (?!select\b|\()/g, " ")
    .replace(/!=/g, "<>")
    // "ON a = b" and "ON b = a" are the same join condition.
    .replace(/\bon ([\w.]+) ?= ?([\w.]+)/g, (_, left: string, right: string) =>
      left < right ? `on ${left} = ${right}` : `on ${right} = ${left}`,
    )
    .replace(/\s+/g, "")
    .replace(/column/g, "")
    .replace(/primary_key_auto_increment/g, "primary_key_auto_increment")
    .replace(/auto_increment_primary_key/g, "primary_key_auto_increment")
    .replace(/primarykeyauto_increment/g, "primary_key_auto_increment")
    .replace(/auto_incrementprimarykey/g, "primary_key_auto_increment");
}

function matchesSqlQuery(expected: string, actual: string) {
  return normalizeSqlAnswerForComparison(expected) === normalizeSqlAnswerForComparison(actual);
}

function buildQueryHintSnippet(answer: string) {
  const normalizedAnswer = answer.replace(/`/g, "").replace(/;+\s*$/, "").trim();
  const normalizedUpper = normalizedAnswer.toUpperCase();

  if (normalizedUpper.startsWith("WITH")) {
    return "WITH ... AS (SELECT ...) SELECT ...;";
  }

  if (normalizedUpper.startsWith("INSERT INTO") && normalizedUpper.includes(" ON DUPLICATE KEY UPDATE ")) {
    return "INSERT INTO ... VALUES (...) ON DUPLICATE KEY UPDATE ...;";
  }

  if (normalizedUpper.startsWith("INSERT INTO") && normalizedUpper.includes(" SELECT ")) {
    return "INSERT INTO ... SELECT ... FROM ...;";
  }

  if (normalizedUpper.startsWith("UPDATE") && normalizedUpper.includes(" JOIN ")) {
    return "UPDATE ... JOIN ... ON ... SET ... WHERE ...;";
  }

  if (normalizedUpper.startsWith("SELECT")) {
    if (!normalizedUpper.includes(" FROM")) {
      return "SELECT ...;";
    }

    if (normalizedUpper.includes(" CROSS JOIN ")) {
      return "SELECT ... FROM ... CROSS JOIN ...;";
    }

    if (normalizedUpper.includes(" JOIN ")) {
      return "SELECT ... FROM ... JOIN ... ON ...;";
    }

    if (normalizedUpper.includes("FROM (SELECT")) {
      return "SELECT ... FROM (SELECT ...) AS ...;";
    }

    if (normalizedUpper.includes("(SELECT")) {
      return "SELECT ... FROM ... WHERE ... (SELECT ...);";
    }

    if (normalizedUpper.includes(" OVER (")) {
      return "SELECT ..., ...() OVER (...) AS ... FROM ...;";
    }

    if (normalizedUpper.includes(" CASE ")) {
      return "SELECT ..., CASE WHEN ... THEN ... ELSE ... END AS ... FROM ...;";
    }
  }

  if (normalizedUpper.startsWith("CREATE DATABASE")) {
    return "CREATE DATABASE ...;";
  }

  if (normalizedUpper.startsWith("CREATE TABLE")) {
    return "CREATE TABLE ... (...);";
  }

  if (normalizedUpper.startsWith("ALTER TABLE")) {
    return "ALTER TABLE ...;";
  }

  if (normalizedUpper.startsWith("RENAME TABLE")) {
    return "RENAME TABLE ... TO ...;";
  }

  if (normalizedUpper.startsWith("INSERT INTO")) {
    return "INSERT INTO ... VALUES (...);";
  }

  if (normalizedUpper.startsWith("UPDATE")) {
    return "UPDATE ... SET ... WHERE ...;";
  }

  if (normalizedUpper.startsWith("DELETE FROM")) {
    return "DELETE FROM ... WHERE ...;";
  }

  if (normalizedUpper.startsWith("SELECT")) {
    return "SELECT ... FROM ...;";
  }

  if (normalizedUpper.startsWith("GRANT")) {
    return "GRANT ...;";
  }

  if (normalizedUpper.startsWith("REVOKE")) {
    return "REVOKE ...;";
  }

  if (normalizedUpper.startsWith("START TRANSACTION")) {
    return "START TRANSACTION;";
  }

  if (normalizedUpper.startsWith("COMMIT")) {
    return "COMMIT;";
  }

  if (normalizedUpper.startsWith("ROLLBACK")) {
    return "ROLLBACK;";
  }

  const tokens = normalizedAnswer.split(/\s+/).filter(Boolean);
  if (tokens.length <= 2) {
    return `${tokens.join(" ")} ...;`;
  }

  return `${tokens.slice(0, 3).join(" ")} ...;`;
}

// For case-sensitive command languages (Mongo shell, Firestore JS), where lowercasing
// would break field names and operators. Whitespace and quote style still don't matter.
function normalizeCodeAnswerForComparison(code: string) {
  return code
    .replace(/`/g, "'")
    .replace(/"/g, "'")
    .replace(/;+\s*$/, "")
    .trim()
    .replace(/\s+/g, "");
}

function matchesCodeQuery(expected: string, actual: string) {
  return normalizeCodeAnswerForComparison(expected) === normalizeCodeAnswerForComparison(actual);
}

// Collapses every top-level (...), {...}, or [...] argument list to "...", so a hint shows
// the shape of a call like db.students.find(...).sort(...) without giving away its contents.
function buildCodeHintSnippet(answer: string) {
  const trimmed = answer.trim().replace(/;+\s*$/, "");
  let output = "";
  let depth = 0;

  for (const char of trimmed) {
    if (char === "(" || char === "{" || char === "[") {
      if (depth === 0) {
        output += `${char}...`;
      }
      depth += 1;
      continue;
    }

    if (char === ")" || char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) {
        output += char;
      }
      continue;
    }

    if (depth === 0) {
      output += char;
    }
  }

  return `${output};`;
}

function matchesCourseQuery(step: CourseStep & {kind: "query"}, actual: string) {
  return step.acceptedAnswers.some((answer) =>
    step.language === "code" ? matchesCodeQuery(answer, actual) : matchesSqlQuery(answer, actual),
  );
}

function buildStepHintSnippet(step: CourseStep & {kind: "query"}) {
  const answer = step.acceptedAnswers[0] ?? step.starter;
  return step.language === "code" ? buildCodeHintSnippet(answer) : buildQueryHintSnippet(answer);
}

function calculateQuestionCredits(baseCredits: number, wrongAttempts: number, revealUsed: boolean) {
  if (revealUsed) {
    return 0;
  }

  const multipliers = [1, 0.85, 0.7, 0.55, 0.4, 0.3];
  const multiplier = multipliers[Math.min(wrongAttempts, multipliers.length - 1)];
  return Math.max(Math.round(baseCredits * multiplier), 1);
}

function getCreditMedal(credits: number) {
  if (credits >= 650) {
    return {
      tier: "Gold",
      description: "Outstanding work. You earned a gold medal.",
      color: "from-amber-300 via-yellow-400 to-orange-400",
      border: "border-amber-300/40",
    };
  }

  if (credits >= 450) {
    return {
      tier: "Silver",
      description: "Strong progress. You earned a silver medal.",
      color: "from-slate-200 via-slate-300 to-slate-400",
      border: "border-slate-300/40",
    };
  }

  if (credits >= 250) {
    return {
      tier: "Bronze",
      description: "Good effort. You earned a bronze medal.",
      color: "from-orange-300 via-amber-400 to-yellow-500",
      border: "border-orange-300/40",
    };
  }

  return {
    tier: "Training",
    description: "Keep earning credits to enter the medal board.",
    color: "from-cyan-300 via-sky-400 to-blue-500",
    border: "border-cyan-300/30",
  };
}

function resetSession(
  clearTimer: () => void,
  setCategory: (track: CategoryKey | null) => void,
  setSubPath: (subPath: SubPathKey | null) => void,
  setCourseStepIndex: (index: number) => void,
  setCourseStepOrder: (order: number[]) => void,
  setCourseOptionOrders: (orders: Record<string, number[]>) => void,
  setCourseSessionReady: (ready: boolean) => void,
  setAnswerRevealUsed: (used: boolean) => void,
  setSelectedChoice: (choice: number | null) => void,
  setQueryDraft: (draft: string) => void,
  setFeedback: (feedback: FeedbackState | null) => void,
  setCredits: (credits: number) => void,
  setStreak: (streak: number) => void,
  setWrongAttempts: (attempts: number) => void,
  setCompleted: (completed: boolean) => void,
  nextCategory: CategoryKey | null,
  nextSubPath: SubPathKey | null,
) {
  clearTimer();
  setCategory(nextCategory);
  setSubPath(nextSubPath);
  setCourseStepIndex(0);
  setCourseStepOrder([]);
  setCourseOptionOrders({});
  setCourseSessionReady(false);
  setAnswerRevealUsed(false);
  setSelectedChoice(null);
  setQueryDraft("");
  setFeedback(null);
  setCredits(0);
  setStreak(0);
  setWrongAttempts(0);
  setCompleted(false);
}

function CategoryCard({
  category,
  onChoose,
}: {
  category: CategoryKey;
  onChoose: (category: CategoryKey) => void;
}) {
  const config = LEARNING_TRACKS[category];

  return (
    <button
      type="button"
      onClick={() => onChoose(category)}
      className={`group relative overflow-hidden rounded-[2rem] border ${config.border} ${config.panel} p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.gradient}`}
      />
      <div className="flex items-center justify-between gap-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${config.chip}`}
        >
          {config.badge}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">
          Start
        </span>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-white">{config.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300/90">
          {config.subtitle}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-400">{config.intro}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {config.subpaths.slice(0, 4).map((subPath) => (
          <span
            key={subPath.id}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80"
          >
            {subPath.title}
          </span>
        ))}
      </div>
      <div className="mt-6 text-sm font-medium text-slate-100 transition group-hover:text-white">
        Pick this lane and then choose a specific database.
      </div>
    </button>
  );
}

function SubPathCard({
  subPath,
  onChoose,
}: {
  subPath: SubPathConfig;
  onChoose: (subPathId: SubPathKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChoose(subPath.id)}
      className={`group relative overflow-hidden rounded-[1.75rem] border ${subPath.border} ${subPath.panel} p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${subPath.gradient}`}
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${subPath.chip}`}
        >
          {subPath.badge}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">
          Select
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{subPath.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{subPath.subtitle}</p>
      <p className="mt-4 text-sm leading-6 text-slate-400">{subPath.intro}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {subPath.examples.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80"
          >
            {item}
          </span>
        ))}
      </div>
    </button>
  );
}

function ChoiceButton({
  label,
  index,
  selectedChoice,
  feedback,
  onChoose,
}: {
  label: string;
  index: number;
  selectedChoice: number | null;
  feedback: FeedbackState | null;
  onChoose: (index: number) => void;
}) {
  const isSelected = selectedChoice === index;
  const isCorrect = feedback?.kind === "correct" && isSelected;
  const isWrong = feedback?.kind === "wrong" && isSelected;
  const isRevealed = feedback?.kind === "revealed" && isSelected;
  const isLocked = feedback?.kind === "correct";

  return (
    <button
      type="button"
      onClick={() => onChoose(index)}
      disabled={isLocked && !isSelected}
      className={`min-h-[4.5rem] rounded-2xl border px-4 py-4 text-left text-sm font-medium transition duration-200 ${
        isCorrect
          ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-50 shadow-[0_12px_40px_rgba(16,185,129,0.18)]"
          : isWrong
            ? "border-rose-300/60 bg-rose-400/15 text-rose-50"
            : isRevealed
              ? "border-amber-300/60 bg-amber-400/15 text-amber-50 shadow-[0_12px_40px_rgba(251,191,36,0.18)]"
            : isLocked
              ? "border-white/10 bg-white/5 text-slate-400 opacity-70"
              : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/50 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function buildFireworksState(wrongAttempts: number, revealUsed: boolean): FireworksState | null {
  if (revealUsed) {
    return null;
  }

  if (wrongAttempts === 0) {
    return {
      id: Date.now(),
      mainCount: 3,
      littleCount: 3,
    };
  }

  if (wrongAttempts === 1) {
    return {
      id: Date.now(),
      mainCount: 2,
      littleCount: 3,
    };
  }

  if (wrongAttempts === 2) {
    return {
      id: Date.now(),
      mainCount: 0,
      littleCount: 3,
    };
  }

  return null;
}

type FireworkShell = {
  launchAt: number;
  x: number;
  targetY: number;
  hue: number;
  accentHue: number;
  particleCount: number;
  speed: number;
  glitter: boolean;
};

type FireworkRocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: {x: number; y: number}[];
  shell: FireworkShell;
};

type FireworkParticle = {
  x: number;
  y: number;
  trail: {x: number; y: number}[];
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  hue: number;
  lightness: number;
  width: number;
  friction: number;
  gravity: number;
  glitter: boolean;
};

type FireworkFlash = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  alpha: number;
};

const ROCKET_GRAVITY = 0.5;
const FRAME_MS = 1000 / 60;

// Shell layouts as fractions of the viewport: big shells first, then the little ones.
const MAIN_SHELLS = [
  {x: 0.2, y: 0.24, hue: 190, accentHue: 280, glitter: false},
  {x: 0.8, y: 0.22, hue: 330, accentHue: 45, glitter: false},
  {x: 0.5, y: 0.14, hue: 45, accentHue: 0, glitter: true},
];

const LITTLE_SHELLS = [
  {x: 0.12, y: 0.44, hue: 270, accentHue: 190},
  {x: 0.5, y: 0.36, hue: 160, accentHue: 60},
  {x: 0.88, y: 0.46, hue: 20, accentHue: 330},
];

function buildFireworkShells(burst: FireworksState, width: number, height: number) {
  const scale = Math.min(Math.max(Math.min(width, height) / 750, 0.55), 1.25);
  const density = width < 640 ? 0.7 : 1;
  const mainShells = MAIN_SHELLS.slice(0, burst.mainCount).map<FireworkShell>((shell, index) => ({
    launchAt: index * 180,
    x: shell.x * width,
    targetY: shell.y * height,
    hue: shell.hue,
    accentHue: shell.accentHue,
    particleCount: Math.round(90 * density),
    speed: 9 * scale,
    glitter: shell.glitter,
  }));
  const littleStart = mainShells.length ? 500 : 0;
  const littleShells = LITTLE_SHELLS.slice(0, burst.littleCount).map<FireworkShell>((shell, index) => ({
    launchAt: littleStart + index * 150,
    x: shell.x * width,
    targetY: shell.y * height,
    hue: shell.hue,
    accentHue: shell.accentHue,
    particleCount: Math.round(45 * density),
    speed: 5 * scale,
    glitter: false,
  }));

  return [...mainShells, ...littleShells];
}

function launchRocket(shell: FireworkShell, height: number): FireworkRocket {
  const startX = shell.x + (Math.random() - 0.5) * 60;
  const startY = height + 10;
  const vy = -Math.sqrt(2 * ROCKET_GRAVITY * (startY - shell.targetY));
  const framesToApex = -vy / ROCKET_GRAVITY;

  return {
    x: startX,
    y: startY,
    vx: (shell.x - startX) / framesToApex,
    vy,
    trail: [],
    shell,
  };
}

function explodeShell(shell: FireworkShell, x: number, y: number): FireworkParticle[] {
  const particles: FireworkParticle[] = [];
  const makeParticle = (angle: number, speed: number, hue: number, lightness: number, width: number) => ({
    x,
    y,
    trail: [],
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    alpha: 1,
    decay: 0.011 + Math.random() * 0.008,
    hue: hue + (Math.random() - 0.5) * 24,
    lightness,
    width,
    friction: 0.955,
    gravity: 0.06,
    glitter: shell.glitter,
  });

  // Outer shell: most sparks near full speed so the burst reads as a sphere.
  for (let index = 0; index < shell.particleCount; index += 1) {
    const angle = (index / shell.particleCount) * Math.PI * 2 + Math.random() * 0.2;
    const speed = shell.speed * (0.7 + Math.random() * 0.3);
    particles.push(makeParticle(angle, speed, shell.hue, 62 + Math.random() * 10, 2.2));
  }

  // Inner core in an accent colour.
  const coreCount = Math.round(shell.particleCount * 0.3);
  for (let index = 0; index < coreCount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = shell.speed * (0.2 + Math.random() * 0.3);
    particles.push(makeParticle(angle, speed, shell.accentHue, 70, 1.6));
  }

  return particles;
}

function FireworksCelebration({burst, onDone}: {burst: FireworksState | null; onDone: () => void}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!burst || !canvas || !context) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pendingShells = buildFireworkShells(burst, width, height);
    const rockets: FireworkRocket[] = [];
    let particles: FireworkParticle[] = [];
    let flashes: FireworkFlash[] = [];
    const startedAt = performance.now();
    let lastFrameAt = startedAt;
    let frameId = 0;

    const renderFrame = (now: number) => {
      const step = Math.min((now - lastFrameAt) / FRAME_MS, 3);
      lastFrameAt = now;

      while (pendingShells.length && now - startedAt >= pendingShells[0].launchAt) {
        rockets.push(launchRocket(pendingShells.shift()!, height));
      }

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];
        rocket.trail.push({x: rocket.x, y: rocket.y});
        if (rocket.trail.length > 10) {
          rocket.trail.shift();
        }

        rocket.x += rocket.vx * step;
        rocket.y += rocket.vy * step;
        rocket.vy += ROCKET_GRAVITY * step;

        const tail = rocket.trail[0];
        const gradient = context.createLinearGradient(tail.x, tail.y, rocket.x, rocket.y);
        gradient.addColorStop(0, "rgba(255, 200, 120, 0)");
        gradient.addColorStop(1, "rgba(255, 236, 200, 0.95)");
        context.strokeStyle = gradient;
        context.lineWidth = 2.4;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(rocket.x, rocket.y);
        context.stroke();

        if (Math.random() < 0.6 * step) {
          particles.push({
            x: rocket.x,
            y: rocket.y,
            trail: [],
            vx: (Math.random() - 0.5) * 0.8,
            vy: Math.random() * 0.8,
            alpha: 0.8,
            decay: 0.05,
            hue: 38,
            lightness: 65,
            width: 1.2,
            friction: 0.9,
            gravity: 0.04,
            glitter: false,
          });
        }

        if (rocket.vy >= -2.5) {
          rockets.splice(index, 1);
          particles.push(...explodeShell(rocket.shell, rocket.x, rocket.y));
          flashes.push({
            x: rocket.x,
            y: rocket.y,
            radius: rocket.shell.speed * 16,
            hue: rocket.shell.hue,
            alpha: 0.55,
          });
        }
      }

      for (const flash of flashes) {
        const glow = context.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        glow.addColorStop(0, `hsla(${flash.hue}, 100%, 85%, ${flash.alpha})`);
        glow.addColorStop(1, `hsla(${flash.hue}, 100%, 60%, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        context.fill();
        flash.alpha -= 0.07 * step;
      }
      flashes = flashes.filter((flash) => flash.alpha > 0);

      for (const particle of particles) {
        // Each spark keeps a few past positions and is drawn as a short tapering streak.
        particle.trail.push({x: particle.x, y: particle.y});
        if (particle.trail.length > 5) {
          particle.trail.shift();
        }
        const drag = Math.pow(particle.friction, step);
        particle.vx *= drag;
        particle.vy = particle.vy * drag + particle.gravity * step;
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.alpha -= particle.decay * step;

        if (particle.alpha <= 0) {
          continue;
        }

        // Glitter shells twinkle white as they burn out.
        const twinkle = particle.glitter && particle.alpha < 0.65;
        if (twinkle && Math.random() < 0.45) {
          continue;
        }

        context.strokeStyle = twinkle
          ? `hsla(50, 100%, 92%, ${particle.alpha})`
          : `hsla(${particle.hue}, 100%, ${particle.lightness}%, ${particle.alpha})`;
        context.lineWidth = particle.width;
        context.beginPath();
        context.moveTo(particle.trail[0].x, particle.trail[0].y);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      }
      particles = particles.filter((particle) => particle.alpha > 0);

      if (!pendingShells.length && !rockets.length && !particles.length && !flashes.length) {
        context.clearRect(0, 0, width, height);
        onDone();
        return;
      }

      frameId = window.requestAnimationFrame(renderFrame);
    };

    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, width, height);
    };
  }, [burst, onDone]);

  if (!burst) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedSubPath, setSelectedSubPath] = useState<SubPathKey | null>(null);
  const [courseStepIndex, setCourseStepIndex] = useState(0);
  const [courseStepOrder, setCourseStepOrder] = useState<number[]>([]);
  const [courseOptionOrders, setCourseOptionOrders] = useState<Record<string, number[]>>({});
  const [courseResumeSnapshot, setCourseResumeSnapshot] = useState<CourseProgressSnapshot | null>(null);
  const [courseSessionReady, setCourseSessionReady] = useState(false);
  const [courseRoundIndex, setCourseRoundIndex] = useState(0);
  const [courseRoundStartCredits, setCourseRoundStartCredits] = useState(0);
  const [courseNextRoundSnapshot, setCourseNextRoundSnapshot] = useState<CourseProgressSnapshot | null>(null);
  const [answerRevealUsed, setAnswerRevealUsed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [queryDraft, setQueryDraft] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [fireworksBurst, setFireworksBurst] = useState<FireworksState | null>(null);
  const [credits, setCredits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
    };
  }, []);

  const clearFireworks = useCallback(() => {
    setFireworksBurst(null);
  }, []);

  const triggerFireworks = (attemptCount: number, revealUsed: boolean) => {
    setFireworksBurst(buildFireworksState(attemptCount, revealUsed));
  };

  const resetCourseRounds = () => {
    setCourseRoundIndex(0);
    setCourseRoundStartCredits(0);
    setCourseNextRoundSnapshot(null);
  };

  const resetProgress = () => {
    clearAdvanceTimer();
    resetCourseRounds();
    setFireworksBurst(null);
    setCourseStepIndex(0);
    setCourseStepOrder([]);
    setCourseOptionOrders({});
    setCourseSessionReady(false);
    setAnswerRevealUsed(false);
    setSelectedChoice(null);
    setQueryDraft("");
    setFeedback(null);
    setCredits(0);
    setStreak(0);
    setWrongAttempts(0);
    setCompleted(false);
  };

  const continueCourseSession = (snapshot: CourseProgressSnapshot) => {
    clearAdvanceTimer();
    setFireworksBurst(null);
    setCourseStepOrder(snapshot.stepOrder);
    setCourseOptionOrders(snapshot.optionOrders);
    setCourseStepIndex(Math.min(snapshot.courseStepIndex, snapshot.stepOrder.length - 1));
    setSelectedChoice(null);
    setQueryDraft(snapshot.queryDraft);
    setFeedback(null);
    setCredits(snapshot.credits);
    setStreak(snapshot.streak);
    setWrongAttempts(snapshot.wrongAttempts);
    setCompleted(false);
    setCourseSessionReady(true);
    setAnswerRevealUsed(Boolean(snapshot.revealUsed));
    setCourseResumeSnapshot(null);
    setCourseRoundIndex(snapshot.roundIndex);
    setCourseRoundStartCredits(snapshot.roundStartCredits);
    setCourseNextRoundSnapshot(null);
  };

  const startCourseRound = (course: Course, roundIndex: number) => {
    continueCourseSession(buildCourseRoundSnapshot(course, roundIndex, {credits: 0, streak: 0}));
  };

  const createFreshCourseSession = (subPathId: SubPathKey, course: Course) => {
    startCourseRound(course, 0);
    clearCourseProgressSnapshot(subPathId);
  };

  const handleCategorySelect = (category: CategoryKey) => {
    resetSession(
      clearAdvanceTimer,
      setSelectedCategory,
      setSelectedSubPath,
      setCourseStepIndex,
      setCourseStepOrder,
      setCourseOptionOrders,
      setCourseSessionReady,
      setAnswerRevealUsed,
      setSelectedChoice,
      setQueryDraft,
      setFeedback,
      setCredits,
      setStreak,
      setWrongAttempts,
      setCompleted,
      category,
      null,
    );
    resetCourseRounds();
    setFireworksBurst(null);
    toast.success(`You chose ${LEARNING_TRACKS[category].title}. Now pick a database.`);
  };

  const handleSubPathSelect = (subPathId: SubPathKey) => {
    if (!selectedCategory) {
      return;
    }

    resetProgress();
    setSelectedSubPath(subPathId);

    const subPath = getSubPath(selectedCategory, subPathId);
    if (!subPath) {
      return;
    }

    const savedSnapshot = readCourseProgressSnapshot(subPathId, subPath.course);
    if (savedSnapshot && !savedSnapshot.completed) {
      const {round, step} = getSnapshotStep(subPath.course, savedSnapshot);
      setCourseResumeSnapshot(savedSnapshot);
      toast.success(`You left off at ${describeCourseStep(step, round)}. Continue or start fresh.`);
      return;
    }

    createFreshCourseSession(subPathId, subPath.course);
    toast.success(`Great choice. Let's learn ${subPath.title}.`);
  };

  const goBackToCategories = () => {
    resetSession(
      clearAdvanceTimer,
      setSelectedCategory,
      setSelectedSubPath,
      setCourseStepIndex,
      setCourseStepOrder,
      setCourseOptionOrders,
      setCourseSessionReady,
      setAnswerRevealUsed,
      setSelectedChoice,
      setQueryDraft,
      setFeedback,
      setCredits,
      setStreak,
      setWrongAttempts,
      setCompleted,
      null,
      null,
    );
    resetCourseRounds();
    setFireworksBurst(null);
  };

  const goBackToSubPaths = () => {
    resetProgress();
    setSelectedSubPath(null);
  };

  const currentSubPath = getSubPath(selectedCategory, selectedSubPath);
  const currentCourse = currentSubPath?.course ?? null;
  const currentCourseStepIndex =
    currentSubPath && courseSessionReady ? courseStepOrder[courseStepIndex] ?? null : null;
  const currentCourseRound = currentCourse?.rounds[courseRoundIndex] ?? null;
  const nextCourseRound = courseNextRoundSnapshot ? currentCourse?.rounds[courseNextRoundSnapshot.roundIndex] ?? null : null;
  const lastCourseRoundIndex = (currentCourse?.rounds.length ?? 1) - 1;
  const currentCourseStep =
    currentCourseStepIndex !== null ? currentCourseRound?.steps[currentCourseStepIndex] ?? null : null;
  const totalCourseSteps = currentCourseRound?.steps.length ?? 0;
  const hasCourse = Boolean(currentSubPath);
  const progress = hasCourse
    ? ((courseStepIndex + (completed ? 1 : 0)) / Math.max(totalCourseSteps, 1)) * 100
    : 0;
  const currentLessonLabel = currentCourseStep ? describeCourseStep(currentCourseStep) : "";
  const currentCourseOptionOrder =
    currentCourseStep?.kind === "mcq"
      ? courseOptionOrders[String(currentCourseStepIndex ?? -1)] ?? currentCourseStep.options.map((_, index) => index)
      : [];
  const needHint = currentCourseStep?.hint ?? null;
  const canLoadQueryHint = currentCourseStep?.kind !== "query" ? true : wrongAttempts >= 5;
  const canRevealAnswer = !completed && wrongAttempts >= 10 && !answerRevealUsed;
  const courseResumePoint =
    courseResumeSnapshot && currentCourse ? getSnapshotStep(currentCourse, courseResumeSnapshot) : null;
  const showCourseResumePrompt = Boolean(currentSubPath) && Boolean(courseResumeSnapshot) && !courseSessionReady && !completed;
  const resumeStepLabel = describeCourseStep(courseResumePoint?.step ?? null, courseResumePoint?.round);
  // Medals are earned per round; credits keep adding up across rounds.
  const roundCredits = hasCourse ? credits - courseRoundStartCredits : credits;
  const currentMedal = getCreditMedal(roundCredits);

  const finishCurrentCourse = (message: string) => {
    setCompleted(true);
    setSelectedChoice(null);
    setQueryDraft("");
    setFeedback({
      kind: "correct",
      message,
    });
    if (selectedSubPath) {
      clearCourseProgressSnapshot(selectedSubPath);
    }
    setCourseSessionReady(false);
    setCourseResumeSnapshot(null);
  };

  const advanceCourseStep = (nextCredits: number, nextStreak: number, delay: number) => {
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      setSelectedChoice(null);
      setQueryDraft("");
      setWrongAttempts(0);
      setAnswerRevealUsed(false);

      const isFinalStep = courseStepIndex === totalCourseSteps - 1;
      if (!isFinalStep) {
        setCourseStepIndex((value) => value + 1);
        setFeedback(null);
        return;
      }

      const nextRoundIndex = courseRoundIndex + 1;
      if (nextRoundIndex <= lastCourseRoundIndex && currentCourse && selectedSubPath) {
        // Save the next round right away so leaving now resumes at its first question.
        const nextRoundSnapshot = buildCourseRoundSnapshot(currentCourse, nextRoundIndex, {
          credits: nextCredits,
          streak: nextStreak,
        });
        const finishedRoundTitle = currentCourseRound?.title ?? "Round";
        const unlockedRoundTitle = currentCourse.rounds[nextRoundIndex].title;

        saveCourseProgressSnapshot(selectedSubPath, nextRoundSnapshot);
        setCourseNextRoundSnapshot(nextRoundSnapshot);
        setCourseSessionReady(false);
        setFeedback({
          kind: "correct",
          message: `${finishedRoundTitle} complete. ${unlockedRoundTitle} is now unlocked.`,
        });
        toast.success(`${finishedRoundTitle} complete. ${unlockedRoundTitle} unlocked.`);
        return;
      }

      finishCurrentCourse(
        `${currentSubPath?.title ?? "Course"} complete. You finished every round of practice.`,
      );
    }, delay);
  };

  const handleRevealAnswer = () => {
    if (completed || !canRevealAnswer) {
      return;
    }

    if (hasCourse && currentCourseStep) {
      setAnswerRevealUsed(true);
      if (currentCourseStep.kind === "query") {
        setQueryDraft(currentCourseStep.acceptedAnswers[0] ?? currentCourseStep.starter);
        setSelectedChoice(null);
      } else {
        const correctDisplayIndex = currentCourseOptionOrder.findIndex(
          (optionIndex) => optionIndex === currentCourseStep.correctIndex,
        );
        setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
      }

      const revealedAnswer =
        currentCourseStep.kind === "mcq"
          ? currentCourseStep.options[currentCourseStep.correctIndex]
          : currentCourseStep.acceptedAnswers[0] ?? currentCourseStep.starter;

      setFeedback({
        kind: "revealed",
        message:
          currentCourseStep.kind === "mcq"
            ? `Revealed answer: ${revealedAnswer}. Select that option to continue, but this question earns no credits now.`
            : "Revealed answer loaded. Use it to continue, but this question earns no credits now.",
      });
      toast("Answer revealed. No credits will be awarded for this question.");
    }
  };

  const handleLoadStarter = () => {
    if (!currentCourseStep || currentCourseStep.kind !== "query") {
      return;
    }

    if (!canLoadQueryHint) {
      toast.error("Try your own answer 5 times first.");
      return;
    }

    setQueryDraft(buildStepHintSnippet(currentCourseStep));
    toast.success("Hint loaded.");
  };

  const handleChoice = (choiceIndex: number) => {
    if (completed || feedback?.kind === "correct") {
      return;
    }

    if (hasCourse && currentCourseStep?.kind === "mcq") {
      setSelectedChoice(choiceIndex);
      const sourceStepIndex = currentCourseStepIndex;
      const optionOrder =
        sourceStepIndex !== null
          ? courseOptionOrders[String(sourceStepIndex)] ?? currentCourseStep.options.map((_, index) => index)
          : currentCourseStep.options.map((_, index) => index);
      const actualChoiceIndex = optionOrder[choiceIndex];
      const correctAnswer = currentCourseStep.options[currentCourseStep.correctIndex];
      const reward = calculateQuestionCredits(10, wrongAttempts, answerRevealUsed);

      if (actualChoiceIndex === currentCourseStep.correctIndex) {
        const nextStreak = answerRevealUsed ? streak : streak + 1;
        const bonus = !answerRevealUsed && nextStreak % 3 === 0 && reward > 0 ? 5 : 0;
        const earned = reward + bonus;

        setCredits((value) => value + earned);
        setStreak(nextStreak);
        setWrongAttempts(0);
        setAnswerRevealUsed(false);
        setFeedback({
          kind: answerRevealUsed ? "revealed" : "correct",
          message: answerRevealUsed
            ? "Revealed answer accepted. No credits were awarded for this question."
            : bonus
              ? `Correct. +${earned} credits with a streak bonus.`
              : reward < 10
                ? `Correct. +${earned} credits. This one is worth less because it took a few tries.`
                : `Correct. +${earned} credits.`,
        });
        toast.success(
          answerRevealUsed
            ? "Answer revealed. No credits earned for this question."
            : bonus
              ? `Correct. +${earned} credits and a streak bonus.`
              : reward < 10
                ? `Correct. +${earned} credits.`
                : `Correct. +${earned} credits.`,
        );
        triggerFireworks(wrongAttempts, answerRevealUsed);
        advanceCourseStep(credits + earned, nextStreak, 950);
        return;
      }

      if (answerRevealUsed) {
        const correctDisplayIndex = optionOrder.findIndex(
          (optionIndex) => optionIndex === currentCourseStep.correctIndex,
        );
        setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
        setFeedback({
          kind: "revealed",
          message: `The revealed answer is ${correctAnswer}. Select that option to continue, but this question does not earn credits now.`,
        });
        toast("The answer is already revealed.");
        return;
      }

      setStreak(0);
      setWrongAttempts((value) => value + 1);
      setFeedback({
        kind: "wrong",
        message: "Not quite. Try again and think about the concept.",
      });
      toast.error("Not quite. Try again.");
    }
  };

  const handleQuerySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasCourse || currentCourseStep?.kind !== "query" || completed || feedback?.kind === "correct") {
      return;
    }

    if (!queryDraft.trim()) {
      toast.error("Type a query before submitting.");
      return;
    }

    const isCorrect = matchesCourseQuery(currentCourseStep, queryDraft);
    const reward = calculateQuestionCredits(15, wrongAttempts, answerRevealUsed);

    if (!isCorrect) {
      if (answerRevealUsed) {
        setFeedback({
          kind: "revealed",
          message: "The revealed answer is already loaded. Submit that answer to continue, but this question will not earn credits.",
        });
        toast("The answer is already revealed.");
        return;
      }

      setStreak(0);
      setWrongAttempts((value) => value + 1);
      setFeedback({
        kind: "wrong",
        message: "Not quite. Try again and refine the query.",
      });
      toast.error("Not quite. Try again.");
      return;
    }

    const nextStreak = answerRevealUsed ? streak : streak + 1;
    const bonus = !answerRevealUsed && nextStreak % 3 === 0 && reward > 0 ? 5 : 0;
    const earned = reward + bonus;

    setCredits((value) => value + earned);
    setStreak(nextStreak);
    setWrongAttempts(0);
    setAnswerRevealUsed(false);
    setFeedback({
      kind: answerRevealUsed ? "revealed" : "correct",
      message: answerRevealUsed
        ? "Revealed answer accepted. No credits were awarded for this question."
        : bonus
          ? `Created. +${earned} credits with a streak bonus.`
          : reward < 15
            ? `Created. +${earned} credits. This one is worth less because it took a few tries.`
            : `Created. +${earned} credits.`,
    });
    toast.success(
      answerRevealUsed
        ? "Answer revealed. No credits earned for this question."
        : bonus
          ? `Created. +${earned} credits and a streak bonus.`
          : reward < 15
            ? `Created. +${earned} credits.`
            : `Created. +${earned} credits.`,
    );
    triggerFireworks(wrongAttempts, answerRevealUsed);
    advanceCourseStep(credits + earned, nextStreak, 1100);
  };

  useEffect(() => {
    if (!hasCourse || !selectedSubPath || !courseSessionReady || !currentCourseStep || completed) {
      return;
    }

    const stepOrder = courseStepOrder.length ? courseStepOrder : currentCourseRound?.steps.map((_, index) => index) ?? [];
    saveCourseProgressSnapshot(selectedSubPath, {
      roundIndex: courseRoundIndex,
      roundStartCredits: courseRoundStartCredits,
      stepOrder,
      optionOrders: courseOptionOrders,
      courseStepIndex,
      queryDraft,
      revealUsed: answerRevealUsed,
      credits,
      streak,
      wrongAttempts,
      completed,
    });
  }, [
    completed,
    credits,
    currentCourseRound,
    currentCourseStep,
    hasCourse,
    selectedSubPath,
    courseOptionOrders,
    courseRoundIndex,
    courseRoundStartCredits,
    courseSessionReady,
    courseStepIndex,
    courseStepOrder,
    queryDraft,
    answerRevealUsed,
    streak,
    wrongAttempts,
  ]);

  return (
    <>
      <FireworksCelebration burst={fireworksBurst} onDone={clearFireworks} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(8, 15, 27, 0.96)",
            color: "#e2e8f0",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(2, 8, 23, 0.35)",
          },
        }}
      />

      <main className="relative min-h-screen overflow-hidden bg-[#07111d] px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-[-7rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
          {!selectedCategory ? (
            <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Interactive database trainer
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Pick SQL or NoSQL, then choose the exact database you want to master.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Students first choose the data model, then the database flavor.
                  After that the lesson becomes a guided quiz with instant feedback,
                  encouraging text, and rewards.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200/85">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    Step 1: choose a path
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    Step 2: choose a database
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    Step 3: answer and earn credits
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <CategoryCard category="sql" onChoose={handleCategorySelect} />
                <CategoryCard category="nosql" onChoose={handleCategorySelect} />
              </div>
            </section>
          ) : !selectedSubPath ? (
            <section className={`relative w-full overflow-hidden rounded-[2rem] border ${LEARNING_TRACKS[selectedCategory].border} ${LEARNING_TRACKS[selectedCategory].panel} p-6 shadow-2xl sm:p-8 lg:p-10`}>
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${LEARNING_TRACKS[selectedCategory].gradient}`}
              />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${LEARNING_TRACKS[selectedCategory].chip}`}
                  >
                    Step 2 of 2
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    Choose your {LEARNING_TRACKS[selectedCategory].title} database.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Pick the specific sub-path you want to study. We will tailor the
                    questions and feedback to that database style.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goBackToCategories}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Back to paths
                </button>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {LEARNING_TRACKS[selectedCategory].subpaths.map((subPath) => (
                  <SubPathCard key={subPath.id} subPath={subPath} onChoose={handleSubPathSelect} />
                ))}
              </div>
            </section>
          ) : completed && currentSubPath ? (
            <section
              className={`relative w-full overflow-hidden rounded-[2rem] border ${currentSubPath.border} ${currentSubPath.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentSubPath.gradient}`}
              />
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentSubPath.chip}`}
                  >
                    Completed
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    Great work. You completed the full {currentSubPath.title} course.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    You finished all {currentSubPath.course.rounds.length} rounds of {currentSubPath.title}
                    practice, from the basics through to harder, real-world queries. That is a real win.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Credits
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {credits}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Final streak
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {streak}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Path
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {selectedCategory ? selectedCategory.toUpperCase() : ""} / {currentSubPath.title}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-6 rounded-3xl border ${currentMedal.border} bg-gradient-to-br ${currentMedal.color} p-[1px]`}>
                    <div className="rounded-[1.45rem] bg-slate-950/90 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Medal board
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                          {currentMedal.tier}
                        </span>
                        <p className="text-sm leading-6 text-slate-200">
                          {currentMedal.description}
                        </p>
                      </div>
                      {currentMedal.tier === "Training" && (
                        <p className="mt-3 text-sm leading-6 text-amber-200/90">
                          Keep earning more credits to enter the medal board.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubPath) {
                          createFreshCourseSession(selectedSubPath, currentSubPath.course);
                          setCompleted(false);
                          toast.success(`Restarted ${currentSubPath.title}.`);
                        }
                      }}
                      className={`rounded-full bg-gradient-to-r ${currentSubPath.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Play again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        startCourseRound(currentSubPath.course, lastCourseRoundIndex);
                        toast.success(`Replaying ${currentSubPath.course.rounds[lastCourseRoundIndex].title}.`);
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Replay {currentSubPath.course.rounds[lastCourseRoundIndex].title}
                    </button>
                    <button
                      type="button"
                      onClick={goBackToSubPaths}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another database
                    </button>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another path
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Final coach note
                  </p>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-lg font-semibold text-white">
                      {feedback?.message}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Compare this database with the other sub-paths to sharpen your
                      understanding of SQL and NoSQL choices.
                    </p>
                  </div>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Memory boost
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Each correct answer gives a small reward so the lesson feels
                      active, friendly, and easy to continue.
                    </p>
                  </div>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Medal status
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {currentMedal.tier} medal path
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {currentMedal.tier === "Training"
                        ? "You’re close — keep building credits to unlock a bronze, silver, or gold finish."
                        : currentMedal.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : courseNextRoundSnapshot && nextCourseRound && currentSubPath ? (
            <section
              className={`relative w-full overflow-hidden rounded-[2rem] border ${currentSubPath.border} ${currentSubPath.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentSubPath.gradient}`}
              />

              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentSubPath.chip}`}
                  >
                    {currentCourseRound?.title} complete
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    You cleared {currentCourseRound?.title}. {nextCourseRound.title} is unlocked.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    {nextCourseRound.title} has {nextCourseRound.summary} Your credits and streak carry over.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Round credits
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {roundCredits}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Total credits
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {credits}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Streak
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {streak}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-6 rounded-3xl border ${currentMedal.border} bg-gradient-to-br ${currentMedal.color} p-[1px]`}>
                    <div className="rounded-[1.45rem] bg-slate-950/90 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {currentCourseRound?.title} medal
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                          {currentMedal.tier}
                        </span>
                        <p className="text-sm leading-6 text-slate-200">
                          {currentMedal.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        continueCourseSession(courseNextRoundSnapshot);
                        toast.success(`${nextCourseRound.title} started. Good luck.`);
                      }}
                      className={`rounded-full bg-gradient-to-r ${currentSubPath.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Start {nextCourseRound.title}
                    </button>
                    <button
                      type="button"
                      onClick={goBackToSubPaths}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another database
                    </button>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another path
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Up next in {nextCourseRound.title}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {nextCourseRound.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm text-slate-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-lg font-semibold text-white">
                      Your progress is saved.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      If you leave now, you will pick up at the first question of {nextCourseRound.title} next time.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : showCourseResumePrompt && currentSubPath ? (
            <section
              className={`relative w-full overflow-hidden rounded-[2rem] border ${currentSubPath.border} ${currentSubPath.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentSubPath.gradient}`}
              />

              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentSubPath.chip}`}
                  >
                    Resume available
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    Continue where you left off?
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    You were last working on {resumeStepLabel}. Your saved credits, streak, and query draft are ready on this device.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Saved step
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {resumeStepLabel}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Credits
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {courseResumeSnapshot?.credits ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Streak
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {courseResumeSnapshot?.streak ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (courseResumeSnapshot) {
                          continueCourseSession(courseResumeSnapshot);
                          toast.success(`Welcome back. Continuing from ${resumeStepLabel}.`);
                        }
                      }}
                      className={`rounded-full bg-gradient-to-r ${currentSubPath.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Continue from where you left off
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubPath && currentSubPath) {
                          createFreshCourseSession(selectedSubPath, currentSubPath.course);
                          toast.success("Starting fresh from the first question.");
                        }
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Start fresh
                    </button>
                    <button
                      type="button"
                      onClick={goBackToSubPaths}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another database
                    </button>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Change path
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    A quick note
                  </p>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-lg font-semibold text-white">
                      Nice work keeping your progress.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      We saved this locally so students can return without losing their place. If you want a clean slate, start fresh and begin from question one.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : currentSubPath && currentCourseStep ? (
            <section
              className={`relative w-full overflow-hidden rounded-[2rem] border ${currentSubPath.border} ${currentSubPath.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentSubPath.gradient}`}
              />

              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentSubPath.chip}`}
                    >
                      {currentSubPath.title} · {currentCourseRound?.title}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {currentLessonLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {credits} credits
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Streak {streak}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                      <span>{currentCourseRound?.title} progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${currentSubPath.gradient} transition-all duration-500`}
                        style={{width: `${progress}%`}}
                      />
                    </div>
                  </div>

                  <h1 className="mt-7 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {currentCourseStep.prompt}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    {currentCourseStep.kind === "mcq"
                      ? "Choose the best answer. Correct answers move you into the next lesson."
                      : `Write the ${currentSubPath.title} query for the prompt below, then submit it to check your work.`}
                  </p>

                  {currentCourseStep.kind === "mcq" ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {currentCourseOptionOrder.map((optionIndex, displayIndex) => {
                        const option = currentCourseStep.options[optionIndex];
                        if (!option) {
                          return null;
                        }

                        return (
                          <ChoiceButton
                            key={`${optionIndex}-${option}`}
                            label={option}
                            index={displayIndex}
                            selectedChoice={selectedChoice}
                            feedback={feedback}
                            onChoose={handleChoice}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={handleQuerySubmit} className="mt-8 grid gap-4">
                      <label className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                        Write the query
                      </label>
                      <textarea
                        value={queryDraft}
                        onChange={(event) => setQueryDraft(event.target.value)}
                        placeholder=""
                        rows={6}
                        className="min-h-[10rem] rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          className={`rounded-full bg-gradient-to-r ${currentSubPath.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                        >
                          Check query
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadStarter}
                          disabled={!canLoadQueryHint}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/5"
                        >
                          {canLoadQueryHint ? "Load hint" : "Load hint after 5 tries"}
                        </button>
                        {canRevealAnswer && (
                          <button
                            type="button"
                            onClick={handleRevealAnswer}
                            className="rounded-full border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-400/20"
                          >
                            Reveal answer
                          </button>
                        )}
                      </div>
                      {!canLoadQueryHint && (
                        <p className="text-sm text-slate-400">
                          Keep trying on your own — the hint unlocks after 5 attempts.
                        </p>
                      )}
                      {canRevealAnswer && (
                        <p className="text-sm text-amber-200/90">
                          You have unlocked the reveal button after 10 tries.
                        </p>
                      )}
                    </form>
                  )}

                  {currentCourseStep.kind === "mcq" && canRevealAnswer && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleRevealAnswer}
                        className="rounded-full border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-400/20"
                      >
                        Reveal answer
                      </button>
                    </div>
                  )}

                  <div
                    aria-live="polite"
                    className={`mt-6 rounded-3xl border p-5 ${
                      feedback?.kind === "correct"
                        ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-50"
                        : feedback?.kind === "wrong"
                          ? "border-rose-300/40 bg-rose-400/10 text-rose-50"
                          : feedback?.kind === "revealed"
                            ? "border-amber-300/40 bg-amber-400/10 text-amber-50"
                            : "border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-80">
                      Coach feedback
                    </p>
                    <p className="mt-2 text-base leading-7">
                      {feedback?.message ?? "Pick an answer or write a query to begin."}
                    </p>
                    {feedback?.kind === "correct" && (
                      <p className="mt-3 text-sm leading-6 opacity-80">
                        Nice work. The next step will appear automatically.
                      </p>
                    )}
                    {feedback?.kind === "wrong" && (
                      <p className="mt-3 text-sm leading-6 opacity-80">
                        Try again. The right structure is close, and you can still earn
                        more credits.
                      </p>
                    )}
                    {feedback?.kind === "revealed" && (
                      <p className="mt-3 text-sm leading-6 opacity-80">
                        Good learning move. You can continue, but this question will not add credits now.
                      </p>
                    )}
                  </div>
                </div>

                <aside className="grid gap-4">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Learning tip
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      {needHint ?? currentCourseStep.hint}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Why this matters
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      {currentCourseStep.explanation}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Course map
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Topic
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {currentCourseStep.kind === "mcq" ? currentCourseStep.sectionTitle : currentCourseStep.topicTitle}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Step
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {currentCourseStep.stepNumber} / {currentCourseStep.stepTotal}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {currentCourseRound?.title}: {currentCourseRound?.summary}
                      {courseRoundIndex < lastCourseRoundIndex &&
                        currentSubPath.course.rounds[courseRoundIndex + 1] &&
                        ` Finish every question to unlock ${currentSubPath.course.rounds[courseRoundIndex + 1].title}.`}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goBackToSubPaths}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Change database
                    </button>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Change path
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
