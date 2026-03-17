"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050a]";
  const variants: Record<typeof variant, string> = {
    primary:
      "bg-violet-600 hover:bg-violet-500 text-white disabled:bg-violet-600/60",
    secondary:
      "border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-100 disabled:bg-white/5 disabled:text-zinc-500",
    ghost:
      "text-zinc-300 hover:text-white hover:bg-white/5 disabled:text-zinc-500",
  };

  return (
    <button
      className={`${base} ${variants[variant]} px-4 py-2.5 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ label, error, className = "", ...props }: TextInputProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 inline-block text-zinc-200">{label}</span>
      <input
        className={`w-full rounded-lg border bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors border-white/10 focus:border-violet-500 ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </label>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 inline-block text-zinc-200">{label}</span>
      <select
        className="w-full rounded-lg border bg-black/40 px-3 py-2.5 text-sm text-white outline-none border-white/10 focus:border-violet-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#05050a]">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type InlineAlertProps = {
  variant?: "error" | "success" | "info";
  children: ReactNode;
};

export function InlineAlert({ variant = "info", children }: InlineAlertProps) {
  const styles: Record<typeof variant, string> = {
    error: "bg-red-500/10 text-red-300 border-red-500/40",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    info: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${styles[variant]}`}>
      {children}
    </div>
  );
}

