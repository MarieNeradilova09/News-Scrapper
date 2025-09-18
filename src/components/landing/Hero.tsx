import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = `${e.clientX - rect.left}px`;
    const my = `${e.clientY - rect.top}px`;
    el.style.setProperty("--mx", mx);
    el.style.setProperty("--my", my);
  };

  return (
    <header className="w-full border-b">
      <nav className="container flex items-center justify-between py-4" aria-label="Hlavní navigace">
        <a href="#" className="inline-flex items-center font-semibold tracking-tight">
          Ranní Digest
        </a>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost">Ceník</Button>
          <Link to="/auth">
            <Button variant="ghost">Přihlásit</Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="lg" className="gap-2">
              Vyzkoušet
              <ArrowRight className="opacity-90" />
            </Button>
          </Link>
        </div>
      </nav>

      <div
        ref={ref}
        onMouseMove={onMove}
        className="hero-surface"
      >
        <main className="container grid md:grid-cols-2 gap-10 py-14 md:py-24 items-center">
          <section>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Chytrý ranní přehled
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-prose">
              Každé ráno v 8:00 dostaneš výběr článků z tvých zdrojů. AI je bleskově
              shrne, doplní kontext a převede do audia. Vše v jedné webové appce.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#digest" className="inline-flex">
                <Button variant="hero" size="lg" className="gap-2">
                  <Play /> Přehrát ukázku
                </Button>
              </a>
              <Link to="/auth" className="inline-flex">
                <Button variant="outline" size="lg" className="gap-2">
                  Začít používat
                  <ArrowRight className="opacity-90" />
                </Button>
              </Link>
            </div>
          </section>

          <section aria-hidden className="relative">
            <div className="rounded-xl border bg-card p-6 shadow-elegant">
              <div className="text-sm text-muted-foreground mb-2">Ukázkový digest</div>
              <div className="h-40 rounded-md bg-muted" />
            </div>
          </section>
        </main>
      </div>
    </header>
  );
};

export default Hero;
