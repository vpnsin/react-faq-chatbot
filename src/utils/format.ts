import type { ContactChannel } from "../types";

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Build the appropriate href for a contact channel. */
export function contactHref(channel: ContactChannel): string {
  switch (channel.type) {
    case "email": {
      const subject = channel.prefill ? `?subject=${encodeURIComponent(channel.prefill)}` : "";
      return `mailto:${channel.value}${subject}`;
    }
    case "phone":
      return `tel:${channel.value.replace(/[^\d+]/g, "")}`;
    case "whatsapp": {
      const digits = channel.value.replace(/[^\d]/g, "");
      const text = channel.prefill ? `?text=${encodeURIComponent(channel.prefill)}` : "";
      return `https://wa.me/${digits}${text}`;
    }
    case "link":
    default:
      return channel.value;
  }
}

export function iconNameForChannel(
  channel: ContactChannel
): "email" | "phone" | "whatsapp" | "link" {
  return channel.type === "email"
    ? "email"
    : channel.type === "phone"
      ? "phone"
      : channel.type === "whatsapp"
        ? "whatsapp"
        : "link";
}
