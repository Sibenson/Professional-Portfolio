import { site } from "@/data/site";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold tracking-tight">{site.name}</p>
          <p className="mt-1 text-[14px] text-muted">
            {site.roleShort} | {site.roleFocus}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="font-mono text-[11px] text-faint">© {new Date().getFullYear()} · {site.location}</p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
