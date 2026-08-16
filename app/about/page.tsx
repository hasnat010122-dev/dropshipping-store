import InfoPage from "@/components/InfoPage";

export const metadata = { title: "About — Zelko" };

export default function AboutPage() {
  return (
    <InfoPage title="About Zelko">
      <p>
        Zelko is a store for the things you didn&apos;t know you needed until
        you saw them — curated finds at honest prices, delivered fast across
        Pakistan and shipped worldwide.
      </p>
      <p>
        We keep things simple: no markup games, no fake urgency, just
        products we&apos;d actually want ourselves, at prices that make
        sense.
      </p>
      <p className="text-sm text-ink-soft/60">
        (Store owner: replace this with your own story once you&apos;re ready
        — a bit about why you started Zelko goes a long way for building
        trust with new customers.)
      </p>
    </InfoPage>
  );
}
