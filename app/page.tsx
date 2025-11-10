import { Card } from "@/components/ui/Card";
import { Mic } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] gap-8">
        <h1 className="text-5xl font-bold gradient-text text-center">
          Capture Every Idea
        </h1>

        <p className="text-xl text-white/70 text-center max-w-md">
          Never lose a brilliant thought again. Speak it, capture it, refine it.
        </p>

        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Voice Recorder</h2>
            <p className="text-white/60">
              Coming in next session - tap to record your ideas instantly
            </p>
          </div>
        </Card>

        <div className="text-center text-white/50 text-sm mt-8">
          <p>Foundation Complete ✓</p>
          <p className="mt-2">
            PWA Ready • Design System • Database Schema
          </p>
        </div>
      </div>
    </div>
  );
}
