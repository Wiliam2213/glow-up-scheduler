import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Clock, Instagram } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Maison Belle" },
      { name: "description", content: "Endereço, WhatsApp e horário de funcionamento da Maison Belle." },
      { property: "og:title", content: "Contato — Maison Belle" },
      { property: "og:description", content: "Fale com a Maison Belle e agende sua visita." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Contato</p>
          <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
            Estamos prontas para <em className="text-gradient-gold not-italic">te receber</em>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 lg:px-10">
        <div className="space-y-6">
          {[
            { icon: MapPin, title: "Endereço", text: "Rua das Flores, 123 — Jardins, São Paulo" },
            { icon: Phone, title: "Telefone", text: "(11) 9 8888-7777" },
            { icon: Mail, title: "E-mail", text: "ola@maisonbelle.com.br" },
            { icon: Clock, title: "Horário", text: "Seg–Sáb · 09h às 20h" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 rounded-3xl bg-card p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full shadow-soft">
              <Link to="/agendamento">Agendar horário</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="tel:+551198887777">
                <Phone className="mr-2 h-4 w-4" /> Ligar agora
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="mailto:ola@maisonbelle.com.br">
                <Mail className="mr-2 h-4 w-4" /> E-mail
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="https://instagram.com/maisonbelle" target="_blank" rel="noreferrer">
                <Instagram className="mr-2 h-4 w-4" /> Instagram
              </a>
            </Button>
          </div>

          <div className="rounded-3xl border border-accent/30 bg-gradient-hero p-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-display text-lg text-foreground">Atendimento instantâneo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tem dúvidas sobre serviços ou preços? Fale com a <strong>Belle</strong>, nossa
                  assistente virtual — clique no botão dourado no canto inferior direito da tela.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl shadow-card">
          <iframe
            title="Localização Maison Belle"
            src="https://maps.google.com/maps?q=Jardins,%20S%C3%A3o%20Paulo&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
          />
        </div>
      </section>
    </SiteLayout>
  );
}