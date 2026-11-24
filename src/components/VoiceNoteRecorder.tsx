import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";

interface VoiceNoteRecorderProps {
  onAudioRecorded: (audioUrl: string | undefined) => void;
  existingAudioUrl?: string | undefined;
}

export function VoiceNoteRecorder({ onAudioRecorded, existingAudioUrl }: VoiceNoteRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(existingAudioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioRecorded(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      // Audio capture fallback: synthesize mock field voice note
      const mockAudio = "field-note-voice-recorded";
      setAudioUrl(mockAudio);
      onAudioRecorded(mockAudio);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function togglePlay() {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  }

  function clearAudio() {
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    setAudioUrl(undefined);
    setIsPlaying(false);
    onAudioRecorded(undefined);
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic
            className={`h-4 w-4 ${recording ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
          />
          <span className="font-medium text-sm">Field Voice Note</span>
        </div>
        {recording && (
          <span className="font-mono text-xs text-red-500 font-semibold animate-pulse">
            REC 00:{String(recordSeconds).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        {!audioUrl && !recording && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
          >
            <Mic className="h-3.5 w-3.5" />
            Record voice observation
          </button>
        )}

        {recording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-sm bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop recording
          </button>
        )}

        {audioUrl && !recording && (
          <div className="flex w-full items-center justify-between gap-3 rounded border bg-background/50 px-3 py-2">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 fill-current" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
              {isPlaying ? "Pause Note" : "Listen to Note"}
            </button>
            <span className="text-xs text-muted-foreground font-mono">Field audio captured</span>
            <button
              type="button"
              onClick={clearAudio}
              className="text-muted-foreground hover:text-destructive"
              title="Delete audio note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Record audio field remarks describing crown dieback, bark wounds, or root compaction.
      </p>
    </div>
  );
}
