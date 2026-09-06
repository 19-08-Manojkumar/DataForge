'use client';

import {useEffect, useRef, useState, type FormEvent} from "react";
import {Toaster, toast} from "react-hot-toast";
import {MYSQL_COURSE, type MysqlCourse} from "./mysql-course";

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

type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
};

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
  questions?: QuizQuestion[];
  mysqlCourse?: MysqlCourse;
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

type MysqlProgressSnapshot = {
  stepOrder: number[];
  optionOrders: Record<string, number[]>;
  mysqlStepIndex: number;
  queryDraft: string;
  revealUsed: boolean;
  credits: number;
  streak: number;
  wrongAttempts: number;
  completed: boolean;
};

const MYSQL_PROGRESS_STORAGE_KEY = "mysql-course-progress-v2";

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
          "A complete MySQL course with 10 foundation questions and 50 query-writing drills across DDL, DML, DCL, TCL, and DQL.",
        badge: "Beginner friendly",
        gradient: "from-cyan-400 via-blue-500 to-sky-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(8,145,178,0.16)]",
        border: "border-cyan-300/20",
        chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-50",
        examples: ["10 basics", "DDL", "DML", "DQL"],
        mysqlCourse: MYSQL_COURSE,
      },
      {
        id: "postgresql",
        title: "PostgreSQL",
        subtitle: "Feature-rich SQL with strong data integrity",
        intro:
          "Great for learners who want to see a powerful SQL system with advanced types and strict correctness.",
        badge: "Advanced SQL",
        gradient: "from-sky-400 via-cyan-500 to-indigo-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(56,189,248,0.14)]",
        border: "border-sky-300/20",
        chip: "border-sky-300/20 bg-sky-400/10 text-sky-50",
        examples: ["JSONB", "ACID", "Extensions", "Strict SQL"],
        questions: [
          {
            prompt: "Which database is known for strong SQL features?",
            options: ["PostgreSQL", "SQLite", "DynamoDB", "Redis"],
            correctIndex: 0,
            explanation:
              "PostgreSQL is famous for advanced SQL support and dependable data integrity.",
            hint: "Look for the option with strong relational features.",
          },
          {
            prompt: "Which PostgreSQL feature can return inserted rows?",
            options: ["RETURNING", "TOP", "LIMIT", "MERGE"],
            correctIndex: 0,
            explanation:
              "RETURNING lets PostgreSQL give back rows after an INSERT or UPDATE statement.",
            hint: "The word suggests data is sent back to you after the action.",
          },
          {
            prompt: "Which type is often used for precise decimal values?",
            options: ["NUMERIC", "BOOLEAN", "TEXT", "BYTEA"],
            correctIndex: 0,
            explanation:
              "NUMERIC is useful when exact decimal storage matters, such as money values.",
            hint: "This type is chosen when precision matters more than speed.",
          },
        ],
      },
      {
        id: "sqlserver",
        title: "Microsoft SQL Server",
        subtitle: "Enterprise SQL with a familiar business stack",
        intro:
          "Useful for showing students how SQL appears in corporate environments and Microsoft tooling.",
        badge: "Enterprise path",
        gradient: "from-blue-400 via-sky-500 to-cyan-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(14,165,233,0.15)]",
        border: "border-blue-300/20",
        chip: "border-blue-300/20 bg-blue-400/10 text-blue-50",
        examples: ["T-SQL", "SSMS", "TOP", "Windows stack"],
        questions: [
          {
            prompt: "Which keyword often replaces LIMIT in SQL Server?",
            options: ["TOP", "OFFSET", "FETCH", "ROWNUM"],
            correctIndex: 0,
            explanation:
              "SQL Server often uses TOP to control how many rows are returned.",
            hint: "Think of the keyword that means 'first few rows'.",
          },
          {
            prompt: "What is the Microsoft SQL language style often called?",
            options: ["T-SQL", "PL/SQL", "MySQL", "NoSQL"],
            correctIndex: 0,
            explanation:
              "T-SQL is Microsoft's flavor of SQL used in SQL Server.",
            hint: "The answer starts with a 'T'.",
          },
          {
            prompt: "Which tool is commonly used to manage SQL Server?",
            options: ["SSMS", "Figma", "Excel", "Nginx"],
            correctIndex: 0,
            explanation:
              "SSMS means SQL Server Management Studio, a common admin tool.",
            hint: "Look for the Microsoft management tool abbreviation.",
          },
        ],
      },
      {
        id: "sqlite",
        title: "SQLite",
        subtitle: "Lightweight, embedded, and perfect for small projects",
        intro:
          "Excellent for teaching because it is simple, file-based, and easy to run without a server.",
        badge: "Embedded database",
        gradient: "from-violet-400 via-sky-500 to-cyan-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(59,130,246,0.14)]",
        border: "border-violet-300/20",
        chip: "border-violet-300/20 bg-violet-400/10 text-violet-50",
        examples: ["Single file", "Mobile apps", "Embedded", "No server"],
        questions: [
          {
            prompt: "Which database is usually stored in a single file?",
            options: ["SQLite", "MySQL", "MongoDB", "Oracle"],
            correctIndex: 0,
            explanation:
              "SQLite is commonly stored as a single file, which makes it easy to ship and learn.",
            hint: "Think about the database that does not need a server process.",
          },
          {
            prompt: "What makes SQLite easy to use in small apps?",
            options: ["No separate server", "Requires clustering", "Needs a big cluster", "Only works online"],
            correctIndex: 0,
            explanation:
              "SQLite is embedded, so you can use it without running a separate database server.",
            hint: "Look for the option that sounds the simplest to deploy.",
          },
          {
            prompt: "Which SQL database is often used on mobile devices?",
            options: ["SQLite", "Redis", "Cassandra", "PostgreSQL"],
            correctIndex: 0,
            explanation:
              "SQLite is common in phones and lightweight applications because it is compact and local.",
            hint: "Think compact and local.",
          },
        ],
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
          "A great document database for teaching JSON-like records and schema flexibility.",
        badge: "Document database",
        gradient: "from-fuchsia-400 via-pink-500 to-amber-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(217,70,239,0.14)]",
        border: "border-fuchsia-300/20",
        chip: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-50",
        examples: ["Documents", "JSON-like", "Flexible schema", "Collections"],
        questions: [
          {
            prompt: "Which database stores JSON-like documents?",
            options: ["MongoDB", "MySQL", "SQLite", "SQL Server"],
            correctIndex: 0,
            explanation:
              "MongoDB stores data as documents, which makes it easy to model flexible records.",
            hint: "Think about documents instead of tables.",
          },
          {
            prompt: "Which NoSQL style lets fields vary between records?",
            options: ["Flexible schema", "Fixed columns", "Rigid tables", "Stored views"],
            correctIndex: 0,
            explanation:
              "A flexible schema is one of the main reasons document databases are so popular.",
            hint: "Look for the option that sounds adaptable.",
          },
          {
            prompt: "What is a group of MongoDB documents usually called?",
            options: ["Collection", "Table", "Worksheet", "Schema"],
            correctIndex: 0,
            explanation:
              "MongoDB groups documents into collections rather than tables.",
            hint: "Think of the word used for a container of documents.",
          },
        ],
      },
      {
        id: "firebase",
        title: "Firebase",
        subtitle: "Cloud-backed and useful for real-time apps",
        intro:
          "Nice for teaching student-facing apps because it feels modern, fast, and connected.",
        badge: "Realtime cloud",
        gradient: "from-amber-400 via-orange-500 to-fuchsia-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(249,115,22,0.16)]",
        border: "border-amber-300/20",
        chip: "border-amber-300/20 bg-amber-400/10 text-amber-50",
        examples: ["Realtime sync", "Cloud", "Mobile apps", "Auth"],
        questions: [
          {
            prompt: "Which platform is common for realtime app data?",
            options: ["Firebase", "Oracle", "SQLite", "MySQL"],
            correctIndex: 0,
            explanation:
              "Firebase is often used in apps that need cloud sync and realtime updates.",
            hint: "Think cloud-first and live syncing.",
          },
          {
            prompt: "Which feature helps Firebase push updates quickly?",
            options: ["Realtime sync", "Foreign keys", "Stored procedures", "Manual indexing only"],
            correctIndex: 0,
            explanation:
              "Realtime sync lets the app update users quickly when data changes.",
            hint: "The key idea is instant updates between users and the cloud.",
          },
          {
            prompt: "Firebase is often paired with which kind of apps?",
            options: ["Mobile and web apps", "Only desktop databases", "Only spreadsheet files", "Only offline text files"],
            correctIndex: 0,
            explanation:
              "Firebase is popular for mobile and web experiences that need quick backend setup.",
            hint: "Look for the app types that need fast startup.",
          },
        ],
      },
      {
        id: "cassandra",
        title: "Cassandra",
        subtitle: "Distributed and built for large-scale availability",
        intro:
          "Good for explaining a NoSQL system that focuses on scale, resilience, and distributed storage.",
        badge: "Distributed data",
        gradient: "from-indigo-400 via-fuchsia-500 to-pink-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(129,140,248,0.15)]",
        border: "border-indigo-300/20",
        chip: "border-indigo-300/20 bg-indigo-400/10 text-indigo-50",
        examples: ["Wide column", "Distributed", "High availability", "Scale out"],
        questions: [
          {
            prompt: "Which NoSQL database is designed for distributed scale?",
            options: ["Cassandra", "SQLite", "MySQL", "Access"],
            correctIndex: 0,
            explanation:
              "Cassandra is built for distributed data and high availability across many nodes.",
            hint: "Think about a database used across many machines.",
          },
          {
            prompt: "Which scaling style is common for Cassandra?",
            options: ["Horizontal scaling", "One server only", "Manual spreadsheets", "File by file"],
            correctIndex: 0,
            explanation:
              "Cassandra scales out by using more nodes rather than depending on one giant server.",
            hint: "The clue is adding more machines.",
          },
          {
            prompt: "Which property is especially important in Cassandra?",
            options: ["High availability", "Tiny local files", "Single-user tables", "Spreadsheet formatting"],
            correctIndex: 0,
            explanation:
              "Cassandra is often chosen when uptime and resilience matter.",
            hint: "Look for the system that stays available even when nodes fail.",
          },
        ],
      },
      {
        id: "redis",
        title: "Redis",
        subtitle: "In-memory key-value speed for caching and sessions",
        intro:
          "Helpful for showing students a fast NoSQL style that often powers caches and temporary data.",
        badge: "Fast key-value",
        gradient: "from-emerald-400 via-teal-500 to-cyan-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(16,185,129,0.14)]",
        border: "border-emerald-300/20",
        chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
        examples: ["Cache", "Sessions", "Fast lookups", "In-memory"],
        questions: [
          {
            prompt: "Which database is famous for in-memory speed?",
            options: ["Redis", "PostgreSQL", "SQLite", "Oracle"],
            correctIndex: 0,
            explanation:
              "Redis is known for very fast reads and writes because it works mainly in memory.",
            hint: "Look for the ultra-fast key-value system.",
          },
          {
            prompt: "What is Redis often used for?",
            options: ["Caching", "Foreign key joins", "Spreadsheet formulas", "Manual backups only"],
            correctIndex: 0,
            explanation:
              "Redis is commonly used as a cache to speed up frequently accessed data.",
            hint: "Think about temporary data that must be read quickly.",
          },
          {
            prompt: "Which data model fits Redis best?",
            options: ["Key-value", "Relational table", "Spreadsheet grid", "XML tree only"],
            correctIndex: 0,
            explanation:
              "Redis is a key-value store, which makes it simple and fast for many workloads.",
            hint: "The clue is one key paired with one value.",
          },
        ],
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

function buildQuestionOptionOrders<T extends {options: string[]}>(questions: T[]) {
  return questions.reduce<Record<string, number[]>>((orders, question, index) => {
    orders[String(index)] = buildOptionOrder(question.options.length);
    return orders;
  }, {});
}

function buildMysqlStepOrder(course: MysqlCourse) {
  const basics = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "mcq")
    .map(({index}) => index);

  const ddl = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "query" && step.topicKey === "ddl")
    .map(({index}) => index);
  const dml = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "query" && step.topicKey === "dml")
    .map(({index}) => index);
  const dcl = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "query" && step.topicKey === "dcl")
    .map(({index}) => index);
  const tcl = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "query" && step.topicKey === "tcl")
    .map(({index}) => index);
  const dql = course.steps
    .map((step, index) => ({step, index}))
    .filter(({step}) => step.kind === "query" && step.topicKey === "dql")
    .map(({index}) => index);

  return [
    ...shuffleArray(basics),
    ...shuffleArray(ddl),
    ...shuffleArray(dml),
    ...shuffleArray(dcl),
    ...shuffleArray(tcl),
    ...shuffleArray(dql),
  ];
}

