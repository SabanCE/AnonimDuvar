import { CheckCircle2, AlertTriangle, AlertCircle, X, ShieldAlert } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type, message, status } = toast;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        };
      case 'rate-limit':
        return {
          bg: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
        };
      case 'warning':
      case 'bad-request':
        return {
          bg: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-slate-900/90 border-slate-700 text-slate-200',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${style.bg}`}>
        {style.icon}
        <div className="flex-1 text-sm">
          {status && (
            <div className="mb-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${style.badge}`}>
                HTTP {status}
              </span>
            </div>
          )}
          <p className="font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
