import { useState } from 'react';
import { Heart, Pin, Clock } from 'lucide-react';

const COLOR_VARIANTS = {
  yellow: {
    border: 'border-amber-400/60 hover:border-amber-300',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    pin: 'text-amber-400',
    tag: 'bg-amber-400/10 text-amber-300 border-amber-400/20'
  },
  cyan: {
    border: 'border-cyan-400/60 hover:border-cyan-300',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]',
    pin: 'text-cyan-400',
    tag: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20'
  },
  pink: {
    border: 'border-pink-400/60 hover:border-pink-300',
    glow: 'shadow-[0_0_15px_rgba(244,114,182,0.15)] hover:shadow-[0_0_25px_rgba(244,114,182,0.25)]',
    pin: 'text-pink-400',
    tag: 'bg-pink-400/10 text-pink-300 border-pink-400/20'
  },
  purple: {
    border: 'border-purple-400/60 hover:border-purple-300',
    glow: 'shadow-[0_0_15px_rgba(192,132,252,0.15)] hover:shadow-[0_0_25px_rgba(192,132,252,0.25)]',
    pin: 'text-purple-400',
    tag: 'bg-purple-400/10 text-purple-300 border-purple-400/20'
  },
  emerald: {
    border: 'border-emerald-400/60 hover:border-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    pin: 'text-emerald-400',
    tag: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
  },
  amber: {
    border: 'border-orange-400/60 hover:border-orange-300',
    glow: 'shadow-[0_0_15px_rgba(251,146,60,0.15)] hover:shadow-[0_0_25px_rgba(251,146,60,0.25)]',
    pin: 'text-orange-400',
    tag: 'bg-orange-400/10 text-orange-300 border-orange-400/20'
  }
};

function formatTimeAgo(dateString) {
  if (!dateString) return 'Az önce';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} sa önce`;
  return `${Math.floor(diffInSeconds / 86400)} gün önce`;
}

export function NoteCard({ post, onLike }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const style = COLOR_VARIANTS[post.color] || COLOR_VARIANTS.yellow;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistik güncelleme
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    const result = await onLike(post.id || post._id);
    if (!result?.success) {
      // Başarısız olursa geri al
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    } else if (result.likes !== undefined) {
      setLikes(result.likes);
    }

    setTimeout(() => setIsLiking(false), 400);
  };

  return (
    <div
      className={`relative flex flex-col justify-between p-5 rounded-2xl border bg-slate-900/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.glow}`}
    >
      {/* Top Header: Pin & Time */}
      <div className="flex items-center justify-between mb-3">
        <Pin className={`w-4 h-4 ${style.pin} rotate-45`} />
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 my-2">
        <p className="text-slate-100 text-sm md:text-base font-medium leading-relaxed break-words whitespace-pre-wrap font-sans">
          "{post.content}"
        </p>
      </div>

      {/* Footer: Color Tag & Like Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${style.tag}`}>
          #{post.color || 'anonim'}
        </span>

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            hasLiked
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:text-white'
          }`}
          title="Bu notu beğen"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
            } ${isLiking ? 'scale-125' : ''}`}
          />
          <span className="font-mono">{likes}</span>
        </button>
      </div>
    </div>
  );
}
