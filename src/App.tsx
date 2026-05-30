/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  QrCode, Barcode, Check, Star, HelpCircle, ArrowRight, Zap, ShieldCheck, 
  Sparkles, Layers, Minimize2, Eye, Download, Users, ChevronDown, ChevronUp, Share2
} from "lucide-react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { AdContainer } from "./components/AdContainer";
import { QRCodeGenerator } from "./components/QRCodeGenerator";
import { BarcodeGenerator } from "./components/BarcodeGenerator";
import { BlogModule } from "./components/BlogModule";
import { AdminPanel } from "./components/AdminPanel";
import { Blog, Settings } from "./types";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Home FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Setup Routing Navigation hook
  const handleNavigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch Public Website settings & blogs
  const fetchPublicData = async () => {
    try {
      const res = await fetch("/api/public/db");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error("Error reading public db parameters:", err);
    }
  };

  // Log site visitors and fetch configurations on boot
  useEffect(() => {
    fetchPublicData();

    // Increment visitor statistics once per browser load
    fetch("/api/public/increment-stat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visitors" }),
    }).catch(console.error);
  }, []);

  // Central metric increment tracker
  const handleTrackOperation = (type: "qrGenerated" | "barcodeGenerated") => {
    fetch("/api/public/increment-stat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    }).catch(console.error);
  };

  const handleTrackAdClick = () => {
    fetch("/api/public/increment-stat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "adClicks" }),
    }).catch(console.error);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // FAQs structures
  const FAQs = [
    {
      q: "Is this QR and Barcode generator actually 100% free?",
      a: "Yes, absolutely! There are no registration steps, no trial limits, no credit card requirements, and no watermarks on downloaded PNG, JPG, or SVG assets. Generate, customize, and export as many designs as your products or campaigns need."
    },
    {
      q: "Do you collect or store my QR contents or text codes?",
      a: "No! Privacy is our standard. The entire generation engine runs locally inside your client-side browser using Javascript. Your prefilled text values, contact details, coordinates, or Wi-Fi passwords never get processed on external servers."
    },
    {
      q: "What is the benefit of downloading QR codes as SVG vectors?",
      a: "SVG (Scalable Vector Graphics) maintains perfect mathematical precision regardless of how large they are scale-blown. Creating SVGs allows print companies to stretch your QR onto billboard columns, storefront glass, packaging crates, or apparel fabrics without blurring edges."
    },
    {
      q: "Which linear barcode format is recommended for shipping & logistics?",
      a: "We highly recommend **Code 128**. It is an extremely dense linear standard reading uppercase and lowercase characters, numeric digits, and special ASCII characters. If you are preparing standard commercial products for retail checkout counters, use **EAN-13** (Global standard) or **UPC-A** (Standard widely preferred across North America)."
    },
    {
      q: "Can I add brand logos inside my QR code?",
      a: "Yes! Click on 'vCard Generator' or standard 'URL Link' templates, locate the 'Logo Upload' box, and upload your icon. The system locks error-correction-level automatically to 'High (30%)'. This ensures standard camera lenses can easily scan around the central logo image without visual errors."
    }
  ];

  // Routing Handler Render Matrix
  const renderRouteView = () => {
    // -----------------------------------------------------------------
    // INDEX / HOMEPAGE VIEW
    // -----------------------------------------------------------------
    if (currentPath === "/" || currentPath === "") {
      return (
        <div className="space-y-16 py-8">
          
          {/* Header Ad Slot */}
          <AdContainer placement="header" codeHtml={settings?.headerAdCode} onAdClick={handleTrackAdClick} />

          {/* HERO SECTION */}
          <section className="text-center max-w-4xl mx-auto px-4 mt-6">
            
            {/* Sparkling notification tag */}
            <div className="inline-flex items-center space-x-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-zinc-900 dark:text-blue-400 border border-blue-100/50 dark:border-zinc-800/20 mb-6 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full SVG/PNG Vector Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
              Create and Download Custom Codes <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-650 bg-clip-text text-transparent">
                Instantly & 100% Free
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 dark:text-zinc-400 mt-4 leading-relaxed font-normal">
              Fully customize QR codes with logos, custom foreground and background colors, and quiet margins. Generate standard 1D logistics barcodes instantly. No subscription required.
            </p>

            {/* Hero CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
              <button
                onClick={() => handleNavigate("/qr-code-generator")}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center space-x-2 transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                <QrCode className="h-5 w-5" />
                <span>Create QR Code</span>
              </button>

              <button
                onClick={() => handleNavigate("/barcode-generator")}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                <Barcode className="h-5 w-5" />
                <span>Create Barcode</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 dark:text-zinc-500 mt-6 font-mono font-medium">
              <span className="flex items-center">✓ SVG Vector Output</span>
              <span className="flex items-center">✓ 100% Secure & Client-Side</span>
            </div>
          </section>

          {/* Popular QR Code Types section */}
          <section className="bg-white dark:bg-zinc-900 border-y border-slate-200 dark:border-zinc-850/80 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              
              <div className="mb-10 text-center max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Popular QR Code Templates
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-zinc-400">
                  Select predefined layouts to instantly trigger specific phone, contact, layout, or secure internet actions.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Website URL Link", desc: "Open links, catalogs, portals on scan", path: "/qr-code-generator" },
                  { name: "Wi-Fi Hotspot Logins", desc: "Join Wi-Fi networks without password entry", path: "/wifi-qr-code-generator" },
                  { name: "vCard Digital Contact", desc: "Automate phone and address saving", path: "/vcard-qr-code-generator" },
                  { name: "Social Media handles", desc: "Grow profile subscribers instantly", path: "/qr-code-generator" }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleNavigate(item.path)}
                    className="p-5 border border-slate-200/85 dark:border-zinc-800 rounded-2xl bg-slate-50/30 dark:bg-zinc-950/20 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer group hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 w-fit mb-3.5 group-hover:scale-105 transition-transform duration-200">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center group-hover:text-blue-650 dark:group-hover:text-blue-400 transition-colors">
                      {item.name}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Barcode Symbologies section */}
          <section className="max-w-6xl mx-auto px-4">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Linear Barcode Symbologies
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-zinc-400">
                Produce structural barcode vectors matching global standards for supermarket checkouts, warehousing, or manufacturing assets.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-1">
              {[
                { name: "Code 128 (Universal)", desc: "Density logistics & warehouse tracker", path: "/code128-generator" },
                { name: "EAN-13 (Retail Intl)", desc: "Standard superstore POS pricing codes", path: "/ean13-generator" },
                { name: "UPC-A (North America)", desc: "General commerce checkout labels", path: "/barcode-generator" },
                { name: "Industrial Code 39", desc: "Alphanumeric tracking labels", path: "/barcode-generator" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => handleNavigate(item.path)}
                  className="p-5 border border-slate-200/85 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-905 hover:border-blue-500 cursor-pointer group hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-450 w-fit mb-3.5 group-hover:scale-105 transition-transform duration-200">
                    <Barcode className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center group-hover:text-blue-650 transition-colors">
                    {item.name}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sponsor inline banner */}
          <AdContainer placement="content" codeHtml={settings?.contentAdCode} onAdClick={handleTrackAdClick} />

          {/* FEATURES GRID SECTION */}
          <section className="bg-slate-50 dark:bg-zinc-950/40 border-y border-slate-200 dark:border-zinc-850 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              
              <div className="mb-12 text-center max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Premium Standard Features
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-zinc-400">
                  Compare our rapid, server-less generation suite benefits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="p-5 text-center sm:text-left bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl mb-4 mx-auto sm:mx-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Blazing Fast Rendering</h3>
                  <p className="text-xs text-slate-550 dark:text-zinc-400 mt-1 leading-relaxed">
                    Compiled purely client-side locally in your browser. Generates images and vector structures in milliseconds.
                  </p>
                </div>

                <div className="p-5 text-center sm:text-left bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl mb-4 mx-auto sm:mx-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Central Branding Logos</h3>
                  <p className="text-xs text-slate-550 dark:text-zinc-400 mt-1 leading-relaxed">
                    Upload PNG outline badges or brand logos. Automatically centers, scales, and scales error-checking up to **30%** protection.
                  </p>
                </div>

                <div className="p-5 text-center sm:text-left bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl mb-4 mx-auto sm:mx-0">
                    <Minimize2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Lossless Vector Formats</h3>
                  <p className="text-xs text-slate-550 dark:text-zinc-400 mt-1 leading-relaxed">
                    Export high density PNG grids or download XML raw SVG formats to stretch onto giant billboards or apparel.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* RECENT BLOG GUIDES SUMMARY */}
          {blogs.length > 0 && (
            <section className="max-w-6xl mx-auto px-4">
              <div className="mb-10 text-center max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Fresh Integration & Sourcing Articles
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-zinc-400">
                  Read from our optimized SEO knowledge channel covering logistics, tracking formats, and campaign setups.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {blogs.slice(0, 2).map((post) => (
                  <div key={post.id} className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl hover:border-blue-400 transition-all">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block mb-2">Verified Sourcing Article</span>
                    <h3 
                      onClick={() => handleNavigate(`/blog/${post.slug}`)}
                      className="text-md sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1 leading-snug transition-colors"
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-450 mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <button 
                      onClick={() => handleNavigate(`/blog/${post.slug}`)} 
                      className="mt-4 inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SYSTEM FAQ ACCORDION */}
          <section className="bg-white dark:bg-zinc-900 max-w-4xl mx-auto px-4 py-8 rounded-3xl border border-slate-205 dark:border-zinc-850">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-955 dark:text-white tracking-tight text-center mb-2">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal text-center max-w-lg mx-auto mb-8 dark:text-zinc-400">
              Find transparent answers regarding watermark licensing, metadata tracking, and barcode selection formats.
            </p>

            <div className="space-y-3.5">
              {FAQs.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-150 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 rounded-xl overflow-hidden transition-all duration-350"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-250 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 duration-150"
                    >
                      <span>{faq.q}</span>
                      {open ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                    </button>

                    {open && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-850 whitespace-pre-line bg-white/70 dark:bg-zinc-900/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer Ad Placement */}
          <AdContainer placement="footer" codeHtml={settings?.footerAdCode} onAdClick={handleTrackAdClick} />

        </div>
      );
    }

    // -----------------------------------------------------------------
    // QR CODE GENERATOR ROUTE VIEW
    // -----------------------------------------------------------------
    if (
      currentPath === "/qr-code-generator" || 
      currentPath === "/wifi-qr-code-generator" || 
      currentPath === "/vcard-qr-code-generator"
    ) {
      let activePreset: any = "url";
      if (currentPath === "/wifi-qr-code-generator") activePreset = "wifi";
      if (currentPath === "/vcard-qr-code-generator") activePreset = "vcard";

      const labels = {
        url: { title: "Universal QR Code Creator", desc: "Build unlimited custom QR codes for website URLs, landing pages, and redirect promotions." },
        wifi: { title: "Secure Wi-Fi QR Code Generator", desc: "Generate simple scans to let guests link directly to corporate, cafe, or home wireless nodes." },
        vcard: { title: "vCard Digital Contact QR Creator", desc: "Share telephone links, work emails, firm cards, and social headers in single camera taps." }
      }[activePreset as "url" | "wifi" | "vcard"] || { title: "Universal QR Code Creator", desc: "Build custom QR codes instantly." };

      return (
        <div className="space-y-8 py-8 px-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">{labels.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 dark:text-zinc-400">{labels.desc}</p>
          </div>
          
          <QRCodeGenerator 
            initialType={activePreset} 
            onTrackGeneration={() => handleTrackOperation("qrGenerated")}
            onAdClick={handleTrackAdClick} 
          />
        </div>
      );
    }

    // -----------------------------------------------------------------
    // BARCODE GENERATOR ROUTE VIEW
    // -----------------------------------------------------------------
    if (
      currentPath === "/barcode-generator" ||
      currentPath === "/ean13-generator" ||
      currentPath === "/code128-generator"
    ) {
      let activePreset: any = "CODE128";
      if (currentPath === "/ean13-generator") activePreset = "EAN13";

      const labels = {
        CODE128: { title: "Alphanumeric Code 128 Barcode Generator", desc: "Produce high-density Code 128 shipment tags, inventory stickers, and logistics assets." },
        EAN13: { title: "Superstore EAN-13 Retail Barcode Generator", desc: "Create compliant 13-digit EAN-13 European Article Numbers for retail checkouts globally." }
      }[activePreset as "CODE128" | "EAN13"] || { title: "Professional Barcode Generator", desc: "Generate linear 1D barcodes instantly." };

      return (
        <div className="space-y-8 py-8 px-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">{labels.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 dark:text-zinc-400">{labels.desc}</p>
          </div>

          <BarcodeGenerator 
            initialType={activePreset}
            onTrackGeneration={() => handleTrackOperation("barcodeGenerated")}
            onAdClick={handleTrackAdClick}
          />
        </div>
      );
    }

    // -----------------------------------------------------------------
    // NEWSPAPER BLOG MODULES VIEW
    // -----------------------------------------------------------------
    if (currentPath.startsWith("/blog")) {
      // Extract optional sub-slug mapping
      const slugSegment = currentPath.split("/blog/")[1] || null;
      
      return (
        <BlogModule 
          blogs={blogs} 
          activeSlug={slugSegment} 
          onNavigate={handleNavigate}
          onAdClick={handleTrackAdClick}
        />
      );
    }

    // -----------------------------------------------------------------
    // ADMINISTRATIVE CONFIGS CONTROL CONSOLE
    // -----------------------------------------------------------------
    if (currentPath === "/admin") {
      return (
        <AdminPanel onRefreshPublicData={fetchPublicData} />
      );
    }

    // -----------------------------------------------------------------
    // FALLBACK REDIRECT STATE
    // -----------------------------------------------------------------
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-4xl font-extrabold text-blue-600 dark:text-amber-500 font-mono">404</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Sourcing Asset not found on server.</p>
        <button
          onClick={() => handleNavigate("/")}
          className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-850 dark:bg-zinc-950 dark:text-zinc-205 transition-colors duration-300 antialiased font-sans">
      
      {/* Dynamic Animated Head Navigation */}
      <Navigation currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Container */}
      <main className="flex-grow">
        {renderRouteView()}
      </main>

      {/* Master Footer Node with Link Mapping */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
