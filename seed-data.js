import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xuschdhbuudskbtdzumr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c2NoZGhidXVkc2tidGR6dW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDg4NjAsImV4cCI6MjA2OTgyNDg2MH0.rB4vthe8nRMiAOv-cBottUn6HO8Fu3ng5-khOkXcAXU";

// Použijeme public key a budeme vytvářet data pro konkrétního uživatele
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Ukázkové zdroje zpráv
const sampleSources = [
  {
    name: "ČT24",
    url: "https://ct24.ceskatelevize.cz",
    category: "Všechny",
    is_active: true,
    created_by_user_id: "temp-user-id" // Bude nahrazeno skutečným user ID
  },
  {
    name: "iDNES.cz",
    url: "https://idnes.cz",
    category: "Všechny", 
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "Aktuálně.cz",
    url: "https://aktualne.cz",
    category: "Všechny",
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "Respekt",
    url: "https://respekt.cz",
    category: "Všechny",
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "Root.cz",
    url: "https://root.cz",
    category: "Technologie",
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "Lupa.cz",
    url: "https://lupa.cz",
    category: "Technologie",
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "iSport.cz",
    url: "https://isport.blesk.cz",
    category: "Sport",
    is_active: true,
    created_by_user_id: "temp-user-id"
  },
  {
    name: "Hospodářské noviny",
    url: "https://hn.cz",
    category: "Finance",
    is_active: true,
    created_by_user_id: "temp-user-id"
  }
];

// Ukázkové články
const sampleArticles = [
  {
    title: "Umělá inteligence revoluci v české zdravotnictví",
    summary: "České nemocnice začínají implementovat AI systémy pro diagnostiku. Nové technologie mohou významně zrychlit a zpřesnit diagnostické procesy, zejména v oblasti onkologie a radiologie. Pilotní projekt probíhá ve Fakultní nemocnici Motol a ukazuje slibné výsledky.",
    category: "Technologie",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hodiny zpět
    original_url: "https://ct24.ceskatelevize.cz/domaci/ai-ve-zdravotnictvi",
    source_id: null // Bude nastaveno později
  },
  {
    title: "Nový rekord v exportu českých technologií",
    summary: "České technologické společnosti loni vyvezly zboží a služby v rekordní hodnotě 850 miliard korun. Největší podíl má automotive a IT sektor. Export roste zejména do zemí EU a USA, kde české firmy získávají nové kontrakty v oblasti software developmentu.",
    category: "Finance",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hodiny zpět
    original_url: "https://hn.cz/export-technologii-rekord",
    source_id: null
  },
  {
    title: "Česká hokejová reprezentace míří na mistrovství světa",
    summary: "Trenér Radim Rulík nominoval finální sestavu pro nadcházející mistrovství světa v hokeji. Tým povede kapitán Jan Kovář, nechybí ani hvězdy z NHL včetně Davida Pastrňáka. Přípravné zápasy ukázaly dobrou formu týmu, který bude patřit mezi favority turnaje.",
    category: "Sport", 
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hodin zpět
    original_url: "https://isport.blesk.cz/hokej-ms-nominace",
    source_id: null
  },
  {
    title: "Kybernetická bezpečnost v době AI",
    summary: "S růstem popularity umělé inteligence rostou i kybernetické hrozby. Experti varují před novými typy útoků využívajícími AI pro vytváření sofistikovaných phishingových kampaní. České úřady připravují novou strategii kybernetické bezpečnosti na roky 2024-2028.",
    category: "Technologie",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hodin zpět
    original_url: "https://root.cz/kyberneticka-bezpecnost-ai",
    source_id: null
  },
  {
    title: "Zelená transformace českého průmyslu",
    summary: "České firmy investují rekordní částky do zeleného přechodu. Automobilky přestavují výrobu na elektrická vozidla, energetické společnosti staví nové obnovitelné zdroje. EU poskytuje na transformaci dotace v řádu stovek miliard korun.",
    category: "Finance",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hodin zpět
    original_url: "https://aktualne.cz/zelena-transformace-prumysl",
    source_id: null
  },
  {
    title: "Nová éra mobilních plateb v Česku",
    summary: "Český trh s mobilními platbami zaznamenal v loňském roce růst o 45%. Nejpopulárnější jsou bezkontaktní platby přes smartphone. Banky spouštějí nové služby zahrnující platby pomocí QR kódů a integraci s e-commerce platformami.",
    category: "Finance",
    published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hodin zpět
    original_url: "https://idnes.cz/mobilni-platby-rust",
    source_id: null
  },
  {
    title: "Čeští vývojáři vytvořili revoluční zdravotnickou aplikaci",
    summary: "Startup z Brna uvedl na trh aplikaci pro vzdálené monitorování pacientů s chronickými onemocněními. Systém využívá AI pro predikci zdravotních komplikací a automaticky upozorňuje lékaře na rizikové stavy. Aplikace již získala certifikaci pro použití v EU.",
    category: "Technologie",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 den zpět
    original_url: "https://lupa.cz/zdravotnicka-aplikace-ai",
    source_id: null
  },
  {
    title: "Česká fotbalová liga přináší technologické inovace",
    summary: "Fortuna Liga zavádí nejmodernější VAR systém v Evropě. Nová technologie umožní ještě přesnější rozhodování rozhodčích. Kromě toho liga testuje AI systémy pro analýzu hráčského výkonu a prevenci zranění.",
    category: "Sport",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hodin zpět
    original_url: "https://isport.blesk.cz/fotbal-var-technologie",
    source_id: null
  }
];

