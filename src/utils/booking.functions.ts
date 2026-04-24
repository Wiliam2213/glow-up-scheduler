import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export type BookingPayload = {
  serviceId: string;
  professionalId: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
};

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: BookingPayload) => {
    if (!input || typeof input !== "object") throw new Error("Dados inválidos");
    const out: BookingPayload = {
      serviceId: String(input.serviceId ?? ""),
      professionalId: String(input.professionalId ?? ""),
      date: String(input.date ?? ""),
      startTime: String(input.startTime ?? ""),
      clientName: String(input.clientName ?? "").trim().slice(0, 120),
      clientPhone: String(input.clientPhone ?? "").trim().slice(0, 30),
      clientEmail: input.clientEmail ? String(input.clientEmail).trim().slice(0, 160) : undefined,
      notes: input.notes ? String(input.notes).slice(0, 500) : undefined,
    };
    if (!UUID_RE.test(out.serviceId)) throw new Error("Serviço inválido");
    if (!UUID_RE.test(out.professionalId)) throw new Error("Profissional inválido");
    if (!DATE_RE.test(out.date)) throw new Error("Data inválida");
    if (!TIME_RE.test(out.startTime)) throw new Error("Horário inválido");
    if (out.clientName.length < 2) throw new Error("Informe seu nome");
    if (out.clientPhone.length < 8) throw new Error("Informe um telefone válido");
    return out;
  })
  .handler(async ({ data }) => {
    // 1. Load service to compute end_time
    const { data: service, error: svcErr } = await supabaseAdmin
      .from("services")
      .select("id, name, duration_minutes, active")
      .eq("id", data.serviceId)
      .maybeSingle();
    if (svcErr || !service || !service.active) {
      return { ok: false as const, error: "Serviço não encontrado." };
    }

    // 2. Validate professional and working hours
    const { data: pro, error: proErr } = await supabaseAdmin
      .from("professionals")
      .select("id, name, start_time, end_time, working_days, active")
      .eq("id", data.professionalId)
      .maybeSingle();
    if (proErr || !pro || !pro.active) {
      return { ok: false as const, error: "Profissional não encontrado." };
    }

    const dayOfWeek = new Date(`${data.date}T00:00:00`).getDay(); // 0=sun
    if (!pro.working_days?.includes(dayOfWeek)) {
      return { ok: false as const, error: "Profissional não atende neste dia." };
    }

    const endTime = addMinutes(data.startTime, service.duration_minutes);
    const startHHMM = data.startTime;
    const proStart = String(pro.start_time).slice(0, 5);
    const proEnd = String(pro.end_time).slice(0, 5);
    if (startHHMM < proStart || endTime > proEnd) {
      return { ok: false as const, error: "Horário fora do expediente do profissional." };
    }

    // 3. Check conflicts via RPC (security definer)
    const { data: busy, error: busyErr } = await supabaseAdmin.rpc("get_busy_slots", {
      _professional_id: data.professionalId,
      _date: data.date,
    });
    if (busyErr) {
      console.error("get_busy_slots failed:", busyErr);
      return { ok: false as const, error: "Não foi possível validar o horário. Tente novamente." };
    }
    for (const slot of busy ?? []) {
      const bs = String(slot.start_time).slice(0, 5);
      const be = String(slot.end_time).slice(0, 5);
      if (overlaps(startHHMM, endTime, bs, be)) {
        return { ok: false as const, error: "Esse horário acabou de ser reservado. Escolha outro." };
      }
    }

    // 4. Upsert client by phone
    const { data: existing } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("phone", data.clientPhone)
      .maybeSingle();

    let clientId = existing?.id;
    if (!clientId) {
      const { data: newClient, error: clientErr } = await supabaseAdmin
        .from("clients")
        .insert({
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail || null,
        })
        .select("id")
        .single();
      if (clientErr || !newClient) {
        console.error("Client insert failed:", clientErr);
        return { ok: false as const, error: "Não foi possível salvar seus dados." };
      }
      clientId = newClient.id;
    }

    // 5. Insert appointment
    const { data: appt, error: apptErr } = await supabaseAdmin
      .from("appointments")
      .insert({
        service_id: data.serviceId,
        professional_id: data.professionalId,
        client_id: clientId,
        appointment_date: data.date,
        start_time: data.startTime,
        end_time: endTime,
        status: "pending",
        notes: data.notes || null,
      })
      .select("id")
      .single();

    if (apptErr || !appt) {
      console.error("Appointment insert failed:", apptErr);
      return { ok: false as const, error: "Não foi possível confirmar o agendamento." };
    }

    return {
      ok: true as const,
      appointmentId: appt.id,
      serviceName: service.name,
      professionalName: pro.name,
      endTime,
    };
  });

export const getBusySlots = createServerFn({ method: "POST" })
  .inputValidator((input: { professionalId: string; date: string }) => {
    if (!UUID_RE.test(String(input?.professionalId ?? ""))) throw new Error("Profissional inválido");
    if (!DATE_RE.test(String(input?.date ?? ""))) throw new Error("Data inválida");
    return { professionalId: input.professionalId, date: input.date };
  })
  .handler(async ({ data }) => {
    const { data: busy, error } = await supabaseAdmin.rpc("get_busy_slots", {
      _professional_id: data.professionalId,
      _date: data.date,
    });
    if (error) {
      console.error(error);
      return { slots: [] as Array<{ start_time: string; end_time: string }> };
    }
    return {
      slots: (busy ?? []).map((s: { start_time: string; end_time: string }) => ({
        start_time: String(s.start_time).slice(0, 5),
        end_time: String(s.end_time).slice(0, 5),
      })),
    };
  });