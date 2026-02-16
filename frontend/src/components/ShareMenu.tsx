import { useEffect, useRef } from "react";
import { MoreVertical, Share2 } from "lucide-react";

type ShareMenuProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onShare: () => void;
  align?: "left" | "right";
  buttonClassName?: string;
};

export default function ShareMenu({
  open,
  onOpen,
  onClose,
  onShare,
  align = "right",
  buttonClassName = "",
}: ShareMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const alignmentClass = align === "left" ? "left-0" : "right-0";

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      onClose();
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        className={`text-gray-400 hover:text-(--accent-brown) ${buttonClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open share menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute ${alignmentClass} mt-2 w-40 border border-(--border) bg-white shadow-lg z-20`}
        >
          <button
            type="button"
            onClick={() => {
              onShare();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:text-(--accent-brown) hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4" />
            Share Post
          </button>
        </div>
      )}
    </div>
  );
}
