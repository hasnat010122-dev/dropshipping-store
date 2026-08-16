import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Privacy Policy — FetchWow" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="August 2026">
      <p>
        <strong>Note to store owner:</strong> this is a general-purpose
        starting template, not legal advice. If you plan to serve customers
        in the EU/UK (GDPR) or California (CCPA), have this reviewed against
        those specific requirements before launch.
      </p>

      <h2>What we collect</h2>
      <p>
        When you place an order, we collect your name, phone number, delivery
        address, city, and — if you choose to provide it — your email
        address, purely to fulfill and communicate about your order.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and deliver your order</li>
        <li>To send order confirmations and updates (if you provided an email)</li>
        <li>To contact you about your order via phone or WhatsApp if needed</li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <p>
        We don&apos;t sell your personal information to third parties. Your
        order details are only shared with our delivery partners and, where
        relevant, our product suppliers — solely to get your order to you.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep order records for our own bookkeeping and customer support
        purposes. If you&apos;d like your data removed, contact us via our{" "}
        <a href="/contact">contact page</a>.
      </p>

      <h2>Payments</h2>
      <p>
        We don&apos;t store your full payment details ourselves — payments
        are handled through the payment method you select at checkout.
      </p>
    </InfoPage>
  );
}
