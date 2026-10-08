import { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles } from 'lucide-react';

const COLORS = [
  { id: 'yellow', label: 'Sarı', bg: 'bg-amber-400', border: 'border-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' },
  { id: 'cyan', label: 'Camgöbeği', bg: 'bg-cyan-400', border: 'border-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]' },
  { id: 'pink', label: 'Pembe', bg: 'bg-pink-400', border: 'border-pink-400', glow: 'shadow-[0_0_20px_rgba(244,114,182,0.3)]' },
  { id: 'purple', label: 'Mor', bg: 'bg-purple-400', border: 'border-purple-400', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.3)]' },
  { id: 'emerald', label: 'Yeşil', bg: 'bg-emerald-400', border: 'border-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]' },
  { id: 'amber', label: 'Turuncu', bg: 'bg-orange-400', border: 'border-orange-400', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]' }
];

export function ClickNoteCreator({ position, onSubmit, onClose, isSubmitting }) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus textarea immediately
    textareaRef.current?.focus();

    // Escape listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeColor = COLORS.find((c) => c.id === color) || COLORS[0];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      setError('Boş not bırakamazsın.');
      return;
    }
    if (content.trim().length > 100) {
      setError('En fazla 100 karakter olabilir.');
      return;
    }
    await onSubmit(content.trim(), color);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Bounds adjustment to stay within window
  const panelWidth = 280;
  const panelHeight = 220;
  const safeLeft = Math.min(Math.max(16, position.x - panelWidth / 2), window.innerWidth - panelWidth - 24);
  const safeTop = Math.min(Math.max(70, position.y - panelHeight / 2), window.innerHeight - panelHeight - 24);

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${safeLeft}px`, top: `${safeTop}px` }}
      className={`fixed z-50 w-[280px] p-4 rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl transition-all duration-200 animate-in zoom-in-95 fade-in ${activeColor.border} ${activeColor.glow}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Buraya Not Bırak</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={3}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        maxLength={100}
        placeholder="Aklındakini yaz... (Enter ile gönder)"
        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 resize-none leading-relaxed"
      />

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
        {/* Color buttons */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={`w-4 h-4 rounded-full ${c.bg} transition-all cursor-pointer ${
                color === c.id ? 'scale-125 ring-2 ring-white/80' : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <span className={`text-[10px] font-mono ${content.length > 90 ? 'text-rose-400' : 'text-slate-500'}`}>
          {content.length}/100
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Vazgeç
        </button>
        <button
          type="button"
          disabled={isSubmitting || !content.trim()}
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-md"
        >
          <Send className="w-3 h-3" />
          <span>Yapıştır</span>
        </button>
      </div>
    </div>
  );
}
