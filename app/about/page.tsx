import InfoPage from "@/components/InfoPage";

export const metadata = { title: "About — FetchWow" };

export default function AboutPage() {
  return (
    <InfoPage title="About FetchWow">
      <p>
        FetchWow is a store for the things you didn&apos;t know you needed until
        you saw them — curated finds at honest prices, shipped to customers
        all over the world.
      </p>
      <p>
        We keep things simple: no markup games, no fake urgency, just
        products we&apos;d actually want ourselves, at prices that make
        sense.
      </p>
      <p className="text-sm text-ink-soft/60">
        (Store owner: replace this with your own story once you&apos;re ready
        — a bit about why you started FetchWow goes a long way for building
        trust with new customers.)
      </p>
    </InfoPage>
  );
}
