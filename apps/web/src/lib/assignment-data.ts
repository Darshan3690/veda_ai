export type QuestionType = {
  type: string;
  count: number;
  marks: number;
};

export type GeneratedQuestion = {
  question: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
  answer: string;
  type?: "mcq" | "short" | "long" | "numerical" | "diagram";
  options?: string[];
};

export type GeneratedSection = {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
};

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  className: string;
  assignedOn: string;
  dueDate: string;
  duration: string;
  maxMarks: number;
  sections?: GeneratedSection[];
  questions: GeneratedQuestion[];
};

export const questionTypes = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
];

export const assignments: Assignment[] = [
  {
    id: "electricity-paper",
    title: "Quiz on Electricity",
    subject: "English",
    className: "5th",
    assignedOn: "20-06-2025",
    dueDate: "21-06-2025",
    duration: "45 minutes",
    maxMarks: 20,
    questions: [
      {
        difficulty: "Easy",
        marks: 2,
        question: "Define electroplating. Explain its purpose.",
        answer:
          "Electroplating is the process of depositing a thin layer of metal on another metal using electric current. It prevents corrosion, improves appearance, and increases thickness.",
      },
      {
        difficulty: "Moderate",
        marks: 2,
        question: "What is the role of a conductor in the process of electrolysis?",
        answer:
          "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.",
      },
      {
        difficulty: "Easy",
        marks: 2,
        question: "Why does a solution of copper sulphate conduct electricity?",
        answer:
          "Copper sulphate solution contains free copper and sulphate ions, which carry electric charge and conduct electricity.",
      },
      {
        difficulty: "Moderate",
        marks: 2,
        question: "Describe one example of the chemical effect of electric current in daily life.",
        answer:
          "A common example is silver electroplating on jewellery to prevent tarnishing and improve appearance.",
      },
      {
        difficulty: "Moderate",
        marks: 2,
        question: "Explain why electric current is said to have chemical effects.",
        answer:
          "Electric current can cause reactions in conducting liquids, changing substances at the electrodes.",
      },
      {
        difficulty: "Challenging",
        marks: 2,
        question:
          "How is sodium hydroxide prepared during electrolysis of brine? Write the chemical reaction involved.",
        answer:
          "Sodium hydroxide is formed at the cathode during brine electrolysis. 2H2O + 2e- -> H2 + 2OH-, and Na+ + OH- -> NaOH.",
      },
      {
        difficulty: "Challenging",
        marks: 2,
        question:
          "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.",
        answer:
          "At the cathode, water is reduced to hydrogen gas and hydroxide ions. At the anode, water is oxidized to oxygen gas and hydrogen ions.",
      },
      {
        difficulty: "Easy",
        marks: 2,
        question:
          "Mention the type of current used in electroplating and justify why it is used.",
        answer:
          "Direct current is used because it produces a consistent flow of electrons necessary for controlled deposition of metal.",
      },
      {
        difficulty: "Moderate",
        marks: 2,
        question:
          "What is the importance of electric current in the field of metallurgy?",
        answer:
          "Electric current is used to extract and purify metals through electrolysis and electrorefining.",
      },
      {
        difficulty: "Challenging",
        marks: 2,
        question:
          "Explain with a chemical equation how copper is deposited during the electroplating of an object.",
        answer:
          "Copper ions gain electrons at the cathode and deposit as copper metal: Cu2+ + 2e- -> Cu.",
      },
    ],
  },
];
