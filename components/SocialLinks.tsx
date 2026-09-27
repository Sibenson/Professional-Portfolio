import { site } from "@/data/site";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./icons";

export default function SocialLinks({ className = "" }: { className?: string }) {
  const { linkedin, email, github } = site.contact;
  const links = [
    { label: "LinkedIn profile", href: linkedin, Icon: LinkedInIcon, external: true },
    { label: `Email ${email}`, href: `mailto:${email}`, Icon: MailIcon, external: false },
    ...(github ? [{ label: "GitHub profile", href: github, Icon: GitHubIcon, external: true }] : []),
  ];

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map(({ label, href, Icon, external }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-line-strong hover:bg-surface-2 hover:text-text"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
