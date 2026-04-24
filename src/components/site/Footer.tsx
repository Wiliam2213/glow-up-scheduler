import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 lg:px-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-display text-2xl text-foreground">
              Maison <span className="text-gradient-gold">Belle</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Um espaço pensado para você se sentir cuidada, acolhida e radiante. Beleza com alma,
            atendimento com afeto.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Navegar
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/servicos" className="hover:text-primary transition-smooth">Serviços</Link></li>
            <li><Link to="/profissionais" className="hover:text-primary transition-smooth">Profissionais</Link></li>
            <li><Link to="/depoimentos" className="hover:text-primary transition-smooth">Depoimentos</Link></li>
            <li><Link to="/agendamento" className="hover:text-primary transition-smooth">Agendar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Contato
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              Rua das Flores, 123 — Jardins
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              (11) 9 8888-7777
            </li>
            <li className="flex items-start gap-2">
              <Instagram className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              @maisonbelle
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Maison Belle. Feito com ❤︎ para realçar a sua beleza.
        </p>
      </div>
    </footer>
  );
}