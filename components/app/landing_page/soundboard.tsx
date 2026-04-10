"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dice5, Pause, Play, Square, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SoundClip = {
  id: string;
  label: string;
  file: string;
  hotkey: string;
  description: string;
};

const SOUND_CLIPS: SoundClip[] = [
  {
    id: "vine-boom",
    label: "Vine Boom",
    file: "/sounds/vine-boom.mp3",
    hotkey: "1",
    description: "Dramatic zoom-energy on demand.",
  },
  {
    id: "uwu",
    label: "UwU",
    file: "/sounds/uwu.mp3",
    hotkey: "2",
    description: "Soft chaos for suspiciously wholesome moments.",
  },
  {
    id: "stop-the-cap",
    label: "Stop The Cap",
    file: "/sounds/stop-the-cap-cut.mp3",
    hotkey: "3",
    description: "Immediate fraud detection.",
  },
  {
    id: "roblox-oof",
    label: "Roblox Oof",
    file: "/sounds/roblox-death-sound_1.mp3",
    hotkey: "4",
    description: "Clean failure state audio.",
  },
  {
    id: "airhorn",
    label: "MLG Airhorn",
    file: "/sounds/mlg-airhorn.mp3",
    hotkey: "5",
    description: "Maximum overreaction in one click.",
  },
  {
    id: "meow",
    label: "Meow",
    file: "/sounds/meow_jEHtSyd.mp3",
    hotkey: "6",
    description: "A tactical cat interruption.",
  },
  {
    id: "mystery-clip",
    label: "Mystery Clip",
    file: "/sounds/indian.mp3",
    hotkey: "7",
    description: "Unlabeled energy from the archive.",
  },
  {
    id: "gulping",
    label: "Gulp",
    file: "/sounds/gulping.mp3",
    hotkey: "8",
    description: "For visible panic and bad decisions.",
  },
  {
    id: "gigachad",
    label: "Gigachad",
    file: "/sounds/gigachad.mp3",
    hotkey: "9",
    description: "Confidence boost with no justification.",
  },
  {
    id: "get-out",
    label: "Get Out",
    file: "/sounds/getouttuco.mp3",
    hotkey: "Q",
    description: "Hard reset for the conversation.",
  },
  {
    id: "ewww",
    label: "Ewww",
    file: "/sounds/ewww.mp3",
    hotkey: "W",
    description: "Polite disgust, amplified.",
  },
  {
    id: "dry-fart",
    label: "Dry Fart",
    file: "/sounds/dry-fart.mp3",
    hotkey: "E",
    description: "Low-brow punctuation.",
  },
  {
    id: "dababy",
    label: "DaBaby",
    file: "/sounds/dababy.mp3",
    hotkey: "R",
    description: "Certified meme drop.",
  },
  {
    id: "bruh",
    label: "Bruh",
    file: "/sounds/bruh.mp3",
    hotkey: "T",
    description: "Universal disappointment payload.",
  },
  {
    id: "anime-wow",
    label: "Anime Wow",
    file: "/sounds/anime-wow-sound-effect.mp3",
    hotkey: "Y",
    description: "Peak reaction image in audio form.",
  },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
}

