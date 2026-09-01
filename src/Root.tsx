import React from "react";
import { Composition } from "remotion";
import { Reel1Video, reel1TotalFrames } from "./Reel1Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reel 1 Video */}
      <Composition
        id="Reel1Video"
        component={Reel1Video}
        durationInFrames={reel1TotalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
