import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";

env.allowLocalModels = false;

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";

const moodSelect = document.getElementById("mood");
const timeSelect = document.getElementById("time");
const interestSelect = document.getElementById("interest");

const generateBtn = document.getElementById("generateBtn");
const completeBtn = document.getElementById("completeBtn");
const aiStatus = document.getElementById("aiStatus");
const questResult = document.getElementById("questResult");

const pointsDisplay = document.getElementById("points");
const questTitle = document.getElementById("questTitle");
const questDescription = document.getElementById("questDescription");
const questSteps = document.getElementById("questSteps");
const questPoints = document.getElementById("questPoints");

let generator = null;
let currentQuestPoints = 20;
let questCompleted = false;
let modelPromise = null;

let totalPoints = Number(localStorage.getItem("greenQuestPoints")) || 0;
pointsDisplay.textContent = totalPoints;

// Prepare a model once and reuse it for later quests.
async function loadAI() {
  if (!modelPromise) {
    modelPromise = pipeline("text-generation", MODEL_ID, {
      dtype: "q4"
    });
  }

  try {
    generator = await modelPromise;
    return generator;
  } catch (error) {
    modelPromise = null;
    throw error;
  }
}

// Extract a generated response from different pipeline output shapes.
function getGeneratedText(output) {
  const result = Array.isArray(output) ? output[0] : output;

  if (typeof result?.generated_text === "string") {
    return result.generated_text;
  }

  if (Array.isArray(result?.generated_text)) {
    const lastMessage = result.generated_text
      .filter(message => message.role === "assistant")
      .at(-1);

    if (typeof lastMessage?.content === "string") {
      return lastMessage.content;
    }
  }

  throw new Error("The AI returned an unexpected response.");
}

// A simple backup if the model cannot load.
// This is a template, NOT an AI-generated answer.
function getBackupQuest(mood, minutes, interest) {
  return {
    title: `${interest} Explorer`,
    description:
      `Spend ${minutes} minutes outside exploring ${interest}. ` +
      `Keep the activity safe and match it to your ${mood} mood.`,
    steps: [
      "Choose a safe outdoor area you are allowed to visit.",
      `Spend ${Math.max(2, Math.floor(minutes / 3))} minutes observing ${interest}.`,
      "Notice three interesting details around you.",
      "Write down or remember one new thing you discovered."
    ]
  };
}

// Generate a quest using the local open-weight model.
async function generateQuest() {
  const mood = moodSelect.value;
  const minutes = Number(timeSelect.value);
  const interest = interestSelect.value;

  generateBtn.disabled = true;
  completeBtn.disabled = false;
  generateBtn.textContent = "⏳ Preparing your quest...";
  aiStatus.textContent =
    "Loading the open-weight AI model. The first download may take a while.";

  questCompleted = false;
  completeBtn.textContent = "Complete Quest ✓";
  questResult.classList.add("hidden");

  try {
    const ai = await loadAI();

    aiStatus.textContent = "AI is creating your personalized quest...";

    const prompt = `
You are GreenQuest, a helpful outdoor activity assistant.

Create one practical and safe nature quest.
User mood: ${mood}
Available time: ${minutes} minutes
Interest: ${interest}

Rules:
- The quest must fit the available time.
- Give a short, creative title.
- Give a friendly description.
- Give exactly 4 numbered steps.
- Use simple language.
- Do not suggest trespassing, dangerous plants, touching wildlife,
  entering unsafe areas, or using a phone while walking.
- Return ONLY valid JSON in this format:
{
  "title": "Quest title",
  "description": "Short description",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
}
`;

    const output = await ai(prompt, {
      max_new_tokens: 180,
      do_sample: false,
      repetition_penalty: 1.1
    });

    const rawText = getGeneratedText(output);

    // Locate JSON even if the model adds surrounding text.
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new Error("The model did not return valid JSON.");
    }

    const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.description !== "string" ||
      !Array.isArray(parsed.steps) ||
      parsed.steps.length === 0 ||
      !parsed.steps.every(step => typeof step === "string")
    ) {
      throw new Error("The generated quest has an invalid format.");
    }

    displayQuest(parsed, minutes);
    aiStatus.textContent =
      "✓ Quest generated using open-weight AI in your browser.";

  } catch (error) {
    console.error("AI generation error:", error);

    const backup = getBackupQuest(mood, minutes, interest);
    displayQuest(backup, minutes);

    aiStatus.textContent =
      "AI could not generate a quest. Showing a built-in backup instead. " +
      "Check your internet connection, model support, and browser console.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "✨ Generate My Quest";
  }
}

// Display text safely without inserting model output as HTML.
function displayQuest(quest, minutes) {
  questTitle.textContent = quest.title;
  questDescription.textContent = quest.description;

  questSteps.replaceChildren();

  quest.steps.slice(0, 4).forEach(step => {
    const item = document.createElement("li");
    item.textContent = step;
    questSteps.appendChild(item);
  });

  currentQuestPoints = Math.min(50, Math.max(10, minutes));
  questPoints.textContent = currentQuestPoints;

  questResult.classList.remove("hidden");
  questResult.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

// Award points only once for the current quest.
completeBtn.addEventListener("click", () => {
  if (questCompleted) return;

  questCompleted = true;
  totalPoints += currentQuestPoints;

  localStorage.setItem("greenQuestPoints", totalPoints);
  pointsDisplay.textContent = totalPoints;

  completeBtn.textContent = "✓ Quest Completed!";
  completeBtn.disabled = true;
  aiStatus.textContent =
    `Great job! You earned ${currentQuestPoints} points. Keep exploring!`;
});

generateBtn.addEventListener("click", generateQuest);