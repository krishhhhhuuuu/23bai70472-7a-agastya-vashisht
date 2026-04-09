import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

export async function generateMCQs(syllabusText, count = 10, difficulty = "mixed", topic = "") {
  const difficultyInstruction = difficulty === "mixed"
    ? "Mix of easy (30%), medium (50%), and hard (20%) questions."
    : `All questions should be ${difficulty} difficulty.`;

  const prompt = `You are an expert quiz creator. Generate exactly ${count} multiple choice questions based on the following content.

Topic: ${topic || "General"}
Difficulty: ${difficultyInstruction}

Content:
"""
${syllabusText}
"""

Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "questionText": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation why this answer is correct",
    "difficulty": "easy",
    "topic": "sub-topic"
  }
]

Rules:
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Exactly 4 options per question
- Return ONLY the JSON array, nothing else`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  let text = completion.choices[0].message.content.trim();

  // Handle if model wraps in object like { "questions": [...] }
  let parsed = JSON.parse(text);
  const questions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0]);

  if (!Array.isArray(questions)) throw new Error("AI did not return an array");

  return questions.slice(0, count).map((q, i) => {
    if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${i + 1} has invalid structure`);
    }
    return {
      questionText: q.questionText,
      options: q.options,
      correctIndex: Number(q.correctIndex),
      explanation: q.explanation || "",
      difficulty: q.difficulty || difficulty,
      topic: q.topic || topic,
      aiGenerated: true,
    };
  });
}

export async function getTutorExplanation(question, studentAnswer, correctAnswer, explanation, userQuery) {
  const prompt = `You are a friendly AI tutor helping a student understand a quiz question.

Quiz Question: "${question}"
Student Answer: "${studentAnswer}"
Correct Answer: "${correctAnswer}"
${explanation ? `Explanation: "${explanation}"` : ""}
Student asks: "${userQuery}"

Give a clear, encouraging explanation in 3-5 sentences. Plain text only, no markdown.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return completion.choices[0].message.content.trim();
}

export function getAdaptiveDifficulty(correctCount, totalCount, currentDifficulty = "medium") {
  if (totalCount === 0) return "medium";
  const accuracy = correctCount / totalCount;
  if (accuracy >= 0.8) return "hard";
  if (accuracy >= 0.5) return "medium";
  return "easy";
}
