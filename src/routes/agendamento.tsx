import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/agendamento")({
  validateSearch: (search: Record<string, unknown>) => ({
    serviceId: typeof search.serviceId === "string" ? search.serviceId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Agendamento — Maison Belle" },
      { name: "description", content: "Agende seu horário no Maison Belle em poucos cliques." },
      { property: "og:title", content: "Agendamento — Maison Belle" },
      { property: "og:description", content: "Agende seu horário no Maison Belle em poucos cliques." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CalendarHeart className="h-7 w-7" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Em breve</p>
        <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
          Agendamento <em className="text-gradient-gold not-italic">online</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          O fluxo de agendamento em 4 passos (serviço → profissional → data → horário) está sendo
          finalizado. Por enquanto, fale conosco no WhatsApp e marcamos seu horário em segundos.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full shadow-soft">
            <a href="https://wa.me/5511988887777" target="_blank" rel="noreferrer">
              <Sparkles className="mr-2 h-4 w-4" /> Agendar pelo WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/servicos">Ver serviços</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}