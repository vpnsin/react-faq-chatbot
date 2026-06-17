// @vpnsin-labs/react-faq-chatbot — public API
//
// Remember to also import the stylesheet once in your app:
//   import "@vpnsin-labs/react-faq-chatbot/styles.css";

export { Chatbot } from "./components/Chatbot";
export { useChatbot } from "./hooks/useChatbot";
export type { ChatbotApi, UseChatbotOptions } from "./hooks/useChatbot";

// Search engine (use standalone if you build your own UI)
export {
  searchFAQs,
  resolveFaqQuery,
  isConfidentMatch,
  DEFAULT_SYNONYMS,
} from "./search/faqSearch";

// Icons (override or reuse)
export { DefaultIcons, getIcon } from "./components/icons";
export type { IconName } from "./components/icons";

// Constants
export { CONTACT_INTENT } from "./types";

// Types
export type {
  FAQItem,
  FAQSource,
  SynonymMap,
  ScoredFAQ,
  FAQResolution,
  ResolveOptions,
  AiAdapter,
  AiAdapterParams,
  ChatTurn,
  ChatMessage,
  TextMessage,
  SuggestionsMessage,
  ContactMessage,
  MessageRole,
  QuickTopic,
  ContactChannel,
  ContactChannelType,
  ChatbotLabels,
  ChatbotTheme,
  ThemeTokens,
  ChatbotPosition,
  ChatbotEvent,
  ChatbotProps,
  IconSet,
  NudgeConfig,
  PersistenceMode,
} from "./types";
