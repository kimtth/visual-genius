type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  level?: LogLevel;
  diagnostics?: string;
}

export function log({ message, context, level = "info", diagnostics }: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    diagnostics
  };

  if (process.env.NODE_ENV === "production") {
    // In production, swap this for Application Insights or Azure Monitor ingestion.
    console.log(JSON.stringify(entry));
    return;
  }

  const label = `[${entry.level.toUpperCase()}] Visual Genius`;
  // eslint-disable-next-line no-console
  console.log(label, entry.message, context ?? "", diagnostics ?? "");
}
