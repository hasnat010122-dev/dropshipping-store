import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Terms of Service — Zelko" };

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" updated="August 2026">
      <p>
        <strong>Note to store owner:</strong> this is a general-purpose
        starting template, not legal advice. Consider having a lawyer review
        your final terms once your business details (legal entity, address,
        registration) are finalized.
      </p>

      <h2>Using our store</h2>
      <p>
        By placing an order on Zelko, you agree to provide accurate delivery
        and contact information, and to pay the listed price (plus any
        delivery fees shown at checkout) for the items you order.
      </p>

      <h2>Product information</h2>
      <p>
        We do our best to describe products accurately. Since some items are
        sourced from third-party suppliers, minor variations in color, size,
        or packaging from the photos shown are possible.
      </p>

      <h2>Pricing</h2>
      <p>
        Prices are listed in Pakistani Rupees (Rs) unless stated otherwise
        and may change without notice. The price shown at checkout is the
        price you&apos;ll be charged.
      </p>

      <h2>Order acceptance</h2>
      <p>
        We reserve the right to cancel or refuse any order — for example, if
        an item is unexpectedly out of stock — and will notify you if this
        happens.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Zelko is not liable for indirect or incidental damages arising from
        the use of products purchased through the store, beyond the value of
        the order itself.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach out via our{" "}
        <a href="/contact">contact page</a>.
      </p>
    </InfoPage>
  );
}
