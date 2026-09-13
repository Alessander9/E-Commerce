import React from 'react';
import { Player } from '@remotion/player';
import { HeroRemotionComposition, HeroSlide } from './HeroRemotionComposition';

interface RemotionHeroPlayerProps {
  slides?: HeroSlide[];
  className?: string;
}

export const RemotionHeroPlayer: React.FC<RemotionHeroPlayerProps> = ({
  slides,
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[520px] aspect-square flex items-center justify-center ${className}`}>
      {/* Outer ambient glow rings */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-secondary/20 to-accent/30 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
      
      {/* Remotion Interactive Player */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-navy/40 backdrop-blur-md">
        <Player
          component={HeroRemotionComposition}
          inputProps={{ slides }}
          durationInFrames={360}
          compositionWidth={540}
          compositionHeight={540}
          fps={30}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
          }}
          autoPlay
          loop
          controls={false}
          showVolumeControls={false}
          allowFullscreen={false}
          clickToPlay={false}
        />
      </div>
    </div>
  );
};
