import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { runDailyPipeline, type PipelineResult, type PipelineProgress, formatDuration } from "@/utils/pipelineProcessor";
import { Play, CheckCircle, AlertCircle, Clock, Volume2, Download } from "lucide-react";

const TestScraping = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);

  const handleStartPipeline = async () => {
    setIsRunning(true);
    setPipelineResult(null);
    setProgress(null);
    
    try {
      const result = await runDailyPipeline((progressUpdate) => {
        setProgress(progressUpdate);
      });
      
      setPipelineResult(result);
      
      if (result.success) {
        toast({
          title: "Pipeline dokončen úspěšně!",
          description: `Vygenerován digest s ${result.articles.length} články za ${formatDuration(result.duration)}`,
        });
      } else {
        toast({
          title: "Pipeline dokončen s chybami",
          description: `Dokončeno za ${formatDuration(result.duration)}, ${result.errors.length} chyb`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error during pipeline:', error);
      toast({
        title: "Chyba v pipeline",
        description: "Nepodařilo se spustit pipeline",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
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

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Daily Digest Pipeline</h1>
        <p className="text-muted-foreground">
          Kompletní pipeline pro generování denního digestu s AI zpracováním a audio
        </p>
      </div>

      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Spuštění pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleStartPipeline} 
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Probíhá...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Spustit pipeline
                  </>
                )}
              </Button>
              
              {pipelineResult && (
                <div className="flex items-center gap-2 text-sm">
                  {pipelineResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={pipelineResult.success ? "text-green-600" : "text-red-600"}>
                    {pipelineResult.success ? "Úspěšně dokončeno" : "Dokončeno s chybami"}
                  </span>
                </div>
              )}
            </div>
            
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.message}</span>
                  <span>{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {pipelineResult && (
        <div className="space-y-6">
          {/* Digest Summary */}
          {pipelineResult.digest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-500" />
                  Denní Digest - {pipelineResult.digest.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {pipelineResult.digest.articlesCount} článků
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(pipelineResult.digest.audioDuration * 1000)} audio
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(pipelineResult.duration)} celkem
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">
                    {pipelineResult.digest.summary}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Volume2 className="h-4 w-4" />
                      Přehrát audio
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Stáhnout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processed Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Zpracované články ({pipelineResult.articles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineResult.articles.map((article, index) => (
                  <Card key={article.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{article.source}</Badge>
                            <Badge variant="secondary">{article.category}</Badge>
                            <Badge variant={article.sentiment === 'positive' ? 'default' : 'outline'}>
                              {article.sentiment}
                            </Badge>
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Volume2 className="h-4 w-4" />
                          {formatDuration(article.audioDuration * 1000)}
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Klíčové body:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {article.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Tagy:</h4>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {pipelineResult.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Chyby ({pipelineResult.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pipelineResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {isRunning && !pipelineResult && (
        <Card>
          <CardHeader>
            <CardTitle>Spouštím pipeline...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestScraping;
