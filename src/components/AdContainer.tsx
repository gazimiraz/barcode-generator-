import React from "react";

interface AdContainerProps {
  placement: "header" | "sidebar" | "content" | "result" | "footer";
  codeHtml?: string;
  onAdClick?: () => void;
}

export function AdContainer({ placement, codeHtml, onAdClick }: AdContainerProps) {
  // If user has provided dynamic AdSense HTML script, inject it safely
  if (codeHtml && codeHtml.trim().length > 0) {
    return (
      <div 
        className="my-4 overflow-hidden flex justify-center text-center max-w-full"
        onClick={onAdClick}
        dangerouslySetInnerHTML={{ __html: codeHtml }} 
      />
    );
  }

  // Predefined placeholder dimensions and styles for the web layout design
  const styles = {
    header: "w-full max-w-[728px] h-[90px] text-xs py-2 bg-gray-50 border border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-800",
    sidebar: "w-full h-[250px] md:h-[600px] max-w-[300px] text-xs py-4 bg-gray-50 border border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-800",
    content: "w-full h-[100px] text-xs py-3 bg-gray-50 border border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-800",
    result: "w-full h-[140px] text-xs py-4 bg-gray-50 border border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-800",
    footer: "w-full max-w-[970px] h-[90px] text-xs py-2 bg-gray-50 border border-dashed border-gray-300 dark:bg-zinc-900 dark:border-zinc-800",
  };

  const label = {
    header: "Leaderboard Header Asset (728 x 90)",
    sidebar: "Sidebar Skybox (300 x 600)",
    content: "Content Multi-Grid Ad (Responsive Inline)",
    result: "Below Generator Impact Block (728 x 150)",
    footer: "Horizontal Footer Anchor (970 x 90)",
  };

  const handleSimulatedClick = () => {
    if (onAdClick) {
      onAdClick();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 mx-auto w-full">
      <div 
        className={`${styles[placement]} flex flex-col items-center justify-center rounded-lg transition-all duration-300 hover:border-indigo-400 group cursor-pointer relative`}
        onClick={handleSimulatedClick}
      >
        <span className="absolute top-1 right-2 text-[9px] font-mono tracking-widest text-gray-400 dark:text-zinc-600 uppercase">
          AdSense Ready
        </span>
        <div className="text-center px-4">
          <p className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 font-medium group-hover:text-indigo-500 dark:group-hover:text-amber-400">
            {label[placement]}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1">
            (Simulation: Clicking compiles as Admin dashboard traffic)
          </p>
        </div>
      </div>
    </div>
  );
}
