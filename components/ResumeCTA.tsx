import { site } from "@/data/site";
import { DownloadIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

/** Only renders once public/resume.pdf exists. */
export default function ResumeCTA({ available }: { available: boolean }) {
  if (!available) return null;
  return (
    <section aria-labelledby="resume-heading" className="border-t border-line">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
        <h2 id="resume-heading" className="text-[clamp(1.6rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">
          Prefer the <em className="text-accent-text">one-page</em> version?
        </h2>
        <ButtonLink href={site.resumePath} download="Sibenson-Gautam-Resume.pdf">
          Download resume <DownloadIcon className="h-[18px] w-[18px]" />
        </ButtonLink>
      </div>
    </section>
  );
}
