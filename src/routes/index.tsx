import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Sparkles, Heart, Calendar, Award } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ServiceCard, type ServiceItem } from "@/components/sections/ServiceCard";
import { ProfessionalCard, type ProfessionalItem } from "@/components/sections/ProfessionalCard";
import { TestimonialCard, type TestimonialItem } from "@/components/sections/TestimonialCard";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-salon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Belle — Salão de Beleza Premium" },
      { name: "description", content: "Cabelo, unhas, maquiagem e estética em um espaço delicado e premium. Agende online em segundos." },
      { property: "og:title", content: "Maison Belle — Salão de Beleza Premium" },
      { property: "og:description", content: "Cabelo, unhas, maquiagem e estética em um espaço delicado e premium. Agende online em segundos." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pros, setPros] = useState<ProfessionalItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    void (async () => {
      const [s, p, t] = await Promise.all([
        supabase.from("services").select("id,name,description,price,duration_minutes,category,image_url").eq("featured", true).limit(4),
        supabase.from("professionals").select("id,name,specialty,bio,image_url").limit(4),
        supabase.from("testimonials").select("id,client_name,rating,comment,service_name").limit(3),
      ]);
      if (s.data) setServices(s.data as ServiceItem[]);
      if (p.data) setPros(p.data as ProfessionalItem[]);
      if (t.data) setTestimonials(t.data as TestimonialItem[]);
    })();
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Beleza com alma
            </span>
            <h1 className="font-display text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
              Realce sua beleza com{" "}
              <span className="text-gradient-gold italic">quem entende</span> de você.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Um salão pensado em cada detalhe para você se sentir cuidada, elegante e
              encantadora. Agende online em segundos.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 shadow-soft">
                <Link to="/agendamento">
                  Agendar horário <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-primary/30 hover:bg-primary/5">
                <a href="https://wa.me/5511988887777" target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-12 flex gap-8 text-sm">
              <div>
                <p className="font-display text-3xl text-foreground">+10</p>
                <p className="text-muted-foreground">anos de experiência</p>
              </div>
              <div>
                <p className="font-display text-3xl text-foreground">2k+</p>
                <p className="text-muted-foreground">clientes felizes</p>
              </div>
              <div>
                <p className="font-display text-3xl text-foreground">5★</p>
                <p className="text-muted-foreground">avaliação média</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-gold opacity-20 blur-3xl" />
            <img
              src={heroImg}
              alt="Interior elegante do salão Maison Belle"
              width={1600}
              height={1200}
              className="aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-soft"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-card p-5 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Atendimento</p>
                  <p className="text-sm text-muted-foreground">com afeto e técnica</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Experiência premium", text: "Cada visita é um ritual de cuidado, do café à finalização." },
            { icon: Award, title: "Profissionais premiadas", text: "Equipe formada nas melhores escolas e em constante atualização." },
            { icon: Calendar, title: "Agendamento simples", text: "Marque seu horário online em menos de um minuto." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border/60 bg-card p-8 transition-smooth hover:shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Nossos serviços</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              Cuidado para cada <em className="text-gradient-gold not-italic">detalhe seu</em>
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/5">
            <Link to="/servicos">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Nossa equipe</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              Mãos que entendem você
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pros.map((p, i) => <ProfessionalCard key={p.id} pro={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Quem já viveu</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            Histórias que nos inspiram
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-gold p-12 text-center shadow-gold sm:p-16">
          <h2 className="font-display text-4xl text-foreground sm:text-5xl">
            Pronta para se sentir incrível?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/80">
            Reserve seu momento de cuidado em poucos cliques. Sua transformação começa aqui.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full bg-foreground px-10 text-background hover:bg-foreground/90">
              <Link to="/agendamento">Agendar agora <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
