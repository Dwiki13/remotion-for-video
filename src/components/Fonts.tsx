import React from "react";

export const GoogleFontsLoader: React.FC = () => {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&display=swap');

      .font-display {
        font-family: 'Outfit', 'Plus Jakarta Sans', -apple-system, sans-serif;
      }
      
      .font-sans {
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      }
    `}</style>
  );
};
