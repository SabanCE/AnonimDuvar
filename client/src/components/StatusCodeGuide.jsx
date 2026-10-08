import { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Check, ShieldAlert, AlertTriangle } from 'lucide-react';

export function StatusCodeGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const CODES = [
    {
      code: '200 OK',
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30',
      icon: <Check className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'GET /api/posts ile son 20 not listelenirken ve POST /api/posts/:id/like ile beğeni eklenirken döner.'
    },
    {
      code: '201 Created',
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30',
      icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
      desc: 'POST /api/posts isteği ile duvara başarıyla yeni bir kart/not kaydedildiğinde döner.'
    },
    {
      code: '400 Bad Request',
      color: 'border-rose-500/40 text-rose-300 bg-rose-950/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      desc: 'Not içeriği boş gönderildiğinde veya 100 karakter sınırını aştığında geri çevrilir.'
    },
    {
      code: '429 Too Many Requests',
      color: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Kullanıcı kısa sürede çok fazla not atmaya çalışırsa (spam koruması) Node.js isteği engeller.'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 px-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 text-xs text-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">API Durum Kodları Mimarisi (200, 201, 400, 429)</span>
          <span className="hidden sm:inline text-slate-500">• Gerçek Dünya Senaryosu</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
          <span>{isOpen ? 'Gizle' : 'Detayları İncele'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          {CODES.map((c) => (
            <div key={c.code} className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {c.icon}
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${c.color}`}>
                  {c.code}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
