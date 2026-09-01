import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
  staticFile,
} from "remotion";

export const reel1TotalFrames = 2015;

// Helpers
const easeOut   = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const easeInOut = (t: number) => { t = Math.min(1, Math.max(0, t)); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; };
const clamp     = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Tema warna per scene
interface SceneTheme {
  bg1: string;
  bg2: string;
  accent: string;
  glow: string;
  dim: string;
  blob1: string;
  blob2: string;
}

const THEMES: SceneTheme[] = [
  { bg1: "#020617", bg2: "#0f172a", accent: "#38bdf8", glow: "rgba(56,189,248,0.5)",   dim: "rgba(186,230,253,0.55)", blob1: "#0369a1", blob2: "#1e3a5f" },
  { bg1: "#1e1b4b", bg2: "#0f0a2e", accent: "#a78bfa", glow: "rgba(167,139,250,0.5)",  dim: "rgba(221,214,254,0.55)", blob1: "#4c1d95", blob2: "#2e1065" },
  { bg1: "#09090b", bg2: "#18181b", accent: "#fbbf24", glow: "rgba(251,191,36,0.5)",   dim: "rgba(253,230,138,0.55)", blob1: "#78350f", blob2: "#3b1f00" },
  { bg1: "#0f172a", bg2: "#042f2e", accent: "#2dd4bf", glow: "rgba(45,212,191,0.5)",   dim: "rgba(153,246,228,0.55)", blob1: "#134e4a", blob2: "#0f3460" },
  { bg1: "#2d0a0a", bg2: "#1a0505", accent: "#fb923c", glow: "rgba(251,146,60,0.55)",  dim: "rgba(254,215,170,0.55)", blob1: "#7f1d1d", blob2: "#431407" },
  { bg1: "#030712", bg2: "#111827", accent: "#34d399", glow: "rgba(52,211,153,0.5)",   dim: "rgba(167,243,208,0.55)", blob1: "#064e3b", blob2: "#1a2e25" },
  { bg1: "#111827", bg2: "#0d1f0d", accent: "#a3e635", glow: "rgba(163,230,53,0.5)",   dim: "rgba(217,249,157,0.55)", blob1: "#365314", blob2: "#1a2e0a" },
  { bg1: "#082f49", bg2: "#0c1a2e", accent: "#22d3ee", glow: "rgba(34,211,238,0.5)",   dim: "rgba(165,243,252,0.55)", blob1: "#155e75", blob2: "#0e4c72" },
  { bg1: "#042830", bg2: "#061822", accent: "#5eead4", glow: "rgba(94,234,212,0.5)",   dim: "rgba(204,251,241,0.55)", blob1: "#134e4a", blob2: "#083344" },
  { bg1: "#1e0a3c", bg2: "#110520", accent: "#c084fc", glow: "rgba(192,132,252,0.5)",  dim: "rgba(233,213,255,0.55)", blob1: "#4a044a", blob2: "#2e0a40" },
  { bg1: "#1f0614", bg2: "#0d0008", accent: "#f472b6", glow: "rgba(244,114,182,0.5)",  dim: "rgba(251,207,232,0.55)", blob1: "#881337", blob2: "#4a0025" },
  { bg1: "#2d0a20", bg2: "#160010", accent: "#e879f9", glow: "rgba(232,121,249,0.5)",  dim: "rgba(245,208,254,0.55)", blob1: "#701a75", blob2: "#3b0764" },
];

type TransitionType = "fade" | "slideUp" | "slideDown" | "flash" | "zoom";

const TRANSITIONS: TransitionType[] = [
  "slideUp",   // S1
  "fade",      // S2
  "flash",     // S3
  "slideDown", // S4
  "flash",     // S5
  "zoom",      // S6A
  "slideUp",   // S6B
  "fade",      // S7A
  "slideUp",   // S7B
  "slideDown", // S8A
  "fade",      // S8B
  "zoom",      // S8C
];

interface Word {
  word: string;
  delay: number;
  h?: boolean;
  big?: boolean;
}

// delay = frame dari awal scene kapan kata muncul
const stagger = (words: string[], highlights: string[] = [], bigs: string[] = [], startDelay = 8): Word[] =>
  words.map((w, i) => ({
    word: w,
    delay: startDelay + i * 7,
    h: highlights.includes(w),
    big: bigs.includes(w),
  }));

const S1 = stagger(["jangan", "buru-buru", "menghentikan", "tangisnya."], ["tangisnya."], [], 10);
const S2 = stagger(["saat", "emosi", "memuncak,", "kemampuan", "berpikir", "menurun."], ["emosi", "memuncak,", "menurun."], [], 10);
const S3 = stagger(["tidak", "mempan", "dinasihati."], ["mempan", "dinasihati."], [], 14);
const S4 = stagger(["dia", "belum", "siap", "menerima."], ["siap", "menerima."], [], 14);
const S5 = stagger(["diminta", "berpikir", "jernih", "saat", "sangat", "marah."], ["marah."], [], 10);

const S6A: Word[] = [
  { word: "Sulit,", delay: 8,  h: true, big: true },
  { word: "kan?",   delay: 18, h: true, big: true },
];

