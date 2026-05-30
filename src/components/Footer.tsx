import React from "react";
import { QrCode, ArrowRight, Activity, Cpu, CheckCircle } from "lucide-react";

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-slate-950 text-slate-350 dark:bg-zinc-950 dark:text-zinc-400 border-t border-slate-800 dark:border-zinc-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Brand & Intro */}
          <div className="md:col-span-1 space-y-4">
            <div 
              onClick={(e) => handleLinkClick(e, "/")}
              className="flex items-center space-x-2.5 cursor-pointer group w-fit"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-900/50">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="text-md font-bold tracking-tight text-white">
                CodeCraft <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 py-0.5 rounded font-mono font-normal">PRO</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 dark:text-zinc-500">
              Free Barcode & QR Code Generator offers rapid, unlimited linear barcodes and custom 2D codes with logos. Built for speed, high precision, and seamless vector downloads.
            </p>
            <div className="flex flex-col space-y-1 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                100% Client-Side Engine
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                No registration required
              </span>
            </div>
          </div>

          {/* Column 2: Generator Suite */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              QR Code Suites
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <a 
                  href="/qr-code-generator" 
                  onClick={(e) => handleLinkClick(e, "/qr-code-generator")}
                  className="hover:text-blue-500 transition-colors"
                >
                  Universal Code Creator
                </a>
              </li>
              <li>
                <a 
                  href="/wifi-qr-code-generator" 
                  onClick={(e) => handleLinkClick(e, "/wifi-qr-code-generator")}
                  className="text-blue-400 hover:text-blue-500 flex items-center group font-medium"
                >
                  Wi-Fi Login Generator
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
              <li>
                <a 
                  href="/vcard-qr-code-generator" 
                  onClick={(e) => handleLinkClick(e, "/vcard-qr-code-generator")}
                  className="text-blue-400 hover:text-blue-550 flex items-center group font-medium"
                >
                  vCard Contact QR Creator
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
              <li>
                <span className="text-slate-550 italic text-[11px]">Supports Logo Overlays</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Barcodes Symbologies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Barcode Symbologies
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <a 
                  href="/barcode-generator" 
                  onClick={(e) => handleLinkClick(e, "/barcode-generator")}
                  className="hover:text-blue-500 transition-colors"
                >
                  Universal Barcode Tool
                </a>
              </li>
              <li>
                <a 
                  href="/code128-generator" 
                  onClick={(e) => handleLinkClick(e, "/code128-generator")}
                  className="text-blue-400 hover:text-blue-500 flex items-center group font-medium"
                >
                  Code 128 (Logistics Standard)
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
              <li>
                <a 
                  href="/ean13-generator" 
                  onClick={(e) => handleLinkClick(e, "/ean13-generator")}
                  className="text-blue-400 hover:text-blue-550 flex items-center group font-medium"
                >
                  EAN-13 (International Retail)
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
              <li>
                <a 
                  href="/barcode-generator" 
                  onClick={(e) => handleLinkClick(e, "/barcode-generator")}
                  className="text-slate-400 hover:text-blue-500"
                >
                  UPC-A / Code 39 / Codabar
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Map */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              SEO Assets & Sitemap
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <a 
                  href="/blog" 
                  onClick={(e) => handleLinkClick(e, "/blog")}
                  className="hover:text-blue-550 hover:text-blue-500 transition-colors"
                >
                  Knowledge Hub (Blogs)
                </a>
              </li>
              <li>
                <a 
                  href="/robots.txt" 
                  target="_blank" 
                  className="hover:text-blue-500 transition-colors font-mono text-[11px]"
                >
                  /robots.txt (Crawl Directives)
                </a>
              </li>
              <li>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  className="hover:text-blue-500 transition-colors font-mono text-[11px] text-blue-400 font-semibold"
                >
                  /sitemap.xml (Google Index Map)
                </a>
              </li>
              <li>
                <a 
                  href="/admin" 
                  onClick={(e) => handleLinkClick(e, "/admin")}
                  className="hover:text-blue-500 transition-colors text-slate-500"
                >
                  Admin Panel Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and copyright */}
        <div className="mt-12 border-t border-slate-800 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} CodeCraft Inc. Optimized for Core Web Vitals. Google AdSense ready. All rights reserved.
          </p>
          <div className="flex space-x-4 text-xs text-slate-500">
            <span className="flex items-center">
              <Cpu className="h-3 w-3 mr-1 text-blue-500" />
              Engine: JS-SVG Rasterizer v12.1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
