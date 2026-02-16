import { useEffect, useState } from "react";
import { Facebook, Linkedin, Link2, Twitter, X } from "lucide-react";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
};

const buildShareLinks = (shareUrl: string, title: string) => {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
};

export default function ShareModal({
  open,
  onClose,
  shareUrl,
  title = "",
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
  }, [open, shareUrl]);

  if (!open) return null;

  const links = buildShareLinks(shareUrl, title);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close share dialog"
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white shadow-2xl border border-gray-200 px-10 py-10 text-center"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-8">Share Post</h3>
        <div className="flex items-center justify-center gap-6">
          <a
            href={links.facebook}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90"
            aria-label="Share on Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href={links.twitter}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90"
            aria-label="Share on X"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:opacity-90"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center hover:opacity-90"
            aria-label="Copy link"
          >
            <Link2 className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          {copied ? "Link copied to clipboard." : "Share this story with others."}
        </p>
      </div>
    </div>
  );
}
