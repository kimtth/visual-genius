import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import "@azure/openai/types";
import { log } from "@/lib/observability/logger";
import { env, envWithDefault, ENV_KEYS } from "@/lib/env";

let client: AzureOpenAI | undefined;

function getClient() {
  if (!client) {
    const endpoint = env(ENV_KEYS.AZURE_OPENAI_ENDPOINT);
    const apiKey = env(ENV_KEYS.AZURE_OPENAI_API_KEY);
    const apiVersion = envWithDefault(ENV_KEYS.AZURE_OPENAI_API_VERSION, "2024-10-21");

    if (!endpoint) {
      log({
        level: "warn",
        message: "AZURE_OPENAI_ENDPOINT is not configured; card generation will fail"
      });
    }

    // Use API key if provided, otherwise use Azure AD
    if (apiKey) {
      client = new AzureOpenAI({
        endpoint: endpoint ?? "",
        apiKey,
        apiVersion
      });
    } else {
      const scope = "https://cognitiveservices.azure.com/.default";
      const credential = new DefaultAzureCredential();
      const azureADTokenProvider = getBearerTokenProvider(credential, scope);

      client = new AzureOpenAI({
        endpoint: endpoint ?? "",
        apiVersion,
        azureADTokenProvider
      });
    }
  }

  return client;
}

const deploymentName = () => env(ENV_KEYS.AZURE_OPENAI_DEPLOYMENT_NAME) ?? "";

export interface CardIdea {
  title: string;
  description: string;
  category: "topic" | "action" | "emotion";
  steps: string[];
}

export async function generateCardIdeas(prompt: string) {
  const openAi = getClient();
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Create visual learning cards for autistic children. Card titles MUST be ONE WORD. Generate 3-4 cards per category.

Output JSON format:
{"cards":[
  {"title":"Park","description":"Going to the park","category":"topic","steps":[]},
  {"title":"Draw","description":"Drawing pictures","category":"action","steps":[]},
  {"title":"Happy","description":"Feeling happy","category":"emotion","steps":[]}
]}

Categories: "topic" (conversation subjects), "action" (activities), "emotion" (feelings). Keep it simple.`
    },
    { role: "user", content: prompt }
  ];

  try {
    const response = await openAi.chat.completions.create({
      model: deploymentName(),
      messages,
      max_completion_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content ?? "";

    // Log full response for debugging
    log({
      level: "info",
      message: "OpenAI raw response",
      diagnostics: JSON.stringify({
        finishReason: response.choices[0]?.finish_reason,
        contentLength: content?.length || 0,
        content: content
      })
    });

    if (!content || content.trim() === "") {
      log({
        level: "error",
        message: "Empty response from OpenAI",
        diagnostics: JSON.stringify(response)
      });
      return [];
    }

    // Try to extract JSON if wrapped in markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonContent) as { cards?: CardIdea[] };
    return parsed.cards ?? [];
  } catch (error) {
    log({
      level: "error",
      message: "Failed to generate card ideas",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    throw error;
  }
}
