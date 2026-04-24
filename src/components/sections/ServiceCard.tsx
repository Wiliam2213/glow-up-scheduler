import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { brl, categoryLabel, minutesToLabel } from "@/lib/format";
import { serviceImageByCategory } from "@/lib/serviceImages";

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
};

export function ServiceCard({ service }: { service: ServiceItem }) {
  const img = service.image_url || serviceImageByCategory[service.category];
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={service.name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-6">
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground">
          {categoryLabel[service.category] ?? service.category}
        </span>
        <h3 className="font-display text-2xl text-foreground">{service.name}</h3>
        {service.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}
        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">A partir de</p>
            <p className="font-display text-2xl text-primary">{brl(service.price)}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {minutesToLabel(service.duration_minutes)}
          </div>
        </div>
        <Link
          to="/agendamento"
          search={{ serviceId: service.id }}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
        >
          Agendar este serviço
        </Link>
      </div>
    </article>
  );
}