const S6B = stagger(["bukan", "anak", "yang", "mencari", "masalah."], ["bukan", "masalah."], [], 10);
const S7A = stagger(["emosi", "yang", "terlalu", "besar."], ["emosi", "besar."], [], 10);
const S7B = stagger(["setelah", "mereda,", "barulah", "siap", "belajar."], ["mereda,", "siap"], [], 10);
const S8A = stagger(["tetap", "beri", "batas,", "tapi", "jangan", "paksa."], ["batas,", "paksa."], [], 10);
const S8B = stagger(["menangis", "bukan", "masalah."], ["menangis", "masalah."], [], 14);
const S8C = stagger(["cara", "tubuh", "melepas", "emosi."], ["emosi."], [], 14);

// Background — gradient + blob + partikel ambient
const SceneBg: React.FC<{ theme: SceneTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  const explodeP     = spring({ fps: 30, frame, config: { damping: 14, stiffness: 60, mass: 1.2 } });
  const explodeScale = interpolate(explodeP, [0, 1], [2.8, 1]);
  const explodeOp    = interpolate(explodeP, [0, 1], [0.28, 0.12]);

  const blobs = [
    { cx: 200,  cy: 500,  r: 420, speed: 0.011, ph: 0  },
    { cx: 880,  cy: 1420, r: 520, speed: 0.008, ph: 70 },
    { cx: 540,  cy: 960,  r: 320, speed: 0.014, ph: 35 },
  ];

  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`,
      }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: explodeOp }}>
        <defs><filter id="bb"><feGaussianBlur stdDeviation="70" /></filter></defs>
        {blobs.map((s, i) => {
          const driftX = Math.cos(frame * s.speed + s.ph) * 30;
          const driftY = Math.sin(frame * s.speed * 0.7 + s.ph) * 35;
          const cx = interpolate(explodeP, [0, 1], [540, s.cx + driftX]);
          const cy = interpolate(explodeP, [0, 1], [960, s.cy + driftY]);
          return (
            <circle key={i}
              cx={cx} cy={cy} r={s.r * explodeScale}
              fill={i % 2 === 0 ? theme.blob1 : theme.blob2}
              filter="url(#bb)"
            />
          );
        })}
      </svg>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[
          { x: 110, sp: 0.30, d: 0,  r: 1.5 },
          { x: 290, sp: 0.22, d: 18, r: 1.0 },
          { x: 490, sp: 0.38, d: 7,  r: 2.0 },
          { x: 680, sp: 0.26, d: 42, r: 1.5 },
          { x: 870, sp: 0.34, d: 12, r: 1.0 },
          { x: 380, sp: 0.20, d: 58, r: 1.5 },
          { x: 760, sp: 0.42, d: 28, r: 1.0 },
          { x: 560, sp: 0.28, d: 35, r: 2.0 },
        ].map((p, i) => {
          const e = Math.max(0, frame - p.d);
          const y = ((1920 - e * p.sp * 1.2) % 1920 + 1920) % 1920;
          const op = interpolate(Math.sin(e * 0.018 + i), [-1,1], [0.04, 0.2]);
          return <circle key={i} cx={p.x} cy={y} r={p.r} fill={theme.accent} opacity={op} />;
        })}
      </svg>
    </>
  );
};

// Film grain overlay
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame * 7 + 13) % 1000;
  return (
    <svg width="1080" height="1920"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#grain)" opacity="0.04" />
    </svg>
  );
};

const GF: React.FC<{ id?: string; blur?: number }> = ({ id = "glow", blur = 5 }) => (
  <defs>
    <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation={blur} result="b1" />
      <feGaussianBlur stdDeviation={blur * 2} result="b2" />
      <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
);

// Icons
const IconChild: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 90 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const tearY = interpolate(frame % 45, [0, 45], [0, 28]);
  const tearOp = interpolate(frame % 45, [0, 8, 38, 45], [0, 0.9, 0.9, 0]);
  return (
    <svg width="320" height="390" viewBox="0 0 240 290"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="62" r="42" />
        <path d="M98 50 Q109 55 120 50" />
        <path d="M120 50 Q131 55 142 50" />
        <circle cx="106" cy="62" r="4" fill={accent} stroke="none" />
        <circle cx="134" cy="62" r="4" fill={accent} stroke="none" />
        <path d="M104 80 Q120 72 136 80" />
        <ellipse cx="96" cy={82 + tearY} rx="5" ry="8" fill={accent} stroke="none" opacity={tearOp} />
        <ellipse cx="144" cy={86 + tearY * 0.85} rx="4" ry="6.5" fill={accent} stroke="none" opacity={tearOp * 0.8} />
        <path d="M78 188 C78 138 162 138 162 188" />
        <path d="M78 156 L44 118" strokeWidth="2.6" />
        <path d="M162 156 L196 118" strokeWidth="2.6" />
        <line x1="102" y1="188" x2="92" y2="240" />
        <line x1="138" y1="188" x2="148" y2="240" />
      </g>
    </svg>
  );
};

const IconHeartFill: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const floodP = spring({ fps: 30, frame: Math.max(0, frame - 10), config: { damping: 16, stiffness: 38 } });
  const waterLevel = interpolate(floodP, [0, 1], [230, 62]);
  const waveOffset = frame * 0.13;
  const heartPath = "M120 196 C120 196 22 144 22 80 C22 52 42 34 66 42 C82 48 98 62 120 82 C142 62 158 48 174 42 C198 34 218 52 218 80 C218 144 120 196 120 196 Z";
  return (
    <svg width="340" height="310" viewBox="0 0 240 220"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <defs>
        <clipPath id="heartClipFill"><path d={heartPath} /></clipPath>
      </defs>
      <g filter="url(#glow)">
        <g clipPath="url(#heartClipFill)">
          <path
            d={`M0 ${waterLevel} Q30 ${waterLevel - 8 + Math.sin(waveOffset) * 5} 60 ${waterLevel} Q90 ${waterLevel + 8 + Math.sin(waveOffset + 1) * 5} 120 ${waterLevel} Q150 ${waterLevel - 8 + Math.sin(waveOffset + 2) * 5} 180 ${waterLevel} Q210 ${waterLevel + 8 + Math.sin(waveOffset + 3) * 5} 240 ${waterLevel} L240 240 L0 240 Z`}
            fill={accent} fillOpacity="0.35" stroke="none"
          />
          <path
            d={`M0 ${waterLevel} Q30 ${waterLevel - 8 + Math.sin(waveOffset) * 5} 60 ${waterLevel} Q90 ${waterLevel + 8 + Math.sin(waveOffset + 1) * 5} 120 ${waterLevel} Q150 ${waterLevel - 8 + Math.sin(waveOffset + 2) * 5} 180 ${waterLevel} Q210 ${waterLevel + 8 + Math.sin(waveOffset + 3) * 5} 240 ${waterLevel}`}
            stroke={accent} strokeWidth="2" fill="none" opacity="0.9"
          />
          {[{ cx: 70, d: 0 }, { cx: 120, d: 22 }, { cx: 168, d: 44 }].map((b, i) => {
            const e = (frame + b.d) % 55;
            const by = interpolate(e, [0, 55], [200, waterLevel + 4]);
            const bo = interpolate(e, [0, 8, 44, 55], [0, 0.7, 0.7, 0]);
            if (by < waterLevel) return null;
            return <circle key={i} cx={b.cx} cy={by} r="3" fill={accent} stroke="none" opacity={bo} />;
          })}
        </g>
        <path d={heartPath} stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const IconWordsBounce: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 85 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const cyclePos = (frame % 55) / 55;
  const travel = interpolate(cyclePos, [0, 0.55, 1], [0, 1, 0]);
  const arrowX = interpolate(travel, [0, 1], [96, 170]);
  const arrowOp = interpolate(cyclePos, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);
  const impactP = interpolate(cyclePos, [0.5, 0.58, 0.7], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width="360" height="300" viewBox="0 0 270 220"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 40 Q14 22 32 22 L96 22 Q114 22 114 40 L114 78 Q114 96 96 96 L54 96 L34 116 L40 96 L32 96 Q14 96 14 78 Z" strokeWidth="2.6" />
        <line x1="34" y1="44" x2="88" y2="44" strokeWidth="2.2" opacity="0.6" />
        <line x1="34" y1="60" x2="76" y2="60" strokeWidth="2.2" opacity="0.6" />
        <line x1="182" y1="14" x2="182" y2="206" strokeWidth="4" opacity="0.85" />
        {[0,1,2,3,4,5].map(i => (
          <line key={i} x1="182" y1={14 + i * 32} x2="198" y2={2 + i * 32} strokeWidth="2" opacity="0.35" />
        ))}
        <g opacity={arrowOp}>
          <line x1={arrowX - 26} y1="112" x2={arrowX} y2="112" strokeWidth="2.6" />
          <path d={`M${arrowX - 9} 104 L${arrowX} 112 L${arrowX - 9} 120`} strokeWidth="2.6" />
        </g>
        {impactP > 0 && (
          <g opacity={impactP} stroke={accent} strokeWidth="2.4">
            <line x1="182" y1="112" x2="168" y2="96" />
            <line x1="182" y1="112" x2="168" y2="128" />
            <line x1="182" y1="112" x2="160" y2="112" />
          </g>
        )}
      </g>
    </svg>
  );
};

const IconClosedDoor: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const doorAngle = interpolate(Math.sin(frame * 0.045), [-1, 1], [2, 28]);
  const lightOp = interpolate(doorAngle, [2, 28], [0.05, 0.55]);
  const lightW  = interpolate(doorAngle, [2, 28], [4, 52]);
  const frameX = 60, frameY = 40, frameW = 150, frameH = 210;
  const skewFactor = doorAngle * 0.8;
  return (
    <svg width="340" height="340" viewBox="0 0 270 280"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <defs>
        <radialGradient id="doorLight" cx="0%" cy="50%" r="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round">
        <rect x={frameX} y={frameY + 2} width={lightW} height={frameH - 4}
          fill="url(#doorLight)" opacity={lightOp} stroke="none" />
        <rect x={frameX} y={frameY} width={frameW} height={frameH}
          stroke={accent} strokeWidth="3" fill="none" />
        <line x1={frameX - 12} y1={frameY + frameH} x2={frameX + frameW + 12} y2={frameY + frameH}
          stroke={accent} strokeWidth="3" />
        <g opacity="0.9">
          <path d={`M ${frameX+3} ${frameY+3} L ${frameX+frameW-skewFactor-3} ${frameY+3} L ${frameX+frameW-skewFactor-3} ${frameY+frameH-3} L ${frameX+3} ${frameY+frameH-3} Z`}
            stroke={accent} strokeWidth="2.2" fill={`${accent}10`} />
          <rect x={frameX+10} y={frameY+18} width={frameW-skewFactor-20} height={80}
            stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5" rx="3" />
          <rect x={frameX+10} y={frameY+112} width={frameW-skewFactor-20} height={80}
            stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5" rx="3" />
          <circle cx={frameX+frameW-skewFactor-22} cy={frameY+frameH/2}
            r="7" stroke={accent} strokeWidth="2.2" fill="none" />
        </g>
        <line x1={frameX+frameW-skewFactor-3} y1={frameY+5}
              x2={frameX+frameW-skewFactor-3} y2={frameY+frameH-5}
          stroke={accent} strokeWidth="2" opacity={lightOp * 1.4} />
      </g>
    </svg>
  );
};

const IconAngryAdult: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const smokeY = interpolate(frame % 55, [0, 55], [0, -28]);
  const smokeOp = interpolate(frame % 55, [0, 10, 44, 55], [0, 0.75, 0.75, 0]);
  const smokeScale = interpolate(frame % 55, [0, 55], [0.5, 1.8]);
  return (
    <svg width="325" height="420" viewBox="0 0 240 310"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="90" r="46" />
        <path d="M94 72 Q107 64 120 72" strokeWidth="4.5" />
        <path d="M120 72 Q133 64 146 72" strokeWidth="4.5" />
        <line x1="100" y1="88" x2="112" y2="88" strokeWidth="3.5" />
        <line x1="128" y1="88" x2="140" y2="88" strokeWidth="3.5" />
        <path d="M100 106 Q120 97 140 106" strokeWidth="2.8" />
        {[
          { cx: 88,  baseY: 50, sc: smokeScale * 0.9 },
          { cx: 120, baseY: 38, sc: smokeScale },
          { cx: 152, baseY: 48, sc: smokeScale * 0.8 },
        ].map((sm, i) => (
          <circle key={i} cx={sm.cx} cy={sm.baseY + smokeY}
            r={12 * sm.sc} opacity={smokeOp * (1 - i * 0.15)}
            stroke={accent} strokeWidth="2" />
        ))}
        <path d="M74 200 C74 158 166 158 166 200" />
        <path d="M74 172 L100 188 M166 172 L140 188" strokeWidth="2.6" />
        <line x1="102" y1="200" x2="92" y2="260" />
        <line x1="138" y1="200" x2="148" y2="260" />
      </g>
    </svg>
  );
};

const IconOverwhelmedHead: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 85 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const spiralRot = frame * 1.8;
  const exPulse = 1 + Math.sin(frame * 0.12) * 0.08;
  const sweatCycle = (frame % 50) / 50;
  const sweatY = interpolate(sweatCycle, [0, 1], [0, 22]);
  const sweatOp = interpolate(sweatCycle, [0, 0.1, 0.85, 1], [0, 0.8, 0.8, 0]);
  return (
    <svg width="320" height="350" viewBox="0 0 240 260"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="100" r="52" />
        <path d="M94 80 Q107 72 120 78" />
        <path d="M120 78 Q133 72 146 80" />
        <circle cx="104" cy="96" r="6" fill={accent} stroke="none" opacity="0.8" />
        <circle cx="136" cy="96" r="6" fill={accent} stroke="none" opacity="0.8" />
        <circle cx="106" cy="94" r="2" fill="#000" stroke="none" />
        <circle cx="138" cy="94" r="2" fill="#000" stroke="none" />
        <path d="M104 116 Q120 128 136 116" strokeWidth="2.5" />
        <g transform={`rotate(${spiralRot}, 172, 54)`} opacity="0.7">
          <path d="M172 54 Q182 44 172 38 Q158 32 152 46 Q148 60 162 66 Q178 72 186 56 Q192 38 176 30"
            strokeWidth="2" fill="none" />
        </g>
        <g transform={`scale(${exPulse}) translate(${(1-exPulse)*58} ${(1-exPulse)*44})`} opacity="0.85">
          <line x1="58" y1="30" x2="58" y2="62" strokeWidth="4" />
          <circle cx="58" cy="72" r="3.5" fill={accent} stroke="none" />
        </g>
        <ellipse cx="176" cy={92 + sweatY} rx="4" ry="7" fill={accent} stroke="none" opacity={sweatOp} />
        <path d="M80 200 C80 162 160 162 160 200" />
        <line x1="92" y1="200" x2="86" y2="240" />
        <line x1="148" y1="200" x2="154" y2="240" />
        <path d="M80 174 Q60 140 72 120" strokeWidth="2.4" />
        <path d="M160 174 Q180 140 168 120" strokeWidth="2.4" />
      </g>
    </svg>
  );
};

const IconChildNotProblem: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 85 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const crossP = easeOut(clamp((frame - 18) / 14, 0, 1));
  const crossLen = crossP * 44;
  const heartP = easeOut(clamp((frame - 34) / 14, 0, 1));
  const heartPulse = heartP > 0.9 ? 1 + Math.sin(frame * 0.08) * 0.05 : heartP;

  const ChildFigure = ({ cx, opacity }: { cx: number; opacity: number }) => (
    <g opacity={opacity}>
      <circle cx={cx} cy="72" r="22" stroke={accent} strokeWidth="2.4" fill="none" />
      <path d={`M${cx-16} 132 C${cx-16} 106 ${cx+16} 106 ${cx+16} 132`} stroke={accent} strokeWidth="2.4" fill="none" />
      <line x1={cx-8} y1="132" x2={cx-12} y2="158" stroke={accent} strokeWidth="2.2" />
      <line x1={cx+8} y1="132" x2={cx+12} y2="158" stroke={accent} strokeWidth="2.2" />
    </g>
  );

  return (
    <svg width="350" height="280" viewBox="0 0 260 210"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <ChildFigure cx={72} opacity={0.7} />
      <g opacity={0.65} stroke={accent} strokeWidth="2.6" strokeLinecap="round">
        <line x1="72" y1="22" x2="72" y2="42" />
        <circle cx="72" cy="50" r="3" fill={accent} stroke="none" />
      </g>
      <g stroke="#f87171" strokeWidth="3.5" strokeLinecap="round" opacity={0.9}>
        <line x1={34} y1={12} x2={34 + crossLen * 0.77} y2={12 + crossLen} />
        <line x1={110} y1={12} x2={110 - crossLen * 0.77} y2={12 + crossLen} />
      </g>
      <line x1="130" y1="10" x2="130" y2="175"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="4 4" />
      <ChildFigure cx={188} opacity={heartP} />
      <g transform={`translate(188, 36) scale(${heartPulse})`} style={{ transformOrigin: "0px 0px" }}>
        <path d="M0 14 C0 14 -18 4 -18 -6 C-18 -14 -11 -18 -6 -14 C-3 -12 -1 -9 0 -6 C1 -9 3 -12 6 -14 C11 -18 18 -14 18 -6 C18 4 0 14 0 14 Z"
          stroke={accent} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={heartP} />
      </g>
      <g opacity={heartP * 0.7} stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="188" cy="185" r="14" strokeWidth="1.8" />
        <path d="M181 185 L186 191 L196 179" />
      </g>
    </svg>
  );
};

const IconOverflowCup: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 85 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const fillP = spring({ fps: 30, frame: Math.max(0, frame - 6), config: { damping: 15, stiffness: 45 } });
  const fillLevel = interpolate(fillP, [0, 1], [180, 66]);
  const wave = frame * 0.1;
  const dripCycle = (frame % 40) / 40;
  const dripY = interpolate(dripCycle, [0, 1], [66, 130]);
  const dripOp = interpolate(dripCycle, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
  return (
    <svg width="280" height="330" viewBox="0 0 200 240"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <defs>
        <clipPath id="cupClip"><path d="M46 62 L60 190 Q100 202 140 190 L154 62 Z" /></clipPath>
      </defs>
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g clipPath="url(#cupClip)">
          <path
            d={`M30 ${fillLevel} Q60 ${fillLevel - 8 + Math.sin(wave) * 5} 90 ${fillLevel} Q120 ${fillLevel + 8 + Math.sin(wave+1) * 5} 150 ${fillLevel} Q175 ${fillLevel - 6} 195 ${fillLevel} L195 210 L30 210 Z`}
            fill={accent} fillOpacity="0.3" stroke="none"
          />
        </g>
        <path d="M46 62 L60 190 Q100 202 140 190 L154 62" strokeWidth="2.6" />
        <ellipse cx="100" cy="62" rx="54" ry="14" strokeWidth="2.6" />
        <ellipse cx="42" cy={dripY} rx="4.5" ry="7" fill={accent} stroke="none" opacity={dripOp} />
        <ellipse cx="158" cy={dripY + 14} rx="4" ry="6" fill={accent} stroke="none" opacity={dripOp * 0.8} />
      </g>
    </svg>
  );
};

const IconStormCalm: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const lightning = Math.sin(frame * 0.2) > 0.55 ? 1 : 0.08;
  const sunRot = frame * 0.9;
  const sunPulse = 1 + Math.sin(frame * 0.06) * 0.04;
  return (
    <svg width="310" height="210" viewBox="0 0 310 210"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g strokeLinecap="round" fill="none">
        <line x1="155" y1="10" x2="155" y2="200"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="5 4" />
        <g filter="url(#glow)" stroke="#fb923c" strokeWidth="2.6">
          <path d="M16 90 Q16 62 36 62 Q40 42 62 42 Q80 26 104 42 Q124 28 128 50 Q144 50 142 72 Q142 92 122 92 Z" />
          <path d="M68 92 L52 122 L76 122 L58 168" strokeWidth="3.2" opacity={lightning} />
          <line x1="28" y1="108" x2="22" y2="128" opacity="0.55" />
          <line x1="48" y1="114" x2="42" y2="134" opacity="0.55" />
          <line x1="110" y1="108" x2="104" y2="128" opacity="0.55" />
        </g>
        <g filter="url(#glow)" stroke={accent} strokeWidth="2.6">
          <circle cx="238" cy="74" r="30" transform={`scale(${sunPulse}) translate(${(1-sunPulse)*238} ${(1-sunPulse)*74})`} />
          {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
            const rad = (deg + sunRot) * Math.PI / 180;
            return (
              <line key={i}
                x1={238 + Math.cos(rad) * 36} y1={74 + Math.sin(rad) * 36}
                x2={238 + Math.cos(rad) * 46} y2={74 + Math.sin(rad) * 46}
                opacity="0.75" strokeWidth="2.2" />
            );
          })}
          <path d="M176 136 Q176 120 190 120 Q193 106 205 106 Q219 98 230 108 Q242 102 245 114 Q255 114 253 126 Q253 138 241 138 Z" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
};

const IconHandBoundaryOpen: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const breathe = Math.sin(frame * 0.045) * 3;
  const lineOp = interpolate(Math.sin(frame * 0.06), [-1,1], [0.4, 0.9]);
  const lineW = interpolate(Math.sin(frame * 0.05), [-1,1], [60, 90]);
  return (
    <svg width="360" height="300" viewBox="0 0 270 220"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`translate(0, ${breathe})`}>
          <path d="M52 180 C38 180 30 166 30 150 L30 102 Q30 95 38 95 Q46 95 46 102 L46 138" />
          <path d="M46 114 L46 78 Q46 70 54 70 Q62 70 62 78 L62 126" />
          <path d="M62 104 L62 66 Q62 58 70 58 Q78 58 78 66 L78 126" />
          <path d="M78 108 L78 72 Q78 64 86 64 Q94 64 94 72 L94 134" />
          <path d="M94 126 Q108 124 114 138 L116 166 Q116 180 96 180 Z" />
          <line x1="52" y1="180" x2="96" y2="180" />
        </g>
        <line x1="135" y1="30" x2="135" y2="190" strokeDasharray="6 5" opacity="0.3" strokeWidth="1.5" />
        <g transform={`translate(0, ${-breathe})`}>
          <path d="M158 100 L158 60 Q158 50 166 50 Q174 50 174 60 L174 110" />
          <path d="M174 84 L174 46 Q174 36 182 36 Q190 36 190 46 L190 110" />
          <path d="M190 88 L190 50 Q190 40 198 40 Q206 40 206 50 L206 110" />
          <path d="M206 96 L206 58 Q206 50 212 50 Q220 50 220 60 L220 120" />
          <path d="M158 100 Q154 120 154 140 L154 168 Q154 182 168 182 L220 182 Q236 182 236 166 L236 120" />
        </g>
        <line x1={135 + (270 - 135 - lineW) / 2} y1="196"
              x2={135 + (270 - 135 - lineW) / 2 + lineW} y2="196"
          strokeWidth="2.8" opacity={lineOp} />
      </g>
    </svg>
  );
};

const IconTearDrop: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const tearCycle = (frame % 60) / 60;
  const tearY = interpolate(tearCycle, [0, 0.7, 1], [20, 140, 160]);
  const tearScaleY = interpolate(tearCycle, [0, 0.6, 0.72, 1], [1, 1, 0.3, 0]);
  const tearOp = interpolate(tearCycle, [0, 0.08, 0.65, 0.75, 1], [0, 1, 1, 0, 0]);
  const rippleStart = 0.72;
  const rippleP = clamp((tearCycle - rippleStart) / (1 - rippleStart), 0, 1);
  const rippleR1 = rippleP * 38;
  const rippleR2 = rippleP * 22;
  const rippleOp = interpolate(rippleP, [0, 0.15, 0.8, 1], [0, 0.7, 0.3, 0]);
  const tear2Cycle = ((frame + 30) % 60) / 60;
  const tear2Y = interpolate(tear2Cycle, [0, 0.7, 1], [20, 140, 160]);
  const tear2Op = interpolate(tear2Cycle, [0, 0.08, 0.65, 0.75, 1], [0, 0.65, 0.65, 0, 0]);
  const ripple2P = clamp((tear2Cycle - rippleStart) / (1 - rippleStart), 0, 1);
  const ripple2R = ripple2P * 28;
  const ripple2Op = interpolate(ripple2P, [0, 0.15, 0.8, 1], [0, 0.5, 0.2, 0]);
  return (
    <svg width="320" height="310" viewBox="0 0 240 230"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" strokeLinecap="round" fill="none">
        <line x1="20" y1="162" x2="220" y2="162" stroke={accent} strokeWidth="1.5" opacity="0.3" />
        <ellipse cx="100" cy={tearY} rx="10" ry={14 * tearScaleY} stroke={accent} strokeWidth="2.2" opacity={tearOp} />
        <ellipse cx="100" cy="162" rx={rippleR1} ry={rippleR1 * 0.28} stroke={accent} strokeWidth="1.8" opacity={rippleOp} />
        <ellipse cx="100" cy="162" rx={rippleR2} ry={rippleR2 * 0.28} stroke={accent} strokeWidth="1.4" opacity={rippleOp * 0.6} />
        <ellipse cx="148" cy={tear2Y} rx="8" ry={11 * interpolate(tear2Cycle, [0, 0.6, 0.72, 1], [1, 1, 0.3, 0])}
          stroke={accent} strokeWidth="1.8" opacity={tear2Op} />
        <ellipse cx="148" cy="162" rx={ripple2R} ry={ripple2R * 0.28} stroke={accent} strokeWidth="1.4" opacity={ripple2Op} />
        <g transform="translate(120, 185)" opacity="0.6">
          <circle cx="0" cy="0" r="18" stroke={accent} strokeWidth="2" />
          <path d="M-9 0 L-2 8 L10 -8" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

const IconBodyRelease: React.FC<{ p: number; frame: number; accent: string }> = ({ p, frame, accent }) => {
  const s = spring({ fps: 30, frame: frame * clamp(p * 5, 0, 1), config: { damping: 12, stiffness: 80 } });
  const sc = interpolate(s, [0,1], [0.4, 1]);
  const waves = [0, 20, 40];
  return (
    <svg width="330" height="370" viewBox="0 0 240 270"
      style={{ opacity: clamp(p * 2, 0, 1), transform: `scale(${sc})` }}>
      <GF blur={6} />
      <g filter="url(#glow)" stroke={accent} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="52" r="32" />
        <path d="M106 46 Q113 42 120 46" strokeWidth="2" opacity="0.8" />
        <path d="M120 46 Q127 42 134 46" strokeWidth="2" opacity="0.8" />
        <path d="M110 62 Q120 70 130 62" strokeWidth="2.2" />
        <path d="M88 178 C88 136 152 136 152 178" />
        <line x1="100" y1="178" x2="92" y2="232" />
        <line x1="140" y1="178" x2="148" y2="232" />
        <path d="M88 152 L52 124" strokeWidth="2.4" />
        <path d="M152 152 L188 124" strokeWidth="2.4" />
        <path d="M52 124 Q42 114 46 106" strokeWidth="2" />
        <path d="M188 124 Q198 114 194 106" strokeWidth="2" />
        {waves.map((d, i) => {
          const e = (frame + d) % 55;
          const r = interpolate(e, [0, 55], [14, 72]);
          const op = interpolate(e, [0, 8, 42, 55], [0, 0.6, 0.15, 0]);
          return <circle key={i} cx="120" cy="148" r={r} strokeWidth="1.6" opacity={op} />;
        })}
      </g>
    </svg>
  );
};

// Typewriter reveal untuk kata highlight, fade+slide untuk kata biasa
const TypewriterWord: React.FC<{
  word: string;
  delay: number;
  isBig: boolean;
  isHigh: boolean;
  theme: SceneTheme;
  allIn: boolean;
  index: number;
}> = ({ word, delay, isBig, isHigh, theme, allIn, index }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - delay;
  const fs = isBig ? 96 : isHigh ? 64 : 52;
  const fw = isBig ? "800" : isHigh ? "600" : "300";

  if (!isBig && !isHigh) {
    const progress = easeOut(clamp(elapsed / 14, 0, 1));
    return (
      <span style={{
        display: "inline-block",
        opacity: interpolate(progress, [0,1], [0, 1]),
        transform: `translateY(${interpolate(progress, [0,1], [24, 0])}px)`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: fs, fontWeight: fw,
        color: theme.dim,
        letterSpacing: 0.2,
        lineHeight: 1.6,
      }}>
        {word}
      </span>
    );
  }

  const revealProgress = easeInOut(clamp(elapsed / 10, 0, 1));
  const clipW = interpolate(revealProgress, [0, 1], [0, 110]);
  const breathe = allIn ? 1 + Math.sin(frame * 0.055 + index * 0.8) * 0.018 : 1;
  const glowStr = allIn ? interpolate(Math.sin(frame * 0.045 + index), [-1,1], [0.5, 1.0]) : 0.7;
  const underlineP = easeOut(clamp((frame - delay - 12) / 16, 0, 1));
  const underlineW = underlineP * (word.length * (isBig ? 52 : 34));

  return (
    <div style={{ position: "relative", display: "inline-block", opacity: elapsed >= 0 ? 1 : 0 }}>
      <span style={{
        position: "absolute", inset: 0,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: fs, fontWeight: fw,
        color: "transparent",
        WebkitTextStroke: `1px ${theme.accent}55`,
        letterSpacing: isBig ? 2 : 1.2,
        lineHeight: isBig ? 1.1 : 1.6,
        whiteSpace: "nowrap",
        opacity: interpolate(revealProgress, [0, 0.8, 1], [1, 0.4, 0]),
      }}>
        {word}
      </span>
      <span style={{
        display: "inline-block",
        clipPath: `inset(0 ${100 - clipW}% 0 0)`,
        transform: `scale(${breathe})`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: fs, fontWeight: fw,
        color: theme.accent,
        letterSpacing: isBig ? 2 : 1.2,
        textShadow: `0 0 32px ${theme.glow.replace(/[\d.]+\)$/, `${glowStr})`)}` +
          `, 0 0 70px ${theme.glow.replace(/[\d.]+\)$/, `${glowStr * 0.4})`)}`,
        lineHeight: isBig ? 1.1 : 1.6,
        whiteSpace: "nowrap",
      }}>
        {word}
      </span>
      <div style={{
        position: "absolute",
        bottom: isBig ? -8 : -6,
        left: 0,
        width: underlineW,
        height: isBig ? 3.5 : 2.5,
        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}88)`,
        borderRadius: 2,
        boxShadow: `0 0 8px ${theme.accent}99`,
      }} />
    </div>
  );
};

