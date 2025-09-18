import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { airtableApi } from "@/integrations/airtable/client";
import { notebooklmApi } from "@/integrations/notebooklm/client";
import type { AirtableArticle } from "@/integrations/airtable/types";
import type { NotebookLMArticle } from "@/integrations/notebooklm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ExternalLink, Play, ArrowLeft, Archive } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<AirtableArticle | null>(null);
  const [notebooklmArticle, setNotebooklmArticle] = useState<NotebookLMArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notebooklmLoading, setNotebooklmLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Funkce pro načítání NotebookLM dat pro tento článek
  const fetchNotebooklmData = async () => {
    if (!article) return;
    
    setNotebooklmLoading(true);
    try {
      console.log('🧠 Načítám NotebookLM data pro článek:', article.fields.Title);
      
      // Simulace - v reálné implementaci by toto bylo API volání s ID článku
      const articlesData = await notebooklmApi.getProcessedArticles();
      
      // Najdeme odpovídající článek (simulace podle názvu)
      const matchingArticle = articlesData.find(nlArticle => 
        nlArticle.title.toLowerCase().includes(article.fields.Title?.toLowerCase() || '') ||
        article.fields.Title?.toLowerCase().includes(nlArticle.title.toLowerCase() || '')
      );
      
      if (matchingArticle) {
        console.log('✅ NotebookLM článek nalezen:', matchingArticle.title);
        setNotebooklmArticle(matchingArticle);
      } else {
        console.log('⚠️ NotebookLM článek nenalezen, vytváříme simulaci');
        // Vytvoříme simulovaný NotebookLM článek
        const simulatedArticle: NotebookLMArticle = {
          id: `notebooklm-${article.id}`,
          title: article.fields.Title || 'Bez názvu',
          content: article.fields.Content || 'Žádný obsah',
          category: article.fields.Category || 'Neznámá',
          summary: article.fields.Summary || 'Žádné shrnutí',
          keyTopics: ['AI zpracování', 'automatické shrnutí'],
          sentiment: 'neutral',
          processedAt: new Date().toISOString()
        };
        setNotebooklmArticle(simulatedArticle);
      }
      
      toast({
        title: "NotebookLM data načtena",
        description: "AI zpracování je připraveno",
      });
      
    } catch (error) {
      console.error('❌ Chyba při načítání NotebookLM dat:', error);
      toast({
        title: "Chyba při načítání NotebookLM dat",
        description: "Nepodařilo se načíst AI zpracování.",
        variant: "destructive"
      });
    } finally {
      setNotebooklmLoading(false);
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id || !user) return;
      
      console.log('🔄 Načítám detail článku:', id);
      
      try {
        // Zkontrolujeme, zda se jedná o NotebookLM článek
        if (id.startsWith('notebooklm-')) {
          const notebooklmId = id.replace('notebooklm-', '');
          const notebooklmArticles = await notebooklmApi.getProcessedArticles();
          const foundNotebooklmArticle = notebooklmArticles.find(a => a.id === notebooklmId);
          
          if (foundNotebooklmArticle) {
            console.log('✅ NotebookLM článek nalezen:', foundNotebooklmArticle.title);
            setNotebooklmArticle(foundNotebooklmArticle);
            
            // Vytvoříme simulovaný Airtable článek pro kompatibilitu
            const simulatedArticle: AirtableArticle = {
              id: id,
              fields: {
                Title: foundNotebooklmArticle.title,
                Content: foundNotebooklmArticle.content,
                Summary: foundNotebooklmArticle.summary,
                Category: foundNotebooklmArticle.category,
                Status: 'Processed',
                Published_At: foundNotebooklmArticle.processedAt,
                Audio_URL: '', // Bude vygenerováno při kliknutí na "Poslouchat audio"
                Original_URL: `https://news.example.com/article/${foundNotebooklmArticle.id}`
              }
            };
            setArticle(simulatedArticle);
          } else {
            console.log('❌ NotebookLM článek nenalezen');
            toast({
              title: "Článek nenalezen",
              description: "Požadovaný článek nebyl nalezen.",
              variant: "destructive"
            });
            navigate('/');
          }
        } else {
          // Standardní Airtable článek
          const articles = await airtableApi.articles.getRecent(100);
          const foundArticle = articles.find(a => a.id === id);
          
          if (foundArticle) {
            console.log('✅ Článek nalezen:', foundArticle.fields.Title);
            setArticle(foundArticle);
          } else {
            console.log('❌ Článek nenalezen');
            toast({
              title: "Článek nenalezen",
              description: "Požadovaný článek nebyl nalezen.",
              variant: "destructive"
            });
            navigate('/');
          }
        }
        
      } catch (error) {
        console.error('❌ Chyba při načítání článku:', error);
        toast({
          title: "Chyba při načítání článku",
          description: "Nepodařilo se načíst detail článku.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, user, navigate]);

  const handlePlayAudio = (audioUrl: string) => {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Chyba při přehrávání audia:', error);
        toast({
          title: "Chyba při přehrávání",
          description: "Nepodařilo se spustit audio",
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('Chyba při vytváření audio objektu:', error);
      toast({
        title: "Chyba při přehrávání",
        description: "Nepodařilo se spustit audio",
        variant: "destructive"
      });
    }
  };

  const handlePlayNotebooklmAudio = () => {
    // Simulace přehrání AI audia
    // V reálné implementaci by toto bylo API volání pro generování TTS
    toast({
      title: "Přehrávání AI audia",
      description: `Přehrávám audio pro: ${article?.fields.Title || 'článek'}`,
    });
    
    // Simulace - v reálné implementaci by toto bylo skutečné audio URL
    console.log('🎵 Přehrávám AI audio pro:', article?.fields.Title);
  };

  const handleArchiveArticle = async () => {
    if (!article) return;
    
    try {
      // Simulace archivace článku
      // V reálné implementaci by toto bylo API volání pro změnu statusu článku
      console.log('📦 Archivuji článek:', article.fields.Title);
      
      // Simulace změny statusu na 'Archived'
      // V reálné implementaci: await airtableApi.articles.update(article.id, { Status: 'Archived' });
      
      toast({
        title: "Článek archivován",
        description: "Článek je uložený ve správě zdrojů",
      });
      
      // Po archivaci přesměrujeme zpět na hlavní stránku
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Chyba při archivaci článku:', error);
      toast({
        title: "Chyba při archivaci",
        description: "Nepodařilo se archivovat článek",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
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

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Článek nenalezen</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na hlavní stránku
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
            <h1 className="text-xl font-semibold">Detail článku</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl leading-normal mb-4">
                    {article.fields.Title || 'Bez názvu'}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Shrnutí článku */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Shrnutí článku</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {article.fields.Summary || 'Žádné shrnutí není k dispozici.'}
                  </p>
                </div>
              </div>

              {/* Highline článku */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Highline článku</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {article.fields.Content || 'Žádný obsah není k dispozici.'}
                  </p>
                </div>
              </div>


              {/* Akce */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                {article.fields.Audio_URL && (
                  <Button 
                    variant="hero" 
                    size="lg" 
                    onClick={() => handlePlayAudio(article.fields.Audio_URL!)}
                    className="gap-2 hover:scale-105 hover:shadow-lg transition-all duration-200 hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" />
                    Přehrát původní audio
                  </Button>
                )}
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handlePlayNotebooklmAudio}
                  className="gap-2 hover:scale-105 hover:shadow-lg transition-all duration-200 hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" />
                  Poslouchat audio
                </Button>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={() => {
                    const url = article.fields.Original_URL || `https://example.com/article/${article.id}`;
                    window.open(url, '_blank');
                  }}
                  className="gap-2 hover:scale-105 hover:shadow-lg transition-all duration-200 hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Přejít na originální článek
                </Button>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handleArchiveArticle}
                  className="gap-2 hover:scale-105 hover:shadow-lg transition-all duration-200 hover:bg-primary/90"
                >
                  <Archive className="h-4 w-4" />
                  Archivovat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetail;