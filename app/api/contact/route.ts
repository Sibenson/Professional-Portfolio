import { NextResponse } from "next/server";
import { normalize, validateContact } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Minimum time (ms) a real person needs to fill the form. Bots are faster. */
const MIN_FILL_TIME_MS = 3000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  // 1. Only accept same-origin submissions from the site itself.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  // 2. Parse body.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // 3. Spam traps. Respond "ok" so bots don't learn they were caught.
  const honeypot = typeof body.website === "string" ? body.website : "";
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if (honeypot.length > 0 || !startedAt || Date.now() - startedAt < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: true });
  }

  // 4. Rate limit repeated submissions.
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  // 5. Validate fields (same rules as the browser).
  const data = normalize(body);
  const errors = validateContact(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // 6. Send via Resend. Secrets stay on the server.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set.");
    return NextResponse.json({ ok: false, error: "Contact form is not configured." }, { status: 500 });
  }

  const cleanSubject = data.subject.replace(/[\r\n]+/g, " ");

  const text = [
    `From:\n${data.email}`,
    `Name:\n${data.name}`,
    `Subject:\n${cleanSubject}`,
    `Message:\n${data.message}`,
    "—\nSent from the contact form on your website. Reply to this email to answer the visitor directly.",
  ].join("\n\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px 8px 0;color:#5a6878;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:8px 0;color:#16202b">${value}</td></tr>`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;max-width:600px">
    <p style="margin:0 0 16px;color:#5a6878">New message from your website contact form</p>
    <table style="border-collapse:collapse;width:100%">
      ${row("From", `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>`)}
      ${row("Name", escapeHtml(data.name))}
      ${row("Subject", escapeHtml(cleanSubject))}
    </table>
    <div style="margin-top:16px;padding:16px;border:1px solid #d9e0e8;border-radius:8px;white-space:pre-wrap;color:#16202b">${escapeHtml(data.message)}</div>
    <p style="margin:16px 0 0;color:#5a6878;font-size:13px">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email, // "Reply" in Gmail goes straight to the visitor
        subject: `Website contact: ${cleanSubject}`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "Email service error." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Network error", err);
    return NextResponse.json({ ok: false, error: "Email service unreachable." }, { status: 502 });
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
