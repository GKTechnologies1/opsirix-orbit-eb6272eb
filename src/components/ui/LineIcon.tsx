import {
  AlertTriangle, BarChart3, Brain, Building2, CheckCircle2, Clock, Compass, Cpu, FileStack, Folder, FolderOpen,
  GitBranch, Handshake, HardHat, Landmark, Laptop, Lightbulb, Link2, Lock, Map, Monitor, Phone, RefreshCw,
  Rocket, Scale, Search, Settings, Shield, Target, TrendingUp, Wallet, Briefcase, ClipboardList, CreditCard,
  Zap, X, Check, CircleDashed, Frown, type LucideIcon,
} from "lucide-react";

/** Maps legacy emoji glyphs to consistent line icons. Labels stay in the surrounding text. */
const MAP: Record<string, LucideIcon> = {
  "⚖": Scale, "⚙": Settings, "⚠": AlertTriangle, "⚡": Zap, "✅": CheckCircle2, "✓": Check, "✕": X,
  "🎯": Target, "🏗": HardHat, "🏛": Landmark, "🏦": Building2, "💡": Lightbulb, "💳": CreditCard,
  "💸": Wallet, "💻": Laptop, "💼": Briefcase, "📁": Folder, "📂": FolderOpen, "📈": TrendingUp,
  "📊": BarChart3, "📋": ClipboardList, "📑": FileStack, "📞": Phone, "🔀": GitBranch, "🔄": RefreshCw,
  "🔍": Search, "🔒": Lock, "🔗": Link2, "🕐": Clock, "🕳": CircleDashed, "🖥": Monitor, "🗺": Map,
  "😰": Frown, "🚀": Rocket, "🛡": Shield, "🤝": Handshake, "🧠": Brain, "🧭": Compass, "🔧": Cpu,
};

export function LineIcon({ glyph, size = 20, className }: { glyph: string; size?: number; className?: string }) {
  const key = Array.from(glyph.replace(/\uFE0F/g, ""))[0] ?? "";
  const Icon = MAP[key] ?? CircleDashed;
  return <Icon aria-hidden="true" focusable="false" size={size} strokeWidth={1.75} className={className} style={{ display: "inline-block", verticalAlign: "middle", color: "currentColor" }} />;
}
