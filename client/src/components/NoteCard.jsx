import { useState } from 'react';
import { Heart, Pin, Trash2 } from 'lucide-react';

const COLOR_VARIANTS = {
  yellow: {
    border: 'border-amber-400/50 hover:border-amber-300',
    glow: 'shadow-[0_4px_20px_rgba(251,191,36,0.12)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.3)]',
    bg: 'bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-amber-400',
    accent: 'text-amber-300'
  },
  cyan: {
    border: 'border-cyan-400/50 hover:border-cyan-300',
    glow: 'shadow-[0_4px_20px_rgba(34,211,238,0.12)] hover:shadow-[0_8px_30px_rgba(34,211,238,0.3)]',
    bg: 'bg-gradient-to-b from-cyan-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-cyan-400',
    accent: 'text-cyan-300'
  },
  pink: {
    border: 'border-pink-400/50 hover:border-pink-300',
    glow: 'shadow-[0_4px_20px_rgba(244,114,182,0.12)] hover:shadow-[0_8px_30px_rgba(244,114,182,0.3)]',
    bg: 'bg-gradient-to-b from-pink-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-pink-400',
    accent: 'text-pink-300'
  },
  purple: {
    border: 'border-purple-400/50 hover:border-purple-300',
    glow: 'shadow-[0_4px_20px_rgba(192,132,252,0.12)] hover:shadow-[0_8px_30px_rgba(192,132,252,0.3)]',
    bg: 'bg-gradient-to-b from-purple-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-purple-400',
    accent: 'text-purple-300'
  },
  emerald: {
    border: 'border-emerald-400/50 hover:border-emerald-300',
    glow: 'shadow-[0_4px_20px_rgba(52,211,153,0.12)] hover:shadow-[0_8px_30px_rgba(52,211,153,0.3)]',
    bg: 'bg-gradient-to-b from-emerald-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-emerald-400',
    accent: 'text-emerald-300'
  },
  amber: {
    border: 'border-orange-400/50 hover:border-orange-300',
    glow: 'shadow-[0_4px_20px_rgba(251,146,60,0.12)] hover:shadow-[0_8px_30px_rgba(251,146,60,0.3)]',
    bg: 'bg-gradient-to-b from-orange-500/10 via-slate-900/80 to-slate-950/90',
    pin: 'text-orange-400',
    accent: 'text-orange-300'
  }
};

function formatTimeAgo(dateString) {
  if (!dateString) return 'Az önce';
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
  return `${Math.floor(diff / 86400)}g`;
}

export function NoteCard({ post, onLike, onDelete, isAbsolute = false }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const style = COLOR_VARIANTS[post.color] || COLOR_VARIANTS.yellow;
  const rotation = typeof post.rotation === 'number' ? post.rotation : 0;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking || isDeleting) return;
    setIsLiking(true);

    setLikes((prev) => prev + 1);
    setHasLiked(true);

    const result = await onLike(post.id || post._id);
    if (!result?.success) {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    } else if (result.likes !== undefined) {
      setLikes(result.likes);
    }

    setTimeout(() => setIsLiking(false), 300);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;
    if (window.confirm('Bu notunu duvardan silmek istediğine emin misin?')) {
      setIsDeleting(true);
      await onDelete(post.id || post._id);
    }
  };

  const cardStyle = isAbsolute && typeof post.posX === 'number' && typeof post.posY === 'number'
    ? {
        position: 'absolute',
        left: `${post.posX}%`,
        top: `${post.posY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`
      }
    : {
        transform: `rotate(${rotation}deg)`
      };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={cardStyle}
      className={`group relative w-[230px] sm:w-[250px] p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-40 cursor-default select-none ${style.bg} ${style.border} ${style.glow} ${
        isDeleting ? 'opacity-40 pointer-events-none scale-95' : ''
      }`}
    >
      {/* Top Pin, Time & Delete button */}
      <div className="flex items-center justify-between mb-2">
        <Pin className={`w-3.5 h-3.5 ${style.pin} rotate-45 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none`} />
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono">
            {formatTimeAgo(post.createdAt)}
          </span>

          {/* Sadece bu notu oluşturan kişiye silme butonu gösterilir */}
          {post.isOwner && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Notumu Sil (DELETE 200 / 403)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-100 text-xs sm:text-sm font-medium leading-relaxed my-2 break-words whitespace-pre-wrap min-h-[48px]">
        "{post.content}"
      </p>

      {/* Bottom Like & Color tag */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] uppercase font-mono tracking-wider ${style.accent} opacity-80`}>
            #{post.color || 'not'}
          </span>
          {post.isOwner && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono">
              senin
            </span>
          )}
        </div>

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            hasLiked
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
          }`}
          title="Beğen"
        >
          <Heart
            className={`w-3 h-3 transition-transform ${
              hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
            } ${isLiking ? 'scale-125' : ''}`}
          />
          <span className="font-mono text-[11px]">{likes}</span>
        </button>
      </div>
    </div>
  );
}
