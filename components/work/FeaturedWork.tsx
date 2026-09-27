import { products } from "@/data/products";
import SectionHeading from "../ui/SectionHeading";
import Carousel from "./Carousel";
import ProductCard from "./ProductCard";

export default function FeaturedWork() {
  return (
    <section id="work" aria-labelledby="work-heading" className="relative overflow-hidden py-24 md:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,var(--glow),transparent_70%)]" />
      <div className="container-x relative">
        <SectionHeading
          layout="split"
          id="work"
          index="01"
          eyebrow="Selected work"
          title={
            <>
              Products I&apos;ve <em>worked</em> on
            </>
          }
          intro="Real, production software — tested and coordinated as QA and PM + QA at Hazesoft. I didn't build these products; I helped make sure they work."
        />
        <div className="reveal mt-14 md:mt-20">
          <Carousel label="Products I've worked on">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
