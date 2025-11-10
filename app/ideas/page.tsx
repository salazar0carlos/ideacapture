import { Card } from "@/components/ui/Card";
import { Lightbulb } from "lucide-react";

export default function IdeasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] gap-8">
        <h1 className="text-4xl font-bold gradient-text text-center">
          Your Ideas
        </h1>

        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center">
              <Lightbulb size={40} className="text-warning" />
            </div>
            <h2 className="text-2xl font-semibold">Ideas Library</h2>
            <p className="text-white/60">
              Coming in next session - browse, filter, and manage all your captured ideas
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
