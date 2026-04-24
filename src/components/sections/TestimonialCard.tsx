import { Star } from "lucide-react";

export type TestimonialItem = {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
  service_name: string | null;
};

export function TestimonialCard({ t }: { t: TestimonialItem }) {
  return (
    <article className="flex h-full flex-col rounded-3xl bg-card p-7 shadow-card">
      <div className="mb-3 flex gap-0.5 text-accent">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="flex-1 font-display text-lg leading-relaxed text-foreground/90">
        “{t.comment}”
      </p>
      <div className="mt-6 border-t border-border/60 pt-4">
        <p className="font-semibold text-foreground">{t.client_name}</p>
        {t.service_name && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.service_name}</p>
        )}
      </div>
    </article>
  );
}