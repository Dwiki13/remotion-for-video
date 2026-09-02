import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const EnhancedProgressBar: React.FC<{
  totalFrames: number;
  accent?: string;
}> = ({ totalFrames, accent = "#38bdf8" }) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / totalFrames));
  const hue = interpolate(progress, [0, 1], [195, 340]);
  const widthPx = 1080 * progress;

  // Pulse effect for the leading laser glow
  const headPulse = 1 + Math.sin(frame * 0.25) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 1080,
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(4px)",
        overflow: "visible",
        zIndex: 50,
      }}
    >
      {/* Background Track Glow */}
      <div
        style={{
          width: widthPx,
          height: "100%",
          background: `linear-gradient(90deg, hsl(${hue - 40}, 90%, 55%), hsl(${hue}, 95%, 65%), hsl(${hue + 30}, 100%, 75%))`,
          boxShadow: `0 0 16px hsl(${hue}, 95%, 65%), 0 0 32px hsl(${hue}, 90%, 55%)88`,
          borderRadius: "0 3px 3px 0",
          position: "relative",
        }}
      >
        {/* Leading Laser Head Light */}
        {widthPx > 10 && (
          <div
            style={{
              position: "absolute",
              right: -3,
              top: "50%",
              width: 10,
              height: 10,
              transform: `translateY(-50%) scale(${headPulse})`,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: `0 0 12px #ffffff, 0 0 24px hsl(${hue}, 100%, 75%), 0 0 40px hsl(${hue}, 100%, 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
