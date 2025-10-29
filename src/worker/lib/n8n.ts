import type { Env } from "../../../worker-configuration";

export type N8nEventName =
	| "record-added"
	| "record-updated"
	| "lab-result-added";

export type N8nWebhookOptions = {
	// If provided, this full URL will be used; otherwise picks from env
	webhookUrl?: string;
	// Use test URL ("/webhook-test") when true; ignored if webhookUrl provided
	test?: boolean;
	// Optional token/header for simple auth at the n8n Webhook node
	token?: string;
	// Timeout in ms
	timeoutMs?: number;
};

export type N8nPostResult = {
	ok: boolean;
	status: number;
	bodyText?: string;
	error?: string;
	url: string;
};

/**
 * Posts a JSON payload to the configured n8n webhook.
 * Prefer passing data that n8n can route on: event, patient, record, page URL, etc.
 */
export async function postToN8nWebhook(
	env: Env,
	event: N8nEventName,
	payload: Record<string, unknown>,
	opts: N8nWebhookOptions = {}
): Promise<N8nPostResult> {
	const url =
		opts.webhookUrl?.trim() ||
		(opts.test
			? env.N8N_WEBHOOK_TEST_URL
			: env.N8N_WEBHOOK_URL);

	if (!url) {
		return {
			ok: false,
			status: 0,
			error: "Missing n8n webhook URL (set N8N_WEBHOOK_URL or N8N_WEBHOOK_TEST_URL)",
			url: "",
		};
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 5000);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const token = opts.token || env.N8N_TOKEN;
	if (token) headers["X-Webhook-Token"] = token;

	const body = JSON.stringify({
		event,
		timestamp: new Date().toISOString(),
		source: "curanova.app",
		...payload,
	});

	try {
		const res = await fetch(url, {
			method: "POST",
			headers,
			body,
			signal: controller.signal,
		});
		const text = await res.text().catch(() => undefined);
		return { ok: res.ok, status: res.status, bodyText: text, url };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { ok: false, status: 0, error: message, url };
	} finally {
		clearTimeout(timeout);
	}
}

