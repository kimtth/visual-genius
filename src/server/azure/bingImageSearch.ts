import { log } from "@/lib/observability/logger";

export interface ImageResult {
  id: string;
  thumbnailUrl: string;
  contentUrl: string;
  name: string;
}

export async function searchImages(query: string) {
  const endpoint = process.env.BING_IMAGE_SEARCH_ENDPOINT;
  const key = process.env.BING_IMAGE_SEARCH_KEY;

  if (!endpoint || !key) {
    log({
      level: "warn",
      message: "Bing Image Search configuration missing"
    });
    return [];
  }

  try {
    const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&safeSearch=Strict`, {
      headers: {
        "Ocp-Apim-Subscription-Key": key
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      log({
        level: "warn",
        message: "Bing Image Search returned non-200",
        diagnostics: errorText
      });
      return [];
    }

    const payload = (await response.json()) as { value?: Array<Record<string, string>> };
    return (
      payload.value?.map((item) => ({
        id: item.imageId ?? item.contentUrl ?? "",
        thumbnailUrl: item.thumbnailUrl ?? "",
        contentUrl: item.contentUrl ?? "",
        name: item.name ?? ""
      })) ?? []
    ).filter((result) => Boolean(result.contentUrl));
  } catch (error) {
    log({
      level: "error",
      message: "Failed Bing image search",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return [];
  }
}
