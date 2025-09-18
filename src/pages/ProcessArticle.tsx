import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, Tag, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProcessArticle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "technology", label: "Technologie" },
    { value: "business", label: "Business" },
    { value: "health", label: "Zdraví" },
    { value: "science", label: "Věda" },
    { value: "sports", label: "Sport" },
    { value: "entertainment", label: "Zábava" },
    { value: "politics", label: "Politika" },
    { value: "world", label: "Svět" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Vzdělání" },
    { value: "travel", label: "Cestování" },
    { value: "qa", label: "QA & Testing" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !category) {
      toast({
        title: "Chyba",
        description: "Prosím vyplňte všechna pole",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Call edge function to process the article
      const { data, error } = await supabase.functions.invoke('process-article', {
        body: { url, category }
      });

      if (error) throw error;

      toast({
        title: "Úspěch",
        description: "Článek byl úspěšně zpracován"
      });

      // Reset form
      setUrl("");
      setCategory("");
      
      // Navigate back to main page
      navigate("/");
    } catch (error) {
      console.error('Error processing article:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se zpracovat článek",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Zpracovat článek
              </h1>
              <p className="text-muted-foreground mt-1">
                Zadejte URL článku a kategorii pro jeho zpracování
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Nový článek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium">
                    URL článku
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Kategorie
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte kategorii" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zpracovávám...
                    </>
                  ) : (
                    "Zpracovat článek"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-muted/20 bg-muted/10">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">ℹ️ Jak to funguje:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Zadejte URL článku, který chcete zpracovat</li>
                  <li>Vyberte odpovídající kategorii</li>
                  <li>Systém automaticky stáhne a zpracuje obsah článku</li>
                  <li>Článek bude přidán do vašeho feedu</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProcessArticle;