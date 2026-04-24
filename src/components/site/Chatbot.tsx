import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { sendChatMessage } from "@/utils/chat.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Quais serviços vocês oferecem?",
  "Qual o preço de uma escova?",
  "Como agendar um horário?",
  "Onde fica o salão?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Olá! Sou a Belle 💕 assistente virtual da Maison Belle. Posso te ajudar com serviços, preços, profissionais e agendamento. Como posso te ajudar hoje?",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = useServerFn(sendChatMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await send({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...next,
        { role: "assistant", content: "Desculpe, tive um probleminha. Tente novamente em instantes 💕" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-foreground shadow-gold transition-smooth hover:scale-105",
          open && "scale-90",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-smooth sm:right-6",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-hero px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight text-foreground">Belle</p>
            <p className="text-xs text-muted-foreground">Atendimento virtual · responde agora</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="max-h-[55vh] min-h-[280px] space-y-3 overflow-y-auto bg-background px-4 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Belle está digitando…
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Sugestões</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void handleSend(s)}
                  className="block w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-left text-sm text-foreground transition-smooth hover:border-primary/40 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick action */}
        <div className="border-t border-border/60 bg-secondary/30 px-4 py-2">
          <Button asChild size="sm" variant="ghost" className="h-8 w-full justify-center text-primary hover:bg-primary/10">
            <Link to="/agendamento" onClick={() => setOpen(false)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ir para o agendamento
            </Link>
          </Button>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2 border-t border-border/60 bg-card px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua mensagem…"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none transition-smooth focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Enviar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}