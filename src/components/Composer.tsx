import { useState, type FormEvent } from "react";
import type { ChatbotLabels, IconSet } from "../types";
import { getIcon } from "./icons";

interface ComposerProps {
  disabled: boolean;
  labels: ChatbotLabels;
  icons?: IconSet;
  maxLength?: number;
  onSend: (text: string) => void;
}

export function Composer({ disabled, labels, icons, maxLength = 500, onSend }: ComposerProps) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <form className="rfc-composer" onSubmit={submit}>
      <label htmlFor="rfc-input" className="rfc-visually-hidden">
        {labels.placeholder}
      </label>
      <input
        id="rfc-input"
        className="rfc-input"
        type="text"
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        placeholder={labels.placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="rfc-send"
        aria-label={labels.sendAriaLabel}
        disabled={disabled || !value.trim()}
      >
        {getIcon("send", icons)}
      </button>
    </form>
  );
}
