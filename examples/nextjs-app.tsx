// Next.js (App Router) example.
//
// The widget uses browser-only APIs (localStorage, window), so it must be a
// Client Component. Wrap it in a file with "use client" and either render it in
// your root layout or load it dynamically with `ssr: false`.
//
// --- components/SupportChat.tsx ---
'use client';

import { Chatbot, CONTACT_INTENT, type AiAdapter } from '@vpnsin-labs/react-faq-chatbot';
import '@vpnsin-labs/react-faq-chatbot/styles.css';

const faqs = async () => {
  // Fetch your knowledge base from an API / CMS / Supabase.
  const res = await fetch('/api/faq', { cache: 'no-store' });
  const data = await res.json();
  return data.faqs as { id: number; question: string; answer: string }[];
};

// Optional: route the AI fallback to your own backend (keep API keys server-side!).
const aiAdapter: AiAdapter = async ({ message, history, faqContext }) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, faqContext }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.answer ?? null;
};

export default function SupportChat() {
  return (
    <Chatbot
      faqs={faqs}
      aiAdapter={aiAdapter}
      persistence="local"
      labels={{ title: 'Help Center' }}
      quickTopics={[
        { label: 'Getting started', seed: 'getting started setup onboarding' },
        { label: 'Talk to a human', seed: CONTACT_INTENT },
      ]}
      contactChannels={[{ type: 'email', label: 'Email support', value: 'help@example.com' }]}
    />
  );
}

// --- app/layout.tsx ---
// import SupportChat from "@/components/SupportChat";
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         {children}
//         <SupportChat />
//       </body>
//     </html>
//   );
// }
