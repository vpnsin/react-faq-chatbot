import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  ChatbotEvent,
  ChatbotLabels,
  ChatbotProps,
  ChatbotTheme,
  ContactChannel,
} from "../types";
import { DEFAULT_SYNONYMS } from "../search/faqSearch";
import { useChatbot } from "../hooks/useChatbot";
import { ChatLauncher } from "./ChatLauncher";
import { ChatPanel } from "./ChatPanel";

const DEFAULT_LABELS: ChatbotLabels = {
  title: "Support",
  subtitle: "Typically replies instantly",
  greeting: "Hi! 👋 How can I help you today?",
  placeholder: "Type your message…",
  suggestionsPrompt: "Here are a few things that might help — did you mean one of these?",
  noMatch: "I couldn't find an answer to that. Would you like to reach our team?",
  contactPrompt: "Get in touch with us directly:",
  quickTopicsHeading: "Popular topics",
  launcherAriaLabel: "Open support chat",
  closeAriaLabel: "Close",
  resetAriaLabel: "Reset conversation",
  sendAriaLabel: "Send message",
  online: "Online",
};

const DEFAULT_STORAGE_KEY = "rfc.chat.v1";

// camelCase token -> `--rfc-kebab-case` CSS variable.
function themeToStyle(theme?: ChatbotTheme): CSSProperties {
  if (!theme) return {};
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (value == null) continue;
    const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    style[`--rfc-${kebab}`] = value;
  }
  return style as CSSProperties;
}

export function Chatbot(props: ChatbotProps) {
  const {
    faqs,
    synonyms: userSynonyms,
    aiAdapter,
    quickTopics = [],
    contactChannels = [],
    labels: labelOverrides,
    theme,
    position = "bottom-right",
    persistence = "session",
    storageKey = DEFAULT_STORAGE_KEY,
    defaultOpen = false,
    showLauncher = true,
    open: controlledOpen,
    onOpenChange,
    typingDelayMs = 600,
    nudge,
    confidence,
    onEvent,
    icons,
    className,
  } = props;

  const labels = useMemo<ChatbotLabels>(
    () => ({ ...DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides]
  );

  const synonyms = useMemo(
    () => (userSynonyms ? { ...DEFAULT_SYNONYMS, ...userSynonyms } : DEFAULT_SYNONYMS),
    [userSynonyms]
  );

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const emit = useCallback((e: ChatbotEvent) => onEventRef.current?.(e), []);

  // Open state: controlled if `open` prop is provided, else internal.
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
      emit({ type: next ? "open" : "close" });
    },
    [isControlled, onOpenChange, emit]
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  const api = useChatbot({
    faqs,
    synonyms,
    aiAdapter,
    greeting: labels.greeting,
    suggestionsPrompt: labels.suggestionsPrompt,
    noMatch: labels.noMatch,
    contactPrompt: labels.contactPrompt,
    persistence,
    storageKey,
    typingDelayMs,
    confidence,
    onEvent,
  });

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const handleContactClick = useCallback(
    (channel: ContactChannel) => emit({ type: "contact_clicked", channel }),
    [emit]
  );

  const rootStyle = themeToStyle(theme);

  return (
    <div
      className={`rfc-root rfc-${position}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      data-rfc-open={open ? "true" : "false"}
    >
      {open && (
        <ChatPanel
          api={api}
          labels={labels}
          quickTopics={quickTopics}
          contactChannels={contactChannels}
          icons={icons}
          onClose={() => setOpen(false)}
          onContactClick={handleContactClick}
        />
      )}

      {showLauncher && (
        <ChatLauncher
          open={open}
          labels={labels}
          icons={icons}
          nudge={nudge}
          nudgeStorageKey={`${storageKey}.nudge`}
          onToggle={toggle}
        />
      )}
    </div>
  );
}

export default Chatbot;
