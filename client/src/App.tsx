import { type ReactNode, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  DoorOpen,
  Droplets,
  FileCheck2,
  Home,
  MapPinned,
  Menu,
  Paintbrush,
  Phone,
  Ruler,
  ShieldCheck,
  Star,
  SunMedium,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const business = {
  name: "Prairie Exterior Co.",
  phone: "(620) 555-2480",
  phoneHref: "tel:+162****2480",
  email: "estimates@prairieexteriorco.com",
  address: "1200 Prairie Line Road, Oswego, KS 67356",
  area: "Southeast Kansas and nearby communities",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/process", label: "Process" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Request Estimate" },
];

const services = [
  {
    slug: "siding",
    title: "Siding Installation & Replacement",
    icon: Home,
    summary: "Vinyl, fiber cement, engineered wood, natural wood, and metal siding options planned around curb appeal, durability, and maintenance expectations.",
    details: ["Full siding replacement and selective repair", "House wrap, flashing, corner boards, and trim coordination", "Color, profile, exposure, and accent layout guidance"],
    homeowner: "Siding is usually the largest visual surface on the home. We help homeowners compare appearance, upkeep, budget, and long-term performance before materials are ordered.",
  },
  {
    slug: "gutters-downspouts",
    title: "Gutters & Downspouts",
    icon: Droplets,
    summary: "5-inch and 6-inch seamless gutter systems, downspout routing, gutter guards, and color-matched drainage details.",
    details: ["Seamless gutter installation", "Oversized downspouts and drainage corrections", "Leaf protection and color matching"],
    homeowner: "A good gutter layout protects fascia, siding, foundations, landscaping, and entry areas. We size the system around roof volume and real water movement.",
  },
  {
    slug: "windows",
    title: "Replacement Windows",
    icon: SunMedium,
    summary: "Replacement and new-construction windows with energy-efficient glass packages, clean trim details, and careful exterior water management.",
    details: ["Double-hung, casement, picture, slider, and specialty windows", "Flashing, insulation, and exterior trim integration", "Energy-efficiency and ventilation planning"],
    homeowner: "Window replacement affects comfort, appearance, maintenance, and water control. We look at the opening, trim, siding tie-ins, and room-by-room goals.",
  },
  {
    slug: "doors",
    title: "Exterior Doors",
    icon: DoorOpen,
    summary: "Entry doors, patio doors, storm doors, sidelites, hardware, and weatherstripping installed as part of a tight exterior envelope.",
    details: ["Front, side, patio, and storm doors", "Thresholds, sweeps, weather seals, and hardware", "Trim, paintable surfaces, and security upgrades"],
    homeowner: "Door projects need more than a slab swap. The frame, sill, drainage plane, lockset, and trim all affect comfort and long-term performance.",
  },
  {
    slug: "soffit-fascia",
    title: "Soffit & Fascia",
    icon: Ruler,
    summary: "Ventilated soffit, fascia cladding, rot repair coordination, and roof-edge details that finish the exterior cleanly.",
    details: ["Aluminum, vinyl, and wood-look soffit options", "Fascia wrap and trim metal", "Ventilation review and repair planning"],
    homeowner: "Soffit and fascia are small details with a large effect on roof ventilation, water protection, and the finished look of the home.",
  },
  {
    slug: "wraps-trim",
    title: "Wraps, Trim & Exterior Details",
    icon: Paintbrush,
    summary: "Window wraps, door wraps, corner trim, frieze boards, accents, and finishing details that make a whole-home exterior look intentional.",
    details: ["Color-matched aluminum trim wrap", "Accent bands, corners, and gable details", "Low-maintenance finish planning"],
    homeowner: "Trim is where exterior projects can feel custom instead of pieced together. We coordinate the finish details before the crew starts.",
  },
  {
    slug: "storm-insurance-restoration",
    title: "Storm & Insurance Restoration",
    icon: FileCheck2,
    summary: "Exterior damage documentation, repair scopes, material matching, and claim coordination for siding, gutters, windows, doors, soffit, and fascia.",
    details: ["Wind and hail damage review", "Photo documentation and repair notes", "Insurance-scope coordination and material matching"],
    homeowner: "Storm damage can involve several exterior systems at once. We help document visible damage and explain what needs repair or replacement.",
  },
];

