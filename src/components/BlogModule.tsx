import React, { useEffect, useState } from "react";
import { BookOpen, Calendar, Eye, ArrowLeft, Clock, ArrowRight, User, Check } from "lucide-react";
import { Blog } from "../types";
import { motion } from "motion/react";

interface BlogModuleProps {
  blogs: Blog[];
  activeSlug: string | null;
  onNavigate: (path: string) => void;
  onAdClick?: () => void;
}

export function BlogModule({ blogs, activeSlug, onNavigate, onAdClick }: BlogModuleProps) {
  const [selectedPost, setSelectedPost] = useState<Blog | null>(null);

  useEffect(() => {
    if (activeSlug) {
      const post = blogs.find((b) => b.slug === activeSlug);
      if (post) {
        setSelectedPost(post);
        // Increment view counts on the backend
        fetch("/api/public/increment-stat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "visitors" }), // Simulated visitor view tracker
        }).catch(console.error);
        
        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setSelectedPost(null);
    }
  }, [activeSlug, blogs]);

  // Quick markdown rendering to HTML elements with elegant styling
  const renderSimpleMarkdown = (markdown: string) => {
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-6 mb-3 font-sans tracking-tight">
            {trimmed.substring(4)}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-bold text-gray-900 dark:text-zinc-50 mt-8 mb-4 font-sans tracking-tight">
            {trimmed.substring(3)}
          </h2>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl font-extrabold text-gray-950 dark:text-white mt-10 mb-6 font-sans tracking-tight">
            {trimmed.substring(2)}
          </h1>
        );
      }

      // Dividers
      if (trimmed === "---") {
        return <div key={idx} className="my-6 border-t border-gray-100 dark:border-zinc-800" />;
      }

      // List bullet items
      if (trimmed.startsWith("- ")) {
        const rest = trimmed.substring(2);
        const parts = rest.split("**");
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-gray-700 dark:text-zinc-350 my-1.5 leading-relaxed">
            {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-950 dark:text-zinc-100">{p}</strong> : p)}
          </li>
        );
      }

      // Numbered list items
      if (/^\d+\.\s+/.test(trimmed)) {
        const rest = trimmed.replace(/^\d+\.\s+/, "");
        const parts = rest.split("**");
        return (
          <li key={idx} className="ml-5 list-decimal text-sm text-gray-700 dark:text-zinc-350 my-1.5 leading-relaxed">
            {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-950 dark:text-zinc-100">{p}</strong> : p)}
          </li>
        );
      }

      // Blank line spacer
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph blocks
      const parts = trimmed.split("**");
      return (
        <p key={idx} className="text-sm text-gray-700 dark:text-zinc-350 my-3 leading-relaxed">
          {parts.map((p, pIdx) => {
            if (pIdx % 2 === 1) {
              return <strong key={pIdx} className="font-semibold text-gray-950 dark:text-zinc-100">{p}</strong>;
            }
            // If code backticks are included
            const backticks = p.split("`");
            return backticks.map((b, bIdx) => {
              if (bIdx % 2 === 1) {
                return <code key={bIdx} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-xs font-mono text-blue-600 dark:text-blue-400">{b}</code>;
              }
              return b;
            });
          })}
        </p>
      );
    });
  };

  // Calculate read length
  const getReadTime = (content: string): string => {
    const words = content.split(/\s+/).length;
    const time = Math.ceil(words / 180);
    return `${time} min read`;
  };

  // Detailed article view handler
  if (selectedPost) {
    return (
      <article className="max-w-3xl mx-auto px-4 py-8 animate-none">
        
        {/* Back Link */}
        <button
          onClick={() => onNavigate("/blog")}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-8 py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </button>

        {/* Hero Meta Header */}
        <header className="mb-8 border-b border-gray-100 dark:border-zinc-850 pb-8">
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-zinc-500 mb-3 font-mono items-center">
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {selectedPost.publishedAt}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {getReadTime(selectedPost.content)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
              Editorial Board
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
            {selectedPost.title}
          </h1>
          <p className="text-base text-gray-500 dark:text-zinc-400 mt-3 font-serif leading-relaxed italic">
            "{selectedPost.excerpt}"
          </p>
        </header>

        {/* Adsense Inline Banner placement if defined */}
        <div onClick={onAdClick} className="my-6">
          <div className="h-[90px] border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 rounded-xl flex items-center justify-center p-4 cursor-pointer text-center group">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 dark:text-zinc-650 block">In-Content Ad Placement</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600">Responsive Display Unit</span>
            </div>
          </div>
        </div>

        {/* Dynamic Rich-Text Content Area */}
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          {renderSimpleMarkdown(selectedPost.content)}
        </div>

        {/* Footer info banner */}
        <div className="mt-12 p-5 bg-blue-50/30 dark:bg-zinc-900/40 rounded-2xl border border-slate-205 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-zinc-800 dark:text-zinc-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Learn to build custom identifiers</p>
              <p className="text-gray-500 dark:text-zinc-400 mt-0.5">Explore our free generators to export vectors instantly.</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("/qr-code-generator")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 text-xs shadow-sm shadow-blue-150 transition-all duration-150 shrink-0 cursor-pointer"
          >
            <span>Create Free QR</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </article>
    );
  }

  // Blog listings index
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Intro section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Smarter QR & Barcode Guides
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
          Discover professional tips, layout specifications, and deployment suggestions regarding 1D codes, EAN/UPC barcodes, and secure mobile scanners.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12 border rounded-xl border-dashed bg-gray-50 dark:bg-zinc-900/60 dark:border-zinc-800 font-medium">
          <BookOpen className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No published articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-855 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-zinc-800 flex flex-col justify-between group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 dark:text-zinc-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {post.publishedAt}
                  </span>
                  <span className="flex items-center font-semibold text-blue-500">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {getReadTime(post.content)}
                  </span>
                </div>

                <h2 
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="text-md font-bold text-gray-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-300 cursor-pointer line-clamp-2 leading-snug transition-colors duration-250"
                >
                  {post.title}
                </h2>
                
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-850 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                  <Check className="h-3 w-3 mr-1 text-blue-600" />
                  Verified Guide
                </span>
                <button
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center hover:underline group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer ads spacer */}
      <div className="mt-12" onClick={onAdClick}>
        <div className="h-[90px] border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 rounded-xl flex items-center justify-center p-4 cursor-pointer text-center group">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-450 block">Sponsor Banner placement</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600">Dynamic Google AdSense (728 x 90)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
