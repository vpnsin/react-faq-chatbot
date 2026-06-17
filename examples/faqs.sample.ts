import type { FAQItem } from "@vpnsin-labs/react-faq-chatbot";

/** A small sample knowledge base you can adapt to your product. */
export const faqs: FAQItem[] = [
  {
    id: 1,
    question: "How do I create an account?",
    answer:
      "Click “Sign Up” in the top-right, enter your email and a password, and verify the link we email you. It takes under a minute.",
  },
  {
    id: 2,
    question: "How much does it cost?",
    answer:
      "We have a free tier and paid plans starting at $9/month. See the Pricing page for a full comparison.",
  },
  {
    id: 3,
    question: "Can I get a refund?",
    answer:
      "Yes — we offer a 30-day money-back guarantee on all paid plans. Email support and we’ll process it within 3 business days.",
  },
  {
    id: 4,
    question: "How do I reset my password?",
    answer:
      "On the login screen, click “Forgot password?”, enter your email, and follow the reset link we send you.",
  },
  {
    id: 5,
    question: "Do you offer customer support?",
    answer:
      "Absolutely. You can reach us by email, phone, or WhatsApp — use the “Talk to us” button in this chat.",
  },
];
