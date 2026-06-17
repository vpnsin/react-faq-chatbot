// Vite + React example.
// 1) Install:  npm i @vpnsin-labs/react-faq-chatbot
// 2) Import the stylesheet ONCE (e.g. in main.tsx):  import "@vpnsin-labs/react-faq-chatbot/styles.css";
// 3) Render <SupportChat /> anywhere near the root of your app.

import { Chatbot, CONTACT_INTENT } from "@vpnsin-labs/react-faq-chatbot";
import "@vpnsin-labs/react-faq-chatbot/styles.css";
import { faqs } from "./faqs.sample";

export function SupportChat() {
  return (
    <Chatbot
      faqs={faqs}
      labels={{
        title: "Acme Support",
        subtitle: "We usually reply in a minute",
        greeting: "Hey there 👋 Ask me anything about Acme.",
      }}
      theme={{ primary: "#7c3aed" }}
      quickTopics={[
        { label: "Pricing", seed: "how much does it cost pricing plans" },
        { label: "Account", seed: "create account sign up login" },
        { label: "Refunds", seed: "refund money back guarantee" },
        { label: "Talk to us", seed: CONTACT_INTENT },
      ]}
      contactChannels={[
        { type: "email", label: "Email us", value: "support@acme.com" },
        { type: "whatsapp", label: "WhatsApp", value: "+1 555 010 2030", prefill: "Hi Acme!" },
      ]}
      nudge={{ text: "👋 Need a hand? Ask me anything." }}
      onEvent={(e) => console.log("[chatbot]", e)}
    />
  );
}