const AnimatedWords: React.FC<{ words: Word[]; theme: SceneTheme }> = ({ words, theme }) => {
  const frame = useCurrentFrame();
  const allIn = frame > Math.max(...words.map(w => w.delay)) + 16;
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      justifyContent: "center", alignItems: "baseline",
      gap: "0 16px", textAlign: "center", padding: "0 16px",
    }}>
      {words.map((w, i) => (
        <TypewriterWord key={i} word={w.word} delay={w.delay}
          isBig={!!w.big} isHigh={!!w.h && !w.big}
          theme={theme} allIn={allIn} index={i} />
      ))}
    </div>
  );
};

const IdlePulse: React.FC<{ accent: string; startFrame: number }> = ({ accent, startFrame }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" style={{ position: "absolute", pointerEvents: "none" }}>
      {[0, 23, 46].map((offset, i) => {
        const t = ((elapsed + offset) % 70) / 70;
        const r = interpolate(t, [0, 1], [40, 220]);
        const op = interpolate(t, [0, 0.15, 0.7, 1], [0, 0.45, 0.2, 0]);
        return <circle key={i} cx="250" cy="250" r={r} stroke={accent} strokeWidth="1.5" fill="none" opacity={op} />;
      })}
    </svg>
  );
};

const AccentLine: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [6, 30], [0, 64], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      width: w, height: 1.5,
      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      opacity: 0.55,
    }} />
  );
};

