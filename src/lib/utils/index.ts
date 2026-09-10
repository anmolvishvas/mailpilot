import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function downloadFile(filename: string, content: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsEml(subject: string, body: string, recipientEmail: string = "recipient@example.com") {
  const dateStr = new Date().toUTCString();
  const emlContent = `Date: ${dateStr}
From: Me <me@example.com>
To: ${recipientEmail}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

${body}`;

  downloadFile(`${subject.replace(/[^a-zA-Z0-9_-]/g, "_") || "email"}.eml`, emlContent, "message/rfc822");
}

export function exportAsMarkdown(subject: string, body: string) {
  const mdContent = `# ${subject}\n\n${body}`;
  downloadFile(`${subject.replace(/[^a-zA-Z0-9_-]/g, "_") || "email"}.md`, mdContent, "text/markdown");
}

export function exportAsTxt(subject: string, body: string) {
  const txtContent = `Subject: ${subject}\n\n${body}`;
  downloadFile(`${subject.replace(/[^a-zA-Z0-9_-]/g, "_") || "email"}.txt`, txtContent, "text/plain");
}
