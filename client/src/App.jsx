import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Plus, MousePointerClick } from 'lucide-react';
import { postsApi } from './services/api';
import { NoteCard } from './components/NoteCard';
import { ClickNoteCreator } from './components/ClickNoteCreator';
import { Toast } from './components/Toast';
import corkboardBg from './assets/corkboard.jpg';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [creatorState, setCreatorState] = useState(null);
  const wallRef = useRef(null);

  const triggerToast = (type, message, status) => {
    setToast({ type, message, status });
  };

  const closeToast = () => {
    setToast(null);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const result = await postsApi.getPosts();
    if (result.success) {
      setPosts(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleWallClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.group')) {
      return;
    }

    const clickX = e.clientX;
    const clickY = e.clientY;

    const posX = Math.max(12, Math.min(88, Number(((clickX / window.innerWidth) * 100).toFixed(1))));
    const posY = Math.max(15, Math.min(85, Number(((clickY / window.innerHeight) * 100).toFixed(1))));

    setCreatorState({
      x: clickX,
      y: clickY,
      posX,
      posY
    });
  };

  const handleCreatePost = async (content, color) => {
    setSubmitting(true);
    const posX = creatorState?.posX ?? Math.floor(Math.random() * 70 + 15);
    const posY = creatorState?.posY ?? Math.floor(Math.random() * 60 + 20);
    const rotation = Number((Math.random() * 8 - 4).toFixed(1));

    const result = await postsApi.createPost(content, color, posX, posY, rotation);
    setSubmitting(false);

    if (result.success) {
      triggerToast('success', 'Notun tahtaya iğnelendi! 📌', 201);
      setCreatorState(null);
      if (result.data) {
        setPosts((prev) => [result.data, ...prev]);
      } else {
        fetchPosts();
      }
    } else {
      if (result.status === 429) {
        triggerToast('rate-limit', result.message, 429);
      } else if (result.status === 400) {
        triggerToast('bad-request', result.message, 400);
      } else {
        triggerToast('error', result.message, result.status);
      }
    }
  };

  const handleDeletePost = async (id) => {
    const result = await postsApi.deletePost(id);

    if (result.success) {
      triggerToast('success', 'Notun tahtadan kaldırıldı. 🗑️', 200);
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
    } else {
      if (result.status === 403) {
        triggerToast('warning', result.message, 403);
      } else {
        triggerToast('error', result.message, result.status);
      }
    }
  };

  const handleLikePost = async (id) => {
    const result = await postsApi.likePost(id);
    if (result.success) {
      triggerToast('success', 'Beğenildi ❤️', 200);
      return { success: true, likes: result.likes };
    } else {
      if (result.status === 429) {
        triggerToast('rate-limit', result.message, 429);
      }
      return { success: false };
    }
  };

  return (
    <div
      ref={wallRef}
      onClick={handleWallClick}
      style={{
        backgroundImage: `url(${corkboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0c0805'
      }}
      className="relative min-h-screen w-screen text-slate-100 overflow-x-hidden overflow-y-auto select-none cursor-crosshair"
    >
      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Rustic Wooden Board Header */}
      <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-4 sm:p-6 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-3 bg-[#1c0f08]/90 backdrop-blur-md px-4 py-2 rounded-lg border border-[#4a2a1a] shadow-2xl text-amber-100">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
          <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase font-serif text-amber-200">
            ANONİM DUVAR
          </h1>
          <span className="text-[11px] font-mono text-amber-400/80 border-l border-amber-900/60 pl-2">
            {posts.length} not
          </span>
        </div>

        {/* Minimal hint & Refresh */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-100/90 bg-[#1c0f08]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#4a2a1a] shadow-2xl">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>Panoda boş bir yere tıkla ve not iğnele</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchPosts();
            }}
            disabled={loading}
            className="p-2 rounded-lg bg-[#1c0f08]/90 backdrop-blur-md border border-[#4a2a1a] text-amber-300 hover:text-white transition-all cursor-pointer shadow-2xl disabled:opacity-50"
            title="Panoyu Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Note Creator Popover at Click Coordinates */}
      {creatorState && (
        <ClickNoteCreator
          position={creatorState}
          onSubmit={handleCreatePost}
          onClose={() => setCreatorState(null)}
          isSubmitting={submitting}
        />
      )}

      {/* Corkboard Canvas with Sticky Notes */}
      <main className="relative min-h-screen w-full pt-20 pb-28 px-4 sm:px-8">
        {/* Empty state hint */}
        {posts.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-amber-950/80">
            <div className="w-5 h-5 rounded-full bg-rose-600 mb-2 shadow-md" />
            <p className="text-sm font-serif font-bold text-amber-950">Mantar Pano Henüz Bomboş</p>
            <p className="text-xs text-amber-900/80 mt-1">Herhangi bir yere tıkla ve ilk post-it'i iğnele!</p>
          </div>
        )}

        {/* Free-Flowing Wall Grid */}
        <div className="flex flex-wrap items-start justify-center gap-7 sm:gap-9 max-w-7xl mx-auto py-8">
          {posts.map((post) => (
            <NoteCard
              key={post.id || post._id}
              post={post}
              onLike={handleLikePost}
              onDelete={handleDeletePost}
              isAbsolute={false}
            />
          ))}
        </div>
      </main>

      {/* Floating Action Button (for mobile users) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCreatorState({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            posX: 50,
            posY: 50
          });
        }}
        className="fixed bottom-6 right-6 sm:hidden z-30 p-4 rounded-full bg-amber-700 hover:bg-amber-600 text-white shadow-2xl shadow-black/80 cursor-pointer active:scale-95 transition-all border border-amber-500/50"
        title="Not İğnele"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

export default App;