const ProgressBar: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const progress = frame / reel1TotalFrames;
  const hue = interpolate(progress, [0, 1], [200, 340]);
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
      <div style={{
        width: 1080 * progress, height: "100%",
        background: `linear-gradient(90deg, hsl(${hue},90%,65%), hsl(${hue + 30},95%,70%))`,
        boxShadow: `0 0 12px hsl(${hue},90%,65%), 0 0 24px hsl(${hue},90%,65%)44`,
        borderRadius: "0 2px 2px 0",
      }} />
    </div>
  );
};

const TransitionOverlay: React.FC<{ type: TransitionType }> = ({ type }) => {
  const frame = useCurrentFrame();
  if (type === "flash") {
    const op = interpolate(frame, [0, 12], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (op <= 0) return null;
    return <div style={{ position: "absolute", inset: 0, backgroundColor: "white", opacity: op, pointerEvents: "none" }} />;
  }
  return null;
};

interface SceneDef {
  words: Word[];
  themeIdx: number;
  transition: TransitionType;
  Icon: React.FC<{ p: number; frame: number; accent: string }>;
}

const SceneWrapper: React.FC<SceneDef> = ({ words, themeIdx, transition, Icon }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const theme = THEMES[themeIdx];
  const iconP = clamp(frame / 38, 0, 1);
  const fadeIn  = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const alpha = Math.min(fadeIn, fadeOut);
  const transProgress = easeOut(clamp(frame / 22, 0, 1));
  let contentTransform = "none";
  if (transition === "slideUp")   contentTransform = `translateY(${interpolate(transProgress, [0,1], [60, 0])}px)`;
  if (transition === "slideDown") contentTransform = `translateY(${interpolate(transProgress, [0,1], [-60, 0])}px)`;
  if (transition === "zoom")      contentTransform = `scale(${interpolate(transProgress, [0,1], [1.06, 1])})`;
  const idleStart = Math.max(...words.map(w => w.delay)) + 20;

  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <SceneBg theme={theme} />
      <AbsoluteFill style={{
        justifyContent: "center", alignItems: "center",
        flexDirection: "column", gap: 28,
        padding: "160px 70px 160px",
        transform: contentTransform,
      }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon p={iconP} frame={frame} accent={theme.accent} />
        </div>
        <AccentLine accent={theme.accent} />
        <AnimatedWords words={words} theme={theme} />
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 80, left: -80, opacity: 0.35, pointerEvents: "none" }}>
        <IdlePulse accent={theme.accent} startFrame={idleStart} />
      </div>
      <div style={{ position: "absolute", top: 80, right: -80, opacity: 0.25, pointerEvents: "none" }}>
        <IdlePulse accent={theme.accent} startFrame={idleStart + 35} />
      </div>
      <TransitionOverlay type={transition} />
    </AbsoluteFill>
  );
};