const styleShowcase = [
  { name: "Fiber cement lap siding", color: "bg-stone-500", copy: "Crisp shadow lines, strong durability, and a painted finish that works well for full exterior refreshes." },
  { name: "Board-and-batten accents", color: "bg-slate-600", copy: "Vertical texture for gables, entries, porches, and modern farmhouse elevations." },
  { name: "Wood-look warmth", color: "bg-amber-700", copy: "Natural contrast for porch ceilings, entry features, shutters, or select wall sections." },
  { name: "6-inch dark gutters", color: "bg-zinc-800", copy: "A clean roofline detail that can disappear into trim or become a deliberate accent." },
  { name: "Black window frames", color: "bg-neutral-950", copy: "A sharper modern look that pairs well with light siding and simple trim packages." },
  { name: "Classic white trim", color: "bg-zinc-100", copy: "Bright contrast for traditional homes and a reliable match for most door and gutter packages." },
];

const gallery = [
  { title: "Whole-home siding refresh", before: "Weathered beige lap siding", after: "Fiber cement lap with dark gutters and white trim" },
  { title: "Entry door and trim update", before: "Drafty builder-grade door", after: "Painted entry system with new storm door and wrapped trim" },
  { title: "Gutter and fascia correction", before: "Overflowing 5-inch gutters", after: "6-inch seamless gutters, larger downspouts, and repaired fascia" },
  { title: "Window replacement package", before: "Aging inserts and faded trim", after: "Energy-efficient windows with clean exterior wraps" },
];

const serviceAreas = [
  { slug: "your-city", name: "Southeast Kansas", copy: "Exterior updates for established neighborhoods, rural homes, and storm-damaged properties needing coordinated siding, gutter, window, and door scopes." },
  { slug: "north-county", name: "North Rural Area", copy: "Whole-home exterior planning for larger lots, wind-exposed elevations, and projects where drainage and material durability matter." },
  { slug: "west-valley", name: "West Prairie Area", copy: "Replacement siding, gutters, doors, windows, soffit, and fascia for homeowners comparing curb appeal, efficiency, and repair timing." },
];

const process = [
  ["01", "Exterior review", "We walk the siding, gutters, windows, doors, soffit, fascia, trim, and drainage details so the full exterior scope is understood."],
  ["02", "Material and style planning", "Homeowners compare siding profiles, colors, gutter sizes, window styles, door options, and trim details before the final scope is locked."],
  ["03", "Clear estimate", "The proposal explains what is included, which items are optional, and where insurance or storm documentation may affect the final scope."],
  ["04", "Coordinated installation", "The crew sequences tear-off, repairs, wrap, flashing, siding, windows, doors, gutters, and finish details to avoid rework."],
  ["05", "Final walk-through", "We review the finished exterior, cleanup, warranty paperwork, care notes, and any photo documentation the homeowner needs."],
];

