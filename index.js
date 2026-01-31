import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";

// Public inference endpoint (без ключів)
const INFERENCE_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it";

// SUBIT system prompt
const SYSTEM_PROMPT = fs.readFileSync("subit_system_prompt.txt", "utf8");

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function queryLLM(userMessage) {
  const payload = {
    inputs: `${SYSTEM_PROMPT}\nUser: ${userMessage}\nSUBIT-AI:`,
    parameters: { max_new_tokens: 200 }
  };

  const response = await fetch(INFERENCE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  return "Model error or rate limit.";
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const reply = await queryLLM(message.content);

  message.channel.send(reply.slice(0, 1990));
});

client.login(process.env.DISCORD_TOKEN);

