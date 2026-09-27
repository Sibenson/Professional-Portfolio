import type { ProductVisual } from "@/data/products";

/**
 * Abstract wireframe used until a real screenshot is added.
 * Deliberately schematic so it can never be mistaken for the real product.
 */
const block = "rounded-[3px] bg-line";

export default function ProductIllustration({ visual }: { visual: ProductVisual }) {
  return (
    <div aria-hidden className="absolute inset-0 bg-[linear-gradient(160deg,var(--surface-2),var(--bg-2))] p-[6%]">
      {visual === "commerce-b2b" && <B2B />}
      {visual === "commerce-b2c" && <B2C />}
      {visual === "cloud" && <Cloud />}
    </div>
  );
}

function B2B() {
  return (
    <div className="flex h-full gap-[4%]">
      <div className="flex w-[24%] flex-col gap-[7%]">
        {[70, 55, 80, 45, 60].map((w, i) => (
          <div key={i} className={`h-[5%] ${block}`} style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[4%]">
        <div className={`h-[8%] w-1/2 ${block} bg-line-strong`} />
        {[0, 1, 2, 3, 4].map((r) => (
          <div key={r} className="flex h-[12%] items-center gap-[4%] rounded-md border border-line px-[3%]">
            <div className={`aspect-square h-[60%] ${block}`} />
            <div className={`h-[22%] flex-1 ${block}`} />
            <div className={`h-[22%] w-[14%] ${r === 1 ? "bg-accent/70" : "bg-line-strong"} rounded-[3px]`} />
            <div className="h-[45%] w-[12%] rounded-[3px] border border-line-strong" />
          </div>
        ))}
      </div>
    </div>
  );
}

function B2C() {
  return (
    <div className="flex h-full flex-col gap-[5%]">
      <div className="relative h-[38%] overflow-hidden rounded-md bg-[linear-gradient(120deg,var(--line),var(--line-strong))]">
        <div className="absolute bottom-[18%] left-[6%] h-[14%] w-[34%] rounded-[3px] bg-text/20" />
        <div className="absolute bottom-[18%] left-[42%] h-[14%] w-[14%] rounded-full bg-accent/70" />
      </div>
      <div className="grid flex-1 grid-cols-4 gap-[3%]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-[8%]">
            <div className={`flex-1 ${block}`} />
            <div className={`h-[7%] w-4/5 ${block}`} />
            <div className={`h-[7%] w-2/5 ${block} bg-line-strong`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cloud() {
  return (
    <div className="flex h-full gap-[4%]">
      <div className="flex w-[20%] flex-col gap-[8%] rounded-md border border-line p-[4%]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-[5%] ${i === 1 ? "bg-accent/60" : "bg-line"} rounded-[3px]`} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[4%]">
        <div className="grid h-[22%] grid-cols-3 gap-[4%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-line p-[8%]">
              <div className={`h-[22%] w-1/2 ${block}`} />
              <div className={`mt-[10%] h-[30%] w-3/4 ${block} bg-line-strong`} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-between rounded-md border border-line p-[3%]">
          {[0, 1, 2, 3, 4].map((r) => (
            <div key={r} className="flex items-center gap-[4%]">
              <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${r === 3 ? "bg-flag" : "bg-pass"}`} />
              <div className={`h-[7px] w-[30%] ${block}`} />
              <div className={`h-[7px] w-[18%] ${block}`} />
              <div className={`ml-auto h-[7px] w-[12%] ${block}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
