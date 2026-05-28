import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist", "public");
const templatePath = join(dist, "index.html");
const appPath = join(root, "client", "src", "App.tsx");
const pagesDir = join(root, "client", "src", "pages");
const siteConfigPath = join(root, "client", "src", "site.config.ts");
const siteUrl = (process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "").replace(new RegExp("^https?://"), "").replace(new RegExp("/$"), "");
const baseUrl = siteUrl ? `https://${siteUrl}` : "";
const projectTitle = "Exterior Envelope Pros";
const generatedAt = new Date().toISOString();
const siteConfig = readSiteConfig();

if (!existsSync(templatePath)) {
  console.warn("Jeriko SEO prerender skipped: dist/public/index.html not found");
  process.exit(0);
}

const template = readFileSync(templatePath, "utf8");
const projectState = readProjectState();
const routes = discoverRoutes();

for (const route of routes) {
  const html = renderRoute(route);
  const outDir = route.path === "/" ? dist : join(dist, route.path.startsWith("/") ? route.path.slice(1) : route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
}

writeFileSync(join(dist, "robots.txt"), renderRobots());
writeFileSync(join(dist, "sitemap.xml"), renderSitemap());
writeFileSync(join(dist, "llms.txt"), renderLlmsTxt());

console.log(`Jeriko SEO prerendered ${routes.length} route(s) into ${dist}`);

function discoverRoutes() {
  const app = existsSync(appPath) ? readFileSync(appPath, "utf8") : "";
  const imports = new Map();
  for (const match of app.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+["'](?:@\/pages|\.\/pages)\/([^"']+)["']/g)) {
    imports.set(match[1], match[2]);
  }

  const routes = [];
  for (const match of app.matchAll(/<Route\s+([^>]*?)\/>|<Route\s+([^>]*?)>/g)) {
    const attrs = match[1] || match[2] || "";
    const pathMatch = attrs.match(/path=\{?["']([^"'}]+)["']\}?/);
    const componentMatch = attrs.match(/component=\{?([A-Za-z0-9_]+)\}?/);
    if (!pathMatch || !componentMatch) continue;
    const path = pathMatch[1];
    if (!path || path === "/404" || path.includes(":")) continue;
    routes.push({ path, component: componentMatch[1], source: imports.get(componentMatch[1]) || componentMatch[1] });
  }

  for (const route of projectStateRoutes()) {
    routes.push({ path: route.path, component: route.title || routeLabel(route.path), source: route.title || routeLabel(route.path) });
  }
  if (!routes.some((route) => route.path === "/")) routes.unshift({ path: "/", component: "Home", source: "Home" });
  return uniqueRoutes(routes);
}

function readProjectState() {
  const statePath = join(root, ".jeriko", "project-state.json");
  if (!existsSync(statePath)) return null;
  try { return JSON.parse(readFileSync(statePath, "utf8")); } catch { return null; }
}

function projectStateRoutes() {
  const pages = projectState?.appSpec?.pages;
  if (!Array.isArray(pages)) return [];
  return pages.map((page) => typeof page === "string" ? { path: page, title: routeLabel(page) } : { path: page.path, title: page.title }).filter((page) => typeof page.path === "string" && page.path.startsWith("/"));
}

function uniqueRoutes(routes) {
  const seen = new Set();
  return routes.filter((route) => {
    if (seen.has(route.path)) return false;
    seen.add(route.path);
    return true;
  });
}

