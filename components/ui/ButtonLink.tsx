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
  "group/btn relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[15px] font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-soft active:scale-[0.98]";

const variants = {
  primary: "bg-text text-bg hover:bg-accent hover:text-accent-ink",
  ghost: "border border-line-strong text-text hover:border-text",
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
