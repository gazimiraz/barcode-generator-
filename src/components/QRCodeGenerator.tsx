import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  Download, Upload, Eye, RefreshCw, Layers, Palette, ShieldAlert, Check,
  Link as LinkIcon, AlignLeft, Mail, Phone, MessageSquare, Wifi, Contact, MapPin, Calendar, Share2, Printer
} from "lucide-react";
import { motion } from "motion/react";
import { QRType } from "../types";

interface QRCodeGeneratorProps {
  initialType?: QRType;
  onTrackGeneration?: () => void;
  onAdClick?: () => void;
}

export function QRCodeGenerator({ initialType = "url", onTrackGeneration, onAdClick }: QRCodeGeneratorProps) {
  const [qrType, setQrType] = useState<QRType>(initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // QR Fields
  const [url, setUrl] = useState("https://google.com");
  const [text, setText] = useState("Hello World! This is a free QR Code.");
  
  // Email fields
  const [emailTo, setEmailTo] = useState("hello@example.com");
  const [emailSubject, setEmailSubject] = useState("Inquiry");
  const [emailBody, setEmailBody] = useState("Hello, I would like to know more about your services.");

  // Phone & Messaging
  const [phone, setPhone] = useState("+15550199");
  const [smsPhone, setSmsPhone] = useState("+15550199");
  const [smsBody, setSmsBody] = useState("Send me more details!");
  const [waPhone, setWaPhone] = useState("15550199");
  const [waBody, setWaBody] = useState("Hello, I am interested in building a brand QR.");

  // WiFi field
  const [wifiSsid, setWifiSsid] = useState("Guest_Network");
  const [wifiPassword, setWifiPassword] = useState("SuperSecret123");
  const [wifiEncryption, setWifiEncryption] = useState<"WEP" | "WPA" | "nopass">("WPA");

  // vCard fields
  const [vFirstName, setVFirstName] = useState("John");
  const [vLastName, setVLastName] = useState("Doe");
  const [vOrg, setVOrg] = useState("Acme Labs Inc");
  const [vPhone, setVPhone] = useState("+1 555-0100");
  const [vEmail, setVEmail] = useState("john.doe@acmelabs.com");
  const [vUrl, setVUrl] = useState("https://acmelabs.com");
  const [vTitle, setVTitle] = useState("Solutions Architect");
  const [vAddress, setVAddress] = useState("123 Silicon Boulevard, San Jose, CA");

  // Location fields
  const [locLat, setLocLat] = useState("37.7749");
  const [locLng, setLocLng] = useState("-122.4194");

  // Event fields
  const [evtTitle, setEvtTitle] = useState("Annual Web Summit");
  const [evtStart, setEvtStart] = useState("2026-06-15T09:00");
  const [evtEnd, setEvtEnd] = useState("2026-06-15T17:00");
  const [evtLoc, setEvtLoc] = useState("San Jose Convention Center, CA");

  // Social fields
  const [socialPlatform, setSocialPlatform] = useState("linkedin");
  const [socialUser, setSocialUser] = useState("john-doe-professional");

  // Customization Options
  const [qrSize, setQrSize] = useState<number>(512);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState<number>(4);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  
  // Custom center logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(20); // 15-30% of QR container

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listen for initial type toggles
  useEffect(() => {
    setQrType(initialType);
  }, [initialType]);

  // Construct payload string based on type
  const getQRValue = (): string => {
    switch (qrType) {
      case "url":
        // Ensure starting URL is fully qualified
        return url.match(/^https?:\/\//i) ? url : `https://${url}`;
      case "text":
        return text;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phone}`;
      case "sms":
        return `smsto:${smsPhone}:${smsBody}`;
      case "whatsapp":
        return `https://wa.me/${waPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waBody)}`;
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption};P:${wifiPassword};H:;;`;
      case "vcard":
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vLastName};${vFirstName};;;`,
          `FN:${vFirstName} ${vLastName}`,
          `ORG:${vOrg}`,
          `TITLE:${vTitle}`,
          `TEL;TYPE=CELL,VOICE:${vPhone}`,
          `EMAIL;TYPE=PREF,INTERNET:${vEmail}`,
          `URL:${vUrl}`,
          `ADR;TYPE=WORK,POSTAL:;;${vAddress}`,
          "END:VCARD"
        ].join("\n");
      case "location":
        return `geo:${locLat},${locLng};q=${locLat},${locLng}(Location)`;
      case "event":
        const cleanStart = evtStart.replace(/[-:]/g, "") + "00Z";
        const cleanEnd = evtEnd.replace(/[-:]/g, "") + "00Z";
        return [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "BEGIN:VEVENT",
          `SUMMARY:${evtTitle}`,
          `DTSTART:${cleanStart}`,
          `DTEND:${cleanEnd}`,
          `LOCATION:${evtLoc}`,
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\n");
      case "social":
        if (socialPlatform === "twitter") return `https://twitter.com/${socialUser}`;
        if (socialPlatform === "facebook") return `https://facebook.com/${socialUser}`;
        if (socialPlatform === "instagram") return `https://instagram.com/${socialUser}`;
        if (socialPlatform === "linkedin") return `https://linkedin.com/in/${socialUser}`;
        if (socialPlatform === "youtube") return `https://youtube.com/@${socialUser}`;
        return socialUser;
      default:
        return "Free Barcode & QR Code Generator";
    }
  };

  // Image upload triggers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setErrorCorrection("H"); // Force High error correction to offset central obstruction

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setErrorCorrection("M");
  };

  // Render Logic
  const drawQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    const dataString = getQRValue();

    try {
      // Calculate multiplier scale to draw beautifully sharp high-res renders
      const renderSize = qrSize; 
      canvas.width = renderSize;
      canvas.height = renderSize;

      // Draw QR onto canvas
      await QRCode.toCanvas(canvas, dataString, {
        width: renderSize,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logoPreview ? "H" : errorCorrection,
      });

      // Overlay center logo if available
      if (logoPreview) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.src = logoPreview;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // Calculate logo size relative to QR dimensions
              const sizeInPx = (renderSize * logoSizePercent) / 100;
              const x = (renderSize - sizeInPx) / 2;
              const y = (renderSize - sizeInPx) / 2;

              // Draw solid background container with rounded edges under logo
              ctx.fillStyle = bgColor;
              ctx.beginPath();
              const subRadius = sizeInPx * 0.15;
              ctx.roundRect(x - 4, y - 4, sizeInPx + 8, sizeInPx + 8, subRadius);
              ctx.fill();

              // Draw stamp image onto container
              ctx.drawImage(img, x, y, sizeInPx, sizeInPx);
              resolve();
            };
            img.onerror = () => reject(new Error("Unable to draw center logo. Try another file."));
          });
        }
      }

      if (onTrackGeneration) {
        onTrackGeneration(); // Logs analytics
      }
    } catch (err) {
      console.error("QR Code rendering error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Redraw QR whenever inputs change
  useEffect(() => {
    const timeout = setTimeout(() => {
      drawQRCode();
    }, 150);
    return () => clearTimeout(timeout);
  }, [
    qrType, url, text, emailTo, emailSubject, emailBody, phone, smsPhone, smsBody,
    waPhone, waBody, wifiSsid, wifiPassword, wifiEncryption, vFirstName, vLastName,
    vOrg, vPhone, vEmail, vUrl, vTitle, vAddress, locLat, locLng, evtTitle, evtStart,
    evtEnd, evtLoc, socialPlatform, socialUser, qrSize, fgColor, bgColor, margin,
    errorCorrection, logoPreview, logoSizePercent
  ]);

  // Download Trigger Handler
  const downloadQR = (format: "png" | "jpg" | "svg" | "pdf") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataString = getQRValue();
    const filename = `codecraft-qr-${qrType}-${Date.now()}`;

    if (format === "png") {
      const urlString = canvas.toDataURL("image/png");
      triggerDownload(urlString, `${filename}.png`);
    } else if (format === "jpg") {
      // Create temporary canvas to enforce opaque active background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const urlString = tempCanvas.toDataURL("image/jpeg", 0.95);
        triggerDownload(urlString, `${filename}.jpg`);
      }
    } else if (format === "svg") {
      // Draw SVG string using toDataURL via type 'svg'
      QRCode.toString(dataString, {
        type: "svg",
        width: qrSize,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logoPreview ? "H" : errorCorrection,
      }, (err, svgString) => {
        if (err) return console.error(err);
        
        // If logo is embedded, integrate centered image placeholder in vectors
        if (logoPreview && svgString) {
          try {
            // Read dimensions from parsed svg
            const sizePercent = logoSizePercent;
            const logoSvg = `<image href="${logoPreview}" x="${50 - sizePercent / 2}%" y="${50 - sizePercent / 2}%" width="${sizePercent}%" height="${sizePercent}%" />`;
            const updatedSvgString = svgString.replace("</svg>", `${logoSvg}</svg>`);
            const blob = new Blob([updatedSvgString], { type: "image/svg+xml" });
            const urlString = URL.createObjectURL(blob);
            triggerDownload(urlString, `${filename}.svg`);
            URL.revokeObjectURL(urlString);
            return;
          } catch (e) {
            console.error(e);
          }
        }
        
        if (svgString) {
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const urlString = URL.createObjectURL(blob);
          triggerDownload(urlString, `${filename}.svg`);
          URL.revokeObjectURL(urlString);
        }
      });
    } else if (format === "pdf") {
      // Set printable layout directly in a new print box
      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print High-Res QR Code Setup - CodeCraft</title>
              <style>
                body {
                  margin: 0;
                  padding: 40px;
                  font-family: sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 80vh;
                  text-align: center;
                  color: #333;
                }
                .container {
                  border: 2px solid #e2e8f0;
                  padding: 30px;
                  border-radius: 12px;
                  background: white;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  max-width: 500px;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  margin-bottom: 20px;
                  border: 1px solid #f1f5f9;
                }
                h1 { font-size: 24px; margin-bottom: 8px; color: #1e1b4b; }
                p { font-size: 14px; color: #64748b; margin-bottom: 24px; }
                .meta { font-family: monospace; font-size: 12px; color: #94a3b8; }
                @media print {
                  button { display: none; }
                  .container { border: none; box-shadow: none; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Custom QR Code Package</h1>
                <p>Designed and compiled via CodeCraft Free QR Generator</p>
                <img src="${dataUrl}" alt="QR Code" width="350" height="350" />
                <div class="meta">
                  Type: ${qrType.toUpperCase()} | Error Proofing: ${logoPreview ? "H" : errorCorrection}<br/>
                  Size: ${qrSize}px | Created: ${new Date().toLocaleDateString()}<br/>
                  Target Content: ${getQRValue().substring(0, 45)}${getQRValue().length > 45 ? "..." : ""}
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const triggerDownload = (urlString: string, filename: string) => {
    const link = document.createElement("a");
    link.href = urlString;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  // Helper template tabs
  const typeTabs: { id: QRType; label: string; icon: any }[] = [
    { id: "url", label: "URL Link", icon: LinkIcon },
    { id: "text", label: "Plain Text", icon: AlignLeft },
    { id: "email", label: "Email Template", icon: Mail },
    { id: "phone", label: "Phone Dial", icon: Phone },
    { id: "sms", label: "SMS Template", icon: MessageSquare },
    { id: "whatsapp", label: "WhatsApp chat", icon: Share2 },
    { id: "wifi", label: "WiFi Auth", icon: Wifi },
    { id: "vcard", label: "vCard Business Contact", icon: Contact },
    { id: "location", label: "Coordinates GPS", icon: MapPin },
    { id: "event", label: "Calendar Event", icon: Calendar },
    { id: "social", label: "Social Pages", icon: Share2 }
  ];

  const handlePresetColor = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Input form details (8 columns) */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 transition-all duration-300">
        
        {/* Navigation Categories */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-650 dark:text-amber-400 uppercase mb-4">
          1. Choose QR Content Template
        </h2>
        
        <div className="flex flex-wrap gap-1.5 pb-5 border-b border-slate-200 dark:border-zinc-800/80 mb-6">
          {typeTabs.map((tab) => {
            const Icon = tab.icon;
            const active = qrType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setQrType(tab.id)}
                className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg duration-240 cursor-pointer ${
                  active 
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-100 dark:shadow-none font-semibold"
                    : "bg-slate-50 text-slate-650 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-850"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic fields selector */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-655 dark:text-amber-400 uppercase mb-4">
          2. Enter Content Information
        </h2>

        <div className="space-y-4 mb-8">
          
          {/* Dynamic Render based on active template */}
          {qrType === "url" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Target Website URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. www.yourbusiness.com/promo"
                className="w-full text-sm px-4 py-3 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">Includes secure automatic redirect layers on scan.</p>
            </div>
          )}

          {qrType === "text" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Plaintext contents</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Enter some text codes, serial hashes, serial keys, message boards..."
                className="w-full text-sm px-4 py-3 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          )}

          {qrType === "email" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Recipient Email Address</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="support@organization.com"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Technical assistance"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Inbound body</label>
                <input
                  type="text"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Pre-filled support line text..."
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "phone" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Phone Number (With Country Prefix)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                className="w-full text-sm px-4 py-3 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
              />
            </div>
          )}

          {qrType === "sms" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Target Phone Line</label>
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+15550199"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">SMS Body Message</label>
                <input
                  type="text"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  placeholder="Requesting support callback code"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "whatsapp" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">WhatsApp Number (e.g. 15555551234)</label>
                <input
                  type="tel"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="Do not include + or spaces"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Prefilled Send Message</label>
                <input
                  type="text"
                  value={waBody}
                  onChange={(e) => setWaBody(e.target.value)}
                  placeholder="I am asking for pricing details..."
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "wifi" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">WiFi SSID (Network Name)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. Starbucks_Free_WiFi"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Access Password</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Enter Network Password"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                  disabled={wifiEncryption === "nopass"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Security Type</label>
                <select
                  value={wifiEncryption}
                  onChange={(e: any) => setWifiEncryption(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-white dark:bg-zinc-950 dark:text-zinc-100 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none"
                >
                  <option value="WPA">WPA / WPA2 (Most Secured)</option>
                  <option value="WEP">WEP (Legacy)</option>
                  <option value="nopass">None (Open Hotspot)</option>
                </select>
              </div>
            </div>
          )}

          {qrType === "vcard" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">First Name</label>
                <input
                  type="text"
                  value={vFirstName}
                  onChange={(e) => setVFirstName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Last Name</label>
                <input
                  type="text"
                  value={vLastName}
                  onChange={(e) => setVLastName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Organization / Firm</label>
                <input
                  type="text"
                  value={vOrg}
                  onChange={(e) => setVOrg(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Mobile Phone</label>
                <input
                  type="tel"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Work Email</label>
                <input
                  type="email"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Personal Website</label>
                <input
                  type="url"
                  value={vUrl}
                  onChange={(e) => setVUrl(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Job Title / Designation</label>
                <input
                  type="text"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Postal physical Address</label>
                <input
                  type="text"
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "location" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Map Latitude</label>
                <input
                  type="text"
                  value={locLat}
                  onChange={(e) => setLocLat(e.target.value)}
                  placeholder="37.7749"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Map Longitude</label>
                <input
                  type="text"
                  value={locLng}
                  onChange={(e) => setLocLng(e.target.value)}
                  placeholder="-122.4194"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "event" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Event Title / Name</label>
                <input
                  type="text"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="Networking Summit Meeting"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={evtStart}
                  onChange={(e) => setEvtStart(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={evtEnd}
                  onChange={(e) => setEvtEnd(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Physical Venue Location</label>
                <input
                  type="text"
                  value={evtLoc}
                  onChange={(e) => setEvtLoc(e.target.value)}
                  placeholder="Grand Ballroom, Plaza Hotel NY"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "social" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Social Platform</label>
                <select
                  value={socialPlatform}
                  onChange={(e) => setSocialPlatform(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-white dark:bg-zinc-950 dark:text-zinc-100 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none animate-none"
                >
                  <option value="linkedin">LinkedIn Profile / Company</option>
                  <option value="twitter">X / Twitter Account</option>
                  <option value="facebook">Facebook page</option>
                  <option value="instagram">Instagram Account</option>
                  <option value="youtube">YouTube Channel</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Username / ID Handle</label>
                <input
                  type="text"
                  value={socialUser}
                  onChange={(e) => setSocialUser(e.target.value)}
                  placeholder="e.g. creative_brand_agency"
                  className="w-full text-sm px-4 py-2.5 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* CUSTOMIZATION DRAWER SECTION */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4">
          3. Custom Brand Styling & Alignment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 sm:p-5 bg-slate-50/50 dark:bg-zinc-900/45 border border-slate-200 dark:border-zinc-800/80 rounded-2xl mb-4">
          
          {/* Colors */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-medium text-slate-800 dark:text-zinc-300 flex items-center space-x-1.5">
              <Palette className="h-4 w-4 text-blue-600" />
              <span>Palette Selector</span>
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Foreground Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-slate-200 outline-none"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="text-xs font-mono w-20 px-2 py-1.5 border border-slate-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Background Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-slate-200 outline-none"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="text-xs font-mono w-20 px-2 py-1.5 border border-slate-200 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Color presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Classic Black", fg: "#000000", bg: "#ffffff" },
                  { label: "Blue Brand", fg: "#2563eb", bg: "#ffffff" },
                  { label: "Ocean Teal", fg: "#0d9488", bg: "#ffffff" },
                  { label: "Classic Crimson", fg: "#be123c", bg: "#fef2f2" },
                  { label: "Carbon Gold", fg: "#d97706", bg: "#18181b" }
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetColor(preset.fg, preset.bg)}
                    className="text-[10px] px-2 py-1 rounded bg-white dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-amber-400 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 hover:text-blue-600 duration-150 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logo overlay and structural config */}
          <div className="space-y-3.5 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-zinc-800/80 sm:pl-5">
            <h3 className="text-xs font-medium text-slate-805 dark:text-zinc-300 flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Logo & Container Options</span>
            </h3>

            {/* Logo upload wrapper */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Logo Badge (PNG/JPG)</span>
              {logoPreview ? (
                <div className="flex items-center space-x-3 bg-white dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <img src={logoPreview} alt="Logo preview" className="h-10 w-10 object-contain rounded bg-slate-50 border border-slate-200" referrerPolicy="no-referrer" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">{logoFile?.name}</span>
                    <button onClick={removeLogo} className="text-[10px] font-semibold text-rose-500 hover:underline text-left cursor-pointer">
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center border border-dashed border-slate-200 dark:border-zinc-8 w-full h-12 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-zinc-950 text-xs text-slate-500 hover:text-blue-600 transition-all duration-200">
                  <Upload className="h-4 w-4 mr-2 text-slate-400" />
                  Upload Central Brand Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Margin and Proofing settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block">Quiet Zone (Margin)</label>
                <select
                  value={margin}
                  onChange={(e: any) => setMargin(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-950 dark:text-zinc-100 border border-gray-200 dark:border-zinc-800 rounded-md outline-none"
                >
                  <option value={1}>1px Tight</option>
                  <option value={2}>2px Narrow</option>
                  <option value={4}>4px Recommended</option>
                  <option value={6}>6px Extra Quiet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block">Error Correction</label>
                <select
                  value={errorCorrection}
                  onChange={(e: any) => setErrorCorrection(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-950 dark:text-zinc-100 border border-gray-200 dark:border-zinc-800 rounded-md outline-none"
                  disabled={!!logoPreview}
                >
                  <option value="L">L (7% Recovery)</option>
                  <option value="M">M (15% Recovery)</option>
                  <option value="Q">Q (25% High density)</option>
                  <option value="H">H (30% Maximum Proofing)</option>
                </select>
              </div>
            </div>
            {logoPreview && (
              <p className="text-[9px] text-amber-600 dark:text-amber-400 leading-normal flex items-start space-x-1">
                <ShieldAlert className="h-3 w-3 shrink-0 mr-1 mt-0.5" />
                <span>Error Correction automatically locked to **High (30%)** to guarantee scanning fidelity over centered logo.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Preview and Export Hub (4 columns) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        
        {/* Real-time Renderer Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800/80 shadow-sm p-5 text-center">
          
          <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4 text-left">
            Live Preview Monitor
          </h2>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-zinc-950/60 rounded-xl border border-slate-20 -mb-5 relative group min-h-[220px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}
            
            {/* Draw QR Code */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 max-w-full">
              <canvas ref={canvasRef} className="mx-auto block" style={{ maxWidth: "160px", maxHeight: "160px", imageRendering: "pixelated" }} />
            </div>

            <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-4 leading-normal">
              Real-time generation. Ready for instant scanning on any mobile device camera.
            </p>
          </div>

          {/* Quick Details Parameter list */}
          <div className="text-left bg-slate-50 dark:bg-zinc-905 p-3 rounded-xl border border-slate-205 dark:border-zinc-850 text-[10px] font-mono tracking-tight text-slate-550 dark:text-zinc-550 space-y-1.5 mb-5">
            <div className="flex justify-between">
              <span>QR Type:</span>
              <span className="font-semibold text-blue-600 dark:text-amber-400 uppercase">{qrType}</span>
            </div>
            <div className="flex justify-between">
              <span>Fidelity:</span>
              <span className="font-semibold">{logoPreview ? "MAX 30% (H)" : `${errorCorrection} level`}</span>
            </div>
            <div className="flex justify-between max-w-full">
              <span className="shrink-0 mr-1">Payload:</span>
              <span className="font-mono truncate max-w-[150px] text-slate-700 dark:text-zinc-300">
                {getQRValue()}
              </span>
            </div>
          </div>

          {/* Dynamic Adsense below Generator Result */}
          <div onClick={onAdClick}>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider text-left block uppercase mb-1.5">Sponsored Connection</span>
            <div className="h-[90px] border border-dashed border-slate-350 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/20 hover:border-blue-400 rounded-xl flex flex-col justify-center items-center p-2 cursor-pointer group transition-all">
              <span className="text-[8px] tracking-widest text-slate-400 uppercase block relative -top-1">AdSense Unit</span>
              <span className="text-[10px] font-semibold text-slate-700 dark:text-zinc-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Custom Banner Area (250 x 90)
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Generates simulation statistics click</span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-5 mt-5">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-300 text-left mb-3">
              4. Export High-Fidelity Formats
            </h3>

            {/* Sizes selection dropdown */}
            <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-850">
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Download Resolution:</span>
              <select
                value={qrSize}
                onChange={(e: any) => setQrSize(Number(e.target.value))}
                className="text-xs font-mono bg-transparent outline-none cursor-pointer text-slate-900 dark:text-zinc-100 font-bold"
              >
                <option value={256}>256 x 256 px (Fast)</option>
                <option value={512}>512 x 512 px (Recommended)</option>
                <option value={1024}>1024 x 1024 px (Ultra High)</option>
                <option value={2048}>2048 x 2048 px (Print Ready)</option>
              </select>
            </div>

            {/* Formatting download layout */}
            <div className="grid grid-cols-2 gap-2">
              
              <button
                onClick={() => downloadQR("png")}
                className="flex items-center justify-center space-x-1.5 py-3 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/20 rounded-xl text-xs font-semibold duration-200 dark:text-zinc-300 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>PNG Format</span>
              </button>

              <button
                onClick={() => downloadQR("svg")}
                className="flex items-center justify-center space-x-1.5 py-3 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/20 rounded-xl text-xs font-semibold duration-200 dark:text-zinc-300 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>SVG Vector</span>
              </button>

              <button
                onClick={() => downloadQR("jpg")}
                className="flex items-center justify-center space-x-1.5 py-3 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/20 rounded-xl text-xs font-semibold duration-200 dark:text-zinc-300 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>JPEG Format</span>
              </button>

              <button
                onClick={() => downloadQR("pdf")}
                className="flex items-center justify-center space-x-1.5 py-3 border border-slate-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/20 rounded-xl text-xs font-semibold duration-200 dark:text-zinc-300 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF Blueprint</span>
              </button>

            </div>

            {/* Success micro interactions */}
            {downloadSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-[10px] font-mono text-center"
              >
                ✓ Success: {downloadSuccess} downloaded!
              </motion.div>
            )}

          </div>

        </div>

        {/* Feature quick check card */}
        <div className="bg-gradient-to-tr from-slate-50 to-blue-50/25 dark:from-zinc-900 dark:to-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
          <h3 className="font-semibold text-slate-950 dark:text-white mb-2">QR Code Checklist</h3>
          <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
            <li>✓ Unlimited free generations without account</li>
            <li>✓ High-contrast active vector compatibility</li>
            <li>✓ Standard compliant decoding checks</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