function buildMysqlOptionOrders(course: MysqlCourse, stepOrder: number[]) {
  return stepOrder.reduce<Record<string, number[]>>((orders, stepIndex) => {
    const step = course.steps[stepIndex];

    if (step.kind === "mcq") {
      orders[String(stepIndex)] = buildOptionOrder(step.options.length);
    }

    return orders;
  }, {});
}

function readMysqlProgressSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(MYSQL_PROGRESS_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<MysqlProgressSnapshot>;
    if (
      !Array.isArray(parsed.stepOrder) ||
      typeof parsed.optionOrders !== "object" ||
      parsed.optionOrders === null ||
      typeof parsed.mysqlStepIndex !== "number"
    ) {
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
      stepOrder.length === MYSQL_COURSE.steps.length &&
      uniqueStepOrder.size === MYSQL_COURSE.steps.length &&
      stepOrder.every((item) => item >= 0 && item < MYSQL_COURSE.steps.length);

    if (!isValidStepOrder) {
      return null;
    }

    for (const [key, order] of Object.entries(optionOrders)) {
      const stepIndex = Number(key);
      const step = MYSQL_COURSE.steps[stepIndex];
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
      stepOrder,
      optionOrders,
      mysqlStepIndex: Math.max(0, parsed.mysqlStepIndex),
      queryDraft: typeof parsed.queryDraft === "string" ? parsed.queryDraft : "",
      revealUsed: Boolean(parsed.revealUsed),
      credits: typeof parsed.credits === "number" ? parsed.credits : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      wrongAttempts: typeof parsed.wrongAttempts === "number" ? parsed.wrongAttempts : 0,
      completed: Boolean(parsed.completed),
    } satisfies MysqlProgressSnapshot;
  } catch {
    return null;
  }
}

