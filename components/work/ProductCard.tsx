import Image from "next/image";
import { isPublishableUrl, type Product } from "@/data/products";
import ProductIllustration from "./ProductIllustration";
import { ArrowUpRight } from "../icons";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const linkable = isPublishableUrl(product.url);
  const host = linkable ? hostname(product.url) : "";
  const headingId = `product-${product.id}`;
  const isDev = process.env.NODE_ENV === "development";

  return (
    <article
      aria-labelledby={headingId}
      className="group relative flex h-full flex-col rounded-[28px] border border-line bg-surface p-2.5 transition-[border-color,transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow)] motion-reduce:hover:translate-y-0"
    >
      {/* Browser window preview */}
      <div className="relative overflow-hidden rounded-[20px] border border-line bg-bg-2">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          <span aria-hidden className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-surface-2 px-3 py-1 text-center font-mono text-[11px] text-muted">
            {host || product.name.toLowerCase()}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">
          {product.screenshot ? (
            <Image
              src={product.screenshot}
              alt={product.screenshotAlt}
              fill
              sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 86vw"
              className="object-cover object-top transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
            />
          ) : (
            <>
              <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.04] motion-reduce:group-hover:scale-100">
                <ProductIllustration visual={product.visual} />
              </div>
              <span className="absolute bottom-2.5 right-3 rounded-full bg-bg/70 px-2 py-0.5 font-mono text-[10px] text-muted backdrop-blur">
                {isDev ? "Add screenshot in data/products.ts" : "Illustrative preview"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Logo overlapping the frame edge */}
      <div className="relative z-10 -mt-7 ml-5 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow)]">
        {product.logo ? (
          <Image src={product.logo} alt={`${product.name} logo`} width={40} height={40} className="h-10 w-10 object-contain" />
        ) : (
          <span aria-hidden className="text-[15px] font-bold tracking-tight">
            {initials(product.name)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <p className="rounded-full border border-line px-2.5 py-1 text-[12px] leading-snug text-muted">
            {product.metric ? (
              <>
                <strong className="font-semibold text-text">{product.metric.value}</strong> {product.metric.label}
              </>
            ) : (
              product.status
            )}
          </p>
          <span aria-hidden className="serif-accent -mt-2 shrink-0 text-4xl leading-none sm:-mt-3 sm:text-5xl text-faint transition-colors duration-500 group-hover:text-accent-text">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 id={headingId} className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em]">
          {product.name}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{product.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4 text-[13px]">
          <div>
            <dt className="eyebrow !text-[10.5px]">My role</dt>
            <dd className="mt-1 font-medium">{product.role}</dd>
          </div>
          <div>
            <dt className="eyebrow !text-[10.5px]">Context</dt>
            <dd className="mt-1 font-medium">{product.context}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="eyebrow !text-[10.5px]">Worked on</p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {product.workedOn.map((w) => (
              <li key={w} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px]">
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          {product.tools?.length ? (
            <p className="min-w-0 truncate font-mono text-[11px] text-faint">{product.tools.join(" · ")}</p>
          ) : (
            <span />
          )}
          {linkable ? (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-text px-5 text-[14px] font-medium text-bg transition-colors duration-300 hover:bg-accent hover:text-accent-ink"
            >
              Visit Website
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              <span className="sr-only">: {product.name} (opens in a new tab)</span>
            </a>
          ) : (
            <span className="shrink-0 font-mono text-[11px] text-faint">{isDev ? "Add URL in data/products.ts" : "Link on request"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
