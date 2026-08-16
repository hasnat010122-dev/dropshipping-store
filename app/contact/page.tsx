import { MessageCircle, Mail } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Contact Us — Zelko" };

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const email = process.env.NEXT_PUBLIC_STORE_EMAIL || "";

  return (
    <InfoPage title="Contact Us">
      <p>
        Got a question about an order, a product, or anything else? Reach us
        directly — we usually reply fastest on WhatsApp.
      </p>

      <div className="not-prose grid sm:grid-cols-2 gap-4 mt-8">
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex items-center gap-3 border border-line bg-white p-5 hover:border-coral transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-emerald-600" />
            </span>
            <span>
              <span className="block font-display text-ink">WhatsApp</span>
              <span className="text-sm text-ink-soft font-body">{whatsapp}</span>
            </span>
          </a>
        ) : (
          <div className="border border-dashed border-line p-5 text-sm text-ink-soft/60 font-body">
            WhatsApp number not set up yet — add{" "}
            <code className="font-tag text-xs">NEXT_PUBLIC_STORE_WHATSAPP</code>{" "}
            to your environment settings.
          </div>
        )}

        {email ? (
          <a
            href={`mailto:${email}`}
            className="focus-ring flex items-center gap-3 border border-line bg-white p-5 hover:border-coral transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-coral" />
            </span>
            <span>
              <span className="block font-display text-ink">Email</span>
              <span className="text-sm text-ink-soft font-body">{email}</span>
            </span>
          </a>
        ) : (
          <div className="border border-dashed border-line p-5 text-sm text-ink-soft/60 font-body">
            Email not set up yet — add{" "}
            <code className="font-tag text-xs">NEXT_PUBLIC_STORE_EMAIL</code>{" "}
            to your environment settings.
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-ink-soft/70">
        Have an order question specifically? Our{" "}
        <a href="/track">order tracking page</a> can often answer it faster —
        just enter your order ID and phone number.
      </p>
    </InfoPage>
  );
}
