const steps = ["Cart", "Verify", "Delivery & Payment"];

export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center max-w-xl mx-auto mb-10">
      {steps.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-tag text-xs shrink-0 transition-colors ${
                  done
                    ? "bg-coral text-white"
                    : active
                    ? "bg-ink text-paper"
                    : "bg-paper-dim text-ink-soft/40 border border-line"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span
                className={`text-[11px] font-tag mt-1.5 text-center whitespace-nowrap ${
                  active ? "text-ink" : "text-ink-soft/40"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${
                  done ? "bg-coral" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
