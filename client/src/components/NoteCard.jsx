import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';

const STICKY_COLORS = {
  yellow: {
    bg: 'bg-[#fef9c3]',
    adhesive: 'border-t-[#fde047]',
    text: 'text-[#362b0d]',
    accent: 'text-[#715414]',
    tag: 'bg-[#fef08a]/80 text-[#543d0c]',
    pin: 'from-rose-600 via-rose-500 to-red-400'
  },
  cyan: {
    bg: 'bg-[#e0f2fe]',
    adhesive: 'border-t-[#7dd3fc]',
    text: 'text-[#0c2f42]',
    accent: 'text-[#164e63]',
    tag: 'bg-[#bae6fd]/80 text-[#0c3a52]',
    pin: 'from-amber-600 via-amber-500 to-yellow-400'
  },
  pink: {
    bg: 'bg-[#fce7f3]',
    adhesive: 'border-t-[#f472b6]',
    text: 'text-[#481229]',
    accent: 'text-[#701a3d]',
    tag: 'bg-[#fbcfe8]/80 text-[#5c1333]',
    pin: 'from-sky-600 via-sky-500 to-cyan-400'
  },
  purple: {
    bg: 'bg-[#f3e8ff]',
    adhesive: 'border-t-[#c084fc]',
    text: 'text-[#321356]',
    accent: 'text-[#581c87]',
    tag: 'bg-[#e9d5ff]/80 text-[#431475]',
    pin: 'from-emerald-600 via-emerald-500 to-green-400'
  },
  emerald: {
    bg: 'bg-[#dcfce7]',
    adhesive: 'border-t-[#86efac]',
    text: 'text-[#0e351b]',
    accent: 'text-[#14532d]',
    tag: 'bg-[#bbf7d0]/80 text-[#114522]',
    pin: 'from-red-600 via-red-500 to-rose-400'
  },
  amber: {
    bg: 'bg-[#ffedd5]',
    adhesive: 'border-t-[#fb923c]',
    text: 'text-[#3d1a0d]',
    accent: 'text-[#7c2d12]',
    tag: 'bg-[#fed7aa]/80 text-[#52210e]',
    pin: 'from-blue-600 via-blue-500 to-sky-400'
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
  const [hasLiked, setHasLiked] = useState(Boolean(post.hasLiked));

  // Sync if post prop changes
  useEffect(() => {
    setLikes(post.likes || 0);
    setHasLiked(Boolean(post.hasLiked));
  }, [post.likes, post.hasLiked]);

  const style = STICKY_COLORS[post.color] || STICKY_COLORS.yellow;
  const rotation = typeof post.rotation === 'number' ? post.rotation : 0;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking || isDeleting || hasLiked) return;
    setIsLiking(true);

    // Optimistik güncelleme
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
    if (window.confirm('Bu notunu tahtadan kaldırmak istediğine emin misin?')) {
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
      className={`group relative w-[230px] sm:w-[250px] p-5 pt-6 rounded-sm border-t-[10px] ${style.adhesive} ${style.bg} ${style.text} sticky-paper-shadow transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-40 cursor-default select-none ${
        isDeleting ? 'opacity-40 pointer-events-none scale-95' : ''
      }`}
    >
      {/* 3D Pushpin (Raptiye) at top center */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${style.pin} shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-black/20 flex items-center justify-center`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 -mt-0.5 -ml-0.5" />
        </div>
      </div>

      {/* Top Bar: Time & Delete */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-mono tracking-tight font-medium ${style.accent} opacity-75`}>
          {formatTimeAgo(post.createdAt)}
        </span>

        {/* Delete button (Owner only) */}
        {post.isOwner && (
          <button
            onClick={handleDelete}
            className="p-1 rounded text-red-900/60 hover:text-red-700 hover:bg-black/5 transition-colors cursor-pointer"
            title="Notumu Tahtadan Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Note Content */}
      <p className="font-sans text-xs sm:text-sm font-semibold leading-relaxed my-2 break-words whitespace-pre-wrap min-h-[52px]">
        "{post.content}"
      </p>

      {/* Bottom Bar: Like Button & Owner Tag */}
      <div className="mt-4 pt-2.5 border-t border-black/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {post.isOwner && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${style.tag}`}>
              senin
            </span>
          )}
        </div>

        {/* Like Button (1 like per user limit) */}
        <button
          onClick={handleLike}
          disabled={isLiking || hasLiked}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            hasLiked
              ? 'bg-rose-500/20 text-rose-700 cursor-default shadow-sm'
              : 'bg-black/5 hover:bg-black/10 text-black/70 hover:text-black cursor-pointer'
          }`}
          title={hasLiked ? 'Bu notu zaten beğendiniz' : 'Beğen'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              hasLiked ? 'fill-rose-600 text-rose-600' : 'text-black/60'
            } ${isLiking ? 'scale-125' : ''}`}
          />
          <span className="font-mono text-xs">{likes}</span>
        </button>
      </div>
    </div>
  );
}
