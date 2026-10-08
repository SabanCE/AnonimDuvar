import { useState, useEffect } from 'react';
import { Sparkles, Activity, ShieldCheck, Heart } from 'lucide-react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API health check error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Anonim Dijital Duvar
              </h1>
              <p className="text-xs text-slate-400">Digital Graffiti & Capsule Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
              <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              {loading ? 'Bağlanıyor...' : health ? 'Backend Aktif (200 OK)' : 'Backend Bekleniyor'}
            </span>
          </div>
        </div>
      </header>

      {/* Hero / Starter Placeholder */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/30 text-fuchsia-300 text-xs mb-6">
          <ShieldCheck className="w-4 h-4" />
          Adım 1 Başarıyla Tamamlandı: Mimari & Çalışma Alanı Kuruldu
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Duygularını, Düşüncelerini ve Notlarını{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            Anonim Olarak Paylaş
          </span>
        </h2>

        <p className="mt-4 text-slate-400 max-w-xl text-base">
          Giriş yapmaya gerek yok. Bir kart seç, notunu yapıştır ve duvardaki diğer insanların fikirlerini beğen!
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl text-left">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 font-semibold text-sm mb-1">⚡ 200 OK & 201 Created</div>
            <p className="text-xs text-slate-400">Hızlı veri akışı, gerçek zamanlı not listeleme ve anlık kart oluşturma.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-fuchsia-500/40 transition-all">
            <div className="text-fuchsia-400 font-semibold text-sm mb-1">🛡️ 400 Bad Request & 429 Too Many</div>
            <p className="text-xs text-slate-400">Akıllı doğrulama ve IP tabanlı spam koruyucu rate limiter mimarisi.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-rose-500/40 transition-all">
            <div className="text-rose-400 font-semibold text-sm mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Beğeni Etkileşimi
            </div>
            <p className="text-xs text-slate-400">Kartlara tek tıkla beğeni bırakabilme ve canlı sayaç göstergesi.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Anonim Dijital Duvar • Node.js + Express + MongoDB Atlas + React
      </footer>
    </div>
  );
}

export default App;