function shouldIgnoreHotkey(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

export default function Soundboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeClipIdRef = useRef<string | null>(null);
  const lastVolumeRef = useRef(0.72);
  const playClipRef = useRef<(clip: SoundClip) => Promise<void>>(async () => {});
  const togglePlaybackRef = useRef<() => Promise<void>>(async () => {});
  const stopPlaybackRef = useRef<() => void>(() => {});
  const playRandomClipRef = useRef<() => void>(() => {});
  const sliderId = useId();

  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [message, setMessage] = useState(
    "Choose a clip to preview the soundboard project."
  );

  const activeClip = SOUND_CLIPS.find((clip) => clip.id === activeClipId) ?? null;
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const playClip = async (clip: SoundClip) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      if (activeClipId !== clip.id) {
        audio.pause();
        audio.src = clip.file;
        audio.load();
        setDuration(0);
      }

      audio.currentTime = 0;
      setActiveClipId(clip.id);
      setCurrentTime(0);
      setMessage(`Now playing ${clip.label}.`);
      await audio.play();
    } catch {
      setMessage(
        `Couldn't play ${clip.label}. If the page still looks unstyled, restart the dev server first.`
      );
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio || !activeClipId) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setMessage("Playback could not resume. Click a clip again to retry.");
      }
      return;
    }

    audio.pause();
  };

  const stopPlayback = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setMessage("Playback stopped.");
  };

  const playRandomClip = () => {
    const pool =
      SOUND_CLIPS.length > 1
        ? SOUND_CLIPS.filter((clip) => clip.id !== activeClipIdRef.current)
        : SOUND_CLIPS;

    const randomClip = pool[Math.floor(Math.random() * pool.length)];

    if (randomClip) {
      void playClip(randomClip);
    }
  };

  playClipRef.current = playClip;
  togglePlaybackRef.current = togglePlayback;
  stopPlaybackRef.current = stopPlayback;
  playRandomClipRef.current = playRandomClip;

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;

    if (volume > 0) {
      lastVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    activeClipIdRef.current = activeClipId;
  }, [activeClipId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreHotkey(event.target)) {
        return;
      }

      const key = event.key.toUpperCase();
      const clip = SOUND_CLIPS.find((item) => item.hotkey === key);

      if (clip) {
        event.preventDefault();
        void playClipRef.current(clip);
        return;
      }

      if (event.code === "Space" && activeClipIdRef.current) {
        event.preventDefault();
        void togglePlaybackRef.current();
        return;
      }

      if (key === "ESCAPE") {
        event.preventDefault();
        stopPlaybackRef.current();
        return;
      }

      if (key === "0") {
        event.preventDefault();
        playRandomClipRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Card className="overflow-hidden border shadow-sm text-left">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit items-center rounded-full border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Featured Project
            </span>
            <CardTitle className="text-2xl">Meme Soundboard</CardTitle>
            <CardDescription className="max-w-2xl leading-6">
              A compact soundboard demo wired to the files in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.92em]">
                /public/sounds
              </code>
              . Use the pads, keyboard hotkeys, random mode, and transport controls to preview it.
            </CardDescription>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
            {[
              { label: "Clips", value: String(SOUND_CLIPS.length) },
              { label: "Digits", value: "1-9" },
              { label: "Letters", value: "Q-Y" },
              { label: "Shuffle", value: "0" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border bg-background px-3 py-2 shadow-xs"
              >
                <div className="text-lg font-semibold text-foreground">{item.value}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <audio
          ref={audioRef}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            setMessage("Clip finished. Choose another one.");
          }}
          onError={() => {
            const failedClip = SOUND_CLIPS.find(
              (clip) => clip.id === activeClipIdRef.current
            );
            setMessage(
              failedClip
                ? `Failed to load ${failedClip.label}. Check that the file exists in /public/sounds.`
                : "Audio failed to load."
            );
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Now Playing
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">
              {activeClip?.label ?? "Idle"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeClip?.description ?? "Pick any pad to start playback."}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span>Playback</span>
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                className="gap-2"
                disabled={!activeClipId}
                onClick={() => void togglePlayback()}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={!activeClipId}
                onClick={stopPlayback}
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={playRandomClip}
              >
                <Dice5 className="h-4 w-4" />
                Random
              </Button>
            </div>

            <div className="mt-5 rounded-lg border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label
                  htmlFor={sliderId}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Volume
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
                  onClick={() => setVolume(volume === 0 ? lastVolumeRef.current : 0)}
                >
                  {volume === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <VolumeX className="h-4 w-4" />
                      Unmute
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      Mute
                    </span>
                  )}
                </button>
              </div>
              <input
                id={sliderId}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-sky-500"
              />
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p>{message}</p>
              <p className="text-xs">
                Hotkeys: <span className="font-medium text-foreground">1-9</span> and{" "}
                <span className="font-medium text-foreground">Q-Y</span> play clips.{" "}
                <span className="font-medium text-foreground">Space</span> toggles playback.{" "}
                <span className="font-medium text-foreground">Esc</span> stops.{" "}
                <span className="font-medium text-foreground">0</span> shuffles.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SOUND_CLIPS.map((clip) => {
              const isActive = clip.id === activeClipId;
              const isLive = isActive && isPlaying;

              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => void playClip(clip)}
                  className={cn(
                    "rounded-xl border bg-background p-4 text-left transition hover:border-slate-300 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    isActive && "border-sky-500/50 bg-sky-500/[0.06] shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{clip.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {clip.description}
                      </p>
                    </div>
                    <span className="rounded-md border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                      {clip.hotkey}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{isLive ? "Playing" : isActive ? "Loaded" : "Ready"}</span>
                    <span>{clip.file.replace("/sounds/", "")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
