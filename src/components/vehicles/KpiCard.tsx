type Tone = "default" | "success" | "warning";

const TONE_TEXT_CLASS: Record<Tone, string> = {
  default: "text-foreground",
  success: "text-good",
  warning: "text-warning",
};

export function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border border-line p-6">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${TONE_TEXT_CLASS[tone]}`}>
        {value}
      </p>
    </div>
  );
}
