export interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  OLLAMA_URL?: string;
  // Email + site configuration
  SITE_URL: string; // e.g., https://yourdomain.com
  EMAIL_FROM?: string; // e.g., no-reply@yourdomain.com
  // n8n integration
  N8N_WEBHOOK_URL?: string; // e.g., https://<subdomain>.app.n8n.cloud/webhook/curanova/record-added
  N8N_WEBHOOK_TEST_URL?: string; // e.g., https://<subdomain>.app.n8n.cloud/webhook-test/curanova/record-added
  N8N_TOKEN?: string; // optional token the Webhook node checks via X-Webhook-Token
}

