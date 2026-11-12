"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronsLeftRight,
} from "lucide-react";

export function isCcOrPresetProduct(product: any): boolean {
  if (!product) return false;
  if (product.comparisonEnabled === false) return false;

  const sSlug = String(product.sectionSlug || "").toLowerCase();
  const cat = String(product.category || "").toLowerCase();
  const title = String(product.title || "").toLowerCase();
  const tags = Array.isArray(product.tags)
    ? product.tags.map((t: any) => String(t).toLowerCase())
    : [];

  return (
    sSlug === "cc" ||
    sSlug === "cc-presets" ||
    sSlug === "presets" ||
    cat.includes("cc") ||
    cat.includes("preset") ||
    cat.includes("lut") ||
    cat.includes("color correction") ||
    title.includes(" cc") ||
    title.startsWith("cc ") ||
    title.includes("preset") ||
    tags.some(
      (t: string) =>
        t === "cc" ||
        t.includes("preset") ||
        t.includes("lut") ||
        t.includes("color correction")
    )
  );
}

interface VideoBeforeAfterSliderProps {
  beforeVideoUrl: string;
  afterVideoUrl: string;
  poster?: string;
  defaultSplit?: number;
  displayOrder?: "before-left" | "after-left";
  className?: string;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function VideoBeforeAfterSlider({
  beforeVideoUrl,
  afterVideoUrl,
  poster,
  defaultSplit = 50,
  displayOrder = "before-left",
  className = "",
}: VideoBeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  const [splitPos, setSplitPos] = useState<number>(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const leftSrc =
    displayOrder === "after-left" ? afterVideoUrl : beforeVideoUrl;
  const rightSrc =
    displayOrder === "after-left" ? beforeVideoUrl : afterVideoUrl;
  const leftLabel = displayOrder === "after-left" ? "AFTER" : "BEFORE";
  const rightLabel = displayOrder === "after-left" ? "BEFORE" : "AFTER";

  const updateSplitFromClientX = useCallback((clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(2, Math.min(98, pct)));
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateSplitFromClientX(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updateSplitFromClientX(e.touches[0].clientX);
      }
    };
    const handleEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updateSplitFromClientX]);

  // Keep both videos playing together on mount
  useEffect(() => {
    const v1 = leftVideoRef.current;
    const v2 = rightVideoRef.current;
    if (v1 && v2) {
      v1.muted = true;
      v2.muted = true;
      v1.play().catch(() => {});
      v2.play().catch(() => {});
    }
  }, [leftSrc, rightSrc]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const syncTime = () => {
    const v1 = leftVideoRef.current;
    const v2 = rightVideoRef.current;
    if (!v1 || !v2) return;
    setCurrentTime(v1.currentTime);
    if (v1.duration && Number.isFinite(v1.duration)) {
      setDuration(v1.duration);
    }
    if (Math.abs(v1.currentTime - v2.currentTime) > 0.12) {
      v2.currentTime = v1.currentTime;
    }
  };

  const togglePlayPause = () => {
    const v1 = leftVideoRef.current;
    const v2 = rightVideoRef.current;
    if (!v1 || !v2) return;

    if (isPlaying) {
      v1.pause();
      v2.pause();
      setIsPlaying(false);
    } else {
      v2.currentTime = v1.currentTime;
      Promise.all([v1.play(), v2.play()]).catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    const v1 = leftVideoRef.current;
    const v2 = rightVideoRef.current;
    if (!v1 || !v2) return;
    v1.currentTime = 0;
    v2.currentTime = 0;
    setCurrentTime(0);
    Promise.all([v1.play(), v2.play()]).catch(() => {});
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    const v1 = leftVideoRef.current;
    const v2 = rightVideoRef.current;
    if (v1) v1.currentTime = t;
    if (v2) v2.currentTime = t;
    setCurrentTime(t);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    if (leftVideoRef.current) {
      leftVideoRef.current.muted = nextMuted;
    }
    // Keep second video muted so audio does not echo
    if (rightVideoRef.current) {
      rightVideoRef.current.muted = true;
    }
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl overflow-hidden bg-[#211510] border border-[#D9C9B5]/25 shadow-[0_24px_60px_rgba(0,0,0,0.65)] select-none ${className}`}
    >
      {/* Interactive Overlapping Video Stage */}
      <div
        ref={stageRef}
        onClick={(e) => {
          if (!isDragging) updateSplitFromClientX(e.clientX);
        }}
        className="relative w-full aspect-video bg-black overflow-hidden cursor-ew-resize touch-none"
      >
        {/* RIGHT LAYER (Base Full Video) */}
        <video
          ref={rightVideoRef}
          src={rightSrc}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* LEFT LAYER (Clipped Synchronized Video) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
        >
          <video
            ref={leftVideoRef}
            src={leftSrc}
            poster={poster}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onTimeUpdate={syncTime}
            onLoadedMetadata={() => {
              if (leftVideoRef.current?.duration) {
                setDuration(leftVideoRef.current.duration);
              }
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* BEFORE & AFTER Corner Labels */}
        <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-sm bg-[#211510]/90 border border-[#D9C9B5]/30 text-[#F3EADB] text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] shadow-lg">
            {leftLabel}
          </span>
        </div>

        <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-sm bg-[#FF642D] text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] shadow-lg">
            {rightLabel}
          </span>
        </div>

        {/* Draggable Vertical Divider & Circular Handle */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsDragging(true);
          }}
          style={{ left: `${splitPos}%` }}
          className="absolute top-0 bottom-0 -translate-x-1/2 z-20 flex items-center justify-center cursor-ew-resize touch-none"
        >
          {/* Vertical Line */}
          <div className="w-[2.5px] h-full bg-[#F3EADB] shadow-[0_0_12px_rgba(0,0,0,0.9)]" />

          {/* Circular Drag Handle with Left-Right Arrows */}
          <div
            className={`absolute w-11 h-11 rounded-full bg-[#FF642D] border-2 border-[#F3EADB] text-white flex items-center justify-center shadow-[0_6px_22px_rgba(255,100,45,0.65)] transition-transform ${
              isDragging ? "scale-110" : "hover:scale-105"
            }`}
          >
            <ChevronsLeftRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Synchronized Playback Control Bar */}
      <div className="bg-[#2A1914] px-4 py-3 border-t border-[#D9C9B5]/15 flex flex-wrap items-center gap-3 sm:gap-4 text-[#F3EADB]">
        <button
          type="button"
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-full bg-[#FF642D] hover:bg-[#e85520] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title={isPlaying ? "Pause Both Videos" : "Play Both Videos"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleReplay}
          className="w-8 h-8 rounded-full bg-[#211510] hover:bg-[#3a231c] border border-[#D9C9B5]/20 text-[#F3EADB] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Replay Synchronized"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Shared Progress Bar */}
        <div className="flex-1 flex items-center gap-2.5 min-w-[120px]">
          <span className="text-[11px] font-mono font-bold text-[#D9C9B5] w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 10}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-[#FF642D] h-1.5 bg-[#211510] rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono font-bold text-[#D9C9B5] w-9">
            {formatTime(duration)}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="w-8 h-8 rounded-full bg-[#211510] hover:bg-[#3a231c] border border-[#D9C9B5]/20 text-[#F3EADB] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-[#D9C9B5]" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#FF642D]" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-full bg-[#211510] hover:bg-[#3a231c] border border-[#D9C9B5]/20 text-[#F3EADB] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

