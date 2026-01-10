import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Use the stable model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { duration, distractionCount, wasTalking } = await req.json();

    // Context: "Cramsino" is a study RPG.
    // We adjust the difficulty based on their last session performance.
    let difficulty = "NORMAL";
    if (distractionCount > 5 || wasTalking) difficulty = "EASY"; // They struggled, give them a win
    if (distractionCount === 0 && duration > 25) difficulty = "HARD"; // They are locked in, challenge them

    const prompt = `
      You are the Quest Master for a Study RPG. Generate a SINGLE quest based on the user's recent performance.

      User Stats:
      - Last Session Duration: ${duration} minutes
      - Distractions: ${distractionCount}
      - Talking Detected: ${wasTalking}
      - Recommended Difficulty: ${difficulty}

      Quest Logic:
      - If Difficulty is EASY: Create a "Recovery Quest" (short duration, easy goal).
      - If Difficulty is HARD: Create a "Challenge Quest" (long duration, strict focus).
      - If Talking was TRUE: Create a "Vow of Silence" quest.

      Return ONLY raw JSON (no markdown, no backticks) with this exact structure:
      {
        "id": "generate-unique-id",
        "title": "Creative Quest Name",
        "description": "Flavor text describing the mission (max 1 sentence).",
        "reward_gold": number (50-500),
        "reward_xp": number (20-100),
        "type": "no_distractions" | "no_talking" | "min_duration",
        "target": number (e.g. 0 for distractions, or 30 for minutes),
        "target_minutes": number (minutes required for no_distractions/no_talking)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cleanup: Sometimes Gemini adds \`\`\`json ... \`\`\`. We remove that.
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    const quest = JSON.parse(cleanJson);
    
    // Add a timestamp ID if Gemini didn't generate a good one
    quest.id = Date.now().toString();

    return NextResponse.json(quest);

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback Quest if AI fails (prevents app crash)
    return NextResponse.json({
        id: "fallback-1",
        title: "Manual Training",
        description: "The AI is offline. Focus for 15 minutes.",
        reward_gold: 50,
        reward_xp: 10,
        type: "min_duration",
        target: 15
    });
  }
}
