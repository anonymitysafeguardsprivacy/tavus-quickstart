import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { endConversation, createConversation } from "@/api";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  MessageCircle,
  DollarSign,
  Settings,
} from "lucide-react";
import {
  clearSessionTime,
  getSessionTime,
  setSessionStartTime,
  updateSessionEndTime,
} from "@/utils";
import { Timer } from "@/components/Timer";
import { TIME_LIMIT } from "@/config";
import { niceScoreAtom } from "@/store/game";
import { naughtyScoreAtom } from "@/store/game";
import { apiTokenAtom } from "@/store/tokens";
import { quantum } from 'ldrs';
import { cn } from "@/lib/utils";
import { UserStats } from "@/components/UserStats";
import { JargonGuide } from "@/components/JargonGuide";
import { useDevices } from "@daily-co/daily-react";
import zoomSound from "@/assets/sounds/zoom.mp3";

quantum.register();

const timeToGoPhrases = [
  "I'll need to wrap up our financial discussion soon—let's focus on your most important questions.",
  "We're approaching the end of our session, but I have time for a few more financial insights!",
  "Our consultation time is almost up, but I'd love to address one more financial concern before we finish!",
];

const outroPhrases = [
  "Thank you for this financial consultation. Keep implementing what we discussed, and I'll see you soon!",
  "Our session is complete. Remember to review your financial goals regularly. Take care!",
  "Great discussion about your finances today. Stay disciplined with your plan, and I'll see you next time!",
];

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [naughtyScore] = useAtom(naughtyScoreAtom);
  const [niceScore] = useAtom(niceScoreAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [getUserMediaError, setGetUserMediaError] = useState(false);

  const audio = useMemo(() => {
    const audioObj = new Audio(zoomSound);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);

  // Set the API key automatically
  React.useEffect(() => {
    if (!token) {
      const apiKey = "f840d8e47ab44f0d85e8ca21f24275a8";
      setToken(apiKey);
      localStorage.setItem('tavus-token', apiKey);
    }
  }, [token, setToken]);

  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      setStart(true);
      setTimeout(() => daily?.setLocalAudio(true), 4000);
    }
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (!remoteParticipantIds.length || !start) return;

    setSessionStartTime();
    const interval = setInterval(() => {
      const time = getSessionTime();
      if (time === TIME_LIMIT - 60) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              timeToGoPhrases[Math.floor(Math.random() * 3)] ??
              timeToGoPhrases[0],
          },
        });
      }
      if (time === TIME_LIMIT - 10) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text:
              outroPhrases[Math.floor(Math.random() * 3)] ?? outroPhrases[0],
          },
        });
      }
      if (time >= TIME_LIMIT) {
        leaveConversation();
        clearInterval(interval);
      } else {
        updateSessionEndTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remoteParticipantIds, start]);

  useEffect(() => {
    if (conversation?.conversation_url) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalVideo(true);
          daily?.setLocalAudio(false);
        });
    }
  }, [conversation?.conversation_url]);

  const startConversation = async () => {
    try {
      setIsStarting(true);
      
      audio.currentTime = 0;
      await audio.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      if (micDeviceId && token) {
        const newConversation = await createConversation(token);
        setConversation(newConversation);
      } else {
        setGetUserMediaError(true);
      }
    } catch (error) {
      console.error(error);
      setGetUserMediaError(true);
    } finally {
      setIsStarting(false);
    }
  };

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    daily?.leave();
    daily?.destroy();
    if (conversation?.conversation_id && token) {
      endConversation(token, conversation.conversation_id);
    }
    setConversation(null);
    clearSessionTime();
    setStart(false);
  }, [daily, token, conversation]);

  const openSettings = () => {
    setScreenState({ currentScreen: "settings" });
  };

  // If no conversation is active, show the start interface
  if (!conversation && !isStarting) {
    return (
      <div className="flex h-full w-full">
        {/* Left Sidebar - User Stats */}
        <UserStats />
        
        {/* Main Area - Start Interface */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-primary to-blue-400 p-4 rounded-full">
                <DollarSign className="size-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                  FinIQ.ai
                </h1>
                <p className="text-primary text-lg font-medium">Your AI Financial Mentor</p>
              </div>
            </div>

            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Get personalized financial guidance from your AI mentor. From investment strategies to budgeting tips, 
              experience face-to-face conversations that feel completely natural.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full border border-primary/30 text-sm">
                Investment Planning
              </span>
              <span className="bg-green-400/20 text-green-400 px-4 py-2 rounded-full border border-green-400/30 text-sm">
                Budget Analysis
              </span>
              <span className="bg-blue-400/20 text-blue-400 px-4 py-2 rounded-full border border-blue-400/30 text-sm">
                Tax Optimization
              </span>
              <span className="bg-purple-400/20 text-purple-400 px-4 py-2 rounded-full border border-purple-400/30 text-sm">
                Retirement Planning
              </span>
            </div>

            <Button
              onClick={startConversation}
              className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-8 py-4 text-lg text-white transition-all duration-200 hover:text-primary font-semibold"
              style={{
                height: '60px',
                transition: 'all 0.2s ease-in-out',
                background: 'linear-gradient(135deg, rgba(34, 197, 254, 0.2), rgba(59, 130, 246, 0.2))',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 197, 254, 0.8)';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              }}
            >
              <MessageCircle className="size-6" />
              Start Financial Consultation
            </Button>

            {getUserMediaError && (
              <div className="mt-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/20 border-red-500/50 p-4 text-red-200 backdrop-blur-sm max-w-md mx-auto">
                <p className="text-sm">
                  To chat with your financial mentor, please allow microphone and camera access. Check your browser settings.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              Click to begin your personalized financial mentoring session. Camera and microphone access required.
            </p>
          </div>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={openSettings}
            className="absolute top-6 right-6 size-12 border-0 bg-transparent hover:bg-zinc-800"
          >
            <Settings className="size-6" />
          </Button>
        </div>

        {/* Right Sidebar - Jargon Guide */}
        <JargonGuide />
      </div>
    );
  }

  // Loading state while starting conversation
  if (isStarting) {
    return (
      <div className="flex h-full w-full">
        <UserStats />
        <div className="flex-1 relative flex items-center justify-center">
          <div className="text-center">
            <l-quantum
              size="45"
              speed="1.75"
              color="white"
            ></l-quantum>
            <p className="text-white text-lg mt-4">Connecting to your financial mentor...</p>
          </div>
        </div>
        <JargonGuide />
      </div>
    );
  }

  // Active conversation interface
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - User Stats */}
      <UserStats />
      
      {/* Main Video Area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 size-full">
          {remoteParticipantIds?.length > 0 ? (
            <>
              <Timer />
              <Video
                id={remoteParticipantIds[0]}
                className="size-full"
                tileClassName="!object-cover"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <l-quantum
                  size="45"
                  speed="1.75"
                  color="white"
                ></l-quantum>
                <p className="text-white text-lg mt-4">Connecting to your financial mentor...</p>
              </div>
            </div>
          )}
          {localSessionId && (
            <Video
              id={localSessionId}
              tileClassName="!object-cover"
              className={cn(
                "absolute bottom-20 right-4 aspect-video h-40 w-24 overflow-hidden rounded-lg border border-white/20 sm:bottom-12 lg:h-auto lg:w-52"
              )}
            />
          )}
          <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
            <Button
              size="icon"
              className="border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60"
              variant="secondary"
              onClick={toggleAudio}
            >
              {!isMicEnabled ? (
                <MicOffIcon className="size-6" />
              ) : (
                <MicIcon className="size-6" />
              )}
            </Button>
            <Button
              size="icon"
              className="border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60"
              variant="secondary"
              onClick={toggleVideo}
            >
              {!isCameraEnabled ? (
                <VideoOffIcon className="size-6" />
              ) : (
                <VideoIcon className="size-6" />
              )}
            </Button>
            <Button
              size="icon"
              className="bg-[rgba(251,36,71,0.80)] backdrop-blur hover:bg-[rgba(251,36,71,0.60)] border border-[rgba(251,36,71,0.9)]"
              variant="secondary"
              onClick={leaveConversation}
            >
              <PhoneIcon className="size-6 rotate-[135deg]" />
            </Button>
          </div>
          <DailyAudio />
        </div>
      </div>

      {/* Right Sidebar - Jargon Guide */}
      <JargonGuide />
    </div>
  );
};