function saveMysqlProgressSnapshot(snapshot: MysqlProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MYSQL_PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
}

function clearMysqlProgressSnapshot() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(MYSQL_PROGRESS_STORAGE_KEY);
}

function describeMysqlStep(step: MysqlCourse["steps"][number] | null) {
  if (!step) {
    return "MySQL";
  }

  return step.kind === "mcq"
    ? `Basics ${step.stepNumber} of ${step.stepTotal}`
    : `${step.topicTitle} ${step.stepNumber} of ${step.stepTotal}`;
}

function canonicalizeSqlQuery(query: string) {
  return query
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/;+/g, "")
    .replace(/\s+/g, "")
    .replace(/column/g, "")
    .replace(/primary_key_auto_increment/g, "primary_key_auto_increment")
    .replace(/auto_increment_primary_key/g, "primary_key_auto_increment")
    .replace(/primarykeyauto_increment/g, "primary_key_auto_increment")
    .replace(/auto_incrementprimarykey/g, "primary_key_auto_increment")
    .trim();
}

function buildQueryHintSnippet(answer: string) {
  const normalizedAnswer = answer.replace(/`/g, "").replace(/;+\s*$/, "").trim();
  const normalizedUpper = normalizedAnswer.toUpperCase();

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
  setQuestionIndex: (index: number) => void,
  setMysqlStepIndex: (index: number) => void,
  setMysqlStepOrder: (order: number[]) => void,
  setMysqlOptionOrders: (orders: Record<string, number[]>) => void,
  setQuestionOptionOrders: (orders: Record<string, number[]>) => void,
  setMysqlSessionReady: (ready: boolean) => void,
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
  setQuestionIndex(0);
  setMysqlStepIndex(0);
  setMysqlStepOrder([]);
  setMysqlOptionOrders({});
  setQuestionOptionOrders({});
  setMysqlSessionReady(false);
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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedSubPath, setSelectedSubPath] = useState<SubPathKey | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [mysqlStepIndex, setMysqlStepIndex] = useState(0);
  const [mysqlStepOrder, setMysqlStepOrder] = useState<number[]>([]);
  const [mysqlOptionOrders, setMysqlOptionOrders] = useState<Record<string, number[]>>({});
  const [questionOptionOrders, setQuestionOptionOrders] = useState<Record<string, number[]>>({});
  const [mysqlResumeSnapshot, setMysqlResumeSnapshot] = useState<MysqlProgressSnapshot | null>(null);
  const [mysqlSessionReady, setMysqlSessionReady] = useState(false);
  const [answerRevealUsed, setAnswerRevealUsed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [queryDraft, setQueryDraft] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
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

  const resetProgress = () => {
    clearAdvanceTimer();
    setQuestionIndex(0);
    setMysqlStepIndex(0);
    setMysqlStepOrder([]);
    setMysqlOptionOrders({});
    setQuestionOptionOrders({});
    setMysqlSessionReady(false);
    setAnswerRevealUsed(false);
    setSelectedChoice(null);
    setQueryDraft("");
    setFeedback(null);
    setCredits(0);
    setStreak(0);
    setWrongAttempts(0);
    setCompleted(false);
  };

  const createFreshMysqlSession = () => {
    const nextStepOrder = buildMysqlStepOrder(MYSQL_COURSE);
    const nextOptionOrders = buildMysqlOptionOrders(MYSQL_COURSE, nextStepOrder);

    clearAdvanceTimer();
    setMysqlStepOrder(nextStepOrder);
    setMysqlOptionOrders(nextOptionOrders);
    setMysqlStepIndex(0);
    setSelectedChoice(null);
    setQueryDraft("");
    setFeedback(null);
    setCredits(0);
    setStreak(0);
    setWrongAttempts(0);
    setCompleted(false);
    setMysqlSessionReady(true);
    setAnswerRevealUsed(false);
    setMysqlResumeSnapshot(null);
    clearMysqlProgressSnapshot();
  };

  const continueMysqlSession = (snapshot: MysqlProgressSnapshot) => {
    clearAdvanceTimer();
    setMysqlStepOrder(snapshot.stepOrder);
    setMysqlOptionOrders(snapshot.optionOrders);
    setMysqlStepIndex(Math.min(snapshot.mysqlStepIndex, snapshot.stepOrder.length - 1));
    setSelectedChoice(null);
    setQueryDraft(snapshot.queryDraft);
    setFeedback(null);
    setCredits(snapshot.credits);
    setStreak(snapshot.streak);
    setWrongAttempts(snapshot.wrongAttempts);
    setCompleted(false);
    setMysqlSessionReady(true);
    setAnswerRevealUsed(Boolean(snapshot.revealUsed));
    setMysqlResumeSnapshot(null);
  };

  const handleCategorySelect = (category: CategoryKey) => {
    resetSession(
      clearAdvanceTimer,
      setSelectedCategory,
      setSelectedSubPath,
      setQuestionIndex,
      setMysqlStepIndex,
      setMysqlStepOrder,
      setMysqlOptionOrders,
      setQuestionOptionOrders,
      setMysqlSessionReady,
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

    if (subPathId === "mysql" && subPath.mysqlCourse) {
      const savedSnapshot = readMysqlProgressSnapshot();
      if (savedSnapshot && !savedSnapshot.completed) {
        setMysqlResumeSnapshot(savedSnapshot);
        toast.success(
          `You left off at ${describeMysqlStep(subPath.mysqlCourse.steps[savedSnapshot.stepOrder[savedSnapshot.mysqlStepIndex]] ?? null)}. Continue or start fresh.`,
        );
        return;
      }

      createFreshMysqlSession();
      toast.success(`Great choice. Let's learn ${subPath.title}.`);
      return;
    }

    if (subPath.questions) {
      setQuestionOptionOrders(buildQuestionOptionOrders(subPath.questions));
    }

    toast.success(`Great choice. Let's learn ${subPath.title}.`);
  };

  const goBackToCategories = () => {
    resetSession(
      clearAdvanceTimer,
      setSelectedCategory,
      setSelectedSubPath,
      setQuestionIndex,
      setMysqlStepIndex,
      setMysqlStepOrder,
      setMysqlOptionOrders,
      setQuestionOptionOrders,
      setMysqlSessionReady,
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
  };

  const goBackToSubPaths = () => {
    resetProgress();
    setSelectedSubPath(null);
  };

  const currentSubPath = getSubPath(selectedCategory, selectedSubPath);
  const currentMysqlStepIndex =
    currentSubPath?.id === "mysql" && mysqlSessionReady ? mysqlStepOrder[mysqlStepIndex] ?? null : null;
  const currentMysqlStep =
    currentSubPath?.id === "mysql" && currentMysqlStepIndex !== null
      ? currentSubPath?.mysqlCourse?.steps[currentMysqlStepIndex] ?? null
      : null;
  const currentQuestion = currentSubPath?.id !== "mysql" ? currentSubPath?.questions?.[questionIndex] ?? null : null;
  const totalQuestions = currentSubPath?.questions?.length ?? 0;
  const totalMysqlSteps = currentSubPath?.mysqlCourse?.steps.length ?? 0;
  const isMysqlCourse = currentSubPath?.id === "mysql" && Boolean(currentSubPath?.mysqlCourse);
  const progress = isMysqlCourse
    ? ((mysqlStepIndex + (completed ? 1 : 0)) / Math.max(totalMysqlSteps, 1)) * 100
    : currentSubPath
      ? ((questionIndex + (completed ? 1 : 0)) / Math.max(totalQuestions, 1)) * 100
      : 0;
  const currentLessonLabel = isMysqlCourse && currentMysqlStep ? describeMysqlStep(currentMysqlStep) : `Question ${questionIndex + 1} of ${totalQuestions}`;
  const currentMysqlOptionOrder =
    currentMysqlStep?.kind === "mcq"
      ? mysqlOptionOrders[String(currentMysqlStepIndex ?? -1)] ?? currentMysqlStep.options.map((_, index) => index)
      : [];
  const currentQuestionOptionOrder =
    currentQuestion && currentSubPath?.id !== "mysql"
      ? questionOptionOrders[String(questionIndex)] ?? currentQuestion.options.map((_, index) => index)
      : [];
  const needHint = isMysqlCourse
    ? currentMysqlStep?.hint ?? null
    : currentQuestion && wrongAttempts >= 2
      ? currentQuestion.hint
      : null;
  const canLoadMysqlHint = !isMysqlCourse || currentMysqlStep?.kind !== "query" ? true : wrongAttempts >= 5;
  const canRevealAnswer = !completed && wrongAttempts >= 10 && !answerRevealUsed;
  const mysqlResumeStep = mysqlResumeSnapshot
    ? MYSQL_COURSE.steps[mysqlResumeSnapshot.stepOrder[mysqlResumeSnapshot.mysqlStepIndex] ?? -1] ?? null
    : null;
  const showMysqlResumePrompt =
    currentSubPath?.id === "mysql" && Boolean(mysqlResumeSnapshot) && !mysqlSessionReady && !completed;
  const resumeStepLabel = describeMysqlStep(mysqlResumeStep);
  const currentMedal = getCreditMedal(credits);

  const finishCurrentCourse = (message: string) => {
    setCompleted(true);
    setSelectedChoice(null);
    setQueryDraft("");
    setFeedback({
      kind: "correct",
      message,
    });
    clearMysqlProgressSnapshot();
    setMysqlSessionReady(false);
    setMysqlResumeSnapshot(null);
  };

  const advanceMysqlStep = () => {
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      const isFinalStep = mysqlStepIndex === totalMysqlSteps - 1;
      if (isFinalStep) {
        finishCurrentCourse("Path complete. You unlocked the full MySQL course.");
      } else {
        setMysqlStepIndex((value) => value + 1);
        setSelectedChoice(null);
        setQueryDraft("");
        setFeedback(null);
        setWrongAttempts(0);
      }
      advanceTimerRef.current = null;
    }, 950);
  };

  const handleRevealAnswer = () => {
    if (completed || !canRevealAnswer) {
      return;
    }

    if (isMysqlCourse && currentMysqlStep) {
      setAnswerRevealUsed(true);
      if (currentMysqlStep.kind === "query") {
        setQueryDraft(currentMysqlStep.acceptedAnswers[0] ?? currentMysqlStep.starter);
        setSelectedChoice(null);
      } else {
        const correctDisplayIndex = currentMysqlOptionOrder.findIndex(
          (optionIndex) => optionIndex === currentMysqlStep.correctIndex,
        );
        setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
      }

      const revealedAnswer =
        currentMysqlStep.kind === "mcq"
          ? currentMysqlStep.options[currentMysqlStep.correctIndex]
          : currentMysqlStep.acceptedAnswers[0] ?? currentMysqlStep.starter;

      setFeedback({
        kind: "revealed",
        message:
          currentMysqlStep.kind === "mcq"
            ? `Revealed answer: ${revealedAnswer}. Select that option to continue, but this question earns no credits now.`
            : "Revealed answer loaded. Use it to continue, but this question earns no credits now.",
      });
      toast("Answer revealed. No credits will be awarded for this question.");
      return;
    }

    if (currentQuestion) {
      setAnswerRevealUsed(true);
      const correctDisplayIndex = currentQuestionOptionOrder.findIndex(
        (optionIndex) => optionIndex === currentQuestion.correctIndex,
      );
      setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
      setFeedback({
        kind: "revealed",
        message: `Revealed answer: ${currentQuestion.options[currentQuestion.correctIndex]}. Select that option to continue, but this question earns no credits now.`,
      });
      toast("Answer revealed. No credits will be awarded for this question.");
    }
  };

  const handleLoadStarter = () => {
    if (!currentMysqlStep || currentMysqlStep.kind !== "query") {
      return;
    }

    if (!canLoadMysqlHint) {
      toast.error("Try your own answer 5 times first.");
      return;
    }

    setQueryDraft(buildQueryHintSnippet(currentMysqlStep.acceptedAnswers[0] ?? currentMysqlStep.starter));
    toast.success("Hint loaded.");
  };

  const handleChoice = (choiceIndex: number) => {
    if (completed || feedback?.kind === "correct") {
      return;
    }

    if (isMysqlCourse && currentMysqlStep?.kind === "mcq") {
      setSelectedChoice(choiceIndex);
      const sourceStepIndex = currentMysqlStepIndex;
      const optionOrder =
        sourceStepIndex !== null
          ? mysqlOptionOrders[String(sourceStepIndex)] ?? currentMysqlStep.options.map((_, index) => index)
          : currentMysqlStep.options.map((_, index) => index);
      const actualChoiceIndex = optionOrder[choiceIndex];
      const correctAnswer = currentMysqlStep.options[currentMysqlStep.correctIndex];
      const reward = calculateQuestionCredits(10, wrongAttempts, answerRevealUsed);

      if (actualChoiceIndex === currentMysqlStep.correctIndex) {
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
        advanceMysqlStep();
        return;
      }

      if (answerRevealUsed) {
        const correctDisplayIndex = optionOrder.findIndex(
          (optionIndex) => optionIndex === currentMysqlStep.correctIndex,
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
        message: "Not quite. Try again and think about the MySQL basics.",
      });
      toast.error("Not quite. Try again.");
      return;
    }

    if (!isMysqlCourse && currentQuestion) {
      setSelectedChoice(choiceIndex);
      const optionOrder =
        questionOptionOrders[String(questionIndex)] ?? currentQuestion.options.map((_, index) => index);
      const actualChoiceIndex = optionOrder[choiceIndex];
      const correctAnswer = currentQuestion.options[currentQuestion.correctIndex];
      const reward = calculateQuestionCredits(10, wrongAttempts, answerRevealUsed);

      if (actualChoiceIndex === currentQuestion.correctIndex) {
        const nextStreak = answerRevealUsed ? streak : streak + 1;
        const bonus = !answerRevealUsed && nextStreak % 3 === 0 && reward > 0 ? 5 : 0;
        const earned = reward + bonus;
        const isFinalQuestion = questionIndex === (currentSubPath?.questions?.length ?? 1) - 1;

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

        clearAdvanceTimer();
        advanceTimerRef.current = window.setTimeout(() => {
          if (isFinalQuestion) {
            finishCurrentCourse("Path complete. You unlocked the final result.");
          } else {
            setQuestionIndex((value) => value + 1);
            setSelectedChoice(null);
            setFeedback(null);
            setWrongAttempts(0);
          }
          advanceTimerRef.current = null;
        }, 950);
        return;
      }

      if (answerRevealUsed) {
        const correctDisplayIndex = optionOrder.findIndex(
          (optionIndex) => optionIndex === currentQuestion.correctIndex,
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
        message: "Not quite. Try again and think about the database style.",
      });
      toast.error("Not quite. Try again.");
    }
  };

  const handleQuerySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isMysqlCourse || currentMysqlStep?.kind !== "query" || completed || feedback?.kind === "correct") {
      return;
    }

    if (!queryDraft.trim()) {
      toast.error("Type a query before submitting.");
      return;
    }

    const normalizedDraft = canonicalizeSqlQuery(queryDraft);
    const isCorrect = currentMysqlStep.acceptedAnswers.some(
      (answer) => canonicalizeSqlQuery(answer) === normalizedDraft,
    );
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

    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      const isFinalStep = mysqlStepIndex === totalMysqlSteps - 1;
      if (isFinalStep) {
        finishCurrentCourse("MySQL course complete. You built queries across DDL, DML, DCL, TCL, and DQL.");
      } else {
        setMysqlStepIndex((value) => value + 1);
        setSelectedChoice(null);
        setQueryDraft("");
        setFeedback(null);
        setWrongAttempts(0);
      }
      advanceTimerRef.current = null;
    }, 1100);
  };

  useEffect(() => {
    if (!isMysqlCourse || !mysqlSessionReady || !currentMysqlStep || completed) {
      return;
    }

    const stepOrder = mysqlStepOrder.length ? mysqlStepOrder : MYSQL_COURSE.steps.map((_, index) => index);
    saveMysqlProgressSnapshot({
      stepOrder,
      optionOrders: mysqlOptionOrders,
      mysqlStepIndex,
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
    currentMysqlStep,
    isMysqlCourse,
    mysqlOptionOrders,
    mysqlSessionReady,
    mysqlStepIndex,
    mysqlStepOrder,
    queryDraft,
    answerRevealUsed,
    streak,
    wrongAttempts,
  ]);

  return (
    <>
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
                    {currentSubPath.id === "mysql"
                      ? "Great work. You completed the full MySQL course."
                      : `Great work. You completed ${currentSubPath.title}.`}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    {currentSubPath.id === "mysql"
                      ? "You finished 10 basics questions and 50 query-writing drills across DDL, DML, DCL, TCL, and DQL. That is a real MySQL win."
                      : "You stayed on track, corrected mistakes, and kept moving through the lesson. That is exactly how strong database intuition grows."}
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
                          if (currentSubPath?.id === "mysql") {
                            createFreshMysqlSession();
                            setCompleted(false);
                            toast.success(`Restarted ${currentSubPath.title}.`);
                            return;
                          }

                          resetProgress();
                          setSelectedSubPath(selectedSubPath);
                          toast.success(`Restarted ${currentSubPath.title}.`);
                        }
                      }}
                      className={`rounded-full bg-gradient-to-r ${currentSubPath.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Play again
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
          ) : showMysqlResumePrompt && currentSubPath ? (
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
                        {mysqlResumeSnapshot?.credits ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Streak
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {mysqlResumeSnapshot?.streak ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (mysqlResumeSnapshot) {
                          continueMysqlSession(mysqlResumeSnapshot);
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
                        createFreshMysqlSession();
                        toast.success("Starting fresh from the first MySQL question.");
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
          ) : currentSubPath?.id === "mysql" && currentMysqlStep ? (
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
                      MySQL Course
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
                      <span>Course progress</span>
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
                    {currentMysqlStep.prompt}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    {currentMysqlStep.kind === "mcq"
                      ? "Choose the best answer. Correct answers move you into the next MySQL lesson."
                      : "Write the MySQL query for the prompt below, then submit it to check your work."}
                  </p>

                  {currentMysqlStep.kind === "mcq" ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {currentMysqlOptionOrder.map((optionIndex, displayIndex) => {
                        const option = currentMysqlStep.options[optionIndex];
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
                          disabled={!canLoadMysqlHint}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/5"
                        >
                          {canLoadMysqlHint ? "Load hint" : "Load hint after 5 tries"}
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
                      {!canLoadMysqlHint && (
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

                  {currentMysqlStep.kind === "mcq" && canRevealAnswer && (
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
                        Nice work. The next MySQL step will appear automatically.
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
                      {needHint ?? currentMysqlStep.hint}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Why this matters
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      {currentMysqlStep.explanation}
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
                          {currentMysqlStep.kind === "mcq" ? "Basics" : currentMysqlStep.topicTitle}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Step
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {currentMysqlStep.stepNumber} / {currentMysqlStep.stepTotal}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      The MySQL course starts with 10 concept checks and then moves
                      into 50 query-writing drills across DDL, DML, DCL, TCL, and DQL.
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
          ) : currentSubPath && currentSubPath.id !== "mysql" ? (
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
                      {LEARNING_TRACKS[selectedCategory!].title} / {currentSubPath.title}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Question {questionIndex + 1} of {totalQuestions}
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
                      <span>Progress</span>
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
                    {currentQuestion?.prompt}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Choose the best answer. Wrong answers will show a clear correction
                    and you can try again right away.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {currentQuestionOptionOrder.map((optionIndex, displayIndex) => {
                      const option = currentQuestion?.options[optionIndex];
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

                  {canRevealAnswer && (
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
                      {feedback?.message ?? "Pick an answer to begin."}
                    </p>
                    {feedback?.kind === "correct" && (
                      <p className="mt-3 text-sm leading-6 opacity-80">
                        Nice work. The next question will appear automatically.
                      </p>
                    )}
                    {feedback?.kind === "wrong" && (
                      <p className="mt-3 text-sm leading-6 opacity-80">
                        Try again. The answer is close, and your next attempt can earn
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
                      {needHint ?? currentQuestion?.hint}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Why this matters
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      {currentQuestion?.explanation}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Credits board
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Credits
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {credits}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Streak
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {streak}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      Every third correct answer adds a bonus so the lesson stays
                      rewarding and lively.
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
