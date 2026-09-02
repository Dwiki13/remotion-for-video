import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { EnhancedSceneTheme } from "./CinematicBg";

export interface Word {
  word: string;
  delay: number;
  h?: boolean;
  big?: boolean;
}

export const KineticWord: React.FC<{
  word: string;
  delay: number;
  isBig: boolean;
  isHigh: boolean;
  theme: EnhancedSceneTheme;
  allIn: boolean;
  index: number;
}> = ({ word, delay, isBig, isHigh, theme, allIn, index }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - delay;

  // Soft, organic spring curve (elastic yet steady, no harsh snap)
  const popSpring = spring({
    fps: 30,
    frame: elapsed,
    config: { damping: 14, stiffness: 85, mass: 0.9 },
  });

  const fs = isBig ? 90 : isHigh ? 60 : 50;
  const fw = isBig ? 900 : isHigh ? 800 : 400;

  // Word hasn't appeared yet
  if (elapsed < 0) {
    return (
      <span
        style={{
          display: "inline-flex",
          opacity: 0,
          fontSize: fs,
          userSelect: "none",
          verticalAlign: "baseline",
        }}
      >
        {word}
      </span>
    );
  }

  // --- REGULAR WORD ---
  if (!isBig && !isHigh) {
    const scale = interpolate(popSpring, [0, 1], [0.92, 1]);
    const translateY = interpolate(popSpring, [0, 1], [14, 0]);
    const opacity = interpolate(popSpring, [0, 0.5, 1], [0, 0.85, 1]);

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          verticalAlign: "baseline",
          transformOrigin: "center bottom",
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontSize: fs,
          fontWeight: fw,
          color: theme.dim || "rgba(255, 255, 255, 0.75)",
          letterSpacing: "-0.02em",
          lineHeight: 1.5,
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        {word}
      </span>
    );
  }

  // --- HIGHLIGHTED / BIG WORD ---
  const scalePop = interpolate(popSpring, [0, 1], [0.82, 1]);
  const translateY = interpolate(popSpring, [0, 1], [18, 0]);
  const opacity = interpolate(popSpring, [0, 0.4, 1], [0, 0.9, 1]);

  // Gentle idle shimmer once all words are in
  const breathe = allIn ? 1 + Math.sin(frame * 0.06 + index * 0.4) * 0.015 : 1;
  const glowPulse = allIn ? interpolate(Math.sin(frame * 0.05 + index), [-1, 1], [0.8, 1.1]) : 1;

  // Smooth underline animation
  const underlineSpring = spring({
    fps: 30,
    frame: Math.max(0, elapsed - 4),
    config: { damping: 15, stiffness: 90 },
  });
  const underlineScaleX = interpolate(underlineSpring, [0, 1], [0, 1]);

  const secondaryColor = theme.secondaryAccent || "#ffffff";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "baseline",
        verticalAlign: "baseline",
        transformOrigin: "center bottom",
        transform: `translateY(${translateY}px) scale(${scalePop * breathe})`,
        opacity,
        margin: "0 2px",
      }}
    >
      {/* Background Soft Glow Aura */}
      <div
        style={{
          position: "absolute",
          inset: "-6px -10px",
          background: `radial-gradient(ellipse at center, ${theme.accent}30 0%, transparent 75%)`,
          borderRadius: 14,
          opacity: 0.85 * glowPulse,
          pointerEvents: "none",
        }}
      />

      {/* Main High-Contrast Text */}
      <span
        style={{
          display: "inline-block",
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          fontSize: fs,
          fontWeight: fw,
          letterSpacing: isBig ? "-0.03em" : "-0.02em",
          lineHeight: isBig ? 1.15 : 1.45,
          background: `linear-gradient(135deg, #ffffff 0%, ${theme.accent} 60%, ${secondaryColor} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: `0 0 ${16 * glowPulse}px ${theme.accent}aa`,
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 2,
        }}
      >
        {word}
      </span>

      {/* Dynamic Glowing Laser Underline */}
      <div
        style={{
          position: "absolute",
          bottom: isBig ? -8 : -4,
          left: 0,
          right: 0,
          height: isBig ? 4.5 : 3,
          transformOrigin: "left center",
          transform: `scaleX(${underlineScaleX})`,
          background: `linear-gradient(90deg, ${theme.accent}, ${secondaryColor})`,
          borderRadius: 3,
          boxShadow: `0 0 10px ${theme.accent}`,
          zIndex: 1,
        }}
      />
    </div>
  );
};

export const KineticAnimatedWords: React.FC<{
  words: Word[];
  theme: EnhancedSceneTheme;
}> = ({ words, theme }) => {
  const frame = useCurrentFrame();
  const allIn = frame > Math.max(...words.map((w) => w.delay)) + 12;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "8px 16px",
        textAlign: "center",
        padding: "0 20px",
        maxWidth: 960,
      }}
    >
      {words.map((w, i) => (
        <KineticWord
          key={i}
          word={w.word}
          delay={w.delay}
          isBig={!!w.big}
          isHigh={!!w.h && !w.big}
          theme={theme}
          allIn={allIn}
          index={i}
        />
      ))}
    </div>
  );
};
