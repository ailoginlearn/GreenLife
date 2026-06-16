import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService, Blog } from '../lib/dbService';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  BookOpen, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Brain,
  Baby,
  Smile,
  AlertCircle
} from 'lucide-react';

const BlogSection: React.FC = () => {
  const { isAdmin, user, profile } = useAuth();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Blog viewer/editor states
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('General Health');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formReadTime, setFormReadTime] = useState('5 mins');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'General Health', 'Nutrition', 'Lifestyle'];

  const categoryIcons: Record<string, React.ReactNode> = {
    Cardiology: <Heart className="h-4 w-4 text-rose-500" />,
    Neurology: <Brain className="h-4 w-4 text-indigo-500" />,
    Pediatrics: <Baby className="h-4 w-4 text-amber-500" />,
    'General Health': <Sparkles className="h-4 w-4 text-emerald-500" />,
    Nutrition: <Smile className="h-4 w-4 text-lime-500" />,
    Lifestyle: <Sparkles className="h-4 w-4 text-cyan-500" />
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const loaded = await dbService.getBlogs();
      setBlogs(loaded);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenAddForm = () => {
    setEditingBlog(null);
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormCategory('General Health');
    setFormImageUrl('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600');
    setFormReadTime('5 mins');
    setFormAuthorName(profile?.displayName || 'Dr. GreenLife Coordinator');
    setFormError('');
    setIsEditorOpen(true);
  };

  const handleOpenEditForm = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the blog detail
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

  const handleDeleteBlog = async (blogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this blog post? This action is irreversible.")) {
      return;
    }

    try {
      await dbService.deleteBlog(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      if (viewingBlog?.id === blogId) {
        setViewingBlog(null);
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Error deleting blog. Check permissions.");
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      setFormError('Please fill in Title, Snippet, and Article Content.');
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
      authorName: formAuthorName || 'GreenLife Contributor',
      authorId: user?.uid || 'anonymous-author'
    };

    try {
      if (editingBlog) {
        const updated = await dbService.updateBlog({
          ...editingBlog,
          ...payload
        });
        setBlogs(prev => prev.map(b => b.id === updated.id ? updated : b));
        if (viewingBlog?.id === editingBlog.id) {
          setViewingBlog(updated);
        }
      } else {
        const added = await dbService.addBlog(payload);
        setBlogs(prev => [added, ...prev]);
      }
      setIsEditorOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      setFormError(err instanceof Error ? err.message : 'Permission denied or network connection failed.');
    } finally {
      setSaving(false);
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3 tracking-tight">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg sm:text-xl font-bold text-gray-800 mt-4 mb-2 tracking-tight">{line.replace('### ', '')}</h3>;
      }
      if (line.trim().startsWith('* ')) {
        return <li key={idx} className="text-gray-655 ml-5 list-disc leading-relaxed my-1.5 font-medium text-sm sm:text-base">{line.trim().replace('* ', '')}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-3.5" />;
      }
      
      let content: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        content = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-gray-950">{part}</strong> : part);
      }
      
      return <p key={idx} className="text-gray-655 leading-relaxed my-3 font-medium text-sm sm:text-base">{content}</p>;
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Detail view header switch */}
        {!viewingBlog ? (
          <>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-emerald-700 font-bold text-xs uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full inline-block border border-emerald-100">
                  GreenLife Chronicle
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mt-3">
                  Health & Wellness Newsroom
                </h1>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-semibold mt-1">
                  Clinical publications, fitness advice, and health studies curated by our head physicians.
                </p>
              </div>

              {/* Admin New Blog option */}
              {isAdmin && (
                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center gap-2 self-start md:self-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md cursor-pointer transition-all leading-none text-sm group"
                >
                  <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  Write New Article
                </button>
              )}
            </div>

            {/* Searches and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10 items-center">
              
              {/* Searchbox */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4.5 w-4.5" />
                <input
                  type="text"
                  placeholder="Query articles or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-medium"
                />
              </div>

              {/* Horizontal scroll categories */}
              <div className="lg:col-span-2 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-all shadow-sm ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold'
                        : 'bg-white border-gray-150 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/30'
                    }`}
                  >
                    {categoryIcons[cat]}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500/30 border-t-emerald-650 mb-4" />
                <p className="text-sm font-semibold text-gray-500">Retrieving clinic catalog...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
                <div className="bg-slate-50 text-slate-400 p-4 rounded-full inline-block">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">No publications match criteria</h3>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Try querying another clinical keyword or filtering a different medical category.</p>
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Clear Filter parameters
                  </button>
                )}
              </div>
            ) : (
              /* Blog grid layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((b) => (
                  <article
                    key={b.id}
                    onClick={() => setViewingBlog(b)}
                    className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    {/* Header Image */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-50 text-[10px] font-bold text-emerald-800 tracking-tight flex items-center gap-1">
                        {categoryIcons[b.category]}
                        {b.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div className="space-y-3 text-left">
                        
                        {/* Meta */}
                        <div className="flex items-center gap-3.5 text-[11px] text-gray-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(b.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {b.readTime || '5 mins'}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-lg font-bold text-gray-950 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {b.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-xs text-gray-500 leading-relaxed font-semibold line-clamp-3">
                          {b.excerpt}
                        </p>
                      </div>

                      {/* Author row & admin actions */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-800 font-black text-xs">
                            {b.authorName.charAt(4) || b.authorName.charAt(0) || 'D'}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-gray-800 block leading-tight">{b.authorName}</span>
                          </div>
                        </div>

                        {/* Edit delete for Admins */}
                        {isAdmin ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleOpenEditForm(b, e)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Edit Article"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteBlog(b.id, e)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Article"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-650 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                            Read <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Full blog detail reader mode */
          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm max-w-4xl mx-auto">
            {/* Header Image Banner */}
            <div className="relative h-64 sm:h-96 bg-slate-100">
              <img
                src={viewingBlog.imageUrl}
                alt={viewingBlog.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent" />
              
              {/* Back selector overlay */}
              <button
                onClick={() => setViewingBlog(null)}
                className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-gray-800 p-2.5 rounded-xl border border-gray-150 shadow hover:bg-white transition-all cursor-pointer flex items-center gap-2 font-bold text-xs"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
                Back to Newsroom
              </button>
            </div>

            {/* Article Contents */}
            <div className="p-6 sm:p-10 text-left">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Meta badging */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                    {categoryIcons[viewingBlog.category]}
                    {viewingBlog.category}
                  </span>
                  
                  <span className="text-gray-400 font-semibold">•</span>
                  
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(viewingBlog.publishedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>

                  <span className="text-gray-400 font-semibold">•</span>

                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {viewingBlog.readTime}
                  </span>
                </div>

                {/* Primary Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 leading-tight tracking-tight">
                  {viewingBlog.title}
                </h1>

                {/* Author profile row */}
                <div className="flex items-center justify-between border-y border-gray-100 py-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-800 font-black text-sm">
                      {viewingBlog.authorName.charAt(4) || viewingBlog.authorName.charAt(0) || 'D'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight text-sm sm:text-base">{viewingBlog.authorName}</p>
                      <p className="text-[11px] text-emerald-600 font-semibold uppercase font-mono tracking-widest mt-0.5">Verified Medical staff</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenEditForm(viewingBlog, e)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Post
                      </button>
                      <button
                        onClick={(e) => handleDeleteBlog(viewingBlog.id, e)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-750 font-bold text-xs rounded-xl border border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Article Body (Render custom markdown) */}
                <div className="prose prose-emerald max-w-none pt-4">
                  {renderMarkdown(viewingBlog.content)}
                </div>

                {/* Bottom Back Button */}
                <div className="pt-8 border-t border-gray-100 mt-12 text-center">
                  <button
                    onClick={() => setViewingBlog(null)}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold px-6 py-3 rounded-2xl text-xs transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Articles Newsroom
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Slide-over Form Overlay Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Dark background */}
            <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditorOpen(false)} />
            
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-2xl bg-white border-l border-emerald-50 shadow-2xl flex flex-col justify-between">
                
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-emerald-750 to-emerald-600 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-200" />
                      {editingBlog ? 'Update Chronicle Entry' : 'Publish New Clinical Post'}
                    </h2>
                    <p className="text-[11px] text-emerald-100 font-semibold mt-0.5 leading-snug">
                      Write high-quality guidelines that will build health standards for patients.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1.5 bg-emerald-800/20 hover:bg-emerald-800/40 text-emerald-50 hover:text-white rounded-xl transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form scroll wrapper */}
                <form onSubmit={handleSaveBlog} className="flex-grow overflow-y-auto p-6 space-y-6">
                  
                  {formError && (
                    <div className="bg-red-50 border border-red-150 p-4 rounded-2xl flex items-start gap-2.5 text-left text-xs leading-relaxed text-red-800">
                      <AlertCircle className="h-4 w-4 text-red-650 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-red-900">Database security violation or check failure:</p>
                        <p className="font-medium mt-0.5">{formError}</p>
                      </div>
                    </div>
                  )}

                  {/* Main Inputs */}
                  <div className="space-y-4 text-left">
                    
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Post Title <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Preventive Cardiology: Habits for a Healthy Heart"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-bold"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Short Snippet (Card Excerpt) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formExcerpt}
                        onChange={(e) => setFormExcerpt(e.target.value)}
                        placeholder="e.g. Discover simple, cardiologist-approved lifestyle parameters that lower hypertension..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-medium"
                      />
                    </div>

                    {/* Grid Category, Readtime and Author */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 block">Department Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-bold text-gray-700"
                        >
                          {categories.filter(c => c !== 'All').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Read time */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 block">Est. Reading Time</label>
                        <input
                          type="text"
                          value={formReadTime}
                          onChange={(e) => setFormReadTime(e.target.value)}
                          placeholder="e.g. 5 mins"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-bold"
                        />
                      </div>

                    </div>

                    {/* Image URL and Author */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Author Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 block">Author Doctor Name</label>
                        <input
                          type="text"
                          value={formAuthorName}
                          onChange={(e) => setFormAuthorName(e.target.value)}
                          placeholder="e.g. Dr. Alexander Jenkins"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-bold"
                        />
                      </div>

                      {/* Banner Image URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 block">Banner Photo URL</label>
                        <input
                          type="url"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Unsplash picture link..."
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-semibold"
                        />
                      </div>

                    </div>

                    {/* Content (Markdown Textarea) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 block">Article Body (Markdown Supported) <span className="text-red-500">*</span></label>
                        <span className="text-[10px] text-gray-400 font-semibold">Use ## and ### for headings, * for lists</span>
                      </div>
                      <textarea
                        required
                        rows={12}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder={`## Subtitle Heading\n\nWrite article analysis here...\n\n### Core clinical parameters\n* Bullet point 1\n* Bullet point 2`}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-gray-400 font-medium font-sans"
                      />
                    </div>

                  </div>

                </form>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBlog}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow cursor-pointer transition-colors"
                  >
                    {saving && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />}
                    {saving ? 'Publishing...' : editingBlog ? 'Update Publication' : 'Publish Article'}
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

export default BlogSection;
