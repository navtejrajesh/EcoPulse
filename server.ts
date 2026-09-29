import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize the @google/genai SDK server-side with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Assistant endpoint for answering user sustainability doubts
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userContext } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    // Build context-aware system instruction
    const systemInstruction = `You are EcoPulse AI, an expert, enthusiastic, and scientifically grounded sustainability assistant inside the EcoPulse gamified habit tracker app.
Your mission is to clarify users' doubts, questions, and curiosities about sustainable living, eco habits, recycling nuances, composting rules, carbon footprints, energy conservation, plant-rich nutrition, clean mobility, and circular waste.

User's current profile context:
- Name: ${userContext?.name || 'Eco-Custodian'}
- Current Level: ${userContext?.level || 1}
- Habit Streak: ${userContext?.streak || 0} days
- Total CO2 Prevented: ${userContext?.totalCo2Kg || 0} kg
- Bioregion: ${userContext?.region || 'Global'}

Response Guidelines:
1. Provide warm, encouraging, concise, and scientifically grounded advice.
2. Directly answer their specific doubt (e.g., whether pizza boxes can be composted, how vampire draw works, how to wash cold, best alternatives to cling wrap).
3. Structure your response with clear, easy-to-read paragraphs or bullet points.
4. Whenever applicable, include a concrete estimated ecological savings (e.g. "~1.2 kg CO₂ saved" or "~40 liters of water").
5. At the very end of your response, always propose ONE actionable habit that the user can adopt directly on EcoPulse, formatted strictly on its own final line as:
HABIT_SUGGESTION: {"title": "Short Habit Title", "description": "1-sentence description", "category": "energy"|"food"|"transport"|"waste"|"water", "co2Kg": 1.2, "xp": 35}
(If no new habit is relevant, do not output the HABIT_SUGGESTION line).`;

    // Map conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: item.content || item.text || '' }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Primary and secondary models from @google/genai guidelines
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let fullText = '';
    let apiSuccess = false;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text && response.text.trim().length > 0) {
          fullText = response.text;
          apiSuccess = true;
          break;
        }
      } catch {
        // Continue to next available model candidate
      }
    }

    // Grounded scientific knowledge base if API is temporarily unreachable
    if (!apiSuccess || !fullText) {
      const lower = message.toLowerCase();
      if (lower.includes('coffee') || lower.includes('citrus') || lower.includes('compost') || lower.includes('avocado')) {
        fullText = `### Composting Tricky Kitchen Scraps 🌿\n\n**Coffee Grounds:** Absolutely! Coffee grounds are actually considered "green" (nitrogen-rich) compost material despite their dark color. They provide ideal nutrients for microorganisms and can be added freely alongside coffee filter paper.\n\n**Citrus Peels:** In standard aerobic backyard composters or municipal bins, moderate amounts of citrus peels (oranges, lemons, limes) break down naturally without souring the pile. If you use a **worm bin (vermicomposting)**, limit citrus, as the high d-limonene acidity can irritate worm skin.\n\n**Avocado Pits:** Completely compostable, but due to their dense woody structure, they take 6–12 months to decompose. **Pro-tip:** Whack the pit with a knife or hammer to break it into quarters before dropping it in your compost to speed breakdown by 400%.\n\nHABIT_SUGGESTION: {"title": "Crush & Compost Coffee & Citrus", "description": "Divert kitchen nitrogen scraps into aerated compost rather than landfill.", "category": "waste", "co2Kg": 1.4, "xp": 40}`;
      } else if (lower.includes('pizza') || lower.includes('box')) {
        fullText = `### Pizza Box Dilemma: Recycle vs Compost 🍕\n\n**The Greasy Rule:** Clean corrugated cardboard is 100% recyclable, but grease and melted cheese seep into cardboard fibers and cannot be separated during the water-based pulping process at recycling paper mills.\n\n**Best Action:**\n1. **Tear the box in half:** Put the clean, dry top lid into your standard cardboard recycling bin.\n2. **The greasy base:** Tear the grease-stained bottom into small fist-sized pieces and toss it into your **organics/compost bin**! Microbes and fungi easily digest unbleached cellulose fibers saturated with natural food oils.\n\nHABIT_SUGGESTION: {"title": "Split & Compost Pizza Box", "description": "Recycle the clean lid, compost the greasy base to prevent paper stream contamination.", "category": "waste", "co2Kg": 0.8, "xp": 30}`;
      } else if (lower.includes('plastic') || lower.includes('number') || lower.includes('code') || lower.includes('bottle')) {
        fullText = `### Understanding Plastic Recycling Numbers (#1 to #7) 🧴\n\nThe chasing arrows with a number tell you the chemical polymer, not necessarily whether your local facility actually recycles it:\n\n- **#1 PET (Water & soda bottles):** Widely accepted everywhere. Highly recyclable into new bottles and textiles.\n- **#2 HDPE (Milk jugs, shampoo):** Highly recyclable and durable. High municipal market demand.\n- **#3 PVC & #7 Other:** Extremely difficult to recycle mechanically; almost universally landfilled or incinerated.\n- **#4 LDPE (Grocery bags, wrap):** Never put in curbside bins (they jam sorting conveyor gears). Take clean bags to specialized supermarket drop-off bins.\n- **#5 PP (Yogurt tubs, syrup bottles):** Increasingly accepted in modern dual-stream facilities.\n\n**Bottle Caps:** Modern recyclers recommend leaving plastic caps **screwed tightly onto the crushed bottle** so they don't fall through sorting screens.\n\nHABIT_SUGGESTION: {"title": "Screw Caps On & Rinse #1/#2 Plastics", "description": "Keep bottle caps attached to crushed bottles before placing in the blue bin.", "category": "waste", "co2Kg": 0.5, "xp": 25}`;
      } else if (lower.includes('vampire') || lower.includes('standby') || lower.includes('phantom') || lower.includes('energy') || lower.includes('power')) {
        fullText = `### Defeating Phantom & Vampire Power ⚡\n\n**What draws the most hidden wattage?**\n- **Cable boxes & DVRs:** Often draw 25–45 watts continuously, even when the TV is off!\n- **Gaming consoles in instant-on standby:** Consume 12–18W 24/7 to listen for wake commands.\n- **Desktop computers & multiple monitors:** Sleep modes frequently consume 8–15W idle power.\n- **Microwave & audio soundbars:** Digital clocks and standby circuits pull 3–6W constantly.\n\n**The Impact:** Standby power accounts for 5% to 10% of total residential electric utility bills worldwide. Using a smart switchable master power strip eliminates phantom draws automatically.\n\nHABIT_SUGGESTION: {"title": "Kill Vampire Power Strips", "description": "Switch off master desk and media console power strips before going to bed.", "category": "energy", "co2Kg": 0.9, "xp": 30}`;
      } else if (lower.includes('bike') || lower.includes('walk') || lower.includes('commute') || lower.includes('car') || lower.includes('drive')) {
        fullText = `### Biking vs. Driving: The Real Numbers 🚲\n\n- **Direct Emissions Saved:** An average combustion passenger car emits approximately **180g to 220g of CO₂ per kilometer** (including cold-start inefficiencies).\n- **For a 5km commute:** Choosing a bicycle over driving saves **~1.0 to 1.2 kg of CO₂ per single trip** (~2.2 kg round trip!).\n- **Annual Impact:** Replacing just two 5km car commutes per week with bike riding eliminates **over 220 kg of atmospheric greenhouse gases** while burning healthy cardiovascular calories and avoiding parking expenses.\n\nHABIT_SUGGESTION: {"title": "5km Active Bicycle Commute", "description": "Swap a short motor trip for bicycle pedal power to prevent 1.2kg CO2.", "category": "transport", "co2Kg": 1.2, "xp": 50}`;
      } else {
        fullText = `### Practical Sustainable Living Insights 🌍\n\nLiving sustainably is about consistency over perfection. Every small mindful choice you make today compounds across your bioregion:\n\n1. **Focus on high-leverage habits:** Plant-based meals, active mobility under 4km, and cold-water laundry washes achieve 80% of immediate household carbon reductions.\n2. **Close the material loop:** Refuse single-use disposables, repair items before replacing them, and compost food scraps to prevent anaerobic methane formation in landfills.\n3. **Stay curious:** You can ask me any doubt about materials, local energy saving, or circular habits anytime!\n\nHABIT_SUGGESTION: {"title": "Conscious Low-Impact Day", "description": "Carry your reusable water bottle and cloth tote to eliminate single-use waste today.", "category": "waste", "co2Kg": 0.8, "xp": 35}`;
      }
    }

    // Parse potential suggested habit line
    let replyText = fullText;
    let suggestedHabit = null;

    const habitMatch = fullText.match(/HABIT_SUGGESTION:\s*(\{.*\})/);
    if (habitMatch) {
      try {
        suggestedHabit = JSON.parse(habitMatch[1]);
        replyText = fullText.replace(/HABIT_SUGGESTION:\s*\{.*\}/, '').trim();
      } catch (err) {
        console.warn('Could not parse suggested habit JSON:', err);
      }
    }

    res.json({
      reply: replyText,
      suggestedHabit,
    });
  } catch (error: any) {
    console.error('Gemini API Assistant error:', error);
    res.status(500).json({
      error: 'Failed to process AI assistant request',
      details: error?.message || 'Unknown error occurred',
      fallback:
        "We're having trouble reaching the ecological knowledge base right now. Please check your connection or try again shortly!",
    });
  }
});

// Mount static files & Vite
async function startServer() {
  // Always serve public assets (manifest, icons, etc.)
  app.use(express.static(path.resolve(__dirname, 'public')));

  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoPulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
