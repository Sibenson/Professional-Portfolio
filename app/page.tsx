import { existsSync } from "node:fs";
import path from "node:path";
import { site } from "@/data/site";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/work/FeaturedWork";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Workflow from "@/components/Workflow";
import CaseStudies from "@/components/CaseStudies";
import CloudApi from "@/components/CloudApi";
import Skills from "@/components/Skills";
import ResumeCTA from "@/components/ResumeCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/ui/RevealObserver";

// Optional assets are detected at build time — nothing renders a broken link or image.
const publicFile = (p: string) => existsSync(path.join(process.cwd(), "public", p));
const hasResume = publicFile(site.resumePath);
const hasModel = publicFile(site.character.model);
const hasPoster = publicFile(site.character.poster);

export default function Home() {
  return (
    <>
      <Navbar hasResume={hasResume} />
      <main id="main">
        <Hero hasModel={hasModel} hasPoster={hasPoster} />
        <FeaturedWork />
        <Experience />
        <About />
        <Workflow />
        <CaseStudies />
        <CloudApi />
        <Skills />
        <ResumeCTA available={hasResume} />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
