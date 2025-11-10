import { Card } from "@/components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] gap-8">
        <h1 className="text-4xl font-bold gradient-text text-center">
          Settings
        </h1>

        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-foreground/20 flex items-center justify-center">
              <SettingsIcon size={40} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Preferences</h2>
            <p className="text-white/60">
              Coming in next session - customize your IdeaCapture experience and manage validation settings
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