async function seedDatabase(userId = null) {
  try {
    console.log('🌱 Začínám nahrávání ukázkových dat...');

    // 1. Použijeme předaný user ID nebo vytvoříme dočasné data
    let targetUserId = userId;
    
    if (!targetUserId) {
      console.log('⚠️  Není zadán user ID.');
      console.log('   Spusťte skript s parametrem: node seed-data.js YOUR_USER_ID');
      console.log('   Nebo použijeme dočasný ID pro demonstraci...');
      targetUserId = '00000000-0000-0000-0000-000000000000'; // Dočasné ID
    }

    console.log(`👤 Použiji user ID: ${targetUserId}`);

    // 2. Nahraju zdroje
    console.log('📰 Nahrávám zdroje zpráv...');
    const sourcesToInsert = sampleSources.map(source => ({
      ...source,
      created_by_user_id: targetUserId
    }));

    const { data: insertedSources, error: sourcesError } = await supabase
      .from('sources')
      .insert(sourcesToInsert)
      .select();

    if (sourcesError) {
      console.error('❌ Chyba při nahrávání zdrojů:', sourcesError);
      return;
    }

    console.log(`✅ Úspěšně nahráno ${insertedSources.length} zdrojů`);

    // 3. Namapuju zdroje podle názvu pro články
    const sourceMap = {};
    insertedSources.forEach(source => {
      sourceMap[source.name] = source.id;
    });

    // 4. Nahraju články s referencemi na zdroje
    console.log('📄 Nahrávám články...');
    const articlesToInsert = sampleArticles.map(article => {
      let sourceId = null;
      
      // Namapuj článek na správný zdroj podle URL nebo kategorie
      if (article.original_url.includes('ct24')) {
        sourceId = sourceMap['ČT24'];
      } else if (article.original_url.includes('idnes')) {
        sourceId = sourceMap['iDNES.cz'];
      } else if (article.original_url.includes('aktualne')) {
        sourceId = sourceMap['Aktuálně.cz'];
      } else if (article.original_url.includes('root')) {
        sourceId = sourceMap['Root.cz'];
      } else if (article.original_url.includes('lupa')) {
        sourceId = sourceMap['Lupa.cz'];
      } else if (article.original_url.includes('isport')) {
        sourceId = sourceMap['iSport.cz'];
      } else if (article.original_url.includes('hn.cz')) {
        sourceId = sourceMap['Hospodářské noviny'];
      }
      
      return {
        ...article,
        source_id: sourceId
      };
    });

    const { data: insertedArticles, error: articlesError } = await supabase
      .from('articles')
      .insert(articlesToInsert)
      .select();

    if (articlesError) {
      console.error('❌ Chyba při nahrávání článků:', articlesError);
      return;
    }

    console.log(`✅ Úspěšně nahráno ${insertedArticles.length} článků`);

    // 5. Vytvořím ukázkové user_article_status záznamy
    console.log('👤 Vytvářím stav článků pro uživatele...');
    const userArticleStatuses = insertedArticles.slice(0, 5).map(article => ({
      user_id: targetUserId,
      article_id: article.id,
      is_read: Math.random() > 0.5, // Náhodně označím některé jako přečtené
      is_selected_for_audio: Math.random() > 0.7, // Náhodně označím některé pro audio
      read_at: Math.random() > 0.5 ? new Date().toISOString() : null,
      selected_at: Math.random() > 0.7 ? new Date().toISOString() : null
    }));

    const { error: statusError } = await supabase
      .from('user_article_status')
      .insert(userArticleStatuses);

    if (statusError) {
      console.error('❌ Chyba při vytváření stavů článků:', statusError);
      return;
    }

    console.log(`✅ Úspěšně vytvořeno ${userArticleStatuses.length} stavů článků`);

    console.log('\n🎉 Ukázková data byla úspěšně nahrána!');
    console.log('\n📊 Shrnutí:');
    console.log(`   • Zdroje: ${insertedSources.length}`);
    console.log(`   • Články: ${insertedArticles.length}`);
    console.log(`   • Stavy článků: ${userArticleStatuses.length}`);
    console.log(`   • User ID: ${targetUserId}`);
    
  } catch (error) {
    console.error('💥 Neočekávaná chyba:', error);
  }
}

// Spuštění
const userIdArg = process.argv[2];
seedDatabase(userIdArg);
