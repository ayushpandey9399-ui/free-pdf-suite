import { useState } from "react";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Architecture Notes
 *
 * WHY this exists:
 * The contact page previously offered only a mailto link, which loses everyone
 * who browses without a configured mail client. This component adds a
 * backend-free contact form: validation happens locally with zod and the
 * submission is relayed by Formspree, so no server route, database, or secret
 * handling is introduced for a low volume, low risk message form.
 *
 * Delivery is optional-config: when VITE_FORMSPREE_FORM_ID is present the
 * message is posted to that public Formspree endpoint (the id is not a secret).
 * When it is absent, the validated message is handed to the visitor's mail
 * client as a prefilled mail to the site inbox, so the form always works
 * without any keys or backend.
 */

const SUBJECTS = [
  "Bug Report",
  "Feature Request",
  "General Feedback",
  "Other",
] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(100, { message: "Name must be under 100 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email must be under 255 characters." }),
  subject: z.enum(SUBJECTS, { message: "Please choose a subject." }),
  message: z
    .string()
    .trim()
    .min(20, { message: "Please write at least 20 characters so we can help." })
    .max(2000, { message: "Message must be under 2000 characters." }),
});

type FormValues = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof FormValues, string>>;

const FORMSPREE_ID = import.meta.env["VITE_FORMSPREE_FORM_ID"] as string | undefined;

const ACCENT = "#e5322d";
const BORDER = "#d8d8de";

const inputClass =
  "w-full rounded-md border bg-white px-3 py-2 text-[15px] text-neutral-900 outline-none transition-colors focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200";

export function ContactForm() {
  const [values, setValues] = useState<Record<keyof FormValues, string>>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("idle");
      return;
    }

    setStatus("sending");
    try {
      if (!FORMSPREE_ID) {
        // No relay service configured: hand the composed message to the
        // visitor's mail client so the submission still reaches the inbox.
        const body = [
          `Name: ${parsed.data.name}`,
          `Email: ${parsed.data.email}`,
          `Subject: ${parsed.data.subject}`,
          "",
          parsed.data.message,
        ].join("\n");
        const href =
          `mailto:${CONTACT_EMAIL}` +
          `?subject=${encodeURIComponent(`[FreePDFHub] ${parsed.data.subject} from ${parsed.data.name}`)}` +
          `&body=${encodeURIComponent(body)}`;
        window.location.href = href;
        setStatus("sent");
        setValues({ name: "", email: "", subject: "", message: "" });
        return;
      }
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
          _subject: `[FreePDFHub] ${parsed.data.subject} from ${parsed.data.name}`,
        }),
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      setStatus("sent");
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="my-6 rounded-lg border p-5"
        style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}
      >
        <p className="m-0 text-[15px] font-semibold" style={{ color: "#15803d" }}>
          Thanks for reaching out! We usually reply within a few days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm font-medium underline"
          style={{ color: "#3b3b48" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="my-6 not-prose">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
            style={{ borderColor: errors.name ? ACCENT : BORDER }}
          />
        </Field>

        <Field label="Email" htmlFor="contact-email" error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
            style={{ borderColor: errors.email ? ACCENT : BORDER }}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Subject" htmlFor="contact-subject" error={errors.subject}>
          <select
            id="contact-subject"
            name="subject"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            aria-invalid={Boolean(errors.subject)}
            className={inputClass}
            style={{ borderColor: errors.subject ? ACCENT : BORDER }}
          >
            <option value="">Choose a subject</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Message" htmlFor="contact-message" error={errors.message}>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            maxLength={2000}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
            className={`${inputClass} resize-y`}
            style={{ borderColor: errors.message ? ACCENT : BORDER }}
          />
        </Field>
      </div>

      {status === "error" ? (
        <p
          role="alert"
          className="mt-4 mb-0 rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}
        >
          Something went wrong. Please email us directly at {CONTACT_EMAIL}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: ACCENT }}
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold"
        style={{ color: "#3b3b48" }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 mb-0 text-sm font-medium" style={{ color: ACCENT }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
