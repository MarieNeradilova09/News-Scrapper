-- SQL skript pro nahrání ukázkových dat do databáze
-- Spusťte tento skript v Supabase SQL editoru

-- Nejprve vložíme ukázkové články (bez vazby na zdroje)
INSERT INTO public.articles (title, summary, category, published_at, original_url, source_id) VALUES
('Umělá inteligence revoluci v české zdravotnictví', 
 'České nemocnice začínají implementovat AI systémy pro diagnostiku. Nové technologie mohou významně zrychlit a zpřesnit diagnostické procesy, zejména v oblasti onkologie a radiologie. Pilotní projekt probíhá ve Fakultní nemocnici Motol a ukazuje slibné výsledky.',
 'Technologie',
 NOW() - INTERVAL '2 hours',
 'https://ct24.ceskatelevize.cz/domaci/ai-ve-zdravotnictvi',
 NULL),

('Nový rekord v exportu českých technologií',
 'České technologické společnosti loni vyvezly zboží a služby v rekordní hodnotě 850 miliard korun. Největší podíl má automotive a IT sektor. Export roste zejména do zemí EU a USA, kde české firmy získávají nové kontrakty v oblasti software developmentu.',
 'Finance',
 NOW() - INTERVAL '4 hours',
 'https://hn.cz/export-technologii-rekord',
 NULL),

('Česká hokejová reprezentace míří na mistrovství světa',
 'Trenér Radim Rulík nominoval finální sestavu pro nadcházející mistrovství světa v hokeji. Tým povede kapitán Jan Kovář, nechybí ani hvězdy z NHL včetně Davida Pastrňáka. Přípravné zápasy ukázaly dobrou formu týmu, který bude patřit mezi favority turnaje.',
 'Sport',
 NOW() - INTERVAL '6 hours',
 'https://isport.blesk.cz/hokej-ms-nominace',
 NULL),

('Kybernetická bezpečnost v době AI',
 'S růstem popularity umělé inteligence rostou i kybernetické hrozby. Experti varují před novými typy útoků využívajícími AI pro vytváření sofistikovaných phishingových kampaní. České úřady připravují novou strategii kybernetické bezpečnosti na roky 2024-2028.',
 'Technologie',
 NOW() - INTERVAL '8 hours',
 'https://root.cz/kyberneticka-bezpecnost-ai',
 NULL),

('Zelená transformace českého průmyslu',
 'České firmy investují rekordní částky do zeleného přechodu. Automobilky přestavují výrobu na elektrická vozidla, energetické společnosti staví nové obnovitelné zdroje. EU poskytuje na transformaci dotace v řádu stovek miliard korun.',
 'Finance',
 NOW() - INTERVAL '12 hours',
 'https://aktualne.cz/zelena-transformace-prumysl',
 NULL),

('Nová éra mobilních plateb v Česku',
 'Český trh s mobilními platbami zaznamenal v loňském roce růst o 45%. Nejpopulárnější jsou bezkontaktní platby přes smartphone. Banky spouštějí nové služby zahrnující platby pomocí QR kódů a integraci s e-commerce platformami.',
 'Finance',
 NOW() - INTERVAL '18 hours',
 'https://idnes.cz/mobilni-platby-rust',
 NULL),

('Čeští vývojáři vytvořili revoluční zdravotnickou aplikaci',
 'Startup z Brna uvedl na trh aplikaci pro vzdálené monitorování pacientů s chronickými onemocněními. Systém využívá AI pro predikci zdravotních komplikací a automaticky upozorňuje lékaře na rizikové stavy. Aplikace již získala certifikaci pro použití v EU.',
 'Technologie',
 NOW() - INTERVAL '24 hours',
 'https://lupa.cz/zdravotnicka-aplikace-ai',
 NULL),

('Česká fotbalová liga přináší technologické inovace',
 'Fortuna Liga zavádí nejmodernější VAR systém v Evropě. Nová technologie umožní ještě přesnější rozhodování rozhodčích. Kromě toho liga testuje AI systémy pro analýzu hráčského výkonu a prevenci zranění.',
 'Sport',
 NOW() - INTERVAL '30 hours',
 'https://isport.blesk.cz/fotbal-var-technologie',
 NULL);

-- Zobrazíme počet vložených článků
SELECT COUNT(*) as "Počet článků" FROM public.articles;
