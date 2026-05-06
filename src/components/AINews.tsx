import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Loader2, ExternalLink, BrainCircuit, Globe, Clock, Zap, Filter, ArrowDownUp, Cpu, ChevronRight, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  dateObj: Date;
  source: string;
  description: string;
  fullDescription: string;
  imageUrl?: string;
}

const NewsArticle = ({ item, featured = false }: { item: NewsItem, featured?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.fullDescription.length > (featured ? 250 : 120);
  
  // Fallback image using pollinations.ai to generate contextual images
  const generatePlaceholder = (title: string, isFeatured: boolean) => {
    const prompt = `Abstract sleek modern technology artificial intelligence news concept art representing: ${title}. High quality, digital art, dark tech theme.`;
    const width = isFeatured ? 800 : 400;
    const height = isFeatured ? 500 : 250;
    // We add a seed based on the title to keep the image consistent for the same article
    const seed = title.length;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
  };

  const currentImageUrl = item.imageUrl || generatePlaceholder(item.title, featured);

  return (
    <div className={`group flex flex-col bg-[var(--color-sys-bg)] border-2 border-[var(--color-sys-ink)] rounded-2xl shadow-[4px_4px_0_var(--color-sys-ink)] hover:shadow-[8px_8px_0_var(--color-sys-line)] hover:-translate-y-1 transition-all overflow-hidden ${featured ? 'md:flex-row md:col-span-2 lg:col-span-3' : ''}`}>
      {/* Image Container */}
      <div className={`relative ${featured ? 'md:w-1/2 lg:w-3/5 border-b-2 border-[var(--color-sys-ink)] md:border-b-0 md:border-r-2 min-h-[300px]' : 'w-full aspect-[16/10] border-b-2'} border-[var(--color-sys-ink)] bg-slate-900 overflow-hidden flex-shrink-0`}>
        <img 
          src={currentImageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback to a solid color or gradient if even pollinations fails
            target.src = `https://placehold.co/${featured ? '800x500' : '400x250'}/1e293b/FFFFFF/png?text=AI+News`;
          }}
        />
      </div>

      <div className={`flex flex-col p-6 sm:p-8 ${featured ? 'md:w-1/2 lg:w-2/5' : 'flex-1'} bg-[var(--color-sys-bg)]`}>
        {/* Category / Source Badge */}
        <div className="flex items-center flex-wrap gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] text-xs font-mono font-bold uppercase rounded-full tracking-wider hover:bg-amber-500 hover:text-[var(--color-sys-ink)] transition-colors">
            <Globe className="w-3.5 h-3.5" /> {item.source}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {item.pubDate.split(' - ')[1] || item.pubDate}
          </span>
        </div>

        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block mt-auto mb-5">
          <h3 className={`font-black tracking-tight group-hover:text-amber-600 transition-colors ${featured ? 'text-2xl sm:text-3xl lg:text-4xl leading-[1.1] md:leading-[1.1]' : 'text-xl leading-snug'}`}>
            {item.title}
          </h3>
        </a>
        
        <div className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
          <p className="whitespace-pre-wrap">
            {expanded ? item.fullDescription : item.description}
            {isLong && !expanded && <span>...</span>}
          </p>
          {isLong && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                setExpanded(!expanded);
              }}
              className="text-[var(--color-sys-ink)] hover:text-amber-600 font-bold mt-3 flex items-center gap-1 transition-colors uppercase text-xs tracking-wider font-mono border-b-2 border-transparent hover:border-amber-600 pb-0.5 w-fit"
            >
              {expanded ? 'Tutup Penuh' : 'Baca Selengkapnya'} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? '-rotate-90' : ''}`} />
            </button>
          )}
        </div>

        <div className="mt-auto pt-6 border-t-2 border-[var(--color-sys-ink)]/10 flex items-center justify-between">
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group/btn inline-flex items-center gap-2 bg-slate-100 hover:bg-[var(--color-sys-ink)] hover:text-[var(--color-sys-bg)] transition-colors px-4 py-2.5 text-sm font-bold rounded-xl text-[var(--color-sys-ink)] w-full justify-center sm:w-auto"
          >
            Buka Artikel <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export function AINews() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [modelUpdates, setModelUpdates] = useState<NewsItem[]>([]);
  const [careerNews, setCareerNews] = useState<NewsItem[]>([]);
  const [researchNews, setResearchNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterSource, setFilterSource] = useState('all');
  const [filterDateStr, setFilterDateStr] = useState('1d'); // 1d, 7d, 1m, 1y
  const [sortBy, setSortBy] = useState('relevance'); // relevance, dateDesc, dateAsc, source

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        const decodeHtml = (html: string) => {
          const txt = document.createElement("textarea");
          txt.innerHTML = html;
          return txt.value;
        };

        const extractImage = (htmlContent: string) => {
          const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
          return match ? match[1] : undefined;
        };

        const fetchFeed = async (query: string, limit: number) => {
           // We append 'when:' parameter separately since using 'when:1d' inside 'q' might be finicky but generally works.
          const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
          const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=`;
          
          const response = await fetch(apiUrl);
          if (!response.ok) return [];
          const data = await response.json();
          if (data.status !== 'ok') return [];
          
          return data.items.map((item: any) => {
            const fullDescRaw = decodeHtml((item.content || item.description || '').replace(/<[^>]+>/g, '')).trim();
            let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
            if (!imageUrl && (item.content || item.description)) {
              imageUrl = extractImage(item.content || item.description);
            }

            // Remove excessive source appending from title
            const cleanTitle = decodeHtml(item.title).split(' - ')[0];

            return {
              title: cleanTitle,
              link: item.link,
              dateObj: new Date(item.pubDate),
              pubDate: new Date(item.pubDate).toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit'
              }) + ' - ' + new Date(item.pubDate).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short'
              }),
              source: item.source || 'Google News',
              fullDescription: fullDescRaw,
              description: fullDescRaw.length > 200 ? fullDescRaw.substring(0, 200) + '...' : fullDescRaw,
              imageUrl
            };
          }).filter((i: any) => i.title).slice(0, limit);
        };

        const [mainArticles, models, careers, research] = await Promise.all([
          fetchFeed(`Artificial Intelligence OR machine learning when:${filterDateStr}`, 20),
          fetchFeed(`"AI model" OR "LLM" OR OpenAI OR Anthropic OR Gemini (release OR announcement) when:7d`, 5),
          fetchFeed(`("AI skills" OR "AI jobs" OR "prompt engineering") when:30d`, 4),
          fetchFeed(`"AI research" OR "AI breakthrough" OR "AI paper" when:14d`, 4)
        ]);

        if (mainArticles.length === 0 && models.length === 0) {
          throw new Error('Format feed tidak valid atau API limit hari ini tercapai. Coba refresh atau periksa nanti.');
        }

        setAllNews(mainArticles);
        setModelUpdates(models);
        setCareerNews(careers);
        setResearchNews(research);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat berita. Mungkin limit API tercapai.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [filterDateStr]);

  const displayedNews = useMemo(() => {
    let filtered = [...allNews];

    // Filter by Source
    if (filterSource !== 'all') {
      filtered = filtered.filter(item => item.source === filterSource);
    }

    // Sort
    if (sortBy === 'dateDesc') {
      filtered.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    } else if (sortBy === 'dateAsc') {
      filtered.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    } else if (sortBy === 'source') {
      filtered.sort((a, b) => a.source.localeCompare(b.source));
    }
    
    // Return max 13 (1 featured + 12 grid items)
    return filtered.slice(0, 13);
  }, [allNews, filterSource, sortBy]);

  const availableSources = useMemo(() => {
    const sources = Array.from(new Set(allNews.map(item => item.source)));
    sources.sort();
    return sources;
  }, [allNews]);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="mb-8 border-b-2 border-[var(--color-sys-ink)] pb-6 flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-6 group">
        <div className="inline-flex items-center justify-center p-3 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] rounded-2xl shadow-[4px_4px_0_var(--color-sys-line)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 ease-out shrink-0">
          <Newspaper className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase font-sans mb-2">
            AI News <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 via-orange-600 to-red-600">Frontline</span>
          </h1>
          <p className="text-[var(--color-sys-ink)] font-mono text-xs sm:text-sm max-w-4xl uppercase tracking-wider leading-relaxed font-bold opacity-80">
            Pembaruan Real-Time dari Garis Depan Revolusi Kecerdasan Buatan. 
            Fitur Baru, Tren Industri, dan Skill yang Paling Dicari.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Main News Feed (Left/Center) */}
        <div className="xl:col-span-8 flex flex-col space-y-10">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--color-sys-ink)] p-4 sm:p-6 rounded-2xl shadow-[6px_6px_0_var(--color-sys-line)] text-white">
            <div className="flex items-center gap-3 border-b-2 md:border-b-0 md:border-r-2 border-white/20 pb-4 md:pb-0 md:pr-6 whitespace-nowrap">
              <SlidersHorizontal className="w-6 h-6 text-amber-400" />
              <h2 className="text-lg space-x-2 font-bold font-mono tracking-widest uppercase">
                <span>Filter</span> <span className="text-white/50">Feed</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[120px] max-w-[200px]">
                <label className="text-[10px] font-bold font-mono uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Source
                </label>
                <div className="relative">
                  <select 
                    className="w-full text-sm font-bold border-2 border-white/20 rounded-xl px-4 py-2 bg-white/5 text-white focus:outline-none focus:bg-white focus:text-black appearance-none cursor-pointer transition-colors"
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                  >
                    <option value="all" className="text-black">All Sources</option>
                    {availableSources.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 flex-1 min-w-[120px] max-w-[200px]">
                <label className="text-[10px] font-bold font-mono uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Time Range
                </label>
                <select 
                  className="w-full text-sm font-bold border-2 border-white/20 rounded-xl px-4 py-2 bg-white/5 text-white focus:outline-none focus:bg-white focus:text-black appearance-none cursor-pointer transition-colors"
                  value={filterDateStr}
                  onChange={(e) => setFilterDateStr(e.target.value)}
                >
                  <option value="1d" className="text-black">Past 24 Hours</option>
                  <option value="7d" className="text-black">Past 7 Days</option>
                  <option value="1m" className="text-black">Past Month</option>
                  <option value="1y" className="text-black">Past Year</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[120px] max-w-[200px]">
                <label className="text-[10px] font-bold font-mono uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                  <ArrowDownUp className="w-3 h-3" /> Sort By
                </label>
                <select 
                  className="w-full text-sm font-bold border-2 border-white/20 rounded-xl px-4 py-2 bg-white/5 text-white focus:outline-none focus:bg-white focus:text-black appearance-none cursor-pointer transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance" className="text-black">Relevance</option>
                  <option value="dateDesc" className="text-black">Newest</option>
                  <option value="dateAsc" className="text-black">Oldest</option>
                  <option value="source" className="text-black">Source (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Articles Feed */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-amber-500 absolute top-0 left-0" />
                <Loader2 className="w-16 h-16 animate-[spin_2s_linear_infinite_reverse] text-[var(--color-sys-ink)] opacity-50 mix-blend-multiply" />
              </div>
              <p className="text-lg font-mono uppercase font-bold tracking-widest animate-pulse text-[var(--color-sys-ink)]">
                Fetching Mainframes...
              </p>
            </div>
          ) : error ? (
             <div className="p-8 border-4 border-[var(--color-sys-ink)] bg-red-100 text-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] font-mono text-center">
              <p className="font-black text-2xl uppercase tracking-widest mb-4">Critical Error</p>
              <p className="text-base font-medium leading-relaxed">{error}</p>
             </div>
          ) : displayedNews.length === 0 ? (
            <div className="p-16 border-4 border-dashed border-[var(--color-sys-ink)] rounded-2xl text-center bg-slate-50">
              <h3 className="font-mono font-black text-3xl uppercase tracking-wider text-[var(--color-sys-ink)] mb-4">Tidak Ada Berita</h3>
              <p className="text-lg font-medium text-slate-600">Terlalu banyak filter atau koneksi API tidak lancar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 content-start">
              {displayedNews.map((item, idx) => (
                <NewsArticle key={idx} item={item} featured={idx === 0} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info (Right) */}
        <div className="xl:col-span-4 space-y-10 xl:sticky xl:top-8 xl:h-fit self-start pb-10">
          
          {/* AI Model Updates / Radar */}
          <div className="bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] rounded-3xl p-1 relative overflow-hidden shadow-[8px_8px_0_var(--color-sys-line)]">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             <div className="bg-[var(--color-sys-ink)] rounded-[22px] p-6 lg:p-8 relative z-10 border border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black font-sans tracking-tighter uppercase leading-none">Model<br/><span className="text-emerald-400">Releases</span></h2>
                </div>
                <div className="space-y-6">
                  {modelUpdates.length === 0 ? (
                      <p className="text-white/50 text-sm font-mono animate-pulse">Menunggu data model terbaru...</p>
                    ) : modelUpdates.map((item, i) => (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:scale-150 transition-transform"></div>
                      <div className="flex flex-col gap-2">
                        <span className="font-sans font-bold text-base md:text-lg text-white group-hover:text-emerald-400 transition-colors leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-white/40">
                          {item.source} • {item.pubDate.split(' - ')[1] || item.pubDate}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
             </div>
          </div>

          {/* Careers & Skills News */}
          <div className="bg-amber-400 text-[var(--color-sys-ink)] p-6 lg:p-8 rounded-3xl shadow-[8px_8px_0_var(--color-sys-ink)] border-4 border-[var(--color-sys-ink)]">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-[var(--color-sys-ink)]">
              <BrainCircuit className="w-10 h-10 text-[var(--color-sys-ink)]" />
              <h2 className="text-2xl font-black font-sans tracking-tighter uppercase leading-none">Career &<br/>Skills</h2>
            </div>
            <div className="space-y-6">
              {careerNews.map((item, i) => (
                <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="block group">
                  <div className="flex flex-col gap-2.5">
                    <span className="font-sans font-black text-lg md:text-xl group-hover:underline underline-offset-4 decoration-2 transition-all leading-snug">
                      {item.title}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] uppercase font-mono font-bold tracking-widest opacity-60">
                        {item.source}
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Research & Breakthroughs */}
          <div className="bg-white border-2 border-[var(--color-sys-ink)] p-6 lg:p-8 rounded-3xl shadow-[8px_8px_0_var(--color-sys-ink)] relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000 group-hover:rotate-12 scale-150">
              <Zap className="w-64 h-64" />
            </div>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-200 relative z-10">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                 <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-sans tracking-tighter uppercase leading-none">Research<br/><span className="text-purple-600">Papers</span></h2>
            </div>
            <div className="space-y-8 relative z-10">
              {researchNews.map((item, i) => (
                <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="block group/item flex flex-col gap-3 border-l-4 border-slate-200 pl-4 hover:border-purple-600 transition-colors">
                  <h3 className="font-black text-lg group-hover/item:text-purple-700 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

