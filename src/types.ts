import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------

/** A single FAQ entry. `id` is optional but recommended for stable React keys. */
export interface FAQItem {
  id?: string | number;
  question: string;
  answer: string;
}

/**
 * Where the widget gets its FAQs. Either a static array, or a (possibly async)
 * loader so you can fetch from an API / CMS / Supabase at mount time.
 */
export type FAQSource = FAQItem[] | (() => FAQItem[] | Promise<FAQItem[]>);

/** Domain vocabulary expansion: token -> equivalent terms. All lower-case. */
export type SynonymMap = Record<string, string[]>;

export interface ScoredFAQ {
  item: FAQItem;
  /** Raw relevance score (higher = better). */
  score: number;
  /** Fraction of the user's query tokens this item accounts for (0–1). */
  coverage: number;
}

/** Outcome of resolving a free-text query against the knowledge base. */
export type FAQResolution =
  | { type: "answer"; item: FAQItem }
  | { type: "suggestions"; items: FAQItem[] }
  | { type: "none" };

export interface ResolveOptions {
  limit?: number;
  /** Min coverage (0–1) of the top hit to answer directly. Default 0.6. */
  answerCoverage?: number;
  /** How many candidates to show in a "did you mean" list. Default 3. */
  suggestCount?: number;
  synonyms?: SynonymMap;
}

// ---------------------------------------------------------------------------
// AI fallback adapter
// ---------------------------------------------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiAdapterParams {
  /** The user's latest message. */
  message: string;
  /** Recent conversation turns (oldest → newest), for context. */
  history: ChatTurn[];
  /** Top FAQ entries related to the query — use to ground the model. */
  faqContext: FAQItem[];
}

/**
 * Pluggable AI fallback. Called only when the FAQ search finds no confident
 * match. Bring your own backend (Anthropic, OpenAI, an edge function, …).
 * Return the answer string, or `null` to fall through to the contact handoff.
 */
export type AiAdapter = (params: AiAdapterParams) => Promise<string | null>;

// ---------------------------------------------------------------------------
// Conversation messages
// ---------------------------------------------------------------------------

export type MessageRole = "user" | "agent" | "system";

interface BaseMessage {
  id: string;
  /** ISO timestamp. */
  at: string;
}

export interface TextMessage extends BaseMessage {
  kind: "text";
  role: MessageRole;
  content: string;
}

export interface SuggestionsMessage extends BaseMessage {
  kind: "suggestions";
  items: FAQItem[];
}

export interface ContactMessage extends BaseMessage {
  kind: "contact";
}

export type ChatMessage = TextMessage | SuggestionsMessage | ContactMessage;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Sentinel `seed` value for a QuickTopic that opens the contact card. */
export const CONTACT_INTENT = "__contact__";

export interface QuickTopic {
  label: string;
  /**
   * Query run when the chip is clicked. Use {@link CONTACT_INTENT} to open the
   * contact card directly instead of searching.
   */
  seed: string;
  icon?: ReactNode;
}

export type ContactChannelType = "email" | "phone" | "whatsapp" | "link";

export interface ContactChannel {
  type: ContactChannelType;
  label: string;
  /** Email address, phone number, WhatsApp number (digits), or a URL. */
  value: string;
  /** Optional pre-filled text for `whatsapp` / `email` channels. */
  prefill?: string;
  icon?: ReactNode;
}

export interface ChatbotLabels {
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  suggestionsPrompt: string;
  noMatch: string;
  contactPrompt: string;
  quickTopicsHeading: string;
  launcherAriaLabel: string;
  closeAriaLabel: string;
  resetAriaLabel: string;
  sendAriaLabel: string;
  online: string;
}

export type PersistenceMode = "local" | "session" | "none";

export interface NudgeConfig {
  text: string;
  /** Delay before the nudge appears, ms. Default 4000. */
  delayMs?: number;
}

/**
 * Inline theme overrides. Each value is written to a `--rfc-*` CSS variable on
 * the widget root, so you can theme without touching the stylesheet. Any key in
 * {@link ThemeTokens} is supported; unknown keys are ignored.
 */
export type ChatbotTheme = Partial<ThemeTokens>;

export interface ThemeTokens {
  primary: string;
  primaryForeground: string;
  surface: string;
  surfaceMuted: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  agentBubble: string;
  userBubble: string;
  radius: string;
  fontFamily: string;
  launcherSize: string;
  panelWidth: string;
  panelHeight: string;
  zIndex: string;
}

export type ChatbotPosition = "bottom-right" | "bottom-left";

export type ChatbotEvent =
  | { type: "open" }
  | { type: "close" }
  | { type: "message_sent"; text: string }
  | { type: "faq_answered"; item: FAQItem }
  | { type: "suggestions_shown"; items: FAQItem[] }
  | { type: "ai_answered"; text: string }
  | { type: "contact_offered" }
  | { type: "contact_clicked"; channel: ContactChannel }
  | { type: "reset" }
  | { type: "error"; error: unknown };

/** Override the inline SVG glyphs the widget renders. */
export interface IconSet {
  chat?: ReactNode;
  close?: ReactNode;
  reset?: ReactNode;
  send?: ReactNode;
  sparkles?: ReactNode;
  search?: ReactNode;
  email?: ReactNode;
  phone?: ReactNode;
  whatsapp?: ReactNode;
  link?: ReactNode;
}

export interface ChatbotProps {
  /** The knowledge base (array or async loader). Required. */
  faqs: FAQSource;
  /** Domain synonyms to widen search recall. Merged over the built-in defaults. */
  synonyms?: SynonymMap;
  /** Optional AI fallback when no FAQ matches. */
  aiAdapter?: AiAdapter;
  /** Quick-topic chips shown on a fresh conversation. */
  quickTopics?: QuickTopic[];
  /** Contact channels for the human handoff card. */
  contactChannels?: ContactChannel[];
  /** Copy overrides (partial — unset fields use sensible English defaults). */
  labels?: Partial<ChatbotLabels>;
  /** Theme overrides written as `--rfc-*` CSS variables. */
  theme?: ChatbotTheme;
  /** Corner the launcher/panel dock to. Default `bottom-right`. */
  position?: ChatbotPosition;
  /** Where to persist the thread. Default `session`. */
  persistence?: PersistenceMode;
  /** Storage key for the persisted thread. Default `rfc.chat.v1`. */
  storageKey?: string;
  /** Start with the panel open. Default false. */
  defaultOpen?: boolean;
  /** Render the floating launcher button. Set false to control open state yourself. */
  showLauncher?: boolean;
  /** Controlled open state (use with `onOpenChange`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Simulated "typing" delay before replies land, ms. Default 600. */
  typingDelayMs?: number;
  /** One-time welcome nudge bubble, or `false` to disable. */
  nudge?: NudgeConfig | false;
  /** Confidence tuning for the search resolver. */
  confidence?: Pick<ResolveOptions, "answerCoverage" | "suggestCount">;
  /** Analytics / side-effect hook for conversation events. */
  onEvent?: (event: ChatbotEvent) => void;
  /** Override the built-in inline SVG icons. */
  icons?: IconSet;
  /** Extra class on the widget root. */
  className?: string;
}
