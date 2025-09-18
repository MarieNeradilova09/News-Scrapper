import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Settings, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

const categories = [
  "Všechny",
  "Technologie", 
  "QA",
  "Sport",
  "Finance",
  "Zdraví"
];

const Sources = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSource, setNewSource] = useState({ name: "", url: "", category: "" });
  const [retentionDays, setRetentionDays] = useState(30);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSources();
  }, [user, navigate]);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst zdroje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSource = async () => {
    if (!newSource.name || !newSource.url || !newSource.category) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna pole",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("sources").insert({
        name: newSource.name,
        url: newSource.url,
        category: newSource.category,
        created_by_user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Úspěch",
        description: "Zdroj byl přidán",
      });

      setNewSource({ name: "", url: "", category: "" });
      fetchSources();
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se přidat zdroj",
        variant: "destructive",
      });
    }
  };

  const deleteSource = async (id: string) => {
    try {
      const { error } = await supabase.from("sources").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Úspěch",
        description: "Zdroj byl smazán",
      });

      fetchSources();
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat zdroj",
        variant: "destructive",
      });
    }
  };

  const toggleSourceActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("sources")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchSources();
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se aktualizovat zdroj",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-lg">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Odhlásit se
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Správa zdrojů</h1>
          <p className="text-muted-foreground">
            Spravujte weby, ze kterých se budou stahovat články
          </p>
        </div>

        {/* Add new source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Přidat nový zdroj
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Název webu</Label>
                <Input
                  id="name"
                  value={newSource.name}
                  onChange={(e) =>
                    setNewSource({ ...newSource, name: e.target.value })
                  }
                  placeholder="např. TechCrunch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL adresa</Label>
                <Input
                  id="url"
                  type="url"
                  value={newSource.url}
                  onChange={(e) =>
                    setNewSource({ ...newSource, url: e.target.value })
                  }
                  placeholder="https://techcrunch.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={newSource.category}
                  onValueChange={(value) =>
                    setNewSource({ ...newSource, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== "Všechny").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addSource} className="w-full md:w-auto">
              Přidat zdroj
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Nastavení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention">Doba uchování článků (dny)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">
                  Články starší než {retentionDays} dní budou automaticky smazány
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources list */}
        <Card>
          <CardHeader>
            <CardTitle>Vaše zdroje ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Zatím nemáte přidané žádné zdroje
              </div>
            ) : (
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{source.name}</h3>
                        <Badge variant="outline">{source.category}</Badge>
                        {!source.is_active && (
                          <Badge variant="destructive">Neaktivní</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {source.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Přidáno: {new Date(source.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSourceActive(source.id, source.is_active)}
                      >
                        {source.is_active ? "Deaktivovat" : "Aktivovat"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sources;