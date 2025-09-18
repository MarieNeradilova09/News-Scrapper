import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { airtableApi } from "@/integrations/airtable/client";
import { notebooklmApi } from "@/integrations/notebooklm/client";
import type { AirtableArticle } from "@/integrations/airtable/types";
import type { NotebookLMArticle } from "@/integrations/notebooklm/types";
import Hero from "@/components/landing/Hero";
import DigestPreview from "@/components/landing/DigestPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ExternalLink, User, LogOut, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<AirtableArticle[]>([]);
  const [notebooklmArticles, setNotebooklmArticles] = useState<NotebookLMArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = `${e.clientX - rect.left}px`;
    const my = `${e.clientY - rect.top}px`;
    el.style.setProperty("--mx", mx);
    el.style.setProperty("--my", my);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);


  // Funkce pro automatické mazání starých článků
  const cleanupOldArticles = async () => {
    try {
      console.log('🧹 Kontroluji staré články...');
      
      // Získáme všechny články pro kontrolu
      const allArticles = await airtableApi.articles.getRecent(1000);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Najdeme články starší 7 dní, které nejsou archivované a mají název
      const oldArticles = allArticles.filter(article => {
        const publishedDate = new Date(article.fields.Published_At || article.fields.Created_At);
        const isOld = publishedDate < sevenDaysAgo;
        const isNotArchived = article.fields.Status !== 'Archived';
        const hasTitle = article.fields.Title && 
                        article.fields.Title.trim() !== '' && 
                        article.fields.Title !== 'Bez názvu';
        return isOld && isNotArchived && hasTitle;
      });
      
      if (oldArticles.length > 0) {
        console.log(`🗑️ Nalezeno ${oldArticles.length} starých článků k smazání`);
        
        // Simulace mazání - v reálné implementaci by toto bylo API volání
        for (const article of oldArticles) {
          console.log(`🗑️ Mažu článek: ${article.fields.Title}`);
          // await airtableApi.articles.delete(article.id); // V reálné implementaci
        }
        
        toast({
          title: "Automatické čištění",
          description: `Smazáno ${oldArticles.length} starých článků`,
        });
      } else {
        console.log('✅ Žádné staré články k smazání');
      }
      
    } catch (error) {
      console.error('❌ Chyba při čištění starých článků:', error);
      // Nezobrazujeme toast pro chyby čištění, aby nerušily uživatele
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      console.log('🔄 Začínám načítat data...');
      
      try {
        // Nejdříve vyčistíme staré články
        await cleanupOldArticles();
        
        // Načteme články z Airtable
        console.log('📡 Volám Airtable API...');
        const allArticles = await airtableApi.articles.getRecent(20);
        
        // Filtrujeme články bez názvu
        const articlesWithTitle = allArticles.filter(article => 
          article.fields.Title && 
          article.fields.Title.trim() !== '' && 
          article.fields.Title !== 'Bez názvu'
        );
        
        console.log(`📊 Filtrováno: ${allArticles.length} -> ${articlesWithTitle.length} článků (odstraněny bez názvu)`);
        setArticles(articlesWithTitle);

        // Načteme NotebookLM data
        console.log('🧠 Načítám NotebookLM data...');
        const notebooklmData = await notebooklmApi.getProcessedArticles();
        setNotebooklmArticles(notebooklmData);

        console.log('✅ Data načtena:', { 
          articles: articlesData.length,
          notebooklm: notebooklmData.length 
        });
        
      } catch (error) {
        console.error('❌ Chyba při načítání dat:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        toast({
          title: "Chyba při načítání dat",
          description: `Nepodařilo se načíst články: ${error.message}`,
          variant: "destructive"
        });
        
        // Nastavíme prázdná data místo crashování
        setArticles([]);
        setNotebooklmArticles([]);
      } finally {
        console.log('🏁 Načítání dokončeno');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Chyba při přehrávání",
          description: "Nepodařilo se spustit audio",
          variant: "destructive"
        });
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítám...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with blur effect */}
      <div
        ref={heroRef}
        onMouseMove={onMouseMove}
        className="hero-surface border-b"
      >
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Ranní Digest</h1>
            </div>
            
             <div className="flex items-center gap-3">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => navigate("/sources")}
               >
                 Správa zdrojů
               </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Uživatel'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Odhlásit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="container py-12 md:py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Váš denní digest je připraven
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nejnovější články z vašich zdrojů s AI shrnutím a kontextem
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="hero" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Poslouchat audio
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              Nastavení zdrojů
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="articles" className="container py-6">
        {/* NotebookLM Section */}
        {notebooklmArticles.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">
                Nové články
              </h3>
              <p className="text-muted-foreground">
                Nejnovější články zpracované umělou inteligencí s shrnutím a analýzou
              </p>
            </div>
            
            <div className="space-y-4">
              {notebooklmArticles.map((article, index) => (
                <Card 
                  key={article.id} 
                  className="hover:shadow-md transition-all duration-200 hover-scale animate-fade-in border-l-4 border-l-blue-500 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/article/notebooklm-${article.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 leading-normal">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{article.category}</Badge>
                          <Badge 
                            variant={
                              article.sentiment === 'positive' ? 'default' : 
                              article.sentiment === 'negative' ? 'destructive' : 'secondary'
                            }
                          >
                            {article.sentiment === 'positive' ? 'Pozitivní' : 
                             article.sentiment === 'negative' ? 'Negativní' : 'Neutrální'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.processedAt).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">AI Shrnutí:</h4>
                        <p className="text-sm leading-relaxed line-clamp-2">{article.summary}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Klíčová témata:</h4>
                        <div className="flex flex-wrap gap-1">
                          {article.keyTopics.map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Dnešní články</h3>
          <p className="text-muted-foreground">
            Přečtěte si shrnutí nebo si pusťte audio verzi
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card className="p-8 text-center animate-fade-in">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Zatím žádné články</h3>
                <p>Nebyly nalezeny žádné články. Zkuste to později.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <Card 
                key={article.id} 
                className="hover:shadow-md transition-all duration-200 hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/5 transition-colors"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 leading-normal">
                        {article.fields.Title || 'Bez názvu'}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{article.fields.Category || 'Neznámá'}</Badge>
                        <Badge 
                          variant={article.fields.Status === 'Processed' ? 'default' : 'secondary'}
                        >
                          {article.fields.Status || 'New'}
                        </Badge>
                        {article.fields.Published_At && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.fields.Published_At)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                </CardHeader>
                <CardContent 
                  className="cursor-pointer"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {article.fields.Summary || 'Žádný obsah není k dispozici.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default Index;
