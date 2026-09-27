/**
 * Simplified, illustrative diagrams for each investigation.
 * Generic product names and pseudo-logic only — no real data, code or UI.
 */
import { CheckIcon, CloseIcon } from "../icons";

const panel = "rounded-2xl border border-line bg-bg/60 p-4";
const label = "font-mono text-[10.5px] uppercase tracking-[0.1em]";

function CartRows({ fixed }: { fixed: boolean }) {
  const items = [
    { name: "Product A", note: "matching · qty 2", match: true },
    { name: "Product B", note: "not in rule", match: false },
    { name: "Product C", note: "not in rule", match: false },
  ];
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it) => {
        const discounted = it.match || !fixed;
        const wrong = discounted && !it.match;
        return (
          <li key={it.name} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium">{it.name}</span>
              <span className="block font-mono text-[10.5px] text-faint">{it.note}</span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] ${
                wrong ? "bg-danger/15 text-danger" : discounted ? "bg-pass/15 text-pass" : "bg-surface-2 text-muted"
              }`}
            >
              {discounted ? "− discount" : "full price"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CartRuleVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
      <div className={panel}>
        <p className={`${label} flex items-center gap-2 text-danger`}>
          <CloseIcon className="h-3.5 w-3.5" /> Before
        </p>
        <CartRows fixed={false} />
        <pre className="mt-3 overflow-x-auto whitespace-pre rounded-xl bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted">
{`if cart.has(sku, qty >= 2)
  discount(`}<span className="text-danger">every item</span>{`)`}
        </pre>
      </div>
      <div className={`${panel} border-pass/30`}>
        <p className={`${label} flex items-center gap-2 text-pass`}>
          <CheckIcon className="h-3.5 w-3.5" /> After
        </p>
        <CartRows fixed />
        <pre className="mt-3 overflow-x-auto whitespace-pre rounded-xl bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted">
{`for item in cart
  if item.matches(sku, qty >= 2)
    discount(`}<span className="text-pass">item</span>{`)`}
        </pre>
      </div>
    </div>
  );
}

export function RolePermissionVisual() {
  return (
    <div className={`${panel} p-5`}>
      <p className="flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-muted">
        <span className="rounded-md bg-surface-2 px-2 py-1">Configuration Menu</span>
        <span className="text-faint">→</span>
        <span className="rounded-md bg-surface-2 px-2 py-1 text-text">Role</span>
      </p>
      <div className="mt-5 overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-line bg-surface-2 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
          <span>Permission</span>
          <span className="text-center">Super-admin</span>
          <span className="text-center">Admin</span>
        </div>
        {[{ p: "Duplicate page" }].map((row) => (
          <div
            key={row.p}
            className="grid grid-cols-[1.3fr_1fr_1fr] items-center bg-accent/[0.07] px-4 py-4 text-[13px]"
          >
            <span className="font-medium">{row.p}</span>
            <span className="grid place-items-center">
              <Toggle on />
            </span>
            <span className="flex items-center justify-center gap-2">
              <Toggle on={false} />
              <span className="text-faint">→</span>
              <Toggle on highlight />
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[13px] text-pass">
        <CheckIcon className="h-4 w-4" /> Admin can duplicate pages — no code change
      </p>
    </div>
  );
}

function Toggle({ on, highlight = false }: { on: boolean; highlight?: boolean }) {
  return (
    <span
      className={`relative inline-block h-4 w-7 rounded-full transition-colors ${
        on ? (highlight ? "bg-accent" : "bg-pass/70") : "bg-line-strong"
      }`}
    >
      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg ${on ? "left-3.5" : "left-0.5"}`} />
    </span>
  );
}

export function PdpVariantVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-[0.8fr_auto_1.2fr] sm:items-center">
      <div className={panel}>
        <p className={`${label} text-muted`}>PLP</p>
        <div className="mt-3 rounded-xl border border-line bg-surface p-3">
          <div className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-line-strong font-mono text-[10px] text-faint">
            no image
          </div>
          <p className="mt-2 text-[13px] font-medium">Parent product</p>
        </div>
      </div>
      <span aria-hidden className="justify-self-center font-mono text-faint sm:rotate-0">→</span>
      <div className={panel}>
        <p className={`${label} text-muted`}>PDP</p>
        <div className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-3 rounded-xl border border-line bg-surface p-3">
          <div className="relative grid aspect-square place-items-center rounded-lg border border-dashed border-danger/60 bg-danger/[0.06]">
            <span className="font-mono text-[10px] text-danger">blank</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-danger/15 px-1.5 font-mono text-[9.5px] text-danger">
              parent image
            </span>
          </div>
          <div className="space-y-1.5 text-[12px]">
            <p className="flex items-center justify-between gap-2">
              <span className="text-muted">SKU</span>
              <span className="rounded bg-pass/15 px-1.5 font-mono text-[10px] text-pass">child</span>
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="text-muted">Price</span>
              <span className="rounded bg-pass/15 px-1.5 font-mono text-[10px] text-pass">child</span>
            </p>
            <div className="!mt-3 rounded-lg border border-flag/40 bg-flag/[0.07] p-2 font-mono text-[10px] leading-relaxed text-flag">
              total price
              <br />
              vs. after discount?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
