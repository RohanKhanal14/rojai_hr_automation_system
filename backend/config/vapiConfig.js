const buildAssistantConfig = (session, candidate) => {
  const webhookBaseUrlRaw =
    process.env.VAPI_WEBHOOK_BASE_URL || "https://8ee2-2407-1400-aa2a-eb70-a8c4-1306-82d-12c5.ngrok-free.app" || "";
  const webhookBaseUrl = webhookBaseUrlRaw.replace(/\/+$/, "");

  const toneMap = {
    formal: "professional and formal",
    casual: "friendly and conversational",
    mixed: "professional but approachable",
    technical: "technical and precise",
    behavioral: "empathetic and scenario-focused",
  };
  const tone = toneMap[session.interviewTone] || "professional";
  const questionsPrompt = session.questions
    .map((q, i) => `Question ${i + 1}: ${q}`)
    .join("\n");

  return {
    firstMessage: `Hello ${candidate.fullName}! Welcome to your AI interview for the ${session.jobId?.position || "position"} role. I will ask you exactly ${session.numQuestions} questions one by one. Please answer each question clearly. Are you ready to begin?`,

    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a ${tone} AI interviewer. You must follow these rules STRICTLY.

            YOUR QUESTIONS (ask in this exact order)
            ${questionsPrompt}

            STRICT RULES:
            1. Ask Question 1 first. Wait for the candidate to finish answering.
            2. After their answer — say ONLY "Thank you." then IMMEDIATELY ask the next question.
            3. Never ask follow-up questions. Never say "Can you elaborate?", "Interesting, tell me more", or anything similar.
            4. Never give feedback, opinions, or scores during the interview.
            5. Never go off-topic.
            6. One acknowledgment only: "Thank you.", "Got it.", "Understood." — then next question immediately.
            7. After Question ${session.numQuestions} is answered — say exactly: "Thank you for your time. That concludes your interview for the ${session.jobId?.position || "position"} role. We will review your responses and get back to you soon. Goodbye!"
            8. END THE CALL immediately after saying Goodbye.
            9. Do NOT respond to anything the candidate says after Goodbye.
            10. Do NOT repeat any question under any circumstance.

            FLOW EXAMPLE
            You: "Question 1: [question text]"
            Candidate: "[answer]"
            You: "Thank you. Question 2: [question text]"
            Candidate: "[answer]"
            You: "Thank you. Question 3: [question text]"
            ...and so on until all ${session.numQuestions} questions are done.`,
        },
      ],
    },

    voice: {
      provider: "vapi",
      voiceId: "Rohan", // Rohan
    },

    serverUrl: `${webhookBaseUrl}/api/v1/interviews/webhook`,
    serverMessages: ["end-of-call-report"],
    endCallPhrases: ["Goodbye!"],
    maxDurationSeconds: 900, // 15 min hard limit
  };
};

//Export
export default buildAssistantConfig;