function renderRoute(route) {
  const content = extractPageContent(route);
  const title = pageTitleFor(route, content);
  const description = content.paragraphs.slice(0, 2).join(" ").slice(0, 300) || `${projectTitle} page for ${route.path}`;
  const canonical = baseUrl ? `${baseUrl}${route.path === "/" ? "" : route.path}` : route.path;
  const nav = routes.map((item) => `<a href="${escapeAttr(item.path)}">${escapeHtml(item.path === "/" ? "Home" : routeLabel(item.path))}</a>`).join(" | ");
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: title,
    url: canonical,
    description,
    isPartOf: { "@type": "WebSite", name: projectTitle, url: baseUrl || "/" },
    ...(siteConfig.seoProfile === "local-service" ? {
      serviceArea: route.path === "/" ? "Primary local service area" : routeLabel(route.path),
      areaServed: routeLabel(route.path),
      makesOffer: { "@type": "Offer", itemOffered: { "@type": "Service", name: content.heading } },
      mainEntity: { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How do I get started?", acceptedAnswer: { "@type": "Answer", text: description } }] },
    } : {}),
  }).replaceAll("<", "\\u003c");

  const fallback = `
    <div id="root">
      <noscript>Prairie Exterior Co. includes core exterior service information without JavaScript. JavaScript enhances the full estimate request experience.</noscript>
      <nav aria-label="Primary" data-jeriko-prerender="true">${nav}</nav>
      <article data-jeriko-prerender="true">
        <h1>${escapeHtml(content.heading)}</h1>
        ${content.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n        ")}
      </article>
    </div>`;

  return addLaunchTrackingHooks(injectHead(template, { title, description, canonical, jsonLd })
    .replace(/<div id="root"><\/div>/, fallback)
    .replace(/<html lang="en">/, `<html lang="en" data-jeriko-seo-generated-at="${escapeAttr(generatedAt)}">`));
}

