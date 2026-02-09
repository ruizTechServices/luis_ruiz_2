import type { Message as ThreadMessage } from "@/components/round-robin/ConversationThread";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type SessionStatus =
  | "idle"
  | "active"
  | "paused"
  | "awaiting_user"
  | "completed"
  | "error";

export interface ErrorState {
  model: string;
  message: string;
  retryCount: number;
}

export interface RoundRobinState {
  sessionId: number | null;
  sessionStatus: SessionStatus;
  topic: string;
  selectedModels: string[];
  turnOrder: string[];
  messages: ThreadMessage[];
  currentlyStreaming: { model: string; content: string } | null;
  currentTurn: { model: string; index: number; round: number } | null;
  currentRound: number;
  errorState: ErrorState | null;
  elapsedSeconds: number;
  longWaitModel: string | null;
  longWaitVisible: boolean;
}

export function createInitialState(defaultSelected: string[]): RoundRobinState {
  return {
    sessionId: null,
    sessionStatus: "idle",
    topic: "",
    selectedModels: [...defaultSelected],
    turnOrder: [...defaultSelected],
    messages: [],
    currentlyStreaming: null,
    currentTurn: null,
    currentRound: 1,
    errorState: null,
    elapsedSeconds: 0,
    longWaitModel: null,
    longWaitVisible: false,
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type RoundRobinAction =
  | { type: "SET_SESSION_ID"; id: number | null }
  | { type: "SET_STATUS"; status: SessionStatus }
  | { type: "SET_TOPIC"; topic: string }
  | { type: "SET_SELECTED_MODELS"; models: string[] }
  | { type: "SET_TURN_ORDER"; order: string[] }
  | { type: "SET_MESSAGES"; messages: ThreadMessage[] }
  | { type: "ADD_MESSAGE"; message: ThreadMessage }
  | { type: "SET_STREAMING"; streaming: { model: string; content: string } | null }
  | { type: "APPEND_CHUNK"; model: string; chunk: string }
  | { type: "SET_CURRENT_TURN"; turn: { model: string; index: number; round: number } | null }
  | { type: "SET_CURRENT_ROUND"; round: number }
  | { type: "INCREMENT_ROUND" }
  | { type: "SET_ERROR"; error: ErrorState | null }
  | { type: "INCREMENT_RETRY" }
  | { type: "SET_ELAPSED"; seconds: number }
  | { type: "SET_LONG_WAIT"; model: string | null; visible: boolean }
  | { type: "STOP_TIMER" }
  | { type: "SESSION_INIT"; topic: string; turnOrder: string[]; activeModels: string[] }
  | { type: "TURN_START"; model: string; turnIndex: number }
  | { type: "TURN_COMPLETE"; model: string; fullContent: string }
  | { type: "ROUND_COMPLETE"; round: number }
  | { type: "TURN_ERROR"; model: string; error: string }
  | { type: "RESET"; defaultSelected: string[] };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function roundRobinReducer(
  state: RoundRobinState,
  action: RoundRobinAction,
): RoundRobinState {
  switch (action.type) {
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.id };

    case "SET_STATUS":
      return { ...state, sessionStatus: action.status };

    case "SET_TOPIC":
      return { ...state, topic: action.topic };

    case "SET_SELECTED_MODELS":
      return { ...state, selectedModels: action.models };

    case "SET_TURN_ORDER":
      return { ...state, turnOrder: action.order };

    case "SET_MESSAGES":
      return { ...state, messages: action.messages };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };

    case "SET_STREAMING":
      return { ...state, currentlyStreaming: action.streaming };

    case "APPEND_CHUNK":
      if (!state.currentlyStreaming || state.currentlyStreaming.model !== action.model) {
        return { ...state, currentlyStreaming: { model: action.model, content: action.chunk } };
      }
      return {
        ...state,
        currentlyStreaming: {
          model: action.model,
          content: state.currentlyStreaming.content + action.chunk,
        },
      };

    case "SET_CURRENT_TURN":
      return { ...state, currentTurn: action.turn };

    case "SET_CURRENT_ROUND":
      return { ...state, currentRound: action.round };

    case "INCREMENT_ROUND":
      return { ...state, currentRound: Math.max(1, state.currentRound + 1) };

    case "SET_ERROR":
      return { ...state, errorState: action.error };

    case "INCREMENT_RETRY":
      if (!state.errorState) return state;
      return {
        ...state,
        errorState: { ...state.errorState, retryCount: state.errorState.retryCount + 1 },
      };

    case "SET_ELAPSED":
      return { ...state, elapsedSeconds: action.seconds };

    case "SET_LONG_WAIT":
      return { ...state, longWaitModel: action.model, longWaitVisible: action.visible };

    case "STOP_TIMER":
      return { ...state, elapsedSeconds: 0, longWaitVisible: false };

    // Composite actions from SSE events
    case "SESSION_INIT":
      return {
        ...state,
        topic: state.topic || action.topic,
        turnOrder: action.turnOrder,
        selectedModels: action.activeModels,
      };

    case "TURN_START":
      return {
        ...state,
        sessionStatus: "active",
        errorState: null,
        currentTurn: { model: action.model, index: action.turnIndex, round: state.currentRound },
        currentlyStreaming: { model: action.model, content: "" },
        longWaitModel: action.model,
        longWaitVisible: false,
      };

    case "TURN_COMPLETE": {
      const turnIndex = state.currentTurn?.index ?? state.messages.length;
      return {
        ...state,
        longWaitVisible: false,
        currentlyStreaming: null,
        elapsedSeconds: 0,
        messages: [
          ...state.messages,
          {
            id: Date.now(),
            model: action.model,
            role: "assistant" as const,
            content: action.fullContent,
            turnIndex,
          },
        ],
      };
    }

    case "ROUND_COMPLETE":
      return {
        ...state,
        sessionStatus: "awaiting_user",
        currentRound: action.round,
        currentTurn: null,
        currentlyStreaming: null,
        longWaitVisible: false,
        elapsedSeconds: 0,
      };

    case "TURN_ERROR":
      return {
        ...state,
        sessionStatus: "error",
        errorState: { model: action.model, message: action.error, retryCount: 0 },
        currentlyStreaming: null,
        longWaitVisible: false,
        elapsedSeconds: 0,
      };

    case "RESET":
      return createInitialState(action.defaultSelected);

    default:
      return state;
  }
}
