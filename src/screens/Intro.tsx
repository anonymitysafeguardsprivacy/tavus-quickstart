import { AnimatedWrapper } from "@/components/DialogWrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { MessageCircle, DollarSign } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { conversationAtom } from "@/store/conversation";
import { createConversation } from "@/api";
import { useDaily, useDailyEvent, useDevices } from "@daily-co/daily-react";
import gloriaVideo from "@/assets/video/gloria.mp4";
import zoomSound from "@/assets/sounds/zoom.mp3";
import { quantum } from 'ldrs';

quantum.register();

const useCreateConversationMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const token = useAtomValue(apiTokenAtom);

  const createConversationRequest = async () => {
    try {
      if (!token) {
        throw new Error("Token is required");
      }
      const conversation = await createConversation(token);
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createConversationRequest,
  };
};

export const Intro: React.FC = () => {
  const [, setToken] = useAtom(apiTokenAtom);
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const { createConversationRequest } = useCreateConversationMutation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState(false);
  const audio = useMemo(() => {
    const audioObj = new Audio(zoomSound);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Set the API key automatically
  React.useEffect(() => {
    const apiKey = "f840d8e47ab44f0d85e8ca21f24275a8";
    setToken(apiKey);
    localStorage.setItem('tavus-token', apiKey);
  }, [setToken]);

  useDailyEvent(
    "camera-error",
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setIsPlayingSound(true);
      
      audio.currentTime = 0;
      await audio.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsPlayingSound(false);
      setIsLoadingConversation(true);
      
      let micDeviceId = currentMic?.device?.deviceId;
      if (!micDeviceId) {
        const res = await daily?.startCamera({
          startVideoOff: false,
          startAudioOff: false,
          audioSource: "default",
        });
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultMic = res?.mic?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        const isDefaultSpeaker = res?.speaker?.deviceId === "default";
        // @ts-expect-error deviceId exists in the MediaDeviceInfo
        micDeviceId = res?.mic?.deviceId;

        if (isDefaultMic) {
          if (!isDefaultMic) {
            setMicrophone("default");
          }
          if (!isDefaultSpeaker) {
            setSpeaker("default");
          }
        }
      }
      if (micDeviceId) {
        await createConversationRequest();
      } else {
        setGetUserMediaError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsLoadingConversation(false);
    }
  };

  if (isPlayingSound || isLoadingConversation) {
    return (
      <AnimatedWrapper>
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <l-quantum
            size="45"
            speed="1.75"
            color="white"
          ></l-quantum>
          <p className="text-white text-lg">Connecting to your financial mentor...</p>
        </div>
      </AnimatedWrapper>
    );
  }

  if (error) {
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
            <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
            <p className="text-sm text-gray-300 text-center max-w-md mb-4">
              We're having trouble connecting. Please try again in a few moments.
            </p>
            <AudioButton 
              onClick={handleClick}
              className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-6 py-3 text-base text-white transition-all duration-200 hover:text-primary font-medium"
            >
              Try Again
            </AudioButton>
          </div>
        </div>
      </AnimatedWrapper>
    );
  }

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
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-primary to-blue-400 p-3 rounded-full">
              <DollarSign className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                FinIQ.ai
              </h1>
              <p className="text-primary text-sm font-medium">Your AI Financial Mentor</p>
            </div>
          </div>

          <p className="text-sm text-gray-300 text-center max-w-md mb-4">
            Get personalized financial guidance from your AI mentor. From investment strategies to budgeting tips, 
            experience face-to-face conversations that feel completely natural.
          </p>

          <div className="flex flex-wrap gap-2 mb-6 text-xs">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">
              Investment Planning
            </span>
            <span className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full border border-green-400/30">
              Budget Analysis
            </span>
            <span className="bg-blue-400/20 text-blue-400 px-3 py-1 rounded-full border border-blue-400/30">
              Tax Optimization
            </span>
            <span className="bg-purple-400/20 text-purple-400 px-3 py-1 rounded-full border border-purple-400/30">
              Retirement Planning
            </span>
          </div>

          <AudioButton 
            onClick={handleClick}
            className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-8 py-4 text-lg text-white transition-all duration-200 hover:text-primary font-semibold"
            disabled={isLoading}
            style={{
              height: '60px',
              transition: 'all 0.2s ease-in-out',
              background: 'linear-gradient(135deg, rgba(34, 197, 254, 0.2), rgba(59, 130, 246, 0.2))',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 197, 254, 0.8)';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
            }}
          >
            <MessageCircle className="size-6" />
            Start Financial Consultation
          </AudioButton>

          <p className="text-xs text-gray-400 text-center max-w-sm">
            Click to begin your personalized financial mentoring session
          </p>

          {getUserMediaError && (
            <div className="mt-4 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-3 text-red-200 backdrop-blur-sm max-w-md">
              <p className="text-sm">
                To chat with your financial mentor, please allow microphone and camera access. Check your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
};