import React, { useState, useEffect } from "react";
import { 
  Lock, LayoutDashboard, Settings as SettingsIcon, BookOpen, Globe, DollarSign, 
  Trash2, Edit, Plus, Users, QrCode, Barcode, MousePointerClick, RefreshCw, Key, LogOut, CheckCircle, ChevronRight
} from "lucide-react";
import { Blog, Settings, Stats, DayStat } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  onRefreshPublicData: () => void;
}

export function AdminPanel({ onRefreshPublicData }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Loaded admin state
  const [activeTab, setActiveTab] = useState<"dashboard" | "blogs" | "seo" | "ads" | "security">("dashboard");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Blog publishing state
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);

  // Administrative password reset string
  const [newPassword, setNewPassword] = useState("");

  const authToken = "admin-auth-token-12345";

  // Check login trace inside localStorage on boot
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken === authToken) {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("adminToken", authToken);
        await fetchAdminData();
      } else {
        setLoginError(data.error || "Incorrect admin password.");
      }
    } catch (err) {
      setLoginError("Unable to establish backend contact.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminToken");
    setSettings(null);
    setStats(null);
    setBlogs([]);
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/db", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const db = await res.json();
        setSettings(db.settings);
        setBlogs(db.blogs || []);
        setStats(db.stats);
      }
    } catch (err) {
      console.error("Error reading admin details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedFields: Partial<Settings>) => {
    if (!settings) return;
    setSaveSuccess(null);
    setIsLoading(true);

    try {
      const nextSettings = { ...settings, ...updatedFields };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(nextSettings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        triggerSuccessMessage("Configuration saved successfully!");
        onRefreshPublicData(); // Forces re-sync of meta/analytics in parent layouts
      }
    } catch (err) {
      console.error("Error writing settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !editingBlog.title || !editingBlog.slug) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(editingBlog),
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
        setEditingBlog(null);
        triggerSuccessMessage("Blog article published!");
        onRefreshPublicData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this article?")) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
        triggerSuccessMessage("Article deleted successfully.");
        onRefreshPublicData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ adminPassword: newPassword }),
      });

      if (res.ok) {
        setNewPassword("");
        triggerSuccessMessage("Admin console password updated!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSuccessMessage = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Login Gatekeeper view
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-lg relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Console Portal</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Secure panel to manage SEO, Google AdSense, Blogs, and Statistics
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Administrative Sign-in Key</label>
            <input
              type="password"
              placeholder="e.g. admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 outline-none rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {loginError && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-450 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
              ✗ Error: {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-1.5 text-xs font-bold py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all duration-150 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <span>Access dashboard</span>}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-50 dark:border-zinc-850 pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-mono">
            Default Key: <strong className="text-gray-600 dark:text-zinc-300">admin</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-zinc-800 pb-5 mb-8 space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              CodeCraft Administration Dashboard
            </h1>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              ONLINE
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Control live SEO, dynamic AdSense slots, search trackers, and blogs instantly.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 text-gray-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Lock Console</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 text-xs font-mono rounded-xl flex items-center space-x-2 animate-pulse">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* DASHBOARD TABS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* TABS LEFT COLUMN NAVIGATION */}
        <div className="md:col-span-3 space-y-1">
          {[
            { id: "dashboard", label: "Overview & Analytics", icon: LayoutDashboard },
            { id: "blogs", label: "Blog articles Hub", icon: BookOpen },
            { id: "seo", label: "Meta Tags & SEO", icon: Globe },
            { id: "ads", label: "AdSense Integrator", icon: DollarSign },
            { id: "security", label: "Admin Credentials", icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingBlog(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl duration-150 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none"
                    : "bg-transparent text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            );
          })}
        </div>

        {/* TABS EDITING CONTENT COLUMN */}
        <div className="md:col-span-9">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-6">
              
              {/* Stats Numerical Widget Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Global Visitors</span>
                    <Users className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono">{stats.visitors}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Aggregated overall traffic</p>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-905 border border-gray-100 dark:border-zinc-850 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">QR Code outputs</span>
                    <QrCode className="h-4 w-4 text-teal-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono">{stats.qrGenerated}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Dynamic client-side compile</p>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-905 border border-gray-100 dark:border-zinc-850 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Barcode compiles</span>
                    <Barcode className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono">{stats.barcodeGenerated}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Linear 1D symbologies</p>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-905 border border-gray-100 dark:border-zinc-850 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Simulated Ad clicks</span>
                    <MousePointerClick className="h-4 w-4 text-pink-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono">{stats.adClicks}</p>
                  <p className="text-[9px] text-gray-400 mt-1">AdSense layout CTR tracker</p>
                </div>

              </div>

              {/* Graphical History Representation - Custom Bar Chart */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
                  Weekly Traffic & Generative Operations (Last 7 Days)
                </h3>

                {/* SVG/HTML histogram */}
                <div className="h-48 flex items-end justify-between space-x-2 sm:space-x-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
                  {(stats.dailyStats || []).map((day: DayStat, idx) => {
                    const maxVal = Math.max(...(stats.dailyStats || []).map(d => d.visitors + d.qr + d.barcode), 10);
                    // Proportional height scales
                    const visitorPercent = Math.min((day.visitors / maxVal) * 100, 100);
                    const qrPercent = Math.min((day.qr / maxVal) * 100, 100);
                    const barcodePercent = Math.min((day.barcode / maxVal) * 100, 100);

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full group hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 rounded-lg p-1 relative">
                        
                        {/* Interactive Tooltip values on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[9px] font-mono rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-15">
                          <div>Visitors: {day.visitors}</div>
                          <div>QR Generated: {day.qr}</div>
                          <div>Barcodes: {day.barcode}</div>
                          <div>Ad Clicks: {day.adClicks}</div>
                        </div>

                        {/* Histogram visual stack */}
                        <div className="w-full flex-1 flex items-end justify-center space-x-0.5">
                          <div style={{ height: `${visitorPercent}%` }} className="w-2 rounded-t bg-indigo-500" title={`Visitors: ${day.visitors}`} />
                          <div style={{ height: `${qrPercent}%` }} className="w-2 rounded-t bg-teal-500" title={`QR Codes: ${day.qr}`} />
                          <div style={{ height: `${barcodePercent}%` }} className="w-2 rounded-t bg-amber-500" title={`Barcodes: ${day.barcode}`} />
                        </div>

                        {/* Date axis footer */}
                        <span className="text-[9px] font-mono text-gray-400 mt-2 rotate-[-25deg] sm:rotate-0 tracking-tight shrink-0">
                          {day.date.substring(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend config */}
                <div className="flex flex-wrap items-center justify-center space-x-6 text-[10px] text-gray-500 font-mono mt-4">
                  <span className="flex items-center"><span className="h-2 w-2 rounded bg-indigo-500 mr-1.5 block" />Visitors</span>
                  <span className="flex items-center"><span className="h-2 w-2 rounded bg-teal-500 mr-1.5 block" />QR Generated</span>
                  <span className="flex items-center"><span className="h-2 w-2 rounded bg-amber-500 mr-1.5 block" />Barcode Generated</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BLOG POST AUTHORING (CRUD) */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              
              {!editingBlog ? (
                // Article List State
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl shadow-sm overflow-hidden p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Published Articles</h3>
                    <button
                      onClick={() => setEditingBlog({ title: "", slug: "", excerpt: "", content: "", publishedAt: new Date().toISOString().split("T")[0] })}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold py-2 px-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg duration-150 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Write Article</span>
                    </button>
                  </div>

                  {blogs.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-400">No blog structures declared yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {blogs.map((post) => (
                        <div key={post.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 border border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-950/20 rounded-xl hover:border-indigo-200 transition-all">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 line-clamp-1">{post.title}</h4>
                            <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-mono">
                              <span>Slug: /{post.slug}</span>
                              <span>•</span>
                              <span>Published: {post.publishedAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                            <button
                              onClick={() => setEditingBlog(post)}
                              className="p-1 px-2 border dark:border-zinc-8 w text-[10px] text-gray-600 dark:text-zinc-400 hover:text-indigo-600 font-semibold rounded hover:bg-white flex items-center shrink-0 cursor-pointer"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleBlogDelete(post.id)}
                              className="p-1 px-2 border dark:border-rose-950 text-[10px] text-rose-500 hover:text-rose-700 font-semibold rounded hover:bg-rose-50 flex items-center shrink-0 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Article Editing Form State
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {editingBlog.id ? "Edit Blog Article" : "Write Custom SEO Article"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      Cancel Draft
                    </button>
                  </div>

                  <form onSubmit={handleBlogSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Article Title</label>
                        <input
                          type="text"
                          value={editingBlog.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Automatic SEO slug generation
                            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                            setEditingBlog({ ...editingBlog, title: val, slug });
                          }}
                          className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 animate-none">
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">SEO Slug URL string</label>
                        <input
                          type="text"
                          value={editingBlog.slug || ""}
                          onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                          className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none font-mono"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Search Meta Excerpt</label>
                        <input
                          type="text"
                          value={editingBlog.excerpt || ""}
                          onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                          className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                          placeholder="Short summary displayed on cards and index search lists"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Markdown Content Body</label>
                        <textarea
                          rows={12}
                          value={editingBlog.content || ""}
                          onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                          className="w-full text-sm px-4 py-3 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none font-mono"
                          placeholder="Write headers with ###, bullets with - , strong references with **word**"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Published Date</label>
                        <input
                          type="date"
                          value={editingBlog.publishedAt || ""}
                          onChange={(e) => setEditingBlog({ ...editingBlog, publishedAt: e.target.value })}
                          className="text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                        />
                      </div>

                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingBlog(null)}
                        className="px-4 py-2 border text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-50"
                      >
                        Delete Draft
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                      >
                        Publish Article Update
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEO CONFIGURATOR */}
          {activeTab === "seo" && settings && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
              
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white pb-3 border-b border-gray-50 dark:border-zinc-800">
                SEO Search Engine Optimization settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Website Name</label>
                  <input
                    type="text"
                    defaultValue={settings.siteName}
                    onBlur={(e) => saveSettings({ siteName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Base Meta Title Template</label>
                  <input
                    type="text"
                    defaultValue={settings.siteTitle}
                    onBlur={(e) => saveSettings({ siteTitle: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-805 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Base Meta Description</label>
                  <textarea
                    rows={2}
                    defaultValue={settings.siteDescription}
                    onBlur={(e) => saveSettings({ siteDescription: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-810 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Google Analytics 4 ID (GA4)</label>
                  <input
                    type="text"
                    defaultValue={settings.googleAnalyticsId}
                    placeholder="e.g. G-H2938SJK10"
                    onBlur={(e) => saveSettings({ googleAnalyticsId: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-815 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Google Search Console verification code</label>
                  <input
                    type="text"
                    defaultValue={settings.googleSearchConsoleVerification}
                    placeholder="Paste verification string"
                    onBlur={(e) => saveSettings({ googleSearchConsoleVerification: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Microsoft Clarity tracking ID</label>
                  <input
                    type="text"
                    defaultValue={settings.clarityId}
                    onBlur={(e) => saveSettings({ clarityId: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-lg outline-none font-mono"
                    placeholder="e.g. clarity-id-123"
                  />
                </div>

              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-zinc-950/45 rounded-xl border border-indigo-100/50 dark:border-zinc-850 text-[11px] text-gray-600 dark:text-zinc-400 font-medium">
                ⓘ Saving is triggered on-blur (when clicking outside of the active text field). The dynamic header interceptor automatically synchronizes sitemaps, schemas, and robots.txt outputs for Google crawlers.
              </div>

            </div>
          )}

          {/* TAB 4: ADSENSE INTEGRATOR */}
          {activeTab === "ads" && settings && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
              
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white pb-3 border-b border-gray-50 dark:border-zinc-800">
                Google AdSense script Injector slots
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Integrate Google AdSense advertisement codes into exact spatial placements. Leaving a text area empty falls back to showing an elegant mockup visual frame.
              </p>

              <div className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 dark:text-zinc-300">1. Header Banner Slot (Auto-Anchor Leaderboard 728 x 90)</label>
                  <textarea
                    rows={2}
                    placeholder="Paste structural <script> here..."
                    defaultValue={settings.headerAdCode}
                    onBlur={(e) => saveSettings({ headerAdCode: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 animate-none">
                  <label className="text-xs font-bold text-gray-750 dark:text-zinc-300">2. Sidebar Tower Slot (Right Skybox / Bento column 300 x 600)</label>
                  <textarea
                    rows={2}
                    placeholder="Paste structural <script> here..."
                    defaultValue={settings.sidebarAdCode}
                    onBlur={(e) => saveSettings({ sidebarAdCode: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 animate-none">
                  <label className="text-xs font-bold text-gray-750 dark:text-zinc-300">3. Under Generator Result impact slot (High CPM Native Banner)</label>
                  <textarea
                    rows={2}
                    placeholder="Paste structural <script> here..."
                    defaultValue={settings.resultAdCode}
                    onBlur={(e) => saveSettings({ resultAdCode: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 dark:text-zinc-300">4. Article Inline Placement Slot (Responsive Text Units)</label>
                  <textarea
                    rows={2}
                    placeholder="Paste structural <script> here..."
                    defaultValue={settings.contentAdCode}
                    onBlur={(e) => saveSettings({ contentAdCode: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 dark:text-zinc-300">5. Global Footer Anchor Slot (Leaderboard 970 x 90)</label>
                  <textarea
                    rows={2}
                    placeholder="Paste structural <script> here..."
                    defaultValue={settings.footerAdCode}
                    onBlur={(e) => saveSettings({ footerAdCode: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                  />
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: SECURITY KEYS RESET */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 max-w-lg">
              
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white pb-3 border-b border-gray-50 dark:border-zinc-800">
                Update Admin Panel Access key
              </h3>

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">New Secret Passcode</label>
                  <input
                    type="password"
                    placeholder="Type new passcode here..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 duration-150 text-white font-semibold text-xs rounded-xl"
                >
                  Save Access Passcode
                </button>
              </form>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
