import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Activity, RefreshCw, MessageSquareDashed, Layers } from 'lucide-react';
import { postsApi } from './services/api';
import { NoteCard } from './components/NoteCard';
import { NoteForm } from './components/NoteForm';
import { Toast } from './components/Toast';
import { StatusCodeGuide } from './components/StatusCodeGuide';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'error' | 'checking'
  const [toast, setToast] = useState(null);

  // Show toast notification
  const triggerToast = (type, message, status) => {
    setToast({ type, message, status });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const result = await postsApi.getPosts();

    if (result.success) {
      setPosts(result.data);
      setBackendStatus('connected');
    } else {
      setBackendStatus('error');
      // Only show error toast if not first initial silent load
      console.warn('Posts could not be fetched:', result.message);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts();

    // Check backend health
    postsApi.checkHealth().then((res) => {
      if (res.success) {
        setBackendStatus(res.data?.database === 'connected' ? 'connected' : 'db-pending');
      } else {
        setBackendStatus('error');
      }
    });
  }, [fetchPosts]);

  // Handle post creation
  const handleCreatePost = async (content, color) => {
    setSubmitting(true);
    const result = await postsApi.createPost(content, color);
    setSubmitting(false);

    if (result.success) {
      triggerToast('success', result.message, 201);
      // Prepend the new post to the list
      if (result.data) {
        setPosts((prev) => [result.data, ...prev]);
      } else {
        fetchPosts();
      }
      return true;
    } else {
      // Map status codes to specific toast styles
      if (result.status === 429) {
        triggerToast('rate-limit', result.message, 429);
      } else if (result.status === 400) {
        triggerToast('bad-request', result.message, 400);
      } else {
        triggerToast('error', result.message, result.status);
      }
      return false;
    }
  };

  // Handle post like
  const handleLikePost = async (id) => {
    const result = await postsApi.likePost(id);

    if (result.success) {
      triggerToast('success', 'Beğeni kaydedildi! ❤️', 200);
      return { success: true, likes: result.likes };
    } else {
      if (result.status === 429) {
        triggerToast('rate-limit', result.message, 429);
      } else {
        triggerToast('warning', result.message, result.status);
      }
      return { success: false };
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Anonim Dijital Duvar
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Digital Graffiti & Capsule Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                backendStatus === 'connected'
                  ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                  : backendStatus === 'db-pending'
                  ? 'border-amber-500/30 bg-amber-950/40 text-amber-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              <Activity
                className={`w-3.5 h-3.5 ${
                  backendStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {backendStatus === 'connected'
                  ? 'API & DB Aktif (200 OK)'
                  : backendStatus === 'db-pending'
                  ? 'DB Şifresi Bekleniyor'
                  : 'Backend Bağlantısı'}
              </span>
              <span className="sm:hidden font-mono text-[11px]">API 200</span>
            </span>

            {/* Refresh Button */}
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Duvarı Yenile (GET /api/posts)"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Aklındakileri Duvara Bırak,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Anonim Kal
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Kayıt yok, kimlik yok. O anki moduna göre renkli dijital bir kart bırak ve diğerlerinin notlarını beğen!
          </p>
        </div>

        {/* Note Submission Form */}
        <NoteForm onSubmit={handleCreatePost} isSubmitting={submitting} />

        {/* Status Code Educational Guide */}
        <StatusCodeGuide />

        {/* Wall Header */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Canlı Duvar
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
              {posts.length} Not
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            GET /api/posts • limit 20
          </div>
        </div>

        {/* Wall Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-slate-800/80 bg-slate-900/30 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-4 w-16 bg-slate-800 rounded" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-800 rounded w-full" />
                  <div className="h-3.5 bg-slate-800 rounded w-4/5" />
                </div>
                <div className="h-6 w-20 bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
            <MessageSquareDashed className="w-12 h-12 text-slate-600 mb-3" />
            <h4 className="text-base font-semibold text-slate-300">Duvar Henüz Bomboş!</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              İlk dijital izi sen bırak. Yukarıdaki formdan dilediğin renkte bir not yaz ve yapıştır!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <NoteCard
                key={post.id || post._id}
                post={post}
                onLike={handleLikePost}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>
          Anonim Dijital Duvar • Modern Stack: React 19 + Tailwind CSS + Node.js Express + MongoDB Atlas
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Durum Kodları: 200 OK • 201 Created • 400 Bad Request • 429 Too Many Requests
        </p>
      </footer>
    </div>
  );
}

export default App;
