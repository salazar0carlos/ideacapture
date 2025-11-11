/**
 * Audio Utilities for IdeaCapture
 * Handles microphone permissions, audio conversion, and formatting
 */

/**
 * Check and request microphone permission
 * @returns Promise with permission status and stream if granted
 */
export async function checkMicrophonePermission(): Promise<{
  granted: boolean;
  stream?: MediaStream;
  error?: string;
}> {
  try {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: "Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.",
      };
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    return {
      granted: true,
      stream,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        return {
          granted: false,
          error: "Microphone access denied. Please enable microphone permissions in your browser settings.",
        };
      } else if (error.name === "NotFoundError") {
        return {
          granted: false,
          error: "No microphone found. Please connect a microphone and try again.",
        };
      } else if (error.name === "NotReadableError") {
        return {
          granted: false,
          error: "Microphone is already in use by another application.",
        };
      }
    }

    return {
      granted: false,
      error: "Failed to access microphone. Please check your browser settings.",
    };
  }
}

/**
 * Convert a Blob to Base64 string
 * @param blob Audio blob to convert
 * @returns Promise with Base64 string
 */
export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error("Failed to convert audio to Base64"));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Format duration in seconds to mm:ss format
 * @param seconds Duration in seconds
 * @returns Formatted string (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get supported MIME type for recording
 * @returns Supported MIME type string
 */
export function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback to default
  return "";
}

/**
 * Calculate audio visualization data from audio stream
 * @param stream MediaStream from microphone
 * @returns Audio analyzer and data array
 */
export function createAudioAnalyzer(stream: MediaStream): {
  analyzer: AnalyserNode;
  dataArray: Uint8Array;
  audioContext: AudioContext;
} {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyzer = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);

  analyzer.fftSize = 64;
  source.connect(analyzer);

  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  return { analyzer, dataArray, audioContext };
}