function AppLink({ href, className, children, onClick, ariaLabel }: { href: string; className?: string; children: ReactNode; onClick?: () => void; ariaLabel?: string }) {
  const [, setLocation] = useLocation();
  return <a href={href} className={className} aria-label={ariaLabel} onClick={(event) => { if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || href.startsWith("tel:") || href.startsWith("mailto:")) return; event.preventDefault(); onClick?.(); setLocation(href); window.scrollTo(0, 0); }}>{children}</a>;
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/20">
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <AppLink href="/" onClick={close} className="flex items-center gap-3" ariaLabel={`${business.name} home`}><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><Home className="h-5 w-5" /></span><span className="text-lg font-black tracking-tight sm:text-xl">{business.name}</span></AppLink>
        <nav className="hidden items-center gap-6 text-sm font-bold text-muted-foreground lg:flex">{navItems.map((item) => <AppLink key={item.href} href={item.href} className="transition hover:text-foreground">{item.label}</AppLink>)}</nav>
        <div className="hidden items-center gap-3 md:flex"><AppLink href={business.phoneHref} className="font-black text-primary">{business.phone}</AppLink><AppLink href="/contact"><Button className="font-black">Free Estimate</Button></AppLink></div>
        <button className="rounded-xl border border-border p-3 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="border-t border-border bg-background p-5 lg:hidden"><nav className="grid gap-3">{navItems.map((item) => <AppLink key={item.href} href={item.href} onClick={close} className="rounded-2xl border border-border px-4 py-3 font-bold">{item.label}</AppLink>)}<AppLink href={business.phoneHref} className="rounded-2xl bg-primary px-4 py-3 text-center font-black text-primary-foreground">Call {business.phone}</AppLink></nav></div>}
    </header>
    <main>{children}</main>
    <StickyAuditRail />
    <footer className="border-t border-border bg-card px-6 py-12"><div className="container grid gap-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_0.8fr_0.8fr]"><div><p className="text-lg font-black text-foreground">{business.name}</p><p className="mt-3 max-w-xl leading-7">Exterior envelope contractor for siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration. Built for homeowners comparing exterior replacement, repair, storm documentation, and coordinated curb-appeal upgrades.</p><p className="mt-4">{business.address}</p></div><div><p className="font-black text-foreground">Services</p><div className="mt-4 grid gap-2">{services.slice(0, 6).map((s) => <AppLink key={s.slug} href={`/services/${s.slug}`} className="hover:text-foreground">{s.title}</AppLink>)}</div></div><div><p className="font-black text-foreground">Contact</p><div className="mt-4 grid gap-2"><AppLink href={business.phoneHref} className="hover:text-foreground">{business.phone}</AppLink><a href={`mailto:${business.email}`} className="hover:text-foreground">{business.email}</a><AppLink href="/privacy" className="hover:text-foreground">Privacy Policy</AppLink><AppLink href="/terms" className="hover:text-foreground">Terms</AppLink></div></div></div></footer>
  </div>;
}

function Hero({ eyebrow, title, body, visual = true }: { eyebrow: string; title: string; body: string; visual?: boolean }) {
  return <section className="relative overflow-hidden bg-[linear-gradient(135deg,hsl(var(--hero-start)),hsl(var(--hero-end)))] px-6 py-16 text-white sm:py-24"><div className="container grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center"><div className="reveal"><Badge className="mb-5 border-white/20 bg-white/10 text-white">{eyebrow}</Badge><h1 className="max-w-5xl text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/82 sm:text-xl">{body}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><AppLink href={business.phoneHref}><Button size="lg" className="h-14 bg-white px-7 font-black text-slate-950 hover:bg-white/90"><Phone className="mr-2 h-5 w-5" /> Call {business.phone}</Button></AppLink><AppLink href="/contact"><Button size="lg" variant="outline" className="h-14 border-white/30 bg-white/10 px-7 font-black text-white hover:bg-white/20">Free Exterior Estimate <ArrowRight className="ml-2 h-5 w-5" /></Button></AppLink></div></div>{visual && <LeadOpsVisual />}</div></section>;
}

