import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import "@azure/openai/types";
import { log } from "@/lib/observability/logger";

let client: AzureOpenAI | undefined;

function getClient() {
  if (!client) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

    if (!endpoint) {
      log({
        level: "warn",
        message: "AZURE_OPENAI_ENDPOINT is not configured; card generation will fail"
      });
    }

    const scope = "https://cognitiveservices.azure.com/.default";
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);

    client = new AzureOpenAI({
      endpoint: endpoint ?? "",
      apiVersion,
      azureADTokenProvider
    });
  }

  return client;
}

const deploymentName = () => process.env.AZURE_OPENAI_DEPLOYMENT ?? "";

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
      content:
        "You design concise visual learning cards for autistic children. Respond using pure JSON with shape {\"cards\":[{\"title\":string,\"description\":string,\"category\":\"topic\"|\"action\"|\"emotion\",\"steps\":[string]}]}."
    },
    { role: "user", content: prompt }
  ];

  try {
    const response = await openAi.chat.completions.create({
      model: deploymentName(),
      messages,
      temperature: 0.4,
      max_tokens: 256
    });

    const content = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { cards?: CardIdea[] };
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
