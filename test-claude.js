const { Client } = require("@anthropic-ai/sdk");

async function testClaudeAPI() {
  try {
    console.log("Initializing Anthropic client...");
    console.log(
      "API Key starts with:",
      process.env.ANTHROPIC_API_KEY.substring(0, 10) + "..."
    );

    const client = new Client({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log("Client created successfully");

    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 100,
      messages: [{ role: "user", content: "Say hello" }],
    });

    console.log("Response received:", response.content[0].text);
    console.log("API key is valid!");
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  }
}

testClaudeAPI();
