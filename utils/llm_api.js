const axios = require('axios');

import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.gemini_api_key });



function generateLLMInput(data) {
    const header = "Here is recent stock data (d = date, o = open, h = high, l = low, c = close, v = volume):\n\n";
    
    const body = data.map(entry => {
      const d = entry.date.slice(0, 10);
      const o = entry.open;
      const h = entry.high;
      const l = entry.low;
      const c = entry.close;
      const v = Math.round(entry.volume);
      return `d:${d} o:${o} h:${h} l:${l} c:${c} v:${v}`;
    }).join('\n');
  
    return header + body;
  }
  




async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Explain how AI works in a few words",
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    console.log(response.text);
  }
  
  await main();
