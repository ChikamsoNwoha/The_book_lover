import { useState } from "react";
import { Facebook, Twitter } from "lucide-react";
import { apiRequest } from "../lib/api";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter a valid email." });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest<{ message: string }>(
        "/api/newsletter/subscribe",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      setStatus({
        type: "success",
        message: response?.message || "Check your email to verify.",
      });
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        message: (err as Error).message || "Subscription failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="subscribe" className="bg-black text-white py-15">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-light tracking-wide font-['Cormorant_Garamond'] text-left">
          Subscribe here to get my latest posts
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-[0.25em] text-white mb-2">
              Enter Your Email Here *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full h-12 px-4 hover:bg-[#2f2f2f] border border-white/70 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base rounded-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full md:w-auto inline-flex items-center justify-center px-12 bg-none border border-white text-white hover:bg-(--accent-brown-dark) hover:border-(--accent-brown-dark) transition-all duration-300 whitespace-nowrap disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>

        {status && (
          <p
            className={`mt-4 text-sm ${
              status.type === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {status.message}
          </p>
        )}

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <p>
            {"\u00A9"} 2035 by The Book Lover. Powered and secured by{" "}
            <a href="#" className="underline hover:text-white">
              Wix
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-(--accent-brown)">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-(--accent-brown)">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
