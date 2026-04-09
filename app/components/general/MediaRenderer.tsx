"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Play, Video } from "lucide-react";
import { isVideoUrl, getMediaUrl } from "@/lib/aws_s3";

interface MediaRendererProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  interactive?: boolean; // If true, enables hover-to-play
  showIcon?: boolean;    // If true, shows the video/play icon
  objectFit?: "cover" | "contain";
  controls?: boolean;    // If true, shows native video controls
}

const DEFAULT_IMAGE = "/assets/default.svg";

export const MediaRenderer = ({
  src,
  alt,
  className = "",
  fill = true,
  priority = false,
  unoptimized = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  interactive = false,
  showIcon = true,
  objectFit = "cover",
  controls = false,
}: MediaRendererProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = isVideoUrl(src);

  // Play/Pause logic based on hover
  useEffect(() => {
    if (!interactive || !isVideo || !videoRef.current) return;

    if (isHovered) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented by the browser
          console.warn("Autoplay prevented:", error);
        });
      }
    } else {
      videoRef.current.pause();
      // Only reset if it's actually loaded and seekable
      if (videoRef.current.readyState >= 2) {
        videoRef.current.currentTime = 0.1;
      }
    }
  }, [isHovered, interactive, isVideo]);

  const containerClass = `relative overflow-hidden ${className}`;
  const mediaClass = `w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain"} transition-transform duration-300 ${interactive && isHovered ? "scale-105" : ""}`;

  const renderMedia = () => {
    if (hasError || !src || src.trim() === "") {
      return (
        <Image
          src={DEFAULT_IMAGE}
          alt="Placeholder"
          fill={fill}
          className="object-contain p-4 opacity-50 bg-gray-50"
        />
      );
    }

    if (isVideo) {
      return (
        <div 
          className="w-full h-full relative"
          onMouseEnter={() => interactive && setIsHovered(true)}
          onMouseLeave={() => interactive && setIsHovered(false)}
        >
          <video
            ref={videoRef}
            src={getMediaUrl(src) || ""}
            muted={!controls} // Mute only on preview/hover, not when controls are shown
            autoPlay={controls}
            controls={controls}
            playsInline
            preload="metadata"
            loop
            className={mediaClass}
            onError={() => setHasError(true)}
          />
          
          {/* Video indicator icon */}
          {showIcon && !isHovered && (
            <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-md rounded-lg p-1.5 flex items-center gap-1.5 border border-white/20">
              <Video size={12} className="text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Video</span>
            </div>
          )}

          {/* Centered Play icon for interactive state */}
          {interactive && !isHovered && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/30">
                  <Play size={16} className="text-white fill-white ml-0.5" />
                </div>
             </div>
          )}
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        unoptimized={unoptimized}
        sizes={sizes}
        className={mediaClass}
        onError={() => setHasError(true)}
      />
    );
  };

  return <div className={containerClass}>{renderMedia()}</div>;
};
