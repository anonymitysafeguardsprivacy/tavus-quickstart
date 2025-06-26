import { DialogWrapper, AnimatedTextBlockWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BookOpen } from "lucide-react";

export const FinalScreen: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);

  const handleReturn = () => {
    setScreenState({ currentScreen: "intro" });
  };

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="flex flex-col items-center justify-center gap-8 py-12 px-6 text-center">
          <div className="bg-gradient-to-r from-primary to-blue-400 p-4 rounded-full mb-4">
            <TrendingUp className="size-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white mb-2">
              Great Financial Consultation!
            </h1>
            <p className="text-gray-300 text-lg max-w-md">
              Thank you for your session with your AI financial mentor. Remember to implement the strategies we discussed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <Target className="size-8 text-primary mx-auto mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">Set Goals</h3>
              <p className="text-white/60 text-xs">Define clear financial objectives</p>
            </div>
            
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <TrendingUp className="size-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">Track Progress</h3>
              <p className="text-white/60 text-xs">Monitor your financial growth</p>
            </div>
            
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <BookOpen className="size-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">Keep Learning</h3>
              <p className="text-white/60 text-xs">Expand your financial knowledge</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-white/70 text-sm max-w-lg">
              Your financial journey is ongoing. Schedule regular check-ins with your AI mentor to stay on track with your goals and adapt to changing circumstances.
            </p>
            
            <Button
              onClick={handleReturn}
              className="relative z-20 flex items-center justify-center gap-3 rounded-3xl border border-[rgba(255,255,255,0.3)] px-8 py-4 text-lg text-white transition-all duration-200 hover:text-primary font-semibold"
              style={{
                height: '56px',
                transition: 'all 0.2s ease-in-out',
                background: 'linear-gradient(135deg, rgba(34, 197, 254, 0.2), rgba(59, 130, 246, 0.2))',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 197, 254, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              Schedule Another Session
            </Button>
          </div>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};