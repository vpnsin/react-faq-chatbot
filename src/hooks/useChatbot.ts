import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AiAdapter,
  ChatMessage,
  ChatbotEvent,
  ChatTurn,
  FAQItem,
  FAQSource,
  PersistenceMode,
  ResolveOptions,
  SynonymMap,
} from "../types";
import { resolveFaqQuery, searchFAQs } from "../search/faqSearch";
import { readJSON, remove, writeJSON } from "../utils/storage";

const MAX_STORED = 60;
const AI_GROUNDING = 5;
const HISTORY_TURNS = 8;

export interface UseChatbotOptions {
  faqs: FAQSource;
  synonyms?: SynonymMap;
  aiAdapter?: AiAdapter;
  greeting: string;
  suggestionsPrompt: string;
  noMatch: string;
  contactPrompt: string;
  persistence: PersistenceMode;
  storageKey: string;
  typingDelayMs: number;
  confidence?: Pick<ResolveOptions, "answerCoverage" | "suggestCount">;
  onEvent?: (event: ChatbotEvent) => void;
}

export interface ChatbotApi {
  messages: ChatMessage[];
  isTyping: boolean;
  faqs: FAQItem[];
  /** Send a free-text user message through the resolver/AI pipeline. */
  send: (text: string) => void;
  /** Open the contact-handoff card. */
  showContact: () => void;
  /** Clear the thread back to the greeting. */
  reset: () => void;
}

let idSeq = 0;
const nextId = () => `m${++idSeq}_${Date.now().toString(36)}`;

export function useChatbot(opts: UseChatbotOptions): ChatbotApi {
  const {
    faqs: faqSource,
    synonyms,
    aiAdapter,
    greeting,
    suggestionsPrompt,
    noMatch,
    contactPrompt,
    persistence,
    storageKey,
    typingDelayMs,
    confidence,
    onEvent,
  } = opts;

  // Keep latest callbacks/values in refs so the resolver closures stay stable.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const emit = useCallback((e: ChatbotEvent) => onEventRef.current?.(e), []);

  const initialFaqs = useMemo(
    () => (Array.isArray(faqSource) ? faqSource : []),
    [faqSource]
  );
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const faqsRef = useRef<FAQItem[]>(initialFaqs);
  faqsRef.current = faqs;

  const greet = useCallback(
    (): ChatMessage[] => [
      { id: nextId(), kind: "text", role: "system", content: greeting, at: new Date().toISOString() },
    ],
    [greeting]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = readJSON<ChatMessage[]>(persistence, storageKey);
    if (Array.isArray(saved) && saved.length) return saved;
    return greet();
  });
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const [isTyping, setIsTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Load FAQs from an async source on mount (upgrade from the seed/empty list).
  useEffect(() => {
    if (Array.isArray(faqSource)) {
      setFaqs(faqSource);
      return;
    }
    let alive = true;
    Promise.resolve()
      .then(() => faqSource())
      .then((loaded) => {
        if (alive && Array.isArray(loaded)) setFaqs(loaded);
      })
      .catch((error) => emit({ type: "error", error }));
    return () => {
      alive = false;
    };
  }, [faqSource, emit]);

  // Persist (trimmed) + cleanup timers on unmount.
  useEffect(() => {
    writeJSON(persistence, storageKey, messages.slice(-MAX_STORED));
  }, [messages, persistence, storageKey]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const append = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const pushAgentText = useCallback(
    (content: string) =>
      append({ id: nextId(), kind: "text", role: "agent", content, at: new Date().toISOString() }),
    [append]
  );

  const showContact = useCallback(() => {
    append({ id: nextId(), kind: "contact", at: new Date().toISOString() });
    emit({ type: "contact_offered" });
  }, [append, emit]);

  const tryAi = useCallback(
    async (question: string): Promise<string | null> => {
      if (!aiAdapter) return null;
      try {
        const history: ChatTurn[] = messagesRef.current
          .filter((m): m is Extract<ChatMessage, { kind: "text" }> => m.kind === "text")
          .slice(-HISTORY_TURNS)
          .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
        const ranked = searchFAQs(question, faqsRef.current, { limit: AI_GROUNDING, synonyms });
        const faqContext = ranked.length
          ? ranked.map((r) => r.item)
          : faqsRef.current.slice(0, 6);
        return await aiAdapter({ message: question, history, faqContext });
      } catch (error) {
        emit({ type: "error", error });
        return null;
      }
    },
    [aiAdapter, synonyms, emit]
  );

  const respond = useCallback(
    async (question: string) => {
      setIsTyping(true);
      const settle = (work: () => void | Promise<void>) => {
        const t = setTimeout(async () => {
          await work();
          setIsTyping(false);
        }, typingDelayMs);
        timers.current.push(t);
      };

      const resolution = resolveFaqQuery(question, faqsRef.current, {
        answerCoverage: confidence?.answerCoverage,
        suggestCount: confidence?.suggestCount,
        synonyms,
      });

      if (resolution.type === "answer") {
        settle(() => {
          pushAgentText(resolution.item.answer);
          emit({ type: "faq_answered", item: resolution.item });
        });
        return;
      }

      if (resolution.type === "suggestions") {
        settle(() => {
          pushAgentText(suggestionsPrompt);
          append({ id: nextId(), kind: "suggestions", items: resolution.items, at: new Date().toISOString() });
          emit({ type: "suggestions_shown", items: resolution.items });
        });
        return;
      }

      // No FAQ overlap — try AI, else hand off to a human.
      const aiAnswer = await tryAi(question);
      settle(() => {
        if (aiAnswer) {
          pushAgentText(aiAnswer);
          emit({ type: "ai_answered", text: aiAnswer });
        } else {
          pushAgentText(noMatch);
          showContact();
        }
      });
    },
    [
      typingDelayMs, confidence, synonyms, pushAgentText, append, emit,
      suggestionsPrompt, tryAi, noMatch, showContact,
    ]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      append({ id: nextId(), kind: "text", role: "user", content: trimmed, at: new Date().toISOString() });
      emit({ type: "message_sent", text: trimmed });
      void respond(trimmed);
    },
    [isTyping, append, emit, respond]
  );

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsTyping(false);
    setMessages(greet());
    remove(persistence, storageKey);
    emit({ type: "reset" });
    void contactPrompt; // reserved for future "how else can I help" copy
  }, [greet, persistence, storageKey, emit, contactPrompt]);

  return { messages, isTyping, faqs, send, showContact, reset };
}
