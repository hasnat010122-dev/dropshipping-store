import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Shipping & Delivery — FetchWow" };

export default function ShippingPage() {
  return (
    <InfoPage title="Shipping & Delivery" updated="August 2026">
      <p>
        <strong>Note to store owner:</strong> this page is a starting
        template — update the specific timeframes and costs below to match
        your real suppliers and couriers before you launch.
      </p>

      <h2>Delivery times</h2>
      <ul>
        <li>Within Pakistan: 2–4 business days after your order is confirmed</li>
        <li>International orders: 7–14 business days, depending on destination</li>
        <li>
          Delivery times may be longer during sales, public holidays, or for
          items sourced directly from our suppliers
        </li>
      </ul>

      <h2>Shipping costs</h2>
      <p>
        Delivery cost is calculated at checkout based on your city and order
        size. We&apos;ll always show you the total before you confirm your
        order — no surprise charges.
      </p>

      <h2>Tracking your order</h2>
      <p>
        Once your order ships, you can check its status any time on our{" "}
        <a href="/track">order tracking page</a> using your order ID and
        phone number.
      </p>

      <h2>Delays</h2>
      <p>
        Occasionally, weather, customs, or courier issues can delay a
        delivery beyond the estimate above. If your order is significantly
        delayed, reach out via our <a href="/contact">contact page</a> and
        we&apos;ll look into it.
      </p>
    </InfoPage>
  );
}
