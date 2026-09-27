"use client";

import { useRef, useState } from "react";
import { site } from "@/data/site";
import { LIMITS, normalize, validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";
import { ArrowUpRight, GitHubIcon, LinkedInIcon, PhoneIcon, PinIcon } from "./icons";

type Status = "idle" | "sending" | "success" | "error";

const empty: ContactInput = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [mailFallback, setMailFallback] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update(field: keyof ContactInput, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validateContact(normalize(next)));
    if (status === "success" || status === "error") setStatus("idle");
  }

  function blur(field: keyof ContactInput) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateContact(normalize(values)));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const data = normalize(values);
    const found = validateContact(data);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: honeypot.current?.value ?? "",
          startedAt: startedAt.current,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setStatus("success");
        setValues(empty);
        setTouched({});
        setErrors({});
        startedAt.current = Date.now();
      } else {
        if (json.errors) setErrors(json.errors);
        if (res.status === 429 && json.error) setServerError(json.error);
        // 5xx = the email service isn't reachable/configured — offer a direct email instead.
        if (res.status >= 500) {
          setServerError("");
          setMailFallback(true);
          if (json.error) console.warn(`[contact] ${json.error} — see README "Contact form setup".`);
        }
        setStatus("error");
      }
    } catch {
      setMailFallback(true);
      setStatus("error");
    }
  }

  const sending = status === "sending";
  // Pre-filled email so nothing typed into the form is lost if sending fails.
  const mailtoHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(values.subject || "Hello from your website")}&body=${encodeURIComponent(
    `${values.message}\n\n— ${values.name}${values.email ? ` (${values.email})` : ""}`,
  )}`;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="grain relative overflow-hidden border-t border-line py-24 md:py-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_62%)]" />
      <div className="container-x relative">
        <p className="eyebrow reveal flex items-center gap-3">
          <span className="text-accent-text">08</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          Contact
        </p>
        <h2 id="contact-heading" className="display reveal mt-6 max-w-5xl text-[clamp(2.3rem,6vw,5.5rem)] [&_em]:text-accent-text">
          Working together, talking <em>QA</em>, or building better delivery?
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div className="reveal">
            <p className="max-w-md text-lg leading-relaxed text-muted">
              Recruiters, teams and clients — email me directly, or use the form; it goes straight to my inbox.
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="group mt-8 inline-flex max-w-full items-center gap-3 text-[clamp(1.25rem,2.6vw,1.9rem)] font-semibold tracking-[-0.02em]"
            >
              <span className="break-all underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-accent">
                {site.contact.email}
              </span>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-accent-text transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

            <ul className="mt-10 divide-y divide-line border-y border-line">
              <ContactRow icon={<LinkedInIcon className="h-[17px] w-[17px]" />} label="LinkedIn">
                <a href={site.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-text">
                  {site.contact.linkedinDisplay}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </ContactRow>
              <ContactRow icon={<PhoneIcon className="h-[18px] w-[18px]" />} label="Phone">
                <a href={site.contact.phoneHref} className="hover:text-accent-text">
                  {site.contact.phoneDisplay}
                </a>
              </ContactRow>
              <ContactRow icon={<PinIcon className="h-[18px] w-[18px]" />} label="Location">
                {site.location}
              </ContactRow>
              {site.contact.github && (
                <ContactRow icon={<GitHubIcon className="h-[17px] w-[17px]" />} label="GitHub">
                  <a href={site.contact.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent-text">
                    GitHub profile
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </ContactRow>
              )}
            </ul>
          </div>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            aria-label="Contact form"
            className="reveal relative rounded-[32px] border border-line bg-surface p-6 shadow-[var(--shadow)] sm:p-8 md:p-10"
          >
            {/* Honeypot: hidden from people, tempting for bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Leave this field empty</label>
              <input ref={honeypot} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="name" label="Name" autoComplete="name" maxLength={LIMITS.name.max}
                value={values.name} error={touched.name ? errors.name : undefined}
                onChange={(v) => update("name", v)} onBlur={() => blur("name")} disabled={sending}
              />
              <Field
                id="email" label="Email" type="email" autoComplete="email" maxLength={LIMITS.email.max}
                value={values.email} error={touched.email ? errors.email : undefined}
                onChange={(v) => update("email", v)} onBlur={() => blur("email")} disabled={sending}
              />
            </div>
            <div className="mt-5">
              <Field
                id="subject" label="Subject" maxLength={LIMITS.subject.max}
                value={values.subject} error={touched.subject ? errors.subject : undefined}
                onChange={(v) => update("subject", v)} onBlur={() => blur("subject")} disabled={sending}
              />
            </div>
            <div className="mt-5">
              <Field
                id="message" label="Message" multiline maxLength={LIMITS.message.max}
                value={values.message} error={touched.message ? errors.message : undefined}
                onChange={(v) => update("message", v)} onBlur={() => blur("message")} disabled={sending}
              />
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={sending}
                aria-disabled={sending}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-text px-7 font-medium text-bg transition-colors duration-300 hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending && (
                  <svg aria-hidden className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {sending ? "Sending…" : "Send message"}
              </button>

              <p role="status" aria-live="polite" className="text-[15px]">
                {status === "success" && <span className="text-pass">Message sent. Thanks for reaching out.</span>}
                {status === "error" &&
                  (mailFallback ? (
                    <span className="text-danger">
                      The form couldn&apos;t send right now.{" "}
                      <a href={mailtoHref} className="font-medium text-text underline underline-offset-4 hover:text-accent-text">
                        Email me your message instead
                      </a>
                      .
                    </span>
                  ) : (
                    <span className="text-danger">
                      {serverError || "Please check the highlighted fields and try again."}
                    </span>
                  ))}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-muted">{icon}</span>
      <p className="eyebrow w-24 shrink-0">{label}</p>
      <p className="min-w-0 break-words text-[15px]">{children}</p>
    </li>
  );
}

type FieldProps = {
  id: keyof ContactInput;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
};

function Field({ id, label, value, error, onChange, onBlur, disabled, type = "text", autoComplete, maxLength, multiline }: FieldProps) {
  const errorId = `${id}-error`;
  const cls = `w-full rounded-2xl border bg-bg px-4 text-[16px] text-text placeholder:text-muted/60 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 disabled:opacity-60 ${
    error ? "border-danger focus-visible:outline-danger" : "border-line hover:border-line-strong focus-visible:outline-accent"
  }`;
  const common = {
    id,
    name: id,
    value,
    disabled,
    maxLength,
    required: true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-muted">
        {label}
      </label>
      {multiline ? (
        <textarea {...common} rows={6} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-y py-3`} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className={`${cls} h-12`} />
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
