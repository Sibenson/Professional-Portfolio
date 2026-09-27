import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
  download?: string;
};

const base =
  "group/btn relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[15px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out-soft active:scale-[0.98]";

const variants = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover hover:glow-gold",
  ghost: "border border-gold-deep/70 text-text hover:border-accent hover:text-accent-text hover:glow-gold-soft",
};

export default function ButtonLink({ href, children, variant = "primary", external, className = "", download }: Props) {
  return (
    <a
      href={href}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
