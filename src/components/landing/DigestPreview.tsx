import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Bookmark, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PreviewItem {
  id: string;
  title: string;
  source: string;
  minutes: number;
  summary: string;
  date: string;
}

const sample: PreviewItem[] = [
  {
    id: "1",
    title: "Evropské trhy reagují na nová makrodata",
    source: "Hospodářské noviny",
    minutes: 3,
    summary:
      "Inflace zpomalila rychleji, než se čekalo. Investoři zvažují, zda centrální banky uvolní politiku dříve.",
    date: "Dnes",
  },
  {
    id: "2",
    title: "AI modely v praxi: co už firmám přinášejí",
    source: "Lupa.cz",
    minutes: 2,
    summary:
      "Případové studie z bankovnictví a e‑commerce ukazují rostoucí návratnost. Klíčová je správa dat a bezpečnost.",
    date: "Dnes",
  },
  {
    id: "3",
    title: "Nový zákon o kyberbezpečnosti v EU",
    source: "Seznam Zprávy",
    minutes: 4,
    summary:
      "Směrnice NIS2 zpřísňuje požadavky pro stovky českých firem. Přináší povinnost řídit rizika a hlásit incidenty.",
    date: "Dnes",
  },
];

const DigestPreview = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const now = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const togglePlay = (id: string) => {
    if (playing === id) {
      setPlaying(null);
      setProgress(0);
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    setPlaying(id);
    setProgress(0);
    toast({ title: "Přehrávání ukázky…", description: "Simulovaný MP3 stream" });
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          if (timer.current) window.clearInterval(timer.current);
          setPlaying(null);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  return (
    <section id="digest" aria-labelledby="digest-heading" className="container py-12 md:py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 id="digest-heading" className="text-2xl md:text-3xl font-semibold">
          Dnešní přehled
        </h2>
        <div className="text-sm text-muted-foreground">{now}</div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {sample.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg md:text-xl">{item.title}</CardTitle>
                <Badge variant="secondary">{item.source}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{item.date} • {item.minutes} min poslechu</div>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-muted-foreground mb-4 max-w-prose">{item.summary}</p>

              {playing === item.id ? (
                <div className="flex items-center gap-3">
                  <Button onClick={() => togglePlay(item.id)} variant="secondary" className="gap-2">
                    <Pause /> Zastavit
                  </Button>
                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => togglePlay(item.id)} variant="hero" className="gap-2">
                    <Play /> Přehrát ukázku
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Bookmark /> Uložit
                  </Button>
                  <Button asChild variant="link" className="gap-2">
                    <a href="#" aria-label="Otevřít originál článku">
                      <LinkIcon /> Otevřít originál
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DigestPreview;
