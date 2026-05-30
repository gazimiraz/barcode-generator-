import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json());

// Helper function to read DB
function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  return { settings: {}, stats: { dailyStats: [] }, blogs: [] };
}

// Helper function to write DB
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Escapes special HTML characters
function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// -------------------------------------------------------------
// LIVE STATISTICS INCREMENT ROUTE
// -------------------------------------------------------------
app.post("/api/public/increment-stat", (req, res) => {
  const { type } = req.body; // 'visitors' | 'qrGenerated' | 'barcodeGenerated' | 'adClicks'
  if (!type || !["visitors", "qrGenerated", "barcodeGenerated", "adClicks"].includes(type)) {
    return res.status(400).json({ error: "Invalid type parameter" });
  }

  const db = readDb();
  
  // Increment general counters
  if (db.stats[type] !== undefined) {
    db.stats[type]++;
  } else {
    db.stats[type] = 1;
  }

  // Handle Daily Stats tracking
  const todayStr = new Date().toISOString().split("T")[0];
  if (!db.stats.dailyStats) {
    db.stats.dailyStats = [];
  }

  let dayStat = db.stats.dailyStats.find((d: any) => d.date === todayStr);
  if (!dayStat) {
    dayStat = { date: todayStr, visitors: 0, qr: 0, barcode: 0, adClicks: 0 };
    db.stats.dailyStats.push(dayStat);
  }

  if (type === "visitors") dayStat.visitors++;
  if (type === "qrGenerated") dayStat.qr++;
  if (type === "barcodeGenerated") dayStat.barcode++;
  if (type === "adClicks") dayStat.adClicks++;

  // Max 30 days of history to prevent scaling file size issues
  if (db.stats.dailyStats.length > 30) {
    db.stats.dailyStats.shift();
  }

  writeDb(db);
  res.json({ success: true, baseStats: db.stats });
});

// -------------------------------------------------------------
// PUBLIC WEBSITE CONFIGURATION & DATA ENDPOINT
// -------------------------------------------------------------
app.get("/api/public/db", (req, res) => {
  const db = readDb();
  // Safe settings to expose publicly
  const publicSettings = { ...db.settings };
  delete publicSettings.adminPassword; // Stripped sensitive data

  res.json({
    settings: publicSettings,
    blogs: db.blogs || [],
  });
});

// -------------------------------------------------------------
// ADMIN LOGIN & AUTHENTICATION ENDPOINT
// -------------------------------------------------------------
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const db = readDb();
  const actualPassword = db.settings.adminPassword || "admin";

  if (password === actualPassword) {
    res.json({ success: true, token: "admin-auth-token-12345" });
  } else {
    res.status(401).json({ success: false, error: "Incorrect credentials" });
  }
});

// Simple validation middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer admin-auth-token-12345") {
    next();
  } else {
    res.status(403).json({ error: "Access Denied. Invalid Authorization token." });
  }
};

// -------------------------------------------------------------
// ADMIN CRUD & PRIVATE DATA ENDPOINTS
// -------------------------------------------------------------
app.get("/api/admin/db", requireAuth, (req, res) => {
  const db = readDb();
  res.json(db);
});