function addLaunchTrackingHooks(html) {
  return html
    .replace(/<form\b(?![^>]*\bdata-jeriko-track=)([^>]*)>/gi, '<form data-jeriko-track="form_submit"$1>')
    .replace(/<a\b(?![^>]*\bdata-jeriko-track=)([^>]*\bhref=["']tel:[^"']*["'][^>]*)>/gi, '<a$1 data-jeriko-track="call_click">')
    .replace(/<a\b(?![^>]*\bdata-jeriko-track=)([^>]*\bhref=["']mailto:[^"']*["'][^>]*)>/gi, '<a$1 data-jeriko-track="email_click">')
    .replace(/<a\b(?![^>]*\bdata-jeriko-track=)([^>]*\bhref=["'][^"']*(?:book|booking|schedule|appointment|calendar)[^"']*["'][^>]*)>/gi, '<a$1 data-jeriko-track="booking_click">');
}

function injectHead(html, page) {
  const head = `
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <link rel="canonical" href="${escapeAttr(page.canonical)}" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:url" content="${escapeAttr(page.canonical)}" />
    <meta property="og:image" content="${escapeAttr(baseUrl ? `${baseUrl}/og.svg` : `/og.svg`)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(projectTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="robots" content="index,follow" />
    ${renderVerificationMeta()}
    ${renderAnalyticsScripts()}
    <script type="application/ld+json">${page.jsonLd}</script>`;

  return html
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta name="description"[^>]*>\s*/i, "")
    .replace(/<meta property="og:[^>]+>\s*/gi, "")
    .replace(/<meta name="robots"[^>]*>\s*/i, "")
    .replace(/<link rel="canonical"[^>]*>\s*/i, "")
    .replace(/<\/head>/i, `${head}\n  </head>`);
}

function readSiteConfig() {
  const source = existsSync(siteConfigPath) ? readFileSync(siteConfigPath, "utf8") : "";
  const fromEnv = (name) => process.env[name] || "";
  return {
    analyticsProvider: fromEnv("VITE_ANALYTICS_PROVIDER") || literalConfigValue(source, "analyticsProvider") || "none",
    seoProfile: literalConfigValue(source, "seoProfile") || "standard",
    ga4MeasurementId: fromEnv("VITE_GA4_MEASUREMENT_ID") || literalConfigValue(source, "ga4MeasurementId") || "",
    plausibleDomain: fromEnv("VITE_PLAUSIBLE_DOMAIN") || literalConfigValue(source, "plausibleDomain") || "",
    googleSiteVerification: fromEnv("VITE_GOOGLE_SITE_VERIFICATION") || literalConfigValue(source, "googleSiteVerification") || "",
    bingSiteVerification: fromEnv("VITE_BING_SITE_VERIFICATION") || literalConfigValue(source, "bingSiteVerification") || "",
  };
}

function literalConfigValue(source, key) {
  const match = source.match(new RegExp(key + "\\s*:\\s*[\"']([^\"']*)[\"']"));
  return match?.[1] || "";
}

function renderVerificationMeta() {
  const tags = [];
  if (siteConfig.googleSiteVerification) tags.push(`<meta name="google-site-verification" content="${escapeAttr(siteConfig.googleSiteVerification)}" />`);
  if (siteConfig.bingSiteVerification) tags.push(`<meta name="msvalidate.01" content="${escapeAttr(siteConfig.bingSiteVerification)}" />`);
  return tags.join("\n    ");
}

function renderAnalyticsScripts() {
  const provider = String(siteConfig.analyticsProvider || "none").toLowerCase();
  if (provider === "ga4" && siteConfig.ga4MeasurementId) {
    const id = escapeAttr(siteConfig.ga4MeasurementId);
    return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`;
  }
  if (provider === "plausible" && siteConfig.plausibleDomain) {
    return `<script defer data-domain="${escapeAttr(siteConfig.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>`;
  }
  return "";
}

function extractPageContent(route) {
  const planned = plannedRouteContent(route.path);
  if (planned) return planned;
  const heading = routeLabel(route.path) || projectTitle;
  return { heading, paragraphs: [`${heading} helps homeowners compare siding, gutters, windows, doors, soffit, fascia, wraps, trim, storm documentation, material choices, preparation, installation sequencing, cleanup, and final walk-through expectations before they request an exterior estimate.`, `Prairie Exterior Co. gives homeowners clear exterior information so they understand what can be reviewed, what details should be prepared, and how siding, gutters, windows, doors, soffit, fascia, and trim connect.`, `The information stays practical so homeowners can request an exterior estimate with confidence.`] };
}

function plannedRouteContent(path) {
  const label = routeLabel(path);
  const serviceName = label.replace(/Services\s+/i, "");
  const cityName = label.replace(/Service Areas\s+/i, "");
  const base = {
    "/": ["One exterior plan. No mismatched pieces.", "Prairie Exterior Co. handles siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration as one coordinated outside package for homeowners who do not want a pieced-together exterior.", "The first visit can cover material comparison, storm documentation, finished curb appeal, drainage, trim details, and the right order of work. Homeowners can understand what may be included, how the visit works, what choices will be discussed, and how the finished package should protect the home while improving its appearance.", "Prairie Exterior Co. keeps the process straightforward: review the exterior, compare options, explain the scope, and give the homeowner a clear next step."],
    "/services": ["Exterior Envelope Services", "Homeowners can review siding, gutters, windows, exterior doors, soffit, fascia, wraps, trim, and storm restoration as connected exterior systems. Each service affects neighboring materials, so the estimate explains how water shedding, flashing, trim details, ventilation, and finished appearance work together during planning.", "The service information helps a homeowner move from a visible problem to the right scope. Faded siding, overflowing gutters, drafty windows, damaged doors, rotten fascia, poor trim details, and hail impact can be discussed during one exterior review. That reduces missed items and gives the estimator better context before materials are selected.", "Every service stays focused on homeowner questions: material options, preparation, documentation, and installation sequencing."],
    "/service-areas": ["Local Exterior Service Areas", "Prairie Exterior Co. serves homeowners in nearby communities who need siding, gutters, windows, doors, soffit, fascia, trim, or storm restoration reviewed together. Homeowners can compare how age of housing, wind exposure, drainage patterns, neighborhood style, and storm history affect siding, gutters, windows, doors, soffit, fascia, and trim decisions.", "Each area can have different exterior needs based on home age, wind exposure, drainage, neighborhood style, and storm history. The estimate focuses on what the home actually needs, not a one-size-fits-all package.", "The goal is practical local clarity, not keyword stuffing. A homeowner should know whether the company handles their exterior project and what to prepare before requesting an estimate."],
    "/process": ["Exterior Review to Finished Walk-Through", "The process starts with an exterior review that looks at siding condition, gutter performance, window and door openings, soffit ventilation, fascia edges, trim wraps, and storm damage indicators. A complete review helps prevent surprises after tear-off begins and gives the homeowner a clearer proposal.", "Material and style planning follows the inspection. The homeowner compares siding profiles, color combinations, gutter size, downspout routing, window style, door options, and trim details. The proposal then organizes required work, optional upgrades, insurance documentation, installation sequence, cleanup, and warranty paperwork.", "The final walk-through confirms the finished exterior package, reviews care notes, documents completed work, and gives the homeowner a clean handoff."],
    "/projects": ["Exterior Project Examples", "Project examples show how a worn or mismatched exterior can become a coordinated siding, gutter, window, door, and trim package. A homeowner can compare whole-home siding refreshes, gutter and fascia corrections, replacement window packages, entry door updates, and storm repair scopes before requesting an estimate.", "Each example explains the starting condition, the exterior systems involved, and the outcome a homeowner can discuss with the estimator.", "Good project proof helps homeowners understand finish quality, cleanup expectations, and whether the company can coordinate several exterior trades together."],
    "/about": ["About Prairie Exterior Co.", "Prairie Exterior Co. focuses on the outside of the home: siding, gutters, windows, doors, soffit, fascia, wraps, trim, and storm restoration planned as one coordinated system instead of isolated repairs.", "Homeowners can expect practical exterior planning, clear scope discussion, material comparison, storm documentation when needed, and a final walk-through before the project is complete.", "Homeowners should leave the about section understanding the contractor's focus, how exterior decisions are handled, and why a full-scope review can produce a better finished result."],
    "/gallery": ["Exterior Gallery and Finish Ideas", "The gallery helps homeowners compare siding profiles, trim contrast, gutter colors, window frames, door upgrades, and before-and-after transformations. Exterior work is visual, so the site gives visitors a structured way to think about curb appeal, water control, maintenance, and finish consistency before they request an estimate.", "The examples help a homeowner decide whether they want fiber cement, vinyl, engineered wood, board-and-batten accents, dark gutters, wrapped trim, or updated entry details.", "The gallery keeps the focus on curb appeal, water control, maintenance, and finish consistency."],
    "/reviews": ["Homeowner Feedback", "Homeowner feedback should help future customers understand communication, cleanliness, material guidance, documentation, and follow-through during exterior projects. Exterior work involves visible decisions and weather-sensitive details, so reviews should speak to how the contractor explained options and protected the property.", "Reviews should help homeowners understand communication, cleanliness, material guidance, and follow-through.", "Useful feedback can describe siding color decisions, gutter drainage improvements, window comfort, door weatherstripping, storm documentation, jobsite cleanup, and the final walk-through."],
    "/faq": ["Exterior Estimate Questions", "Homeowners often ask whether siding and gutters can be estimated together, what photos to send before the visit, whether storm damage can be documented, and how window or door work affects surrounding trim. The FAQ gives direct answers before the homeowner contacts the contractor.", "The answers explain that bundled exterior planning can reduce rework, that photos help the estimator prepare, and that storm or insurance concerns should be flagged early.", "A strong FAQ lowers friction for homeowners who are comparing several exterior needs at once."],
    "/contact": ["Request an Exterior Estimate", "The estimate request collects the homeowner's name, phone number, email, best contact time, project type, and project description for siding, gutters, windows, doors, soffit, fascia, wraps, trim, storm restoration, or multi-service exterior projects.", "A homeowner can also call, email, or use the address information when the exterior concern needs direct follow-up.", "The goal is to make the next step simple: describe the exterior problem and request a clear estimate."],
    "/privacy": ["Privacy Policy", "The privacy content explains that estimate requests collect contact information and project details so the exterior contractor can respond. That can include the homeowner's name, phone number, email address, preferred contact time, selected project categories, and description of siding, gutter, window, door, trim, or storm damage needs.", "Prairie Exterior Co. should keep privacy details aligned with its actual data handling, retention, notification tools, analytics, and customer follow-up process.", "Clear privacy language helps homeowners understand what information is being requested and why it matters for an exterior estimate."],
    "/terms": ["Terms and Accessibility", "The terms explain that exterior service information is general and that final pricing, scope, materials, warranty terms, and scheduling are determined after review. Siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration work can vary by home condition and local requirements.", "Accessibility language should provide a real contact method for homeowners who need help requesting an estimate or understanding exterior service information.", "The goal is clear homeowner communication without overstating service commitments or verified credentials."],
  };
  if (base[path]) return { heading: base[path][0], paragraphs: base[path].slice(1) };
  if (path.startsWith("/services/")) return { heading: `${serviceName} Planning`, paragraphs: [`${serviceName} work should be reviewed with the surrounding exterior systems so the finished home looks intentional and sheds water correctly. The estimator should look at adjacent trim, flashing, drainage, fasteners, openings, and material transitions before recommending a repair or replacement path.`, `Homeowners can use this content to prepare photos, describe problem areas, compare material options, and understand what may be included in the proposal. The final scope should explain preparation, installation sequence, cleanup, optional upgrades, and any documentation needed for storm or insurance conversations.`, `Prairie Exterior Co. can review material options, warranty questions, project details, and service-area needs for ${serviceName.toLowerCase()} before launch.`] };
  if (path.startsWith("/service-areas/")) return { heading: `${cityName} Exterior Work`, paragraphs: [`Homeowners in ${cityName} may need siding, gutters, windows, doors, soffit, fascia, wraps, trim, or storm restoration depending on home age, exposure, drainage, and previous repairs. A local exterior review helps connect those needs into one practical plan.`, `Local exterior conditions can vary by neighborhood, home age, roofline, wind exposure, drainage, and storm history. The estimate helps homeowners understand whether the company serves their home and what kind of exterior work is commonly handled nearby.`, `Prairie Exterior Co. keeps service-area expectations clear before work is scheduled.`] };
  return null;
}

function pageTitleFor(route, content) {
  const base = route.path === "/" ? projectTitle : `${content.heading} | ${projectTitle}`;
  const trimmed = String(base || "").trim();
  return trimmed.length >= 8 ? trimmed : `${trimmed || "Home"} Exterior Services`;
}

function pushClean(list, value) {
  const cleaned = String(value)
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length >= 4) list.push(cleaned);
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function looksLikeCode(value) {
  return looksLikeCssClassList(value)
    || /^(className|function|return|import|export|const|let|var)\b/.test(value)
    || /\b(import|export|const|let|var)\s+[A-Za-z_$][\w$]*\b/.test(value)
    || /;\s*import\s+from\b/.test(value)
    || /^\/?(?:images|assets)\//.test(value)
    || /\.(?:png|jpe?g|webp|svg|gif)\b/i.test(value)
    || /^(tel:|mailto:|https?:)/i.test(value)
    || /(^[,;:]|["'],|:\s*$)/.test(value)
    || /[{}<>]=?|=>|\.tsx|@\//.test(value)
    || value.includes("--")
    || value.length > 500;
}

function looksLikeCssClassList(value) {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  const classLike = parts.filter((part) => /^(?:[a-z]+:)*-?[a-z][a-z0-9]*(?:-[a-z0-9/[\].()#%]+|\[[^\]]+\]|\/\d+)+$/i.test(part)).length;
  return classLike >= Math.max(2, Math.ceil(parts.length * 0.6));
}

function routeLabel(path) {
  if (path === "/") return "Home";
  return path.replace(/^\//, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderRobots() {
  return `User-agent: Googlebot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: *
Allow: /

${baseUrl ? `Sitemap: ${baseUrl}/sitemap.xml\n` : ""}`;
}

function renderSitemap() {
  const loc = (path) => baseUrl ? `${baseUrl}${path === "/" ? "" : path}` : path;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${escapeHtml(loc(route.path))}</loc><lastmod>${generatedAt.slice(0, 10)}</lastmod><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>
`;
}

function renderLlmsTxt() {
  return `# ${projectTitle}

Public exterior service information for homeowners comparing siding, gutters, windows, doors, soffit, fascia, trim, and storm restoration.

## Exterior service links

${routes.map((route) => `- ${routeLabel(route.path)}: ${baseUrl ? `${baseUrl}${route.path === "/" ? "" : route.path}` : route.path}`).join("\n")}

## Public information

Homeowners can review exterior services, service areas, process details, project examples, contact options, privacy terms, and accessibility information.
`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
