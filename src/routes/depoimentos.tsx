import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TestimonialCard, type TestimonialItem } from "@/components/sections/TestimonialCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/depoimentos")({
  head: () => ({
    meta: [
      { title: "Depoimentos — Maison Belle" },
      { name: "description", content: "O que nossas clientes dizem sobre a experiência Maison Belle." },
      { property: "og:title", content: "Depoimentos — Maison Belle" },
      { property: "og:description", content: "O que nossas clientes dizem sobre a experiência Maison Belle." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    void supabase
      .from("testimonials")
      .select("id,client_name,rating,comment,service_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setItems(data as TestimonialItem[]));
  }, []);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Depoimentos</p>
          <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
            Histórias de <em className="text-gradient-gold not-italic">brilho</em>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            A maior recompensa do nosso trabalho é ver cada cliente sair daqui se sentindo bem consigo mesma.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => <TestimonialCard key={t.id} t={t} />)}
        </div>
      </section>
    </SiteLayout>
  );
}