const OFFSETS = [0, 119, 307, 505, 709, 919, 967, 1135, 1318, 1480, 1731, 1858];
const dur = (i: number) => (i < OFFSETS.length - 1 ? OFFSETS[i+1] : reel1TotalFrames) - OFFSETS[i];

export const Reel1Video: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#020617" }}>
    <Audio src={staticFile("vo-reel-1.mp3")} />
    <Series>
      {([
        { words: S1,  Icon: IconChild,            themeIdx: 0  },
        { words: S2,  Icon: IconHeartFill,         themeIdx: 1  },
        { words: S3,  Icon: IconWordsBounce,        themeIdx: 2  },
        { words: S4,  Icon: IconClosedDoor,         themeIdx: 3  },
        { words: S5,  Icon: IconAngryAdult,         themeIdx: 4  },
        { words: S6A, Icon: IconOverwhelmedHead,    themeIdx: 5  },
        { words: S6B, Icon: IconChildNotProblem,    themeIdx: 6  },
        { words: S7A, Icon: IconOverflowCup,        themeIdx: 7  },
        { words: S7B, Icon: IconStormCalm,          themeIdx: 8  },
        { words: S8A, Icon: IconHandBoundaryOpen,   themeIdx: 9  },
        { words: S8B, Icon: IconTearDrop,           themeIdx: 10 },
        { words: S8C, Icon: IconBodyRelease,        themeIdx: 11 },
      ] as const).map((sc, i) => (
        <Series.Sequence key={i} durationInFrames={dur(i)}>
          <SceneWrapper words={sc.words} themeIdx={sc.themeIdx} transition={TRANSITIONS[i]} Icon={sc.Icon} />
        </Series.Sequence>
      ))}
    </Series>
    <ProgressBar accent="#38bdf8" />
    <FilmGrain />
  </AbsoluteFill>
);
