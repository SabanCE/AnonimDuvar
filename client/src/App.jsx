import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, RefreshCw, Plus, MousePointerClick } from 'lucide-react';
import { postsApi } from './services/api';
import { NoteCard } from './components/NoteCard';
import { ClickNoteCreator } from './components/ClickNoteCreator';
import { Toast } from './components/Toast';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [creatorState, setCreatorState] = useState(null); // { x, y, posX, posY }
  const wallRef = useRef(null);

  const triggerToast = (type, message, status) => {
    setToast({ type, message, status });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch posts
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

  // Handle canvas click to spawn creator
  const handleWallClick = (e) => {
    // If clicking close or existing card, ignore
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

  // Submit note created at click position
  const handleCreatePost = async (content, color) => {
    setSubmitting(true);
    const posX = creatorState?.posX ?? Math.floor(Math.random() * 70 + 15);
    const posY = creatorState?.posY ?? Math.floor(Math.random() * 60 + 20);
    const rotation = Number((Math.random() * 8 - 4).toFixed(1));

    const result = await postsApi.createPost(content, color, posX, posY, rotation);
    setSubmitting(false);

    if (result.success) {
      triggerToast('success', 'Notun duvara yapıştırıldı! 📌', 201);
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

  // Handle post delete (Only author can delete)
  const handleDeletePost = async (id) => {
    const result = await postsApi.deletePost(id);

    if (result.success) {
      triggerToast('success', 'Notun duvardan silindi. 🗑️', 200);
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
    } else {
      if (result.status === 403) {
        triggerToast('warning', result.message, 403);
      } else {
        triggerToast('error', result.message, result.status);
      }
    }
  };

  // Handle like
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
      className="relative min-h-screen w-screen bg-[#07080c] text-slate-100 overflow-x-hidden overflow-y-auto select-none cursor-crosshair"
      style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
        backgroundSize: '28px 28px'
      }}
    >
      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Ultra-Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-4 sm:p-6 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800/80 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h1 className="text-xs sm:text-sm font-bold tracking-wider text-slate-200">
            ANONİM DUVAR
          </h1>
          <span className="text-[11px] font-mono text-slate-500 border-l border-slate-800 pl-2">
            {posts.length} not
          </span>
        </div>

        {/* Minimal hint & Refresh */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80">
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
            <span>Boş bir alana tıkla ve not bırak</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchPosts();
            }}
            disabled={loading}
            className="p-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="Duvarı Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
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

      {/* Scattered Organic Note Cards Canvas */}
      <main className="relative min-h-screen w-full pt-20 pb-28 px-4 sm:px-8">
        {/* Empty state hint */}
        {posts.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600">
            <Sparkles className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
            <p className="text-sm font-medium">Duvar bomboş...</p>
            <p className="text-xs text-slate-600 mt-1">Ekranda herhangi bir yere tıkla ve ilk notu bırak!</p>
          </div>
        )}

        {/* Free-Flowing Wall Grid */}
        <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8 max-w-7xl mx-auto py-8">
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
        className="fixed bottom-6 right-6 sm:hidden z-30 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-2xl shadow-cyan-500/40 cursor-pointer active:scale-95 transition-all"
        title="Not Ekle"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

export default App;
