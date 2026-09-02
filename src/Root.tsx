import React from "react";
import { Composition } from "remotion";
import { Reel1Video, reel1TotalFrames } from "./Reel1Video";
import { Reel1VideoEnhanced } from "./Reel1VideoEnhanced";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reel 1 Video (Original) */}
      <Composition
        id="Reel1Video"
        component={Reel1Video}
        durationInFrames={reel1TotalFrames}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Reel 1 Video (Enhanced - Modern Kinetic Typography & Cinematic Visuals) */}
      <Composition
        id="Reel1VideoEnhanced"
        component={Reel1VideoEnhanced}
        durationInFrames={reel1TotalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

