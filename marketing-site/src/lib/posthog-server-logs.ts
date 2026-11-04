import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";

const apiKey = process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.VITE_PUBLIC_POSTHOG_HOST;
const isDevelopment = process.env.NODE_ENV !== "production";

if ((!apiKey || !apiHost) && isDevelopment) {
  const variableName = !apiKey
    ? "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN"
    : "VITE_PUBLIC_POSTHOG_HOST";
  throw new Error(
    `${variableName} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variableName} is configured`,
  );
}

if (apiKey && apiHost) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "atlus-marketing-site-server",
      "deployment.environment": process.env.NODE_ENV ?? "development",
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${apiHost}/i/v1/logs`,
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
      ),
    ],
  });

  sdk.start();
}

const posthogLogger = logs.getLogger("atlus.posthog.server");

export function logPostHogServerFailure(
  source: "middleware" | "ssr_response" | "server_entry",
) {
  posthogLogger.emit({
    severityText: "error",
    body: "Marketing site request failed",
    attributes: { source, status_code: 500 },
  });
}
