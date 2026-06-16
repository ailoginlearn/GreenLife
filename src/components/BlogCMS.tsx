import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService, Blog, DEFAULT_BLOGS } from '../lib/dbService';
import { isFirebaseEnabled } from '../lib/firebase';
import { 
  Lock, 
  Key, 
  AlertCircle, 
  LogOut, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  X, 
  BookOpen, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

// Pre-defined Admin CMS Credentials requested by the user
const CMS_USER_ID = "greenlife_cms";
const CMS_PASSWORD = "clinic_blog_direct_2026";

const BlogCMS: React.FC = () => {
  const { isAdmin, user, profile, loginWithGoogle, logout: firebaseLogout } = useAuth();
  
  // Local Session Auth state for CMS
  const [cmsAuthenticated, setCmsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('greenlife_cms_session') === 'active';
  });
  
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // CMS Blog States
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor Drawer/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Cardiology');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formReadTime, setFormReadTime] = useState('4 mins');
  const [formAuthorName, setFormAuthorName] = useState('');

  const categories = ['Cardiology', 'Neurology', 'Pediatrics', 'General Health', 'Nutrition', 'Lifestyle'];

  // Retrieve Blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const dbBlogs = await dbService.getBlogs();
      setBlogs(dbBlogs);
    } catch (err) {
      console.error("CMS failed to download clinic blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmsAuthenticated) {
      fetchBlogs();
    }
  }, [cmsAuthenticated]);

  // Handle local CMS Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId.trim() === CMS_USER_ID && loginPass === CMS_PASSWORD) {
      sessionStorage.setItem('greenlife_cms_session', 'active');
      setCmsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Username ID or CMS Access Code. Please audit inputs.');
    }
  };

  // Handle local CMS Logout
  const handleLogout = () => {
    sessionStorage.removeItem('greenlife_cms_session');
    setCmsAuthenticated(false);
    setLoginId('');
    setLoginPass('');
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormCategory('Cardiology');
    setFormImageUrl('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600');
    setFormReadTime('5 mins');
    setFormAuthorName(profile?.displayName || 'Dr. Sarah Jenkins');
    setFormError('');
    setIsEditorOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormExcerpt(blog.excerpt);
    setFormContent(blog.content);
    setFormCategory(blog.category);
    setFormImageUrl(blog.imageUrl);
    setFormReadTime(blog.readTime);
    setFormAuthorName(blog.authorName);
    setFormError('');
    setIsEditorOpen(true);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      setFormError('Please configure required parameters (Title, Excerpt, Content).');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      title: formTitle,
      excerpt: formExcerpt,
      content: formContent,
      category: formCategory,
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      readTime: formReadTime || '5 mins',
      authorName: formAuthorName || 'Dr. GreenLife Coordinator',
      authorId: user?.uid || 'cms-admin'
    };

    try {
      if (editingBlog) {
        const updated = await dbService.updateBlog({
          ...editingBlog,
          ...payload
        });
        setBlogs(prev => prev.map(b => b.id === updated.id ? updated : b));
      } else {
        const added = await dbService.addBlog(payload);
        setBlogs(prev => [added, ...prev]);
      }
      setIsEditorOpen(false);
    } catch (err) {
      console.error("CMS failed to write changes:", err);
      setFormError(err instanceof Error ? err.message : 'Database permission verification failed. Please make sure Google Clinician session is active.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (blogId: string) => {
    if (!window.confirm("Permanently wipe this health chronicle entry? This step removes record metadata instantly.")) {
      return;
    }

    try {
      await dbService.deleteBlog(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
    } catch (err) {
      console.error("CMS deletion failure:", err);
      alert("Error deleting article: Permission verification rejected.");
    }
  };

  // Search filter
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics counters
  const totalArticles = blogs.length;
  const cardiologyCount = blogs.filter(b => b.category === 'Cardiology').length;
  const neurologyCount = blogs.filter(b => b.category === 'Neurology').length;
  const pediatricsCount = blogs.filter(b => b.category === 'Pediatrics').length;

  if (!cmsAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-left font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-8">
          
          {/* Branded Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex bg-emerald-500/10 text-emerald-400 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">GreenLife Chronicle CMS</h1>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest mt-1">Specialist Publishing Desk</p>
            </div>
          </div>

          {/* Secure Warnings */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-400 font-semibold leading-relaxed">
            Please enter the unique credential credentials assigned for back-office article curation. Unlisted visitors are tracked under HIPAA Audit systems.
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {loginError && (
              <div className="bg-red-950/40 border border-red-900/40 text-red-300 text-xs p-3.5 rounded-2xl leading-relaxed font-semibold flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CMS Account ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-505 h-4 w-4" />
                <input
                  type="text"
                  required
                  placeholder="greenlife_cms"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-600 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Access Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-505 h-4 w-4" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-640 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:translate-y-px text-white font-extrabold text-sm py-3.5 rounded-2xl shadow transition-all cursor-pointer block mt-6"
            >
              Sign In CMS Controller
            </button>
          </form>

          {/* Secure disclaimer in footer */}
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Standard secure gateway 2026 • Encrypted Port 3000
            </span>
          </div>

        </div>
      </div>
    );
  }

  // Active CMS Logged in view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans text-left">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Top Banner Row */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-550 text-white p-2.5 rounded-xl shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold block leading-none text-white">GreenLife Chronicle CMS</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase block mt-1">Publisher Core Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4.5 py-2 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl border border-slate-850 hover:border-slate-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Exit Workspace
            </button>
          </div>

        </div>
      </div>

      {/* Main CMS Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Clinician Firebase validation alert block */}
        {isFirebaseEnabled && (!isAdmin || !user) && (
          <div className="bg-amber-950/30 border border-amber-900/60 p-5 rounded-2xl flex flex-col md:flex-row items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-200">Google Clinician Alignment Required</h4>
                <p className="text-xs text-amber-400/85 font-medium mt-1 leading-relaxed">
                  You are logged into the local CMS container, but your browser is not linked to the clinical Firebase admin account (<strong className="text-white">ailogin.learn@gmail.com</strong>). Database security policies require this to publish or modify cloud documents.
                </p>
              </div>
            </div>
            <button
              onClick={loginWithGoogle}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all shadow cursor-pointer whitespace-nowrap self-stretch md:self-auto"
            >
              Link Google Clinician Profile
            </button>
          </div>
        )}

        {isFirebaseEnabled && isAdmin && user && (
          <div className="bg-emerald-950/30 border border-emerald-900/40 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">
              Firebase Security Validated: Active secure administrative pipeline with cloud database as <strong className="text-white">{user.email}</strong>.
            </span>
          </div>
        )}

        {/* Dashboard Analytics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Total Articles</p>
              <h3 className="text-lg font-black text-white mt-1">{totalArticles} Publications</h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-500/10 text-rose-450 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Cardiology</p>
              <h3 className="text-lg font-black text-white mt-1">{cardiologyCount} Articles</h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Neurology</p>
              <h3 className="text-lg font-black text-white mt-1">{neurologyCount} Articles</h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Pediatrics</p>
              <h3 className="text-lg font-black text-white mt-1">{pediatricsCount} Articles</h3>
            </div>
          </div>
        </div>

        {/* Database Search & Controller Table */}
        <div className="bg-slate-900/95 border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
          
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 h-4.5 w-4.5" />
              <input
                type="text"
                placeholder="Query clinical articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 placeholder:text-slate-650 font-semibold"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 self-stretch sm:self-auto bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-2xl font-bold text-xs text-white shadow-lg transition-all active:translate-y-0.5 cursor-pointer text-center justify-center"
            >
              <Plus className="h-4.5 w-4.5" />
              Publish New Chronicle
            </button>

          </div>

          {/* Table display */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-800 border-t-emerald-450 mb-3" />
              <p className="text-xs font-mono text-slate-505 uppercase tracking-wider">Synchronizing clinical articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-400 font-bold">No clinic records match searching parameters</p>
              <p className="text-xs text-slate-600 mt-1 font-semibold">Try modifying your query tags.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-850 text-[10px] text-slate-450 uppercase tracking-wider font-bold">
                    <th className="px-6 py-4.5">Publication Title</th>
                    <th className="px-6 py-4.5">Medical Category</th>
                    <th className="px-6 py-4.5">Author Clinician</th>
                    <th className="px-6 py-4.5">Published Date</th>
                    <th className="px-6 py-4.5 text-right">Row Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-xs text-slate-300 font-semibold">
                  {filteredBlogs.map(b => (
                    <tr key={b.id} className="hover:bg-slate-850/20 transition-all">
                      
                      {/* Title & Preview Image */}
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img 
                            src={b.imageUrl} 
                            alt="" 
                            className="h-10 w-14 object-cover rounded-lg bg-slate-800 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <p className="font-extrabold text-white truncate text-sm leading-snug">{b.title}</p>
                            <p className="text-[11px] text-slate-503 font-semibold mt-0.5 truncate">{b.excerpt}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight">
                          {b.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        <span className="font-bold text-white text-[11px]">{b.authorName}</span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(b.publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Row actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-700"
                            title="Edit Chronicle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 hover:bg-red-950/35 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-900/50"
                            title="Delete Chronicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Editor slide-over modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden text-slate-300" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark back layer */}
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsEditorOpen(false)} />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-2xl bg-slate-950 border-l border-slate-850 flex flex-col justify-between shadow-2xl">
                
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 to-emerald-900 border-b border-emerald-900/30 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-md sm:text-base font-extrabold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-400" />
                      {editingBlog ? 'Update Chronicle Article' : 'Publish New Specialist Guide'}
                    </h2>
                    <p className="text-[10px] text-emerald-305 font-semibold mt-0.5 font-mono">CMS CLOUD CONTROL INTERFACE</p>
                  </div>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body form */}
                <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-6 space-y-5">
                  
                  {formError && (
                    <div className="bg-red-950/20 border border-red-905/30 p-4 rounded-2xl flex items-start gap-2.5 text-left text-xs text-red-300 font-semibold leading-relaxed">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-red-200">Writing Operation Blocked by Database validations:</p>
                        <p className="text-red-300/90 mt-0.5">{formError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chronicle Title *</label>
                      <input
                        type="text"
                        required
                        maxLength={250}
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Navigating Pediatric Immunity in Winter Seasons"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-extrabold"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Short Card Excerpt (Snippet) *</label>
                      <input
                        type="text"
                        required
                        maxLength={1000}
                        value={formExcerpt}
                        onChange={(e) => setFormExcerpt(e.target.value)}
                        placeholder="e.g. Expert pediatric dietary modifications and micro-ingredient guidelines..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    {/* Category, Readtime */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Department Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-bold"
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reading Duration</label>
                        <input
                          type="text"
                          maxLength={60}
                          value={formReadTime}
                          onChange={(e) => setFormReadTime(e.target.value)}
                          placeholder="e.g. 5 mins"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-bold"
                        />
                      </div>

                    </div>

                    {/* Author, Image URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Author Clinician Name</label>
                        <input
                          type="text"
                          maxLength={120}
                          value={formAuthorName}
                          onChange={(e) => setFormAuthorName(e.target.value)}
                          placeholder="e.g. Dr. Alexander Jenkins"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Banner Image URL</label>
                        <input
                          type="url"
                          maxLength={2000}
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Unsplash clinical picture link..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-semibold"
                        />
                      </div>

                    </div>

                    {/* Content Area */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-440 uppercase tracking-wider block">Clinical Article Content (Markdown) *</label>
                        <span className="text-[10px] text-slate-500 font-mono">## for headings, * for lists</span>
                      </div>
                      <textarea
                        required
                        maxLength={95000}
                        rows={10}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder={`## Subtitle Heading\n\nWrite detailed medical analysis here...\n\n### Daily actions\n* Bullet item 1\n* Bullet item 2`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium font-sans"
                      />
                    </div>

                  </div>

                </form>

                {/* Footer buttons */}
                <div className="px-6 py-4.5 bg-slate-900 border-t border-slate-850 flex justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-3 bg-slate-950 border border-slate-804 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950"
                  >
                    {saving && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />}
                    {saving ? 'Publishing...' : editingBlog ? 'Update Chronicle' : 'Publish Article'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BlogCMS;
