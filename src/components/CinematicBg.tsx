import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface EnhancedSceneTheme {
  bg1: string;
  bg2: string;
  accent: string;
  glow: string;
  dim: string;
  blob1: string;
  blob2: string;
  secondaryAccent?: string;
}

export const CinematicBg: React.FC<{
  theme: EnhancedSceneTheme;
  globalFrame?: number;
}> = ({ theme, globalFrame }) => {
  const localFrame = useCurrentFrame();
  // Prefer global continuous frame to avoid reset between scenes
  const frame = globalFrame !== undefined ? globalFrame : localFrame;

  // Continuous smooth orbital time for background blobs
  const t = frame * 0.02;
  const secondary = theme.secondaryAccent || theme.accent;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#000000",
      }}
    >
      {/* 1. Base Radial Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, ${theme.bg1} 0%, ${theme.bg2} 75%, #000000 100%)`,
          transition: "background 0.5s ease",
        }}
      />

      {/* 2. Dynamic Continuous Aurora Mesh Nodes */}
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          filter: "blur(80px)",
          opacity: 0.85,
        }}
      >
        {/* Blob Top Center */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            left: `calc(50% - 350px + ${Math.sin(t) * 70}px)`,
            top: `calc(32% - 350px + ${Math.cos(t * 0.75) * 50}px)`,
            background: `radial-gradient(circle, ${theme.blob1} 0%, transparent 70%)`,
            opacity: 0.7,
            mixBlendMode: "screen",
          }}
        />

        {/* Blob Bottom Right */}
        <div
          style={{
            position: "absolute",
            width: 750,
            height: 750,
            borderRadius: "50%",
            right: `${-80 + Math.cos(t * 0.65) * 60}px`,
            bottom: `${120 + Math.sin(t * 0.85) * 80}px`,
            background: `radial-gradient(circle, ${theme.blob2} 0%, transparent 70%)`,
            opacity: 0.65,
            mixBlendMode: "screen",
          }}
        />

        {/* Blob Left Pulse */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            left: `${-60 + Math.sin(t * 1.05) * 50}px`,
            top: `${720 + Math.cos(t * 0.55) * 80}px`,
            background: `radial-gradient(circle, ${secondary}38 0%, transparent 70%)`,
            opacity: 0.5,
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* 3. Central Focused Glow */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          width: 850,
          height: 850,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${theme.accent}14 0%, transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* 4. Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* 5. Continuous Floating Bokeh Dust */}
      <svg
        width="1080"
        height="1920"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {[
          { x: 120, sp: 0.4, d: 0, r: 2.2, b: 0.7 },
          { x: 260, sp: 0.25, d: 15, r: 1.4, b: 0.4 },
          { x: 440, sp: 0.5, d: 8, r: 2.8, b: 0.85 },
          { x: 620, sp: 0.32, d: 34, r: 1.8, b: 0.6 },
          { x: 800, sp: 0.42, d: 19, r: 2.5, b: 0.75 },
          { x: 940, sp: 0.2, d: 45, r: 1.2, b: 0.3 },
          { x: 340, sp: 0.55, d: 60, r: 3.2, b: 0.9 },
          { x: 710, sp: 0.28, d: 25, r: 1.6, b: 0.5 },
          { x: 530, sp: 0.38, d: 50, r: 2.0, b: 0.65 },
          { x: 180, sp: 0.45, d: 40, r: 2.6, b: 0.8 },
        ].map((p, i) => {
          const e = Math.max(0, frame - p.d);
          const y = ((1920 - e * p.sp * 1.4) % 1920 + 1920) % 1920;
          const twinkle = interpolate(
            Math.sin(e * 0.045 + i * 2),
            [-1, 1],
            [0.2, 0.8]
          );
          const xDrift = Math.sin(e * 0.018 + i) * 16;
          return (
            <circle
              key={i}
              cx={p.x + xDrift}
              cy={y}
              r={p.r}
              fill="#ffffff"
              opacity={twinkle * 0.65 * p.b}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const CinematicFilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame * 11 + 5) % 400;
  return (
    <svg
      width="1080"
      height="1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity: 0.035,
      }}
    >
      <filter id="cinematic-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="2"
          seed={seed}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#cinematic-grain)" />
    </svg>
  );
};
