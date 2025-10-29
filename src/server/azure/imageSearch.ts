import { log } from "@/lib/observability/logger";
import { env, ENV_KEYS } from "@/lib/env";

export interface ImageResult {
  id: string;
  thumbnailUrl: string;
  contentUrl: string;
  name: string;
}

/**
 * Search for images using Unsplash API
 * Get your free API key at: https://unsplash.com/developers
 */
export async function searchImages(query: string): Promise<ImageResult[]> {
  const accessKey = env(ENV_KEYS.UNSPLASH_ACCESS_KEY);

  if (!accessKey) {
    log({
      level: "warn",
      message: "Unsplash API key not configured. Get a free key at https://unsplash.com/developers"
    });
    return [];
  }

  try {
    const endpoint = "https://api.unsplash.com/search/photos";
    const url = new URL(endpoint);
    url.searchParams.append("query", query);
    url.searchParams.append("per_page", "12");
    url.searchParams.append("orientation", "squarish"); // Better for visual cards
    url.searchParams.append("content_filter", "high"); // Family-friendly content

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Client-ID ${accessKey}`,
        "Accept-Version": "v1"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      log({
        level: "warn",
        message: "Unsplash API returned non-200",
        diagnostics: `Status: ${response.status}, Body: ${errorText}`
      });
      return [];
    }

    interface UnsplashPhoto {
      id: string;
      urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
      };
      alt_description: string | null;
      description: string | null;
      user: {
        name: string;
      };
    }

    const payload = (await response.json()) as { results?: UnsplashPhoto[] };
    
    return (
      payload.results?.map((photo) => ({
        id: photo.id,
        thumbnailUrl: photo.urls.small,
        contentUrl: photo.urls.regular, // High quality but not too large
        name: photo.alt_description || photo.description || `Photo by ${photo.user.name}`
      })) ?? []
    ).filter((result) => Boolean(result.contentUrl));
  } catch (error) {
    log({
      level: "error",
      message: "Failed Unsplash image search",
      diagnostics: error instanceof Error ? error.stack : String(error)
    });
    return [];
  }
}
