"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  checkMicrophonePermission,
  formatDuration,
  getSupportedMimeType,
  createAudioAnalyzer,
} from "@/lib/audio-utils";

export interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 300, // 5 minutes default
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(8).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<{
    analyzer: AnalyserNode;
    dataArray: Uint8Array;
    audioContext: AudioContext;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (analyzerRef.current) {
        analyzerRef.current.audioContext.close();
      }
    };
  }, []);

  // Update visualizer
  const updateVisualizer = () => {
    if (!analyzerRef.current || !isRecording || isPaused) return;

    const { analyzer, dataArray } = analyzerRef.current;
    // @ts-ignore - TypeScript ArrayBuffer type mismatch
    analyzer.getByteFrequencyData(dataArray);

    // Take 8 samples from the frequency data
    const samples = 8;
    const step = Math.floor(dataArray.length / samples);
    const newData = [];

    for (let i = 0; i < samples; i++) {
      const value = dataArray[i * step] / 255; // Normalize to 0-1
      newData.push(value);
    }

    setVisualizerData(newData);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    try {
      setError(null);
      const { granted, stream, error: permissionError } = await checkMicrophonePermission();

      if (!granted || !stream) {
        setError(permissionError || "Failed to access microphone");
        return;
      }

      streamRef.current = stream;

      // Setup audio analyzer for visualization
      analyzerRef.current = createAudioAnalyzer(stream);

      // Setup MediaRecorder
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Cleanup analyzer
        if (analyzerRef.current) {
          analyzerRef.current.audioContext.close();
          analyzerRef.current = null;
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

      // Start visualizer
      updateVisualizer();
    } catch (err) {
      setError("Failed to start recording. Please try again.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

      // Resume visualizer
      updateVisualizer();
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setDuration(0);
    setAudioURL(null);
    audioChunksRef.current = [];
    onCancel?.();
  };

  const handleSave = () => {
    if (audioChunksRef.current.length > 0) {
      const mimeType = getSupportedMimeType();
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mimeType || "audio/webm",
      });
      onRecordingComplete(audioBlob, duration);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      if (audioURL) {
        audioRef.current = new Audio(audioURL);
        audioRef.current.onended = () => setIsPlaying(false);
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full p-4 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Interface */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Pulse Animation & Record Button */}
        <div className="relative">
          {isRecording && !isPaused && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-danger"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-danger"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </>
          )}

          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4",
              isRecording
                ? "bg-danger border-danger shadow-lg shadow-danger/50"
                : "bg-gradient-to-br from-primary to-primary-dark border-primary shadow-lg shadow-primary/50"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? (
              <Square size={32} className="text-white" fill="white" />
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </motion.button>
        </div>

        {/* Timer */}
        <div className="text-3xl font-mono font-bold gradient-text">
          {formatDuration(duration)}
        </div>

        {/* Status Text */}
        <div className="text-white/60 text-sm">
          {!isRecording && !audioURL && "Tap to start recording"}
          {isRecording && !isPaused && "Recording..."}
          {isPaused && "Paused"}
          {audioURL && !isRecording && "Recording complete"}
        </div>

        {/* Waveform Visualizer */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-1 h-16"
          >
            {visualizerData.map((value, index) => (
              <motion.div
                key={index}
                className="w-2 bg-gradient-to-t from-primary to-accent rounded-full"
                style={{
                  height: isPaused ? "8px" : `${Math.max(8, value * 64)}px`,
                }}
                animate={{
                  height: isPaused ? "8px" : `${Math.max(8, value * 64)}px`,
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 w-full max-w-sm">
          {isRecording && (
            <>
              <Button
                variant="secondary"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="flex-1"
              >
                {isPaused ? (
                  <>
                    <Play size={20} className="mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={20} className="mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={cancelRecording}
                className="flex-1"
              >
                <X size={20} className="mr-2" />
                Cancel
              </Button>
            </>
          )}

          {audioURL && !isRecording && (
            <>
              <Button
                variant="secondary"
                onClick={togglePlayback}
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={cancelRecording}
                className="flex-1"
              >
                <X size={20} className="mr-2" />
                Discard
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1"
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
