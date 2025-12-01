"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ControlPanel,
  ConversationThread,
  FailureModal,
  LoadingIndicator,
  ModelSelector,
  TurnOrderConfig,
  TopicInput,
  TurnIndicator,
} from "@/components/round-robin";
import type { Message as ThreadMessage } from "@/components/round-robin/ConversationThread";
import {
  DEFAULT_TURN_ORDER,
  MAX_RETRY_ATTEMPTS,
  SUPPORTED_MODELS,
} from "@/lib/round-robin/constants";
import { useRoundRobinStream } from "@/lib/round-robin/useRoundRobinStream";

type SessionStatus =
  | "idle"
  | "active"
  | "paused"
  | "awaiting_user"
  | "completed"
  | "error";

const DEFAULT_SELECTED = DEFAULT_TURN_ORDER as readonly string[];

export default function RoundRobinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = React.useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = React.useState<SessionStatus>("idle");
  const [topic, setTopic] = React.useState("");
  const [selectedModels, setSelectedModels] = React.useState<string[]>([...DEFAULT_SELECTED]);
  const [turnOrder, setTurnOrder] = React.useState<string[]>([...DEFAULT_SELECTED]);
  const [messages, setMessages] = React.useState<ThreadMessage[]>([]);
  const [currentlyStreaming, setCurrentlyStreaming] = React.useState<{
    model: string;
    content: string;
  } | null>(null);
  const [currentTurn, setCurrentTurn] = React.useState<{
    model: string;
    index: number;
    round: number;
  } | null>(null);
  const [currentRound, setCurrentRound] = React.useState<number>(1);
  const [errorState, setErrorState] = React.useState<{
    model: string;
    message: string;
    retryCount: number;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);
  const [longWaitModel, setLongWaitModel] = React.useState<string | null>(null);
  const [longWaitVisible, setLongWaitVisible] = React.useState<boolean>(false);

  const timerRef = React.useRef<number | null>(null);

  const startTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedSeconds(0);
  }, []);

  const { connect, disconnect } = useRoundRobinStream({
    onSessionInit: (data) => {
      setTopic((prev) => prev || data.topic);
      setTurnOrder(data.turnOrder);
      setSelectedModels(data.activeModels);
    },
    onTurnStart: (data) => {
      setSessionStatus("active");
      setErrorState(null);
      setCurrentTurn({ model: data.model, index: data.turnIndex, round: currentRound });
      setCurrentlyStreaming({ model: data.model, content: "" });
      setLongWaitModel(data.model);
      setLongWaitVisible(false);
      startTimer();
    },
    onContentChunk: (data) => {
      setCurrentlyStreaming((prev) => {
        if (!prev || prev.model !== data.model) {
          return { model: data.model, content: data.chunk };
        }
        return { model: data.model, content: prev.content + data.chunk };
      });
    },
    onTurnComplete: (data) => {
      stopTimer();
      setLongWaitVisible(false);
      setCurrentlyStreaming(null);
      setMessages((prev) => {
        const turnIndex = currentTurn?.index ?? prev.length;
        return [
          ...prev,
          {
            id: Date.now(),
            model: data.model,
            role: "assistant",
            content: data.fullContent,
            turnIndex,
          },
        ];
      });
    },
    onRoundComplete: (data) => {
      stopTimer();
      setLongWaitVisible(false);
      setSessionStatus("awaiting_user");
      setCurrentRound(data.round);
      setCurrentTurn(null);
      setCurrentlyStreaming(null);
    },
    onTurnError: (data) => {
      stopTimer();
      setLongWaitVisible(false);
      setSessionStatus("error");
      setErrorState({ model: data.model, message: data.error, retryCount: 0 });
      setCurrentlyStreaming(null);
    },
    onLongWait: (data) => {
      setElapsedSeconds(data.elapsedSeconds);
      setLongWaitModel(data.model);
      setLongWaitVisible(true);
    },
    onError: () => {
      if (sessionStatus !== "idle") {
        setSessionStatus("error");
      }
    },
    onClose: () => {
      stopTimer();
      setLongWaitVisible(false);
    },
  });

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // On load: check for sessionId in URL and attempt resume.
  React.useEffect(() => {
    const idParam = searchParams.get("sessionId");
    if (!idParam) return;

    const id = Number(idParam);
    if (!id || Number.isNaN(id)) return;

    const resume = async () => {
      try {
        const res = await fetch(`/api/round-robin/resume?sessionId=${id}`);
        if (!res.ok) return;
        const data = await res.json();

        setSessionId(id);
        const dbSession = data.session as {
          status: string;
          topic?: string;
          turn_order?: string[];
          active_models?: string[];
          current_round?: number;
        };

        setTopic(dbSession.topic ?? "");
        const restoredTurnOrder =
          Array.isArray(dbSession.turn_order) && dbSession.turn_order.length
            ? dbSession.turn_order
            : [...DEFAULT_SELECTED];
        const restoredActive =
          Array.isArray(dbSession.active_models) && dbSession.active_models.length
            ? dbSession.active_models
            : restoredTurnOrder;
        setTurnOrder(restoredTurnOrder);
        setSelectedModels(restoredActive);
        setCurrentRound(dbSession.current_round ?? 1);

        const mappedMessages: ThreadMessage[] = (data.messages ?? []).map(
          (m: any) => ({
            id: m.id,
            model: m.model,
            role: m.role,
            content: m.content ?? "",
            turnIndex: m.turn_index ?? 0,
          })
        );
        setMessages(mappedMessages);

        const status = (dbSession.status ?? "active") as SessionStatus;
        setSessionStatus(status);

        if (status === "active") {
          connect(id);
        }
      } catch (err) {
        console.error("Failed to resume round-robin session", err);
      }
    };

    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableModels = React.useMemo(
    () =>
      SUPPORTED_MODELS.map((m) => ({
        id: m.id,
        name: m.name,
        available: true,
      })),
    []
  );

  const canStart =
    !!topic.trim() &&
    selectedModels.length > 0 &&
    sessionStatus === "idle";

  async function startSession() {
    if (!topic.trim()) return;

    try {
      const res = await fetch("/api/round-robin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          turnOrder,
          activeModels: selectedModels,
        }),
      });

      if (!res.ok) {
        setSessionStatus("error");
        return;
      }

      const data = await res.json();
      const id = data.sessionId as number;
      setSessionId(id);
      setSessionStatus("active");
      setMessages([
        {
          id: Date.now(),
          model: "user",
          role: "user",
          content: topic.trim(),
          turnIndex: 0,
        },
      ]);
      router.replace(`/round-robin?sessionId=${id}`);
      connect(id);
    } catch (err) {
      console.error("Failed to start round-robin session", err);
      setSessionStatus("error");
    }
  }

  async function sendAction(
    action: "retry" | "skip" | "remove" | "pause" | "resume",
    model?: string
  ) {
    if (!sessionId) return null;
    try {
      const res = await fetch("/api/round-robin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action, model }),
      });
      if (!res.ok) {
        setSessionStatus("error");
        return null;
      }
      const data = await res.json();
      const updated = data.session as {
        status: string;
        active_models?: string[];
        turn_order?: string[];
      };
      setSessionStatus((updated.status ?? "active") as SessionStatus);
      if (Array.isArray(updated.active_models) && updated.active_models.length) {
        setSelectedModels(updated.active_models);
      }
      if (Array.isArray(updated.turn_order) && updated.turn_order.length) {
        setTurnOrder(updated.turn_order);
      }
      return updated;
    } catch (err) {
      console.error("Failed to send round-robin action", err);
      setSessionStatus("error");
      return null;
    }
  }

  async function handlePause() {
    await sendAction("pause");
    disconnect();
    setSessionStatus("paused");
  }

  async function handleResumeClick() {
    if (!sessionId) return;
    if (sessionStatus === "error" && errorState) {
      // Treat as retry of the failed model.
      await handleRetry();
      return;
    }
    await sendAction("resume");
    setSessionStatus("active");
    connect(sessionId);
  }

  async function handleEnd() {
    if (sessionId) {
      await sendAction("pause");
    }
    disconnect();
    setSessionId(null);
    setSessionStatus("idle");
    setTopic("");
    setMessages([]);
    setCurrentlyStreaming(null);
    setCurrentTurn(null);
    setErrorState(null);
    setCurrentRound(1);
    router.replace("/round-robin");
  }

  async function handleContinue(message?: string) {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/round-robin/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
      });
      if (!res.ok) {
        setSessionStatus("error");
        return;
      }

      if (message && message.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            model: "user",
            role: "user",
            content: message.trim(),
            turnIndex: prev[prev.length - 1]?.turnIndex ?? 0,
          },
        ]);
      }

      setSessionStatus("active");
      setCurrentRound((prev) => Math.max(1, prev + 1));
      connect(sessionId);
    } catch (err) {
      console.error("Failed to continue round-robin session", err);
      setSessionStatus("error");
    }
  }

  async function handleRetry() {
    if (!errorState) return;
    const updated = await sendAction("retry", errorState.model);
    if (!updated || !sessionId) return;
    setErrorState((prev) =>
      prev ? { ...prev, retryCount: prev.retryCount + 1 } : prev
    );
    setSessionStatus("active");
    connect(sessionId);
  }

  async function handleSkip() {
    if (!errorState) return;
    await sendAction("skip", errorState.model);
    setErrorState(null);
    if (sessionId) connect(sessionId);
  }

  async function handleRemove() {
    if (!errorState) return;
    const updated = await sendAction("remove", errorState.model);
    setErrorState(null);
    if (!updated) return;
    if (updated.status === "completed") {
      setSessionStatus("completed");
      disconnect();
    } else if (sessionId) {
      connect(sessionId);
    }
  }

  const modelsInRound = selectedModels.length || 1;
  const currentModel = currentTurn?.model ?? "";
  const currentIndex = currentTurn?.index ?? 0;

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Round-Robin Discussion
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure multiple models and watch them take turns discussing your topic.
        </p>
      </header>

      {sessionStatus === "idle" && (
        <section className="space-y-4 rounded-lg border bg-card px-4 py-4">
          <ModelSelector
            availableModels={availableModels}
            selectedModels={selectedModels}
            onSelectionChange={setSelectedModels}
            disabled={sessionStatus !== "idle"}
          />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <TopicInput
              value={topic}
              onChange={setTopic}
              onSubmit={startSession}
              disabled={sessionStatus !== "idle"}
            />
            <TurnOrderConfig
              models={selectedModels}
              turnOrder={turnOrder}
              onOrderChange={setTurnOrder}
              disabled={sessionStatus !== "idle"}
            />
          </div>
        </section>
      )}

      {sessionId && (
        <TurnIndicator
          currentModel={currentModel}
          turnOrder={turnOrder}
          currentIndex={currentIndex}
          currentRound={currentRound}
          status={sessionStatus === "idle" ? "active" : sessionStatus}
        />
      )}

      <ConversationThread
        messages={messages}
        currentlyStreaming={currentlyStreaming}
        modelsInRound={modelsInRound}
      />

      <ControlPanel
        sessionStatus={sessionStatus}
        onStart={startSession}
        onPause={handlePause}
        onResume={handleResumeClick}
        onEnd={handleEnd}
        onContinue={handleContinue}
        canStart={canStart}
      />

      {errorState && (
        <FailureModal
          isOpen={sessionStatus === "error"}
          model={errorState.model}
          error={errorState.message}
          retryCount={errorState.retryCount}
          maxRetries={MAX_RETRY_ATTEMPTS}
          onRetry={handleRetry}
          onSkip={handleSkip}
          onRemove={handleRemove}
          onClose={() => setErrorState(null)}
        />
      )}

      <LoadingIndicator
        model={longWaitModel ?? ""}
        elapsedSeconds={elapsedSeconds}
        isVisible={longWaitVisible && !!longWaitModel}
      />
    </div>
  );
}

