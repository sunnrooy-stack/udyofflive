"use client";

import React, { useRef, useState } from "react";

export interface VideoBeforeAfterManagerProps {
  beforeVideoUrl: string;
  afterVideoUrl: string;
  comparisonEnabled: boolean;
  comparisonThumbnail?: string;
  displayOrder?: "before-left" | "after-left";
  defaultSplit?: number;
  onChange: (
    patch: Partial<{
      beforeVideoUrl: string;
      afterVideoUrl: string;
      comparisonEnabled: boolean;
      comparisonThumbnail: string;
      displayOrder: "before-left" | "after-left";
      defaultSplit: number;
    }>
  ) => void;
}

async function uploadVideoToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    alert("Cloudinary cloud name is not set in admin/.env.local!");
    return null;
  }

  const endpoints = [
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:5000",
    "https://udyofflive1111111111.onrender.com",
  ].filter(Boolean) as string[];

  let sigData: { timestamp: number; signature: string } | null = null;
  for (const base of endpoints) {
    try {
      const sigRes = await fetch(`${base.replace(/\/$/, "")}/api/upload/signature`);
      if (sigRes.ok) {
        sigData = await sigRes.json();
        break;
      }
    } catch {
      // try next
    }
  }

  if (!sigData) {
    alert("Failed to fetch upload signature from backend.");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", "915851656698785");
    formData.append("timestamp", sigData.timestamp.toString());
    formData.append("signature", sigData.signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url || null;
  } catch (err) {
    console.error("Video upload failed:", err);
    alert("Failed to upload video to Cloudinary.");
    return null;
  }
}

