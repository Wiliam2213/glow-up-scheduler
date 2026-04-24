import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => {
    if (!input || !Array.isArray(input.messages)) {
      throw new Error("messages array is required");
    }
    const trimmed = input.messages.slice(-20).map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, 4000),
    }));
    return { messages: trimmed };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        reply:
          "Nosso atendimento virtual está temporariamente indisponível. Por favor, agende pela página de Agendamento ou ligue para (11) 9 8888-7777.",
        error: "missing_api_key",
      };
    }

    // Fetch live catalog so the bot answers with real prices/services
    let context = "";
    try {
      const [{ data: services }, { data: pros }] = await Promise.all([
        supabaseAdmin
          .from("services")
          .select("name, category, price, duration_minutes, description")
          .eq("active", true)
          .limit(30),
        supabaseAdmin
          .from("professionals")
          .select("name, specialty, start_time, end_time, working_days")
          .eq("active", true)
          .limit(20),
      ]);

      if (services?.length) {
        context += "\nSERVIÇOS DISPONÍVEIS:\n";
        for (const s of services) {
          context += `• ${s.name} (${s.category}) — R$ ${Number(s.price).toFixed(2)} · ${s.duration_minutes}min${s.description ? ` — ${s.description}` : ""}\n`;
        }
      }
      if (pros?.length) {
        context += "\nPROFISSIONAIS:\n";
        for (const p of pros) {
          context += `• ${p.name} — ${p.specialty} (atende ${p.start_time}–${p.end_time})\n`;
        }
      }
    } catch (err) {
      console.error("Failed to load catalog for chatbot:", err);
    }

    const systemPrompt = `Você é a Belle, assistente virtual carinhosa e profissional do salão de beleza Maison Belle.
Responda sempre em português, com tom acolhedor, elegante e breve (máx. 3-4 frases por resposta, use emojis com moderação 💕).
Sua missão: tirar dúvidas sobre serviços/preços, indicar profissionais e guiar a cliente até o agendamento online (página /agendamento).
Endereço: Rua das Flores, 123 — Jardins, São Paulo. Funcionamento: Seg–Sáb 09h–20h. Telefone: (11) 9 8888-7777.
NUNCA invente preços, serviços ou nomes de profissionais. Use apenas os dados abaixo.
Quando a cliente quiser marcar, oriente-a a clicar em "Agendar agora" ou ir para /agendamento.
${context}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...data.messages],
        }),
      });

      if (res.status === 429) {
        return { reply: "Estou recebendo muitas mensagens agora 💭 Tente novamente em instantes!", error: "rate_limit" };
      }
      if (res.status === 402) {
        return { reply: "Nosso atendimento virtual está pausado. Por favor, agende pelo site ou ligue para (11) 9 8888-7777 💕", error: "credits" };
      }
      if (!res.ok) {
        const text = await res.text();
        console.error("AI gateway error:", res.status, text);
        return { reply: "Tive um probleminha agora 😔 Você pode agendar direto em /agendamento.", error: "ai_error" };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const reply = json.choices?.[0]?.message?.content?.trim() ?? "Desculpe, não consegui entender. Pode reformular?";
      return { reply, error: null };
    } catch (err) {
      console.error("Chat handler failed:", err);
      return { reply: "Tive um probleminha agora 😔 Tente novamente em instantes.", error: "exception" };
    }
  });