import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { MessageCircle } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import gloriaVideo from "@/assets/video/gloria.mp4";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [, setToken] = useAtom(apiTokenAtom);

  // Set the API key automatically
  React.useEffect(() => {
    const apiKey = "f840d8e47ab44f0d85e8ca21f24275a8";
    setToken(apiKey);
    localStorage.setItem('tavus-token', apiKey);
  }, [setToken]);

  const handleClick = () => {
    setScreenState({ currentScreen: "instructions" });
  };

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center">
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-overlay backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center gap-6 py-8 px-6 rounded-xl border border-[rgba(255,255,255,0.2)]" 
          style={{ 
            fontFamily: 'Inter, sans-serif',
            background: 'rgba(0,0,0,0.3)'
          }}>
          <img src="/public/images/vector.svg" alt="Logo" className="mb-2" style={{ width: '48px', height: 'auto' }} />

          <h1 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Source Code Pro, monospace' }}>
            CVI Demo Playground
          </h1>

          <p className="text-sm text-gray-300 text-center max-w-md mb-4">
            Experience face-to-face conversation with an AI so real, it feels human—an intelligent agent ready to listen, respond, and act.
          </p>

          <AudioButton 
            onClick={handleClick}
            className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-6 py-3 text-base text-white transition-all duration-200 hover:text-primary font-medium"
            style={{
              height: '52px',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 254, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <MessageCircle className="size-5" />
            Talk with Persona
          </AudioButton>

          <p className="text-xs text-gray-400 text-center max-w-sm">
            Click to start an interactive video conversation with our AI persona
          </p>
        </div>
      </div>
    </AnimatedWrapper>
  );
};