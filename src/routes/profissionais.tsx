import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProfessionalCard, type ProfessionalItem } from "@/components/sections/ProfessionalCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Profissionais — Maison Belle" },
      { name: "description", content: "Conheça as profissionais por trás da Maison Belle: especialistas em cabelo, maquiagem, unhas e estética." },
      { property: "og:title", content: "Profissionais — Maison Belle" },
      { property: "og:description", content: "Conheça as profissionais por trás da Maison Belle." },
    ],
  }),
  component: ProsPage,
});

function ProsPage() {
  const [pros, setPros] = useState<ProfessionalItem[]>([]);

  useEffect(() => {
    void supabase
      .from("professionals")
      .select("id,name,specialty,bio,image_url")
      .then(({ data }) => data && setPros(data as ProfessionalItem[]));
  }, []);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">A equipe</p>
          <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
            Mulheres que transformam <em className="text-gradient-gold not-italic">vidas</em>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Cada profissional foi escolhida não só pela técnica, mas pela escuta, sensibilidade e paixão pelo que faz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pros.map((p, i) => <ProfessionalCard key={p.id} pro={p} index={i} />)}
        </div>
      </section>
    </SiteLayout>
  );
}