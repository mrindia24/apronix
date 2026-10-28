/** Loading placeholder matching the enquiry form's shape (prevents layout shift). */
export function FormSkeleton() {
  return (
    <div className="space-y-3.5" aria-hidden="true">
      <div className="grid gap-3.5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[62px] rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-[86px] rounded-xl bg-white/[0.04]" />
      <div className="h-11 w-36 rounded-full bg-white/[0.06]" />
    </div>
  );
}
