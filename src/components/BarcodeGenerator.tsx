import React, { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Download, Info, RefreshCw, AlertCircle, HelpCircle, Check, Palette, Settings as SettingsIcon, Printer } from "lucide-react";
import { motion } from "motion/react";
import { BarcodeType } from "../types";

interface BarcodeGeneratorProps {
  initialType?: BarcodeType;
  onTrackGeneration?: () => void;
  onAdClick?: () => void;
}

export function BarcodeGenerator({ initialType = "CODE128", onTrackGeneration, onAdClick }: BarcodeGeneratorProps) {
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(initialType);
  const [inputText, setInputText] = useState("CODE128-CRAFT123");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Configuration options
  const [barWidth, setBarWidth] = useState<number>(2); // 1-4
  const [barHeight, setBarHeight] = useState<number>(80); // 40-150
  const [showText, setShowText] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14); // 10-24
  const [margin, setMargin] = useState<number>(10); // 0-30
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Listen for initial route presets
  useEffect(() => {
    setBarcodeType(initialType);
    // Suggest clean compliant default values based on chosen symbology
    if (initialType === "EAN13") setInputText("978020137962");
    else if (initialType === "CODE128") setInputText("CODE128-CRAFT123");
  }, [initialType]);

  // Adjust placeholder suggestions as format changes
  const handleFormatChange = (newFormat: BarcodeType) => {
    setBarcodeType(newFormat);
    setErrorMsg(null);
    switch (newFormat) {
      case "CODE128":
        setInputText("CODE128-CRAFT123");
        break;
      case "CODE39":
        setInputText("CODE39-ALPHA01");
        break;
      case "EAN13":
        setInputText("978020137962"); // 12 digits (13th check digit is auto-added)
        break;
      case "EAN8":
        setInputText("4012345"); // 7 digits (8th check digit is auto-added)
        break;
      case "UPCA":
        setInputText("12345678901"); // 11 digits
        break;
      case "UPCE":
        setInputText("0123456"); // 7 digits starting with 0 or 1
        break;
      case "ITF":
        setInputText("123456789012"); // Even numbers digits only eg. 12
        break;
      case "CODABAR":
        setInputText("A123456789B"); // Starts/Ends with A-D
        break;
    }
  };

  // Symbology specifications / requirements
  const formatGuides: Record<BarcodeType, string> = {
    CODE128: "Accepts any ASCII characters. High-density, perfect for shipments and logistics.",
    CODE39: "Accepts uppercase A-Z, 0-9, spaces, and -.$/+%. Self-checking industrial standard.",
    EAN13: "Accepts exactly 12 or 13 numeric digits (0-9). The global supermarket standard.",
    EAN8: "Accepts exactly 7 or 8 numeric digits (0-9). Recommended for small product labels.",
    UPCA: "Accepts exactly 11 or 12 numeric digits (0-9). The US & Canadian supermarket standard.",
    UPCE: "Accepts exactly 6 to 8 digits starting with 0 or 1. Compact retail standard.",
    ITF: "Interleaved 2 of 5. Accepts ONLY numeric digits (0-9) and must have an EVEN number of digit lengths.",
    CODABAR: "Accepts digits (0-9), symbols (-$:/.+), and must start & end with start markers A, B, C, or D."
  };

  // Render Barcode
  const drawBarcode = () => {
    if (!svgRef.current) return;
    setErrorMsg(null);

    // Filter white-spaces from retail codes to avoid typical validation faults
    const textToRender = ["EAN13", "EAN8", "UPCA", "UPCE", "ITF"].includes(barcodeType) 
      ? inputText.replace(/\s+/g, "") 
      : inputText;

    if (!textToRender) {
      setErrorMsg("Input code cannot be blank.");
      return;
    }

    try {
      JsBarcode(svgRef.current, textToRender, {
        format: barcodeType,
        width: barWidth,
        height: barHeight,
        displayValue: showText,
        fontSize: fontSize,
        margin: margin,
        background: bgColor,
        lineColor: fgColor,
        valid: (valid) => {
          if (!valid) {
            setErrorMsg(`Invalid format. ${formatGuides[barcodeType]}`);
          }
        }
      });

      if (onTrackGeneration) {
        onTrackGeneration();
      }
    } catch (err: any) {
      console.error("Barcode build error:", err);
      setErrorMsg(`Generation Failed. Double check the input formatting conforms to ${barcodeType} specifications.`);
    }
  };

  // Re-draw whenever variables change
  useEffect(() => {
    const timeout = setTimeout(() => {
      drawBarcode();
    }, 150);
    return () => clearTimeout(timeout);
  }, [barcodeType, inputText, barWidth, barHeight, showText, fontSize, margin, fgColor, bgColor]);

  // Download Trigger Handler
  const downloadBarcode = (format: "svg" | "png" | "pdf") => {
    const svgElement = svgRef.current;
    if (!svgElement || errorMsg) return;

    const filename = `codecraft-barcode-${barcodeType.toLowerCase()}-${Date.now()}`;

    if (format === "svg") {
      // Direct raw XML download for lossless vector editing
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.svg`);
      URL.revokeObjectURL(url);
    } else if (format === "png") {
      // Draw SVG onto HTML Canvas to rasterize cleanly
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Match bounds based on svg bounding boxes
        const bbox = svgElement.getBBox();
        canvas.width = bbox.width * 2 + 40; // Double scale for high-dpi sharpening
        canvas.height = bbox.height * 2 + 40;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(2, 2);
          ctx.drawImage(img, 20, 20);
          
          const pngUrl = canvas.toDataURL("image/png");
          triggerDownload(pngUrl, `${filename}.png`);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (format === "pdf") {
      // Interactive print window compilation
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode Sheet - CodeCraft</title>
              <style>
                body {
                  margin: 0;
                  padding: 40px;
                  font-family: system-ui, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 80vh;
                  color: #111827;
                }
                .sheet {
                  padding: 40px;
                  border: 1px solid #e5e7eb;
                  border-radius: 12px;
                  background: white;
                  text-align: center;
                  max-width: 600px;
                }
                .barcode-wrap {
                  margin: 30px 0;
                  display: flex;
                  justify-content: center;
                }
                h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
                p { font-size: 13px; color: #6b7280; }
                .meta { font-family: monospace; font-size: 11px; color: #9ca3af; margin-top: 20px; }
                @media print {
                  body { padding: 0; min-height: auto; }
                  .sheet { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="sheet">
                <h1>Linear Barcode Label</h1>
                <p>Designed and compiled via CodeCraft Barcode Generator</p>
                <div class="barcode-wrap">
                  ${svgString}
                </div>
                <div class="meta font-mono">
                  Symbology: ${barcodeType} | Height: ${barHeight}px | Margin: ${margin}px<br/>
                  Original Input: ${inputText}<br/>
                  Source Domain: CodeCraft Engine (${new Date().toLocaleDateString()})
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

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT INPUT & PARAMS CARD (8 columns) */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 transition-all duration-300">
        
        {/* Core Type Selection */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4">
          1. Choose Barcode Symbology
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-5 border-b border-slate-200 dark:border-zinc-800/80 mb-6 font-mono text-xs">
          {(["CODE128", "CODE39", "EAN13", "EAN8", "UPCA", "UPCE", "ITF", "CODABAR"] as BarcodeType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleFormatChange(type)}
              className={`py-2.5 px-3 rounded-lg border text-left font-semibold transition-all duration-200 cursor-pointer ${
                barcodeType === type
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100 dark:shadow-none"
                  : "bg-slate-50 text-slate-750 hover:text-black hover:bg-slate-100 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-850 dark:hover:text-blue-400"
              }`}
            >
              <span>{type}</span>
              {type === "CODE128" && <span className="block text-[8px] opacity-75 font-sans">(Universal)</span>}
              {type === "EAN13" && <span className="block text-[8px] opacity-75 font-sans">(Intl Retail)</span>}
              {type === "UPCA" && <span className="block text-[8px] opacity-75 font-sans">(US Retail)</span>}
            </button>
          ))}
        </div>

        {/* Dynamic Content Inputs */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4">
          2. Enter Alphanumeric Codes
        </h2>

        <div className="space-y-4 mb-8">
          <div className="space-y-1.5 animate-none">
            <label className="text-xs font-medium text-slate-705 dark:text-zinc-300 flex items-center justify-between">
              <span>Barcode Value</span>
              <span className="text-[10px] text-slate-400 font-mono">Format: {barcodeType}</span>
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 123456789012"
              className={`w-full text-sm px-4 py-3 border ${
                errorMsg ? "border-rose-300 focus:ring-rose-500/20" : "border-slate-200 focus:ring-blue-500/25"
              } dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl focus:ring-2 outline-none transition-all`}
            />
          </div>

          {/* Validation Alert */}
          {errorMsg ? (
            <div className="flex items-start space-x-2 p-3 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/20 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase text-[10px] tracking-wider text-rose-800 dark:text-rose-300">Validation Fault</p>
                <p className="mt-0.5 leading-normal">{errorMsg}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2 p-3 bg-blue-50/20 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-xs leading-normal">
              <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <span>{formatGuides[barcodeType]}</span>
            </div>
          )}
        </div>

        {/* Style Parameter Sliders */}
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4">
          3. Sizing & Custom Geometry
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-5 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-205 dark:border-zinc-800/80 rounded-2xl">
          
          {/* Dimension adjusters */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-slate-800 dark:text-zinc-300 flex items-center space-x-1.5">
              <SettingsIcon className="h-4 w-4 text-blue-600" />
              <span>Sizing Scale Dimensions</span>
            </h3>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-655 dark:text-zinc-400">
                <span>Core Bar Width</span>
                <span className="font-semibold font-mono">{barWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={barWidth}
                onChange={(e) => setBarWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-655 dark:text-zinc-400">
                <span>Barcode Height</span>
                <span className="font-semibold font-mono">{barHeight}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={barHeight}
                onChange={(e) => setBarHeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1 pt-1.5">
              <div className="flex justify-between text-xs text-slate-655 dark:text-zinc-400">
                <span>Outer Margins</span>
                <span className="font-semibold font-mono">{margin}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Label typography & colors */}
          <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-zinc-800 sm:pl-5">
            <h3 className="text-xs font-medium text-slate-800 dark:text-zinc-300 flex items-center space-x-1.5">
              <Palette className="h-4 w-4 text-blue-600" />
              <span>Label & Colors Config</span>
            </h3>

            {/* Label Show Hide */}
            <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl">
              <span className="text-xs font-medium text-slate-705 dark:text-zinc-300">Show Human-Read Text</span>
              <input
                type="checkbox"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>

            {showText && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Font Size</span>
                  <span className="font-bold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-zinc-800 accent-blue-600 cursor-pointer rounded"
                />
              </div>
            )}

            {/* Micro Colors */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">Lines Color</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-7 w-full cursor-pointer rounded border border-gray-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">Background Color</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-7 w-full cursor-pointer rounded border border-gray-200 outline-none"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT PREVIEW & EXPORT CARD (4 columns) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        
        {/* Real-time Renderer Monitor Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-205 dark:border-zinc-800 shadow-sm p-5 text-center">
          
          <h2 className="text-xs font-semibold tracking-widest text-blue-600 dark:text-amber-400 uppercase mb-4 text-left">
            Live Preview Monitor
          </h2>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-zinc-950/65 rounded-xl border border-slate-200 mb-5 relative group min-h-[190px]">
            {errorMsg ? (
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider font-mono">Format Error</p>
                <p className="text-[10px] text-gray-400 mt-1">Conform details to barcode rules.</p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 max-w-full overflow-x-auto">
                <svg ref={svgRef} className="mx-auto block" style={{ maxWidth: "100%", height: "auto" }} />
              </div>
            )}
            
            {!errorMsg && (
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-4 leading-normal">
                Standard compliant structure. Print ready vectorized output.
              </p>
            )}
          </div>

          {/* Quick specs lists */}
          <div className="text-left bg-slate-50 dark:bg-zinc-905 p-3 rounded-xl border border-slate-200 dark:border-zinc-855 text-[10px] font-mono tracking-tight text-slate-550 space-y-1.5 mb-5 dark:text-zinc-500">
            <div className="flex justify-between">
              <span>Symbology:</span>
              <span className="font-semibold text-blue-600 dark:text-amber-400 uppercase">{barcodeType}</span>
            </div>
            <div className="flex justify-between">
              <span>Width modifier:</span>
              <span>{barWidth}px line scale</span>
            </div>
            <div className="flex justify-between">
              <span>Human Readable:</span>
              <span>{showText ? `Yes (${fontSize}px)` : "No"}</span>
            </div>
          </div>

          {/* Adsense sidebar or lower generator box slot */}
          <div onClick={onAdClick}>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider text-left block uppercase mb-1.5 font-sans">Sponsored Connection</span>
            <div className="h-[90px] border border-dashed border-slate-300 dark:border-zinc-805 bg-slate-50/30 dark:bg-zinc-950/30 hover:border-blue-400 rounded-xl flex flex-col justify-center items-center p-2 cursor-pointer group transition-all">
              <span className="text-[8px] tracking-widest text-slate-450 uppercase block relative -top-1 font-sans">AdSense Unit</span>
              <span className="text-[10px] font-semibold text-slate-700 dark:text-zinc-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 font-sans">
                Responsive Banner (250 x 90)
              </span>
              <span className="text-[9px] text-gray-400 mt-1">Generates simulation dashboard stats click</span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-5 mt-5">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-300 text-left mb-3">
              4. Export Professional Vectors
            </h3>

            {/* Export trigger Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              
              <button
                onClick={() => downloadBarcode("png")}
                disabled={!!errorMsg}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-white border border-slate-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/10 rounded-xl text-xs font-semibold duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG (Hi-Res)</span>
              </button>

              <button
                onClick={() => downloadBarcode("svg")}
                disabled={!!errorMsg}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-white border border-slate-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/10 rounded-xl text-xs font-semibold duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Lossless SVG</span>
              </button>

              <button
                onClick={() => downloadBarcode("pdf")}
                disabled={!!errorMsg}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-white border border-slate-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/10 rounded-xl text-xs font-semibold duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print PDF Blueprint Sheet</span>
              </button>

            </div>

            {/* Success micro animations context */}
            {downloadSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-[10px] font-mono text-center animate-none"
              >
                ✓ Code file: {downloadSuccess} exported!
              </motion.div>
            )}

          </div>

        </div>

        {/* Dynamic checks info card */}
        <div className="bg-gradient-to-tr from-slate-50 to-blue-50/15 dark:from-zinc-900 dark:to-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 text-xs text-left">
          <h3 className="font-semibold text-slate-955 dark:text-white mb-2 flex items-center">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Symbology Directives:
          </h3>
          <p className="text-slate-550 leading-relaxed dark:text-zinc-400">
            Scanning problems? Ensure bar width is set to at least **2px** on large sheets and maintain solid black fg color lines over white background margins.
          </p>
        </div>

      </div>

    </div>
  );
}
