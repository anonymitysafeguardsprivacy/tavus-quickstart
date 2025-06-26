import { AnimatedWrapper } from "@/components/DialogWrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { MessageCircle } from "lucide-react";
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
          <p className="text-white text-lg">Connecting to your mentor...</p>
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
          <img src="/public/images/vector.svg" alt="Logo" className="mb-2" style={{ width: '48px', height: 'auto' }} />

          <h1 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Source Code Pro, monospace' }}>
            CVI Demo Playground
          </h1>

          <p className="text-sm text-gray-300 text-center max-w-md mb-4">
            Experience face-to-face conversation with an AI mentor so real, it feels human—an intelligent guide ready to listen, respond, and help you grow.
          </p>

          <AudioButton 
            onClick={handleClick}
            className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-6 py-3 text-base text-white transition-all duration-200 hover:text-primary font-medium"
            disabled={isLoading}
            style={{
              height: '52px',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 254, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <MessageCircle className="size-5" />
            Talk with Mentor
          </AudioButton>

          <p className="text-xs text-gray-400 text-center max-w-sm">
            Click to start an interactive video conversation with your AI mentor
          </p>

          {getUserMediaError && (
            <div className="mt-4 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-3 text-red-200 backdrop-blur-sm max-w-md">
              <p className="text-sm">
                To chat with your mentor, please allow microphone and camera access. Check your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
};