import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceCard, type ServiceItem } from "@/components/sections/ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Maison Belle" },
      { name: "description", content: "Cabelo, unhas, maquiagem, estética e sobrancelhas. Conheça todos os serviços do Maison Belle." },
      { property: "og:title", content: "Serviços — Maison Belle" },
      { property: "og:description", content: "Cabelo, unhas, maquiagem, estética e sobrancelhas. Conheça todos os serviços do Maison Belle." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    void supabase
      .from("services")
      .select("id,name,description,price,duration_minutes,category,image_url")
      .order("featured", { ascending: false })
      .then(({ data }) => data && setServices(data as ServiceItem[]));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return ["todos", ...Array.from(set)];
  }, [services]);

  const filtered = filter === "todos" ? services : services.filter((s) => s.category === filter);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Serviços</p>
          <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
            Cuidado pensado para <em className="text-gradient-gold not-italic">você</em>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Tratamentos elaborados com técnica, produtos selecionados e o carinho que faz a diferença.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-full border border-border px-5 py-2 text-sm font-medium capitalize transition-smooth",
                filter === c
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-foreground/70 hover:border-primary/40 hover:text-primary",
              )}
            >
              {c === "todos" ? "Todos" : (categoryLabel[c] ?? c)}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>
    </SiteLayout>
  );
}