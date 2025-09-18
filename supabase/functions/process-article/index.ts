import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { url, category } = await req.json();
    console.log('Processing article:', { url, category });

    if (!url || !category) {
      return new Response(
        JSON.stringify({ error: 'URL and category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the webpage content
    let title = '';
    let summary = '';
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract title from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
      
      // Extract meta description for summary
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      summary = descMatch ? descMatch[1].trim() : `Článek z webu ${new URL(url).hostname}`;
      
      // If no description found, try to extract first paragraph
      if (!descMatch) {
        const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
        if (pMatch) {
          summary = pMatch[1].trim().substring(0, 200) + '...';
        }
      }
    } catch (fetchError) {
      console.error('Error fetching article content:', fetchError);
      // Use fallback values
      title = new URL(url).hostname;
      summary = `Článek z webu ${new URL(url).hostname}`;
    }

    // Find or create dummy source
    const dummySourceName = 'Manuálně přidané články';
    let sourceId;

    const { data: existingSource } = await supabase
      .from('sources')
      .select('id')
      .eq('name', dummySourceName)
      .eq('created_by_user_id', user.id)
      .single();

    if (existingSource) {
      sourceId = existingSource.id;
    } else {
      const { data: newSource, error: sourceError } = await supabase
        .from('sources')
        .insert({
          name: dummySourceName,
          url: 'manual',
          category: category,
          created_by_user_id: user.id
        })
        .select('id')
        .single();

      if (sourceError) {
        console.error('Error creating dummy source:', sourceError);
        return new Response(
          JSON.stringify({ error: 'Failed to create source' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      sourceId = newSource.id;
    }

    // Save article to database
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        summary,
        category,
        original_url: url,
        source_id: sourceId,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (articleError) {
      console.error('Error saving article:', articleError);
      return new Response(
        JSON.stringify({ error: 'Failed to save article' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Article processed successfully:', article);

    return new Response(
      JSON.stringify({ success: true, article }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-article function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});