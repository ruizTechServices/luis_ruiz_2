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
import {
  roundRobinReducer,
  createInitialState,
  type SessionStatus,
} from "@/lib/round-robin/reducer";

const DEFAULT_SELECTED = DEFAULT_TURN_ORDER as readonly string[];

export default function RoundRobinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, dispatch] = React.useReducer(
    roundRobinReducer,
    [...DEFAULT_SELECTED],
    createInitialState,
  );

  const {
    sessionId,
    sessionStatus,
    topic,
    selectedModels,
    turnOrder,
    messages,
    currentlyStreaming,
    currentTurn,
    currentRound,
    errorState,
    elapsedSeconds,
    longWaitModel,
    longWaitVisible,
  } = state;

  const timerRef = React.useRef<number | null>(null);
  const elapsedRef = React.useRef(0);
  React.useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const startTimerActual = React.useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      dispatch({ type: "SET_ELAPSED", seconds: elapsedRef.current });
    }, 1000);
  }, []);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    dispatch({ type: "STOP_TIMER" });
  }, []);

  const { connect, disconnect } = useRoundRobinStream({
    onSessionInit: (data) => {
      dispatch({
        type: "SESSION_INIT",
        topic: data.topic,
        turnOrder: data.turnOrder,
        activeModels: data.activeModels,
      });
    },
    onTurnStart: (data) => {
      dispatch({ type: "TURN_START", model: data.model, turnIndex: data.turnIndex });
      startTimerActual();
    },
    onContentChunk: (data) => {
      dispatch({ type: "APPEND_CHUNK", model: data.model, chunk: data.chunk });
    },
    onTurnComplete: (data) => {
      stopTimer();
      dispatch({ type: "TURN_COMPLETE", model: data.model, fullContent: data.fullContent });
    },
    onRoundComplete: (data) => {
      stopTimer();
      dispatch({ type: "ROUND_COMPLETE", round: data.round });
    },
    onTurnError: (data) => {
      stopTimer();
      dispatch({ type: "TURN_ERROR", model: data.model, error: data.error });
    },
    onLongWait: (data) => {
      dispatch({ type: "SET_ELAPSED", seconds: data.elapsedSeconds });
      dispatch({ type: "SET_LONG_WAIT", model: data.model, visible: true });
    },
    onError: () => {
      if (sessionStatus !== "idle") {
        dispatch({ type: "SET_STATUS", status: "error" });
      }
    },
    onClose: () => {
      stopTimer();
    },
  });

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
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

        dispatch({ type: "SET_SESSION_ID", id });
        const dbSession = data.session as {
          status: string;
          topic?: string;
          turn_order?: string[];
          active_models?: string[];
          current_round?: number;
        };

        dispatch({ type: "SET_TOPIC", topic: dbSession.topic ?? "" });
        const restoredTurnOrder =
          Array.isArray(dbSession.turn_order) && dbSession.turn_order.length
            ? dbSession.turn_order
            : [...DEFAULT_SELECTED];
        const restoredActive =
          Array.isArray(dbSession.active_models) && dbSession.active_models.length
            ? dbSession.active_models
            : restoredTurnOrder;
        dispatch({ type: "SET_TURN_ORDER", order: restoredTurnOrder });
        dispatch({ type: "SET_SELECTED_MODELS", models: restoredActive });
        dispatch({ type: "SET_CURRENT_ROUND", round: dbSession.current_round ?? 1 });

        const mappedMessages: ThreadMessage[] = (data.messages ?? []).map(
          (m: {
            id: number;
            model: string;
            role: "user" | "assistant";
            content?: string | null;
            turn_index?: number | null;
          }) => ({
            id: m.id,
            model: m.model,
            role: m.role,
            content: m.content ?? "",
            turnIndex: m.turn_index ?? 0,
          })
        );
        dispatch({ type: "SET_MESSAGES", messages: mappedMessages });

        const status = (dbSession.status ?? "active") as SessionStatus;
        dispatch({ type: "SET_STATUS", status });

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
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      const data = await res.json();
      const id = data.sessionId as number;
      dispatch({ type: "SET_SESSION_ID", id });
      dispatch({ type: "SET_STATUS", status: "active" });
      dispatch({
        type: "SET_MESSAGES",
        messages: [
          {
            id: Date.now(),
            model: "user",
            role: "user",
            content: topic.trim(),
            turnIndex: 0,
          },
        ],
      });
      router.replace(`/round-robin?sessionId=${id}`);
      connect(id);
    } catch (err) {
      console.error("Failed to start round-robin session", err);
      dispatch({ type: "SET_STATUS", status: "error" });
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
        dispatch({ type: "SET_STATUS", status: "error" });
        return null;
      }
      const data = await res.json();
      const updated = data.session as {
        status: string;
        active_models?: string[];
        turn_order?: string[];
      };
      dispatch({ type: "SET_STATUS", status: (updated.status ?? "active") as SessionStatus });
      if (Array.isArray(updated.active_models) && updated.active_models.length) {
        dispatch({ type: "SET_SELECTED_MODELS", models: updated.active_models });
      }
      if (Array.isArray(updated.turn_order) && updated.turn_order.length) {
        dispatch({ type: "SET_TURN_ORDER", order: updated.turn_order });
      }
      return updated;
    } catch (err) {
      console.error("Failed to send round-robin action", err);
      dispatch({ type: "SET_STATUS", status: "error" });
      return null;
    }
  }

  async function handlePause() {
    await sendAction("pause");
    disconnect();
    dispatch({ type: "SET_STATUS", status: "paused" });
  }

  async function handleResumeClick() {
    if (!sessionId) return;
    if (sessionStatus === "error" && errorState) {
      await handleRetry();
      return;
    }
    await sendAction("resume");
    dispatch({ type: "SET_STATUS", status: "active" });
    connect(sessionId);
  }

  async function handleEnd() {
    if (sessionId) {
      await sendAction("pause");
    }
    disconnect();
    dispatch({ type: "RESET", defaultSelected: [...DEFAULT_SELECTED] });
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
        dispatch({ type: "SET_STATUS", status: "error" });
        return;
      }

      if (message && message.trim()) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: Date.now(),
            model: "user",
            role: "user",
            content: message.trim(),
            turnIndex: messages[messages.length - 1]?.turnIndex ?? 0,
          },
        });
      }

      dispatch({ type: "SET_STATUS", status: "active" });
      dispatch({ type: "INCREMENT_ROUND" });
      connect(sessionId);
    } catch (err) {
      console.error("Failed to continue round-robin session", err);
      dispatch({ type: "SET_STATUS", status: "error" });
    }
  }

  async function handleRetry() {
    if (!errorState) return;
    const updated = await sendAction("retry", errorState.model);
    if (!updated || !sessionId) return;
    dispatch({ type: "INCREMENT_RETRY" });
    dispatch({ type: "SET_STATUS", status: "active" });
    connect(sessionId);
  }

  async function handleSkip() {
    if (!errorState) return;
    await sendAction("skip", errorState.model);
    dispatch({ type: "SET_ERROR", error: null });
    if (sessionId) connect(sessionId);
  }

  async function handleRemove() {
    if (!errorState) return;
    const updated = await sendAction("remove", errorState.model);
    dispatch({ type: "SET_ERROR", error: null });
    if (!updated) return;
    if (updated.status === "completed") {
      dispatch({ type: "SET_STATUS", status: "completed" });
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
            onSelectionChange={(models) =>
              dispatch({ type: "SET_SELECTED_MODELS", models })
            }
            disabled={sessionStatus !== "idle"}
          />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <TopicInput
              value={topic}
              onChange={(t) => dispatch({ type: "SET_TOPIC", topic: t })}
              onSubmit={startSession}
              disabled={sessionStatus !== "idle"}
            />
            <TurnOrderConfig
              models={selectedModels}
              turnOrder={turnOrder}
              onOrderChange={(order) =>
                dispatch({ type: "SET_TURN_ORDER", order })
              }
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
          onClose={() => dispatch({ type: "SET_ERROR", error: null })}
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
