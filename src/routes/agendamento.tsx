import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl, categoryLabel, minutesToLabel } from "@/lib/format";
import { createBooking, getBusySlots } from "@/utils/booking.functions";
import { cn } from "@/lib/utils";
import { serviceImageByCategory } from "@/lib/serviceImages";

export const Route = createFileRoute("/agendamento")({
  validateSearch: (search: Record<string, unknown>) => ({
    serviceId: typeof search.serviceId === "string" ? search.serviceId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Agendamento — Maison Belle" },
      { name: "description", content: "Agende seu horário no Maison Belle em poucos cliques: serviço, profissional, data e horário." },
      { property: "og:title", content: "Agendamento — Maison Belle" },
      { property: "og:description", content: "Agende seu horário no Maison Belle em poucos cliques." },
    ],
  }),
  component: BookingPage,
});

type Service = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
  description: string | null;
};

type Professional = {
  id: string;
  name: string;
  specialty: string;
  image_url: string | null;
  start_time: string;
  end_time: string;
  working_days: number[];
};

const STEPS = ["Serviço", "Profissional", "Data & hora", "Seus dados"] as const;

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDaysISO(base: string, days: number) {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    day: d.getDate(),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    dow: d.getDay(),
  };
}

function generateSlots(start: string, end: string, durationMin: number, stepMin = 30) {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  for (let t = startMin; t + durationMin <= endMin; t += stepMin) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function BookingPage() {
  const { serviceId: prefServiceId } = Route.useSearch();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [serviceId, setServiceId] = useState<string | undefined>(prefServiceId);
  const [proId, setProId] = useState<string | undefined>();
  const [date, setDate] = useState<string>(todayISO());
  const [startTime, setStartTime] = useState<string | undefined>();

  const [busy, setBusy] = useState<Array<{ start_time: string; end_time: string }>>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<null | {
    appointmentId: string;
    serviceName: string;
    professionalName: string;
    endTime: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useServerFn(createBooking);
  const fetchBusy = useServerFn(getBusySlots);

  // Load catalog
  useEffect(() => {
    void (async () => {
      const [s, p] = await Promise.all([
        supabase
          .from("services")
          .select("id,name,price,duration_minutes,category,image_url,description")
          .eq("active", true)
          .order("category"),
        supabase
          .from("professionals")
          .select("id,name,specialty,image_url,start_time,end_time,working_days")
          .eq("active", true)
          .order("name"),
      ]);
      if (s.data) setServices(s.data as Service[]);
      if (p.data) {
        setPros(
          (p.data as Professional[]).map((x) => ({
            ...x,
            start_time: String(x.start_time).slice(0, 5),
            end_time: String(x.end_time).slice(0, 5),
          })),
        );
      }
      setLoadingCatalog(false);
    })();
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );
  const selectedPro = useMemo(() => pros.find((p) => p.id === proId), [pros, proId]);

  // Load busy slots when pro+date selected
  useEffect(() => {
    if (!proId || !date) return;
    setLoadingBusy(true);
    setStartTime(undefined);
    void fetchBusy({ data: { professionalId: proId, date } })
      .then((r) => setBusy(r.slots))
      .finally(() => setLoadingBusy(false));
  }, [proId, date, fetchBusy]);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysISO(todayISO(), i)), []);

  const availableSlots = useMemo(() => {
    if (!selectedPro || !selectedService) return [];
    const all = generateSlots(selectedPro.start_time, selectedPro.end_time, selectedService.duration_minutes, 30);
    return all.map((t) => {
      const end = addMinutes(t, selectedService.duration_minutes);
      const isBusy = busy.some((b) => t < b.end_time && b.start_time < end);
      return { time: t, busy: isBusy };
    });
  }, [selectedPro, selectedService, busy]);

  const proWorksOnDate = useMemo(() => {
    if (!selectedPro) return true;
    const dow = new Date(`${date}T00:00:00`).getDay();
    return selectedPro.working_days.includes(dow);
  }, [selectedPro, date]);

  const canNext = (() => {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!proId;
    if (step === 2) return !!date && !!startTime && proWorksOnDate;
    return name.trim().length >= 2 && phone.trim().length >= 8;
  })();

  const handleConfirm = async () => {
    if (!serviceId || !proId || !startTime) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submit({
        data: {
          serviceId,
          professionalId: proId,
          date,
          startTime,
          clientName: name,
          clientPhone: phone,
          clientEmail: email || undefined,
          notes: notes || undefined,
        },
      });
      if (res.ok) {
        setConfirmation({
          appointmentId: res.appointmentId,
          serviceName: res.serviceName,
          professionalName: res.professionalName,
          endTime: res.endTime,
        });
      } else {
        setError(res.error);
      }
    } catch (e) {
      console.error(e);
      setError("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  /* CONFIRMATION VIEW */
  if (confirmation) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Agendamento confirmado</p>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            Te esperamos! <em className="text-gradient-gold not-italic">💕</em>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Sua reserva foi registrada com sucesso. Você receberá um lembrete antes do horário.
          </p>
          <div className="mx-auto mt-8 max-w-md rounded-3xl border border-border/60 bg-card p-6 text-left shadow-card">
            <Row label="Serviço" value={confirmation.serviceName} />
            <Row label="Profissional" value={confirmation.professionalName} />
            <Row label="Data" value={new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} />
            <Row label="Horário" value={`${startTime} – ${confirmation.endTime}`} />
            <Row label="Código" value={confirmation.appointmentId.slice(0, 8).toUpperCase()} />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/">Voltar à home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/servicos">Ver mais serviços</Link>
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-card/80 text-primary">
            <CalendarHeart className="h-6 w-6" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Agendamento online</p>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            Reserve seu <em className="text-gradient-gold not-italic">momento</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Em 4 passos rápidos você marca seu horário com a profissional ideal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        {/* Stepper */}
        <ol className="mb-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-smooth",
                  i < step && "bg-primary text-primary-foreground",
                  i === step && "bg-gradient-gold text-foreground shadow-gold",
                  i > step && "border border-border bg-card text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-sm sm:inline", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="hidden h-px w-8 bg-border sm:block" />}
            </li>
          ))}
        </ol>

        {/* STEP CONTENT */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card sm:p-10">
          {loadingCatalog ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando…
            </div>
          ) : (
            <>
              {step === 0 && (
                <div>
                  <h2 className="font-display text-2xl text-foreground">Escolha o serviço</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {services.map((s) => {
                      const active = s.id === serviceId;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setServiceId(s.id)}
                          className={cn(
                            "group flex gap-4 rounded-2xl border p-4 text-left transition-smooth",
                            active
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border/60 hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          <img
                            src={s.image_url || serviceImageByCategory[s.category]}
                            alt={s.name}
                            className="h-20 w-20 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wider text-accent">
                              {categoryLabel[s.category] ?? s.category}
                            </p>
                            <p className="font-display text-lg text-foreground">{s.name}</p>
                            <p className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{brl(Number(s.price))}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {minutesToLabel(s.duration_minutes)}
                              </span>
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl text-foreground">Escolha a profissional</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {pros.map((p) => {
                      const active = p.id === proId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setProId(p.id)}
                          className={cn(
                            "flex items-center gap-4 rounded-2xl border p-4 text-left transition-smooth",
                            active
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border/60 hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-display text-lg text-foreground">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.specialty}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Atende {p.start_time}–{p.end_time}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && selectedPro && selectedService && (
                <div>
                  <h2 className="font-display text-2xl text-foreground">Escolha data e horário</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedService.name} com {selectedPro.name} · {minutesToLabel(selectedService.duration_minutes)}
                  </p>

                  {/* Date strip */}
                  <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                    {days.map((iso) => {
                      const d = formatDayLabel(iso);
                      const works = selectedPro.working_days.includes(d.dow);
                      const active = iso === date;
                      return (
                        <button
                          key={iso}
                          onClick={() => works && setDate(iso)}
                          disabled={!works}
                          className={cn(
                            "flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 text-center transition-smooth",
                            active && "border-primary bg-primary text-primary-foreground shadow-soft",
                            !active && works && "border-border/60 text-foreground hover:border-primary/40",
                            !works && "cursor-not-allowed border-border/40 text-muted-foreground/50 line-through",
                          )}
                        >
                          <span className="text-[10px] uppercase tracking-wider">{d.weekday}</span>
                          <span className="font-display text-2xl leading-none">{d.day}</span>
                          <span className="text-[10px] uppercase">{d.month}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slots */}
                  <div className="mt-6">
                    {!proWorksOnDate ? (
                      <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
                        {selectedPro.name} não atende neste dia. Escolha outra data.
                      </p>
                    ) : loadingBusy ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando horários…
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                        {availableSlots.map(({ time, busy: isBusy }) => (
                          <button
                            key={time}
                            onClick={() => !isBusy && setStartTime(time)}
                            disabled={isBusy}
                            className={cn(
                              "rounded-xl border px-3 py-2 text-sm transition-smooth",
                              startTime === time && "border-primary bg-primary text-primary-foreground shadow-soft",
                              startTime !== time && !isBusy && "border-border/60 text-foreground hover:border-primary/40 hover:bg-primary/5",
                              isBusy && "cursor-not-allowed border-border/30 bg-secondary/40 text-muted-foreground/50 line-through",
                            )}
                          >
                            {time}
                          </button>
                        ))}
                        {availableSlots.length === 0 && (
                          <p className="col-span-full text-sm text-muted-foreground">
                            Nenhum horário disponível neste dia.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-2xl text-foreground">Seus dados</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Para confirmarmos sua reserva e enviarmos lembretes.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Nome completo *">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como gostaria de ser chamada?"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>
                    <Field label="Telefone *">
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 9 9999-9999"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>
                    <Field label="E-mail (opcional)">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>
                    <Field label="Observações (opcional)">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Algo que devemos saber?"
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>
                  </div>

                  {/* Summary */}
                  <div className="mt-8 rounded-2xl bg-secondary/40 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
                      Resumo da reserva
                    </p>
                    <Row label="Serviço" value={selectedService?.name ?? "—"} />
                    <Row label="Profissional" value={selectedPro?.name ?? "—"} />
                    <Row
                      label="Quando"
                      value={`${new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · ${startTime ?? "—"}`}
                    />
                    <Row label="Total" value={selectedService ? brl(Number(selectedService.price)) : "—"} highlight />
                  </div>

                  {error && (
                    <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* NAV */}
          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="rounded-full"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            {step < 3 ? (
              <Button
                size="lg"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="rounded-full px-8 shadow-soft"
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => void handleConfirm()}
                disabled={!canNext || submitting}
                className="rounded-full bg-gradient-gold px-8 text-foreground shadow-gold hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Confirmar agendamento
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", highlight ? "font-display text-lg text-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}