function LeadOpsVisual() {
  return <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur"><div className="overflow-hidden rounded-[1.5rem] bg-white text-slate-950"><div className="grid grid-cols-3"><div className="h-28 bg-[linear-gradient(135deg,#d6d3d1,#78716c)]" /><div className="h-28 bg-[linear-gradient(135deg,#e7e5e4,#292524)]" /><div className="h-28 bg-[linear-gradient(135deg,#fefce8,#92400e)]" /></div><div className="p-6"><div className="flex items-center justify-between"><p className="font-black">Whole-home exterior plan</p><Badge className="bg-emerald-100 text-emerald-800">Exterior plan</Badge></div><div className="mt-5 grid gap-3">{["Siding profile + color", "Gutter size + drainage", "Window and door tie-ins", "Soffit, fascia, wraps, trim"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-100 p-3 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</div>)}</div></div></div></div>;
}

function SectionIntro({ badge, title, body }: { badge: string; title: string; body: string }) { return <div className="mb-12 max-w-3xl"><Badge className="mb-4">{badge}</Badge><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{body}</p></div>; }
function StickyAuditRail() { return <AppLink href="/contact" className="fixed bottom-5 right-5 z-40 hidden rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-xl transition hover:-translate-y-1 lg:inline-flex">Request exterior estimate <ArrowRight className="ml-2 h-4 w-4" /></AppLink>; }
function LeadFlowLineSection() { const steps = [["Photo review", "Share the exterior problem, storm concern, or replacement goal."], ["Scope match", "The estimator connects siding, gutter, window, door, soffit, fascia, wrap, and trim needs into one visit."], ["Clear proposal", "The homeowner gets one organized exterior plan with choices, priorities, and next steps."]]; return <section className="px-6 py-20"><div className="container"><SectionIntro badge="Estimate path" title="A cleaner path from first call to exterior plan." body="The site guides homeowners from the exact problem they see to the right exterior scope, instead of forcing them to guess which trade or material category comes first." /><div className="grid gap-5 md:grid-cols-3">{steps.map(([title, body], index) => <Card key={title} className="relative overflow-hidden"><CardHeader><p className="text-sm font-black text-primary">Step {index + 1}</p><CardTitle>{title}</CardTitle><CardDescription className="leading-7">{body}</CardDescription></CardHeader></Card>)}</div></div></section>; }
function LeadLeakAudit() { const [checked, setChecked] = useState<string[]>(["siding", "gutters"]); const items = ["siding", "gutters", "windows", "doors", "soffit", "fascia", "storm damage"]; const score = Math.max(1, checked.length); return <section className="bg-muted/40 px-6 py-20"><div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><SectionIntro badge="Exterior scope check" title="Homeowners can flag every exterior system in one place." body="A bundled exterior project often crosses materials and trades. This quick checklist mirrors the contact form so the estimator sees the full picture before the site visit." /><Card className="p-6"><CardHeader className="p-0"><CardTitle>Project readiness score: {score}/7</CardTitle><CardDescription>Select the exterior items that may need review.</CardDescription></CardHeader><CardContent className="mt-6 grid gap-3 p-0 sm:grid-cols-2">{items.map((item) => <label key={item} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-bold capitalize"><Checkbox checked={checked.includes(item)} onCheckedChange={(value) => setChecked((current) => value ? Array.from(new Set([...current, item])) : current.filter((entry) => entry !== item))} />{item}</label>)}</CardContent></Card></div></section>; }
function BeforeAfterComparison() { return <section className="px-6 py-20"><div className="container"><SectionIntro badge="Before and after comparison" title="Show the condition, then show the finished exterior package." body="Exterior buyers need to compare what looks worn, mismatched, or water-damaged against the finished siding, gutter, window, door, and trim plan." /><div className="grid gap-5 md:grid-cols-2">{gallery.map((item, index) => <Card key={item.title} className="overflow-hidden"><div className="grid grid-cols-2"><div className="h-40 bg-stone-300 p-4 text-sm font-black text-stone-700">Before<br/><span className="text-xs font-semibold">{item.before}</span></div><div className={`h-40 p-4 text-sm font-black text-white ${index % 2 ? "bg-slate-800" : "bg-primary"}`}>After<br/><span className="text-xs font-semibold text-white/85">{item.after}</span></div></div><CardHeader><CardTitle>{item.title}</CardTitle><CardDescription>Transformation summary for exterior planning conversations.</CardDescription></CardHeader></Card>)}</div></div></section>; }
function ServiceGrid() { return <section className="px-6 py-20"><div className="container"><SectionIntro badge="Exterior envelope services" title="One team for the outside of your house." body="Most exterior projects touch more than one system. Siding, gutters, windows, doors, soffit, fascia, wraps, and trim need to be planned together so the finished home looks clean and sheds water correctly." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => { const Icon = service.icon; return <AppLink key={service.slug} href={`/services/${service.slug}`} className="group block"><Card className="h-full border-border/80 bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"><CardHeader><div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon /></div><CardTitle>{service.title}</CardTitle><CardDescription className="leading-7">{service.summary}</CardDescription></CardHeader><CardContent><p className="inline-flex items-center text-sm font-black text-primary">View service details <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" /></p></CardContent></Card></AppLink>; })}</div></div></section>; }
function Showcase() { return <section className="bg-muted/40 px-6 py-20"><div className="container"><SectionIntro badge="Material and style showcase" title="Exterior buyers need to see the finished look before they commit." body="Use these finish categories to compare siding texture, trim contrast, gutter color, window frames, and accent choices before the exterior package is finalized." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{styleShowcase.map((item) => <div key={item.name} className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm"><div className={`h-32 ${item.color}`} /><div className="p-5"><h3 className="text-xl font-black">{item.name}</h3><p className="mt-3 leading-7 text-muted-foreground">{item.copy}</p></div></div>)}</div></div></section>; }
function Trust() { const items = ["Licensing and insurance reviewed during estimate", "Manufacturer options reviewed before materials are ordered", "Workmanship details explained before approval", "Storm damage documentation", "Material selection guidance", "Clean jobsite and final walk-through"]; return <section className="px-6 py-20"><div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><SectionIntro badge="Trust and workmanship" title="Built around the details homeowners worry about." body="Exterior envelope work has a longer decision cycle than a one-day repair. Homeowners compare materials, colors, warranties, photos, and whether one contractor can coordinate the full outside package." /><div className="grid gap-4 sm:grid-cols-2">{items.map((item) => <div key={item} className="rounded-2xl border border-border bg-card p-5"><ShieldCheck className="mb-3 h-6 w-6 text-primary" /><h3 className="font-black">{item}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">We explain the exact scope, materials, documentation, and warranty details before work is approved.</p></div>)}</div></div></section>; }
function Insurance() { return <section className="px-6 py-20"><div className="container rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-xl sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center"><div><Badge className="mb-4 bg-white/15 text-white">Storm and insurance work</Badge><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Siding, gutters, windows, doors, soffit, and fascia can all be part of one storm claim.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">When wind or hail hits the exterior, damage may not stop at one trade. The site gives homeowners a clear path to request documentation, material matching, and repair scope guidance.</p></div><div className="grid gap-3">{["Damage photo documentation", "Insurance-scope review", "Material and color matching", "Full exterior repair planning"].map((item) => <div key={item} className="rounded-2xl bg-white/12 p-4 font-bold"><FileCheck2 className="mr-2 inline h-5 w-5" />{item}</div>)}</div></div></div></section>; }
function Gallery() { return <section className="bg-muted/40 px-6 py-20"><div className="container"><SectionIntro badge="Gallery" title="Exterior examples for siding, gutters, windows, and doors." body="These examples help homeowners compare materials, colors, drainage details, entry upgrades, and trim choices before they request an estimate." /><BeforeAfterComparison /></div></section>; }
function Reviews() { return <section className="px-6 py-20"><div className="container"><SectionIntro badge="Homeowner feedback" title="Homeowner feedback for exterior decisions." body="Homeowners use reviews to understand communication, cleanliness, material guidance, and confidence before scheduling an exterior estimate." /><div className="grid gap-5 md:grid-cols-3">{["Clear material choices and a clean final look.", "They helped us understand the storm damage scope.", "The siding, gutters, and trim finally look like one package."].map((quote) => <Card key={quote}><CardHeader><Star className="h-6 w-6 fill-primary text-primary" /><CardTitle className="text-xl">Homeowner review</CardTitle><CardDescription className="leading-7">“{quote}”</CardDescription></CardHeader></Card>)}</div></div></section>; }
function CTA() { return <section className="px-6 py-20"><div className="container rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><Badge className="mb-4">Next step</Badge><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Ready to plan the outside of your home?</h2><p className="mt-4 max-w-3xl leading-8 text-muted-foreground">Call or request a free exterior estimate for siding, gutters, windows, doors, soffit, fascia, wraps, trim, or storm restoration.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><AppLink href={business.phoneHref}><Button size="lg" variant="outline" className="h-14 w-full font-black"><Phone className="mr-2 h-5 w-5" />{business.phone}</Button></AppLink><AppLink href="/contact"><Button size="lg" className="h-14 w-full font-black">Request Estimate</Button></AppLink></div></div></div></section>; }
function HomePage() { return <><Hero eyebrow="Siding • Gutters • Windows • Doors" title="Siding, Gutters, Windows & Doors — One Team for Your Home's Exterior." body="Prairie Exterior Co. handles the full outside package: siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration planned as one clean exterior system." /><ServiceGrid /><LeadFlowLineSection /><LeadLeakAudit /><Showcase /><Trust /><Insurance /><BeforeAfterComparison /><Reviews /><ServiceAreaSummary /><CTA /></>; }
function ServicesPage() { return <><Hero eyebrow="Full exterior bundle" title="Exterior services planned as one coordinated package." body="Homeowners often start with siding and discover gutters, trim, windows, doors, or storm repairs should be handled at the same time. The full bundle is organized so each part of the exterior works with the next." /><ServiceGrid /><Insurance /><CTA /></>; }
function ServicePage({ slug }: { slug: string }) { const service = services.find((item) => item.slug === slug) || services[0]; const Icon = service.icon; return <><Hero eyebrow="Exterior service" title={service.title} body={service.summary} /><section className="px-6 py-20"><div className="container grid gap-10 lg:grid-cols-[0.75fr_1.25fr]"><div className="rounded-[2rem] border border-border bg-card p-7"><Icon className="mb-5 h-10 w-10 text-primary" /><h2 className="text-3xl font-black">What can be included</h2><ul className="mt-6 space-y-3">{service.details.map((item) => <li key={item} className="flex gap-3 leading-7"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />{item}</li>)}</ul></div><div><h2 className="text-4xl font-black">Planning notes for homeowners</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{service.homeowner}</p><p className="mt-5 text-lg leading-8 text-muted-foreground">Homeowners can compare this specific service with the broader exterior package, including nearby siding, gutter, window, door, soffit, fascia, trim, and storm-restoration needs. Manufacturer lines, warranty details, service-area notes, and project photos should match the contractor completing the work.</p><AppLink href="/contact"><Button size="lg" className="mt-8 font-black">Request a {service.title} estimate</Button></AppLink></div></div></section><Showcase /><CTA /></>; }
function ServiceAreaSummary() { return <section className="px-6 py-20"><div className="container"><SectionIntro badge="Service area" title="Exterior help for Southeast Kansas and nearby communities." body="The service area information helps homeowners understand where exterior estimates are available and which siding, gutter, window, door, soffit, fascia, and storm needs are commonly reviewed." /><div className="grid gap-5 md:grid-cols-3">{serviceAreas.map((area) => <AppLink key={area.slug} href={`/service-areas/${area.slug}`} className="block"><Card className="h-full transition hover:-translate-y-1 hover:border-primary/40"><CardHeader><MapPinned className="h-6 w-6 text-primary" /><CardTitle>{area.name}</CardTitle><CardDescription className="leading-7">{area.copy}</CardDescription></CardHeader></Card></AppLink>)}</div></div></section>; }
function ServiceAreasPage() { return <><Hero eyebrow="Service Areas" title="Exterior envelope service for {city} and nearby communities." body="Homeowners can request local help with siding, gutters, windows, doors, soffit, fascia, wraps, trim, and storm restoration from one exterior team." /><ServiceAreaSummary /><CTA /></>; }
function CityPage({ slug }: { slug: string }) { const area = serviceAreas.find((item) => item.slug === slug) || serviceAreas[0]; return <><Hero eyebrow="Local exterior contractor" title={`${area.name} siding, gutters, windows, doors, and storm restoration.`} body={area.copy} /><section className="px-6 py-20"><div className="container grid gap-8 lg:grid-cols-2"><div><h2 className="text-4xl font-black">Local exterior planning</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Homes in {area.name} may need different priorities depending on age, exposure, drainage, HOA style expectations, and previous storm damage. This page gives homeowners one place to request siding, gutter, window, door, soffit, fascia, and trim help without guessing which trade to call first.</p></div><Card><CardHeader><CardTitle>Common exterior requests in {area.name}</CardTitle><CardDescription className="leading-7">Whole-home siding updates, seamless gutters, window replacement, entry doors, soffit and fascia repair, trim wraps, and insurance restoration documentation.</CardDescription></CardHeader></Card></div></section><ServiceGrid /><CTA /></>; }
function ProcessPage() { return <><Hero eyebrow="Process" title="A clear path from exterior review to finished curb appeal." body="Exterior envelope projects involve more choices than a single repair. The process helps homeowners compare materials, understand scope, and coordinate the full outside package." /><section className="px-6 py-20"><div className="container grid gap-5 md:grid-cols-2 xl:grid-cols-5">{process.map(([num, title, body]) => <Card key={num}><CardHeader><p className="text-4xl font-black text-primary">{num}</p><CardTitle>{title}</CardTitle><CardDescription className="leading-7">{body}</CardDescription></CardHeader></Card>)}</div></section><CTA /></>; }
function AboutPage() { return <><Hero eyebrow="About" title="A contractor focused on the outside of the house." body={`${business.name} focuses on coordinated exterior envelope work: siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration planned around the home as a whole.`} /><Trust /><Reviews /><CTA /></>; }
function GalleryPage() { return <><Hero eyebrow="Gallery" title="Before-and-after exterior transformations." body="Exterior envelope work is visual. Homeowners can use these examples to compare finished siding, gutters, windows, doors, and trim combinations." /><Gallery /><Showcase /><CTA /></>; }
function ReviewsPage() { return <><Hero eyebrow="Reviews" title="Homeowner feedback for exterior projects." body="Homeowners often want to know how material choices, communication, storm documentation, and cleanup felt from the customer side." /><Reviews /><CTA /></>; }
function ProjectsPage() { return <><Hero eyebrow="Projects" title="Exterior project examples organized by homeowner goal." body="Review sample siding refreshes, gutter corrections, window packages, door upgrades, and storm restoration scopes before choosing the next step." /><BeforeAfterComparison /><Showcase /><CTA /></>; }
function FaqPage() { const faqs = [["Can siding and gutters be estimated together?", "Yes. Reviewing siding, gutters, trim, and drainage together prevents rework and gives the homeowner a cleaner scope."], ["What should I send before the visit?", "Photos of worn siding, overflowing gutters, damaged trim, drafty windows, door issues, and storm marks help the estimator prepare."], ["Can the site support insurance restoration requests?", "Yes. The request form includes storm and insurance options so damage documentation can be reviewed with the exterior scope."], ["Is this for a real exterior company?", "The site structure is ready for a real exterior company to connect verified credentials, service territory, warranty terms, and project photography before launch."]]; return <><Hero eyebrow="FAQ" title="Common questions before an exterior estimate." body="Homeowners need clear answers before booking siding, gutter, window, door, soffit, fascia, trim, or storm restoration work." visual={false} /><section className="px-6 py-20"><div className="container grid gap-5 md:grid-cols-2">{faqs.map(([q, a]) => <Card key={q}><CardHeader><CardTitle>{q}</CardTitle><CardDescription className="leading-7">{a}</CardDescription></CardHeader></Card>)}</div></section><CTA /></>; }
function ContactPage() { const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle"); const projectTypes = ["Siding", "Gutters", "Windows", "Doors", "Soffit/Fascia", "Wraps/Trim", "Insurance claim", "Multiple services"]; async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setStatus("sending"); const form = event.currentTarget; const data = new FormData(form); const selected = projectTypes.filter((item) => data.get(item)); const payload = Object.fromEntries(data.entries()); if (!payload.name || !payload.phone || !payload.description) { setStatus("error"); return; } try { const res = await fetch("/api/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, projectTypes: selected, source: "exterior-envelope-demo" }) }); if (!res.ok) throw new Error("Request failed"); setStatus("success"); form.reset(); } catch { setStatus("error"); } }
  return <><Hero eyebrow="Request estimate" title="Tell us what part of the exterior needs attention." body="Use the checkboxes to flag siding, gutters, windows, doors, storm damage, or a multi-service exterior overhaul so the contractor knows what they are walking into." visual={false} /><section className="px-6 pb-20"><div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-[2rem] border border-border bg-card p-7"><h2 className="text-3xl font-black">Contact details</h2><div className="mt-6 grid gap-4 text-muted-foreground"><p><Phone className="mr-2 inline h-5 w-5 text-primary" /> <a href={business.phoneHref}>{business.phone}</a></p><p>{business.email}</p><p>{business.address}</p><p className="leading-7">Estimate requests are prepared with the project details needed for follow-up. Call if the request is urgent.</p></div></div><form noValidate onSubmit={submit} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="grid gap-5"><div className="grid gap-4 md:grid-cols-2"><Field label="Name"><Input name="name" required /></Field><Field label="Phone"><Input name="phone" required /></Field></div><div className="grid gap-4 md:grid-cols-2"><Field label="Email"><Input name="email" type="email" /></Field><Field label="Best time to contact"><Input name="bestTime" placeholder="Morning, afternoon, evening" /></Field></div><Field label="Project type"><div className="grid gap-3 sm:grid-cols-2">{projectTypes.map((item) => <label key={item} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-bold"><Checkbox name={item} value={item} />{item}</label>)}</div></Field><Field label="Brief project description"><Textarea name="description" required placeholder="Tell us what you want replaced, repaired, matched, or reviewed after a storm." className="min-h-32" /></Field><Button disabled={status === "sending"} size="lg" className="h-14 font-black">{status === "sending" ? "Sending..." : "Send Estimate Request"}</Button>{status === "success" && <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 font-bold text-emerald-800">Request received. The exterior team can follow up by phone or email.</p>}{status === "error" && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-800">The request could not be sent. Please call {business.phone}.</p>}</div></form></div></section></>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="grid gap-2"><Label className="font-black">{label}</Label>{children}</div>; }
function PrivacyPage() { return <Legal title="Privacy Policy" body="This contact form collects name, phone, email, project type, best contact time, and project description so the exterior contractor can respond to estimate requests." />; }
function TermsPage() { return <Legal title="Terms and Accessibility" body="This website provides general exterior service information and estimate-request functionality. Final service terms, warranty language, credentials, pricing, and accessibility contact details are confirmed during the estimate process." />; }
function Legal({ title, body }: { title: string; body: string }) { return <><Hero eyebrow="Site information" title={title} body={body} visual={false} /><section className="px-6 py-20"><div className="container prose max-w-3xl"><h2>Website policy details</h2><p>{body}</p><p>Policy details are kept clear so homeowners understand how estimate requests and service information are handled.</p></div></section></>; }
function NotFound() { return <Hero eyebrow="404" title="Page not found." body="Use the navigation to return to the exterior envelope demo site." visual={false} />; }
function RoutedServicePage({ params }: { params: { slug: string } }) { return <ServicePage slug={params.slug} />; }
function RoutedCityPage({ params }: { params: { slug: string } }) { return <CityPage slug={params.slug} />; }
export default function App() { return <Shell><Switch><Route path="/" component={HomePage} /><Route path="/services" component={ServicesPage} /><Route path="/services/:slug" component={RoutedServicePage} /><Route path="/service-areas" component={ServiceAreasPage} /><Route path="/service-areas/:slug" component={RoutedCityPage} /><Route path="/process" component={ProcessPage} /><Route path="/projects" component={ProjectsPage} /><Route path="/about" component={AboutPage} /><Route path="/gallery" component={GalleryPage} /><Route path="/reviews" component={ReviewsPage} /><Route path="/faq" component={FaqPage} /><Route path="/contact" component={ContactPage} /><Route path="/privacy" component={PrivacyPage} /><Route path="/terms" component={TermsPage} /><Route component={NotFound} /></Switch></Shell>; }
