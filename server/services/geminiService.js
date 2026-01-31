import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export const generateLevelPlan = async (
    goal,
    category,
    difficulty,
    levelCount
) => {
    if (!apiKey) {
        throw new Error("Server missing GEMINI_API_KEY");
    }

    const prompt = `
You are a senior product designer and curriculum architect
who specializes in building addictive, gamified learning systems.

This roadmap will be used inside a real application, not a blog.
Every level must feel purposeful, progressive, and rewarding.

USER GOAL
Goal: "${goal}"
Category: "${category}"
Difficulty: "${difficulty}"
Total Levels: ${levelCount}

DESIGN RULES
- Create EXACTLY ${levelCount} levels.
- Level 1 must be beginner-friendly and focus on setup or fundamentals.
- Each next level must introduce a clear upgrade in skill or complexity.
- The final level must represent real-world completion or mastery.
- Avoid generic advice. Be concrete and actionable.
- Do NOT repeat tasks or ideas across levels.

LEVEL QUALITY RULES
- Titles: short, motivating, max 5 words.
- Descriptions: 1–2 sentences, clear and actionable.
- Tasks: 3–5 checklist-style actions a user can actually complete.
- Estimated time must feel realistic.
- Tips should feel like insider advice.
- Resources can be placeholders but relevant.

OUTPUT FORMAT (STRICT)
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text before or after.
`;

    console.log(`Generating plan with Gemini 2.5 Flash...`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING", description: "Short, motivating title" },
                            description: { type: "STRING", description: "1-2 sentences, actionable" },
                            tasks: {
                                type: "ARRAY",
                                items: { type: "STRING" },
                                description: "3-5 checklist actions"
                            },
                            estimatedTime: { type: "STRING", description: "Realistic time" },
                            tips: { type: "STRING", description: "Insider advice" },
                            resources: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        title: { type: "STRING" },
                                        url: { type: "STRING" }
                                    }
                                },
                                description: "Relevant resources"
                            }
                        },
                        required: ["title", "description", "tasks", "estimatedTime"]
                    }
                }
            }
        });


        const text = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text);

        if (!text) {
            console.log("Full Gemini Response:", JSON.stringify(response, null, 2));
            throw new Error("Gemini response is missing text.");
        }

        return JSON.parse(text);

    } catch (error) {
        console.error("❌ Gemini Generation Error:", error);
        throw error;
    }
};