// Update Administrative Settings (incl Password)
app.post("/api/admin/settings", requireAuth, (req, res) => {
  const newSettings = req.body;
  const db = readDb();
  
  db.settings = {
    ...db.settings,
    ...newSettings
  };

  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// Add or Edit Blog Post
app.post("/api/admin/blogs", requireAuth, (req, res) => {
  const body = req.body;
  const db = readDb();
  if (!db.blogs) db.blogs = [];

  const existingIndex = db.blogs.findIndex((b: any) => b.id === body.id || b.slug === body.slug);
  const nowStr = new Date().toISOString().split("T")[0];

  if (existingIndex > -1) {
    // Update existing
    db.blogs[existingIndex] = {
      ...db.blogs[existingIndex],
      ...body,
      views: db.blogs[existingIndex].views || 0
    };
  } else {
    // Create new
    const newId = body.id || String(Date.now());
    db.blogs.push({
      ...body,
      id: newId,
      views: 0,
      publishedAt: body.publishedAt || nowStr
    });
  }

  writeDb(db);
  res.json({ success: true, blogs: db.blogs });
});

// Delete Blog Post
app.delete("/api/admin/blogs/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  
  db.blogs = (db.blogs || []).filter((b: any) => b.id !== id);
  writeDb(db);
  res.json({ success: true, blogs: db.blogs });
});


// -------------------------------------------------------------
// DYNAMIC SEO ROBOTS.TXT & SITEMAP XML ENDPOINTS
// -------------------------------------------------------------
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const protocol = req.secure ? "https" : "http";
  const sitemapUrl = `${protocol}://${host}/sitemap.xml`;

  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${sitemapUrl}`);
});

app.get("/sitemap.xml", (req, res) => {
  const db = readDb();
  const host = req.headers.host || "localhost:3000";
  const protocol = req.secure ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const generatorPaths = [
    "/qr-code-generator",
    "/barcode-generator",
    "/ean13-generator",
    "/code128-generator",
    "/wifi-qr-code-generator",
    "/vcard-qr-code-generator"
  ];

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage url
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Generator pages urls
  generatorPaths.forEach((path) => {
    xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Blog list page url
  xml += `  <url>\n    <loc>${baseUrl}/blog</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

  // Blog posts urls
  if (db.blogs && db.blogs.length > 0) {
    db.blogs.forEach((post: any) => {
      xml += `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${post.publishedAt || today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
  }

  xml += `</urlset>\n`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});


// -------------------------------------------------------------
// DYNAMIC METADATA & SCHEMA INTERCEPTOR & RENDERER
// -------------------------------------------------------------
function getSEOProperties(url: string, db: any, fullHost: string) {
  const settings = db.settings || {};
  let title = settings.siteName || "Barcode & QR Code Generator";
  let description = settings.siteDescription || "Free online barcode and QR code creator website.";
  let schema: any = null;

  const appUrl = `https://${fullHost}`;

  if (url === "/qr-code-generator") {
    title = `Free QR Code Generator | Customize & Download SVG/PNG | ${settings.siteName}`;
    description = "Create custom QR codes with logo, color configuration, and margins without registration. Exports in crisp vector SVG, PDF, or high-res PNG designs.";
    schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Free QR Code Generator",
      "url": `${appUrl}/qr-code-generator`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "description": description,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
  } else if (url === "/barcode-generator") {
    title = `Free Barcode Generator | Support Code 128, ENA, UPC | ${settings.siteName}`;
    description = "Generate standard linear 1D product barcodes instantly. Fully customizable line width, label text, margins, and download exports in SVG, PNG, and PDF.";
    schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Free Barcode Generator",
      "url": `${appUrl}/barcode-generator`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "description": description,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
  } else if (url === "/ean13-generator") {
    title = `EAN-13 Barcode Generator - Create Custom Retail Labels | ${settings.siteName}`;
    description = "Generate standard compliance EAN-13 retail labels containing company prefix numbers. Ready for retail checkout registers globally. SVG/PNG vector downloads.";
  } else if (url === "/code128-generator") {
    title = `Code 128 Barcode Generator - High-Density Logistics labels | ${settings.siteName}`;
    description = "Generate compact, alphanumeric Code 128 barcodes. The logistics standard for shipment trackers, equipment tracking, and packaging inventory labels.";
  } else if (url === "/wifi-qr-code-generator") {
    title = `Wi-Fi QR Code Generator - Scan to Connect Wireless Internet | ${settings.siteName}`;
    description = "Produce instantly scanning Wi-Fi logins for office, cafe, and home guests. Avoid tedious typing and password leaks. Scan and connect instantly.";
  } else if (url === "/vcard-qr-code-generator") {
    title = `vCard QR Code Generator - Digital Business Card Scanner | ${settings.siteName}`;
    description = "Generate dynamic contact QR codes linking phone, email, websites, and bio links. Fast digital business cards imported in single click scanners.";
  } else if (url.startsWith("/blog/")) {
    const slug = url.split("/blog/")[1]?.split("?")[0];
    const post = (db.blogs || []).find((b: any) => b.slug === slug);
    if (post) {
      title = `${post.title} | ${settings.siteName}`;
      description = post.excerpt || description;
      schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.publishedAt,
        "author": { "@type": "Person", "name": "Admin" },
        "publisher": {
          "@type": "Organization",
          "name": settings.siteName,
          "logo": { "@type": "ImageObject", "url": `${appUrl}/logo-placeholder.png` }
        }
      };
    }
  } else if (url === "/blog") {
    title = `Articles & Guides - QR & Barcode Best Practices | ${settings.siteName}`;
    description = "Explore detailed guides, industry news, and integration codes regarding 1D structure codes, EAN/UPC barcodes, and scan-centric QR marketing programs.";
  } else if (url === "/" || url === "") {
    title = settings.siteTitle || `${settings.siteName} - Create codes Instantly`;
    description = settings.siteDescription || description;
    schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": settings.siteName,
      "url": appUrl,
      "description": description
    };
  }

  return { title, description, schema };
}

// Global page server handling dynamic metatags
async function serveAppWithMeta(req: express.Request, res: express.Response, htmlSourcePath: string, viteInstance?: any) {
  try {
    const db = readDb();
    const fullHost = req.get("host") || "localhost:3000";
    const pathUrl = req.path;
    const info = getSEOProperties(pathUrl, db, fullHost);

    let html = fs.readFileSync(htmlSourcePath, "utf-8");

    if (viteInstance) {
      html = await viteInstance.transformIndexHtml(req.originalUrl, html);
    }

    const titleTag = `<title>${escapeHtml(info.title)}</title>`;
    const schemaTag = info.schema 
      ? `<script type="application/ld+json">${JSON.stringify(info.schema)}</script>` 
      : "";

    // Dynamic insertions for SEO
    const metaTags = `
    <title>${escapeHtml(info.title)}</title>
    <meta name="description" content="${escapeHtml(info.description)}" />
    <meta property="og:title" content="${escapeHtml(info.title)}" />
    <meta property="og:description" content="${escapeHtml(info.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://${fullHost}${pathUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="google-site-verification" content="${escapeHtml(db.settings.googleSearchConsoleVerification || '')}" />
    ${schemaTag}
    ${db.settings.googleAnalyticsId ? `
    <!-- Google Analytics Integration -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${db.settings.googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${db.settings.googleAnalyticsId}');
    </script>` : ""}
    ${db.settings.clarityId ? `
    <!-- Microsoft Clarity Integration -->
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${db.settings.clarityId}");
    </script>` : ""}
    ${db.settings.headerAdCode ? `<!-- Google AdSense Header Anchor -->\n${db.settings.headerAdCode}` : ""}
    `;

    // Strip original title and replace with injected block
    html = html.replace(/<title>.*?<\/title>/gi, "");
    html = html.replace("</head>", `${metaTags}\n</head>`);

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (err: any) {
    console.error("Meta serving error:", err);
    if (viteInstance) {
      viteInstance.ssrFixStacktrace(err);
    }
    res.status(500).end("Server internal error occurred.");
  }
}

// -------------------------------------------------------------
// VITE AND ASSETS INITIALIZATION
// -------------------------------------------------------------
async function startServer() {
  // Vite integration in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Custom router allows intercepting for meta tags (HTML file serving)
    });

    // Handle Vite assets + modules
    app.use((req, res, next) => {
      // Forward asset paths to Vite's static/middleware
      if (
        req.path.includes(".") &&
        !req.path.endsWith(".html") &&
        !req.path.startsWith("/api")
      ) {
        return vite.middlewares(req, res, next);
      }
      next();
    });

    // Intercept client-facing router for SEO tag rendering 
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const indexHtmlPath = path.join(process.cwd(), "index.html");
      await serveAppWithMeta(req, res, indexHtmlPath, vite);
    });

    app.use(vite.middlewares);
  } else {
    // Production Assets serving with custom meta injection
    const distPath = path.join(process.cwd(), "dist");

    // Static asset serving (js, css, images, fonts)
    app.use(
      express.static(distPath, {
        index: false, // Let custom routing handle rendering index.html
      })
    );

    // Apply custom SEO dynamic index.html injection
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      const indexHtmlPath = path.join(distPath, "index.html");
      await serveAppWithMeta(req, res, indexHtmlPath);
    });
  }

  // Fallback endpoint
  app.get("/api/*", (req, res) => {
    res.status(404).json({ error: "API Route not found" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
