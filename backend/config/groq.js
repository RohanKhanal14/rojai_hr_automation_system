//Imports
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Groq from "groq-sdk";
//Ensure env is loaded even when process starts outside Backend cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
//Config
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//Functions
const analyzeCV = async (rawCV, jobInfo) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are an expert ATS evaluator. Return ONLY valid JSON. No markdown, no backticks, no explanation — raw JSON only.",
      },
      {
        role: "user",
        content: `You are an expert ATS (Applicant Tracking System) evaluator.

        Analyze the CV text below against the job requirements and return ONLY a valid JSON object. No markdown, no backticks, raw JSON only.

        ===JOB DETAILS===
        Position: ${jobInfo.position}
        Department: ${jobInfo.department}
        Experience Level Required: ${jobInfo.experienceLevel}
        Description: ${jobInfo.description}
        Must Have Skills: ${jobInfo.mustHaveSkills.join(", ")}
        Nice To Have Skills: ${jobInfo.niceToHaveSkills.join(", ")}

        ===CV TEXT===
        ${rawCV}

        ===WEIGHTED SCORING SYSTEM===
        Use this exact weighted formula for overallScore:
        - skillsScore     → weight 40% (how many mustHaveSkills match. niceToHaveSkills are bonus)
        - experienceScore → weight 25% (does candidate experience level match required level)
        - educationScore  → weight 15% (relevant degree or field of study)
        - keywordsScore   → weight 12% (keyword overlap between CV and job description)
        - projectsScore   → weight 8%  (relevant projects or practical work)

        overallScore = (skillsScore × 0.40) + (experienceScore × 0.25) + (educationScore × 0.15) + (keywordsScore × 0.12) + (projectsScore × 0.08)

        ===RETURN THIS EXACT JSON STRUCTURE===
        {
            "atsScore": 0,
            "cvSummary": "One paragraph explaining why this score was given, what matched well and what was missing."
        }
        `,
      },
    ],
  });
  const raw = response.choices[0].message.content;
  const cleaned = raw
    .replace(/```json|```/g, "")
    .replace(/^[^{[]*/, "") // remove any text before JSON starts
    .replace(/[^}\]]*$/, "") // remove any text after JSON ends
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    throw new Error(`Groq returned invalid JSON: ${cleaned}`);
  }
};
const analyzeInterview = async (transcript, messages, session) => {
  const questionsText = session.questions
    .map((q, i) => `Q${i + 1}: ${q}`)
    .join("\n");
  const candidateResponses = messages
    .filter((m) => m.role === "user")
    .map((m, i) => `Response ${i + 1}: ${m.content || m.message || ""}`)
    .join("\n");
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are an expert HR interview evaluator. Return ONLY valid JSON. No markdown, no backticks, no explanation — raw JSON only.",
      },
      {
        role: "user",
        content: `
        Analyze this job interview and return ONLY valid JSON.

        INTERVIEW QUESTIONS
        ${questionsText}

        CANDIDATE RESPONSES
        ${candidateResponses}

        FULL TRANSCRIPT
        ${transcript}

        RETURN THIS EXACT JSON
        {
          "overallScore": 0,
          "recommendation": "",
          "summary": "",
          "responses": [
            {
              "questionText": "",
              "transcription": "",
              "aiScore": 0,
              "aiFeedback": "",
              "sentiment": ""
            }
          ]
        }

        SCORING RULES
          - overallScore: 0-100 weighted average of all response aiScores
          - recommendation: "Strong Hire" (85+), "Hire" (70-84), "Maybe" (50-69), "No Hire" (below 50)
          - summary: 2-3 sentences for the HR professional about the candidate overall
          - aiScore per response: 0-100 based on relevance, clarity and depth
          - sentiment: "Positive", "Neutral" or "Negative" based on tone and confidence
          - responses array must have exactly ${session.numQuestions} items — one per question`,
      },
    ],
  });
  const raw = response.choices[0].message.content;
  const cleaned = raw
    .replace(/```json|```/g, "")
    .replace(/^[^{[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    throw new Error(`Groq returned invalid JSON: ${cleaned}`);
  }
};
//Export
export { analyzeCV, analyzeInterview };
