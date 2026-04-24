import { professionalImage } from "@/lib/serviceImages";

export type ProfessionalItem = {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  image_url: string | null;
};

export function ProfessionalCard({ pro, index }: { pro: ProfessionalItem; index: number }) {
  const img = professionalImage(pro.image_url, index);
  return (
    <article className="group overflow-hidden rounded-3xl bg-card shadow-card transition-smooth hover:shadow-soft">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={img}
          alt={pro.name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{pro.specialty}</p>
        <h3 className="font-display text-2xl text-foreground">{pro.name}</h3>
        {pro.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground">{pro.bio}</p>
        )}
      </div>
    </article>
  );
}