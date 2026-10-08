import { useState, useEffect, useRef } from 'react';
import { Send, X, Pin } from 'lucide-react';

const COLORS = [
  { id: 'yellow', label: 'Sarı', bg: 'bg-[#fef9c3]', adhesive: 'border-t-[#fde047]', text: 'text-[#362b0d]', dot: 'bg-[#fde047]' },
  { id: 'cyan', label: 'Mavi', bg: 'bg-[#e0f2fe]', adhesive: 'border-t-[#7dd3fc]', text: 'text-[#0c2f42]', dot: 'bg-[#7dd3fc]' },
  { id: 'pink', label: 'Pembe', bg: 'bg-[#fce7f3]', adhesive: 'border-t-[#f472b6]', text: 'text-[#481229]', dot: 'bg-[#f472b6]' },
  { id: 'purple', label: 'Lila', bg: 'bg-[#f3e8ff]', adhesive: 'border-t-[#c084fc]', text: 'text-[#321356]', dot: 'bg-[#c084fc]' },
  { id: 'emerald', label: 'Yeşil', bg: 'bg-[#dcfce7]', adhesive: 'border-t-[#86efac]', text: 'text-[#0e351b]', dot: 'bg-[#86efac]' },
  { id: 'amber', label: 'Turuncu', bg: 'bg-[#ffedd5]', adhesive: 'border-t-[#fb923c]', text: 'text-[#3d1a0d]', dot: 'bg-[#fb923c]' }
];

export function ClickNoteCreator({ position, onSubmit, onClose, isSubmitting }) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();

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

  const panelWidth = 280;
  const panelHeight = 220;
  const safeLeft = Math.min(Math.max(16, position.x - panelWidth / 2), window.innerWidth - panelWidth - 24);
  const safeTop = Math.min(Math.max(70, position.y - panelHeight / 2), window.innerHeight - panelHeight - 24);

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${safeLeft}px`, top: `${safeTop}px` }}
      className={`fixed z-50 w-[280px] p-4 pt-5 rounded-sm border-t-[10px] ${activeColor.adhesive} ${activeColor.bg} ${activeColor.text} sticky-paper-shadow transition-all duration-200 animate-in zoom-in-95 fade-in`}
    >
      {/* 3D Pushpin */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-red-400 shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-black/20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 -mt-0.5 -ml-0.5" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-xs font-bold opacity-80">
          <Pin className="w-3.5 h-3.5 rotate-45" />
          <span>Yeni Not Yaz</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1 text-black/50 hover:text-black hover:bg-black/5 rounded transition-colors cursor-pointer"
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
        placeholder="Buraya notunu yaz... (Enter ile yapıştır)"
        className="w-full p-2.5 rounded border border-black/15 bg-white/50 text-slate-900 placeholder-black/40 text-xs font-semibold focus:outline-none focus:border-black/30 resize-none leading-relaxed"
      />

      {error && <p className="text-[11px] text-red-700 font-bold mt-1">{error}</p>}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10">
        {/* Color buttons */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={`w-4 h-4 rounded-full ${c.dot} shadow-sm transition-all cursor-pointer ${
                color === c.id ? 'scale-125 ring-2 ring-black/70' : 'opacity-60 hover:opacity-100'
              }`}
              title={c.label}
            />
          ))}
        </div>

        {/* Counter */}
        <span className={`text-[10px] font-mono font-bold ${content.length > 90 ? 'text-red-700' : 'opacity-60'}`}>
          {content.length}/100
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 text-xs font-bold text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          Vazgeç
        </button>
        <button
          type="button"
          disabled={isSubmitting || !content.trim()}
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-40 transition-all cursor-pointer shadow-md"
        >
          <Send className="w-3 h-3" />
          <span>İğnele</span>
        </button>
      </div>
    </div>
  );
}
