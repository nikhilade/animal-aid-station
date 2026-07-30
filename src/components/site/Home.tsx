import { PawPrint, ArrowRight, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { Nav } from "./Nav";
import dogsHero from "@/assets/dogs-hero.webp.asset.json";
import dogHead from "@/assets/dog-head.webp.asset.json";
import aboutVet from "@/assets/about-vet.jpg";
import serviceVet from "@/assets/service-vet.jpg";
import serviceGrooming from "@/assets/service-grooming.jpg";
import serviceBoarding from "@/assets/service-boarding.jpg";
import serviceTraining from "@/assets/service-training.jpg";
import serviceSpecial from "@/assets/service-special.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

const services = [
  {
    title: "Veterinary Care",
    copy: "Routine check-ups, vaccinations, diagnostics and emergency treatment from licensed veterinarians who know your pet by name.",
    img: serviceVet,
  },
  {
    title: "Grooming Services",
    copy: "Baths, trims, nail care and de-shedding treatments that keep coats healthy and tails wagging all year round.",
    img: serviceGrooming,
  },
  {
    title: "Boarding & Daycare",
    copy: "Cosy overnight suites and supervised play days so your companion feels at home even when you are away.",
    img: serviceBoarding,
  },
  {
    title: "Training Services",
    copy: "Positive-reinforcement obedience and behaviour programmes built around your pet's pace and personality.",
    img: serviceTraining,
  },
  {
    title: "Special Care Services",
    copy: "Post-surgery recovery, senior support and chronic condition management with attentive daily monitoring.",
    img: serviceSpecial,
  },
];

const posts = [
  { title: "Top Foods for a Healthy Pet Diet", author: "Brooklyn Simmons", date: "November 28, 2024", img: blog1 },
  { title: "Holiday Safety Tips for Your Pets", author: "Isabella Parker", date: "November 28, 2024", img: blog2 },
  { title: "How to Stop Unwanted Chewing", author: "Sophia Bennett", date: "November 28, 2024", img: blog3 },
];

const sponsors = ["Pawfect", "VetLine", "HappyTail", "CarePlus"];

export function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section id="home" className="relative bg-sage">
        <div className="paw-field absolute inset-0 opacity-70" aria-hidden />
        <div className="relative">
          <Nav />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-0 pt-8 lg:grid-cols-2 lg:pt-16">
            <div className="pb-12 lg:pb-28">
              <p className="text-lg font-medium text-clay">The Best Pet Care Service</p>
              <h1 className="mt-4 text-5xl leading-[1.1] sm:text-6xl lg:text-[64px]">
                Where Happy Pets
                <br />
                Meet Expert Care
              </h1>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-foreground/80">
                Compassionate veterinary medicine, grooming and daycare under one roof — because
                your companion deserves a team that treats them like family.
              </p>
              <a
                href="#contact"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-forest px-9 py-4 text-[16px] font-medium text-forest transition-colors hover:bg-forest hover:text-primary-foreground"
              >
                Get Started
              </a>
            </div>

            <div className="relative flex items-end justify-center">
              <img
                src={dogHead.url}
                alt="Illustrated dog head"
                className="pointer-events-none absolute left-[50%] top-[4%] w-[20%]"
              />
              <img
                src={dogsHero.url}
                alt="Illustrated husky, great dane, dalmatian and bulldog sitting together"
                className="w-full max-w-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-sand py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl text-4xl leading-tight sm:text-5xl">
              Loving Pets Is What We Do Best
            </h2>
            <ArrowRight className="hidden size-12 -rotate-12 text-clay lg:block" strokeWidth={1.5} />
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
            <img
              src={aboutVet}
              alt="Veterinarian holding a happy golden dog"
              loading="lazy"
              width={900}
              height={1100}
              className="h-[440px] w-full rounded-[2.5rem] object-cover lg:h-[520px]"
            />

            <div>
              <p className="text-[17px] leading-relaxed text-foreground/80">
                From the first wagging-tail welcome to the follow-up call after treatment, every
                part of our clinic is designed around comfort. Our veterinarians, groomers and
                daycare team work together so your pet gets consistent, gentle care at every visit.
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {[
                  {
                    title: "Passion for pets",
                    copy: "We are pet owners first — every animal in our care is treated like our own.",
                  },
                  {
                    title: "Expertise & experience",
                    copy: "Over fifteen years of clinical practice across preventive and emergency care.",
                  },
                ].map((f) => (
                  <div key={f.title}>
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-forest">
                      <PawPrint className="size-6 text-primary-foreground" />
                    </span>
                    <h3 className="mt-4 text-xl">{f.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-foreground/75">{f.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="bg-cream py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="text-center text-xl font-semibold">Our Generous Sponsors and Donors</h3>
        </div>
        <div className="mt-10 overflow-hidden">
          <div className="marquee-track flex w-max gap-16 pr-16">
            {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap text-2xl font-bold text-forest/50"
              >
                <PawPrint className="size-6" /> {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="max-w-3xl text-4xl leading-tight sm:text-5xl">
            Expert Care for Every Stage of Your Pet's Life
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.title}
                className="group overflow-hidden rounded-[2rem] bg-cream p-6 transition-transform hover:-translate-y-1"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-56 w-full rounded-[1.5rem] object-cover"
                />
                <h3 className="mt-6 text-2xl">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">{s.copy}</p>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-clay"
                >
                  Book now <ArrowUpRight className="size-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="relative overflow-hidden bg-forest py-20 lg:py-28">
        <div className="paw-field absolute inset-0 opacity-100 invert" aria-hidden />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-[220px_1fr]">
          <img
            src={testimonial1}
            alt="Sarah Johnson holding her dog Max"
            loading="lazy"
            width={700}
            height={700}
            className="size-52 rounded-full object-cover"
          />
          <div>
            <blockquote className="text-3xl leading-snug text-primary-foreground sm:text-4xl">
              &ldquo;She&apos;s not just a pet, she&apos;s our cuddle buddy — and this team treats
              her exactly that way.&rdquo;
            </blockquote>
            <p className="mt-6 text-lg font-semibold text-primary-foreground">Sarah Johnson</p>
            <p className="text-sm text-primary-foreground/70">Dog — Max</p>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="bg-sand py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl leading-tight sm:text-5xl">Unleashing Expert Tips for Pet Owners</h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {posts.map((p) => (
              <article key={p.title} className="rounded-[2rem] bg-card p-5">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-52 w-full rounded-[1.5rem] object-cover"
                />
                <h3 className="mt-6 text-xl leading-snug">{p.title}</h3>
                <div className="mt-4 flex items-center justify-between text-sm text-foreground/70">
                  <span>
                    {p.author} · {p.date}
                  </span>
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-forest text-primary-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl leading-tight sm:text-5xl">Have Questions? We&apos;re Here to Help</h2>
            <ul className="mt-10 space-y-6">
              {[
                { icon: Phone, text: "(00) 123 654 987" },
                { icon: Mail, text: "info@petgood.com" },
                { icon: MapPin, text: "9400 S Normandie Ave #14, Los Angeles, CA" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-cream text-forest">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[16px] text-foreground/85">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            className="rounded-[2rem] bg-cream p-8"
            onSubmit={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                className="rounded-full border border-border bg-card px-5 py-3 text-[15px] outline-none focus:border-forest"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                className="rounded-full border border-border bg-card px-5 py-3 text-[15px] outline-none focus:border-forest"
              />
            </div>
            <select
              className="mt-5 w-full rounded-full border border-border bg-card px-5 py-3 text-[15px] outline-none focus:border-forest"
              defaultValue=""
            >
              <option value="" disabled>
                Choose Service...
              </option>
              {services.map((s) => (
                <option key={s.title}>{s.title}</option>
              ))}
            </select>
            <textarea
              rows={4}
              placeholder="Tell us about your pet"
              className="mt-5 w-full rounded-[1.5rem] border border-border bg-card px-5 py-4 text-[15px] outline-none focus:border-forest"
            />
            <button
              type="submit"
              className="mt-6 rounded-full bg-forest px-9 py-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-forest py-16 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-3">
          <div>
            <span className="flex items-center text-2xl font-bold">
              pet g<PawPrint className="inline size-5 -rotate-12 text-clay" />od
            </span>
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/75">
              Full-service veterinary care, grooming and daycare for the pets of Los Angeles.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#contact"
                  aria-label="Social link"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/30 transition-colors hover:bg-primary-foreground/10"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg text-primary-foreground">Quick Link</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              {["Home", "About us", "Services", "Blog", "Contact us"].map((l) => (
                <li key={l}>
                  <a href="#home" className="hover:text-clay">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg text-primary-foreground">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              {["Appointments", "Emergency care", "Pricing"].map((l) => (
                <li key={l}>
                  <a href="#contact" className="hover:text-clay">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-7xl px-6 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Pet Good Veterinary Clinic. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
