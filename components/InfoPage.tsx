import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

export default function InfoPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-14 w-full">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">
          {title}
        </h1>
        {updated && (
          <p className="text-xs font-tag text-ink-soft/50 mb-8 uppercase tracking-wide">
            Last updated {updated}
          </p>
        )}
        <div className="prose-content font-body text-ink-soft leading-relaxed space-y-5 [&_h2]:font-display [&_h2]:text-ink [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-coral [&_a]:underline [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
