import { useState } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

const COLORS = [
  { id: 'yellow', label: 'Sarı', bg: 'bg-amber-400', ring: 'ring-amber-400' },
  { id: 'cyan', label: 'Camgöbeği', bg: 'bg-cyan-400', ring: 'ring-cyan-400' },
  { id: 'pink', label: 'Pembe', bg: 'bg-pink-400', ring: 'ring-pink-400' },
  { id: 'purple', label: 'Mor', bg: 'bg-purple-400', ring: 'ring-purple-400' },
  { id: 'emerald', label: 'Zümrüt', bg: 'bg-emerald-400', ring: 'ring-emerald-400' },
  { id: 'amber', label: 'Turuncu', bg: 'bg-orange-400', ring: 'ring-orange-400' }
];

export function NoteForm({ onSubmit, isSubmitting }) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [error, setError] = useState('');

  const charCount = content.length;
  const isOverLimit = charCount > 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Lütfen bir şeyler yaz! Boş not bırakamazsın.');
      return;
    }

    if (content.trim().length > 100) {
      setError('Not en fazla 100 karakter olabilir.');
      return;
    }

    const success = await onSubmit(content.trim(), color);
    if (success) {
      setContent('');
      setColor('yellow');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-cyan-950/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Duvara Bir Not Bırak</h3>
        </div>
        <div
          className={`text-xs font-mono font-medium ${
            isOverLimit
              ? 'text-rose-400 font-bold'
              : charCount > 80
              ? 'text-amber-400'
              : 'text-slate-400'
          }`}
        >
          {charCount} / 100
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');
          }}
          placeholder="Aklından ne geçiyor? Bir itiraf, motivasyon sözü veya selam..."
          maxLength={110}
          className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm leading-relaxed transition-all resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Color Selection & Submit Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Renk:</span>
          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer ${
                  color === c.id
                    ? `scale-125 ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} shadow-md`
                    : 'opacity-60 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || isOverLimit}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Gönderiliyor...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Duvara Yapıştır (POST 201)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