export default function VideoBeforeAfterManager({
  beforeVideoUrl,
  afterVideoUrl,
  comparisonEnabled,
  comparisonThumbnail = "",
  displayOrder = "before-left",
  defaultSplit = 50,
  onChange,
}: VideoBeforeAfterManagerProps) {
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [beforeDuration, setBeforeDuration] = useState<number | null>(null);
  const [afterDuration, setAfterDuration] = useState<number | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const beforeRef = useRef<HTMLVideoElement | null>(null);
  const afterRef = useRef<HTMLVideoElement | null>(null);

  const durationMismatch =
    beforeDuration !== null &&
    afterDuration !== null &&
    Math.abs(beforeDuration - afterDuration) > 0.75;

  const handleTogglePreviewPlay = () => {
    const b = beforeRef.current;
    const a = afterRef.current;
    if (!b && !a) return;

    if (previewPlaying) {
      b?.pause();
      a?.pause();
      setPreviewPlaying(false);
    } else {
      if (b && a) {
        a.currentTime = b.currentTime;
      }
      b?.play().catch(() => {});
      a?.play().catch(() => {});
      setPreviewPlaying(true);
    }
  };

  const handleReplayPreview = () => {
    const b = beforeRef.current;
    const a = afterRef.current;
    if (b) b.currentTime = 0;
    if (a) a.currentTime = 0;
    b?.play().catch(() => {});
    a?.play().catch(() => {});
    setPreviewPlaying(true);
  };

  const handleVideoFile = async (side: "before" | "after", file?: File) => {
    if (!file) return;
    if (side === "before") setUploadingBefore(true);
    else setUploadingAfter(true);

    const url = await uploadVideoToCloudinary(file);
    if (url) {
      onChange(side === "before" ? { beforeVideoUrl: url } : { afterVideoUrl: url });
    }

    if (side === "before") setUploadingBefore(false);
    else setUploadingAfter(false);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#FF642D]/40 bg-[#211510]/60 space-y-4">
      {/* Header & Enable Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#FF642D] flex items-center gap-1.5">
            <span>🎬</span>
            <span>Video Before &amp; After Manager</span>
          </span>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Upload or paste synchronized BEFORE &amp; AFTER videos (.mp4, .webm, Cloudinary). Shown only on CC &amp; Preset products.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-white">
          <input
            type="checkbox"
            checked={comparisonEnabled}
            onChange={(e) => onChange({ comparisonEnabled: e.target.checked })}
            className="rounded text-[#FF642D] focus:ring-0 cursor-pointer"
          />
          <span>{comparisonEnabled ? "Comparison Enabled" : "Comparison Disabled"}</span>
        </label>
      </div>

      {/* BEFORE & AFTER Video Inputs */}
      <div className="grid grid-cols-1 gap-3">
        {/* BEFORE */}
        <div className="p-3 rounded-xl border border-slate-700/80 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-300">BEFORE Video (Raw / Unedited)</span>
            {beforeDuration !== null && (
              <span className="text-[10px] font-mono text-slate-400">
                {beforeDuration.toFixed(1)}s
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={uploadingBefore ? "Uploading Before video..." : beforeVideoUrl}
              onChange={(e) => {
                setBeforeDuration(null);
                onChange({ beforeVideoUrl: e.target.value });
              }}
              disabled={uploadingBefore}
              placeholder="https://res.cloudinary.com/.../before.mp4"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-[#FF642D]"
            />
            <label className="px-3 py-2 rounded-lg bg-[#FF642D]/20 hover:bg-[#FF642D]/30 border border-[#FF642D]/40 text-[#FF642D] text-xs font-bold cursor-pointer text-center shrink-0">
              {beforeVideoUrl ? "Replace Video" : "Upload Video"}
              <input
                type="file"
                accept="video/mp4,video/webm,video/*"
                className="hidden"
                onChange={(e) => handleVideoFile("before", e.target.files?.[0])}
              />
            </label>
            {beforeVideoUrl && (
              <button
                type="button"
                onClick={() => {
                  setBeforeDuration(null);
                  onChange({ beforeVideoUrl: "" });
                }}
                className="px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold cursor-pointer shrink-0"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* AFTER */}
        <div className="p-3 rounded-xl border border-slate-700/80 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-300">AFTER Video (CC Graded / Preset Applied)</span>
            {afterDuration !== null && (
              <span className="text-[10px] font-mono text-slate-400">
                {afterDuration.toFixed(1)}s
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={uploadingAfter ? "Uploading After video..." : afterVideoUrl}
              onChange={(e) => {
                setAfterDuration(null);
                onChange({ afterVideoUrl: e.target.value });
              }}
              disabled={uploadingAfter}
              placeholder="https://res.cloudinary.com/.../after.mp4"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-[#FF642D]"
            />
            <label className="px-3 py-2 rounded-lg bg-[#FF642D]/20 hover:bg-[#FF642D]/30 border border-[#FF642D]/40 text-[#FF642D] text-xs font-bold cursor-pointer text-center shrink-0">
              {afterVideoUrl ? "Replace Video" : "Upload Video"}
              <input
                type="file"
                accept="video/mp4,video/webm,video/*"
                className="hidden"
                onChange={(e) => handleVideoFile("after", e.target.files?.[0])}
              />
            </label>
            {afterVideoUrl && (
              <button
                type="button"
                onClick={() => {
                  setAfterDuration(null);
                  onChange({ afterVideoUrl: "" });
                }}
                className="px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold cursor-pointer shrink-0"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duration Compatibility Check */}
      {durationMismatch && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-semibold">
          ⚠️ Incompatible video durations detected ({beforeDuration?.toFixed(1)}s vs{" "}
          {afterDuration?.toFixed(1)}s). Upload matching duration clips for frame-accurate sync.
        </div>
      )}

      {/* Display Order & Default Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Comparison Display Order
          </label>
          <select
            value={displayOrder}
            onChange={(e) =>
              onChange({ displayOrder: e.target.value as "before-left" | "after-left" })
            }
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
          >
            <option value="before-left">BEFORE (Left) &bull; AFTER (Right)</option>
            <option value="after-left">AFTER (Left) &bull; BEFORE (Right)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Default Slider Position ({defaultSplit}%)
          </label>
          <input
            type="range"
            min={10}
            max={90}
            value={defaultSplit}
            onChange={(e) => onChange({ defaultSplit: Number(e.target.value) })}
            className="w-full accent-[#FF642D] cursor-pointer mt-1.5"
          />
        </div>
      </div>

      {/* Optional Thumbnail */}
      <div>
        <label className="block text-[11px] font-bold text-slate-300 mb-1">
          Comparison Poster Thumbnail URL (optional)
        </label>
        <input
          type="url"
          value={comparisonThumbnail}
          onChange={(e) => onChange({ comparisonThumbnail: e.target.value })}
          placeholder="https://... (falls back to Cover Image)"
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-[#FF642D]"
        />
      </div>

      {/* Dual Synchronized Video Preview */}
      {(beforeVideoUrl || afterVideoUrl) && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Synchronized Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePreviewPlay}
                className="px-3 py-1 rounded-lg bg-[#FF642D] hover:bg-[#e85520] text-white text-xs font-bold cursor-pointer"
              >
                {previewPlaying ? "Pause Both" : "Play Both"}
              </button>
              <button
                type="button"
                onClick={handleReplayPreview}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Replay
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black relative">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] font-black text-amber-300">
                BEFORE
              </span>
              {beforeVideoUrl ? (
                <video
                  ref={beforeRef}
                  src={beforeVideoUrl}
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={(e) => setBeforeDuration(e.currentTarget.duration)}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-xs text-slate-500">
                  No Before Video
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black relative">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-[#FF642D] text-[10px] font-black text-white">
                AFTER
              </span>
              {afterVideoUrl ? (
                <video
                  ref={afterRef}
                  src={afterVideoUrl}
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={(e) => setAfterDuration(e.currentTarget.duration)}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-xs text-slate-500">
                  No After Video
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

