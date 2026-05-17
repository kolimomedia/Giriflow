export const site = {
  name: "GiriFlow",
  domain: "giriflow.com",
  url: "https://giriflow.com",
  tagline: "Plan your social, together.",
  description:
    "GiriFlow is the social media planner for teams, agencies, and solo creators. Draft the week, review the month, and ship the year — with clients and teammates in the loop.",
  family: {
    label: "Part of the Giri family",
    siblings: [
      { name: "GiriBooks", url: "https://giribooks.com", note: "Business solutions for creatives" },
    ],
  },
  social: {
    instagram: "https://instagram.com/giriflow",
    x: "https://x.com/giriflow",
    linkedin: "https://linkedin.com/company/giriflow",
  },
  contact: {
    email: "hello@giriflow.com",
  },
} as const;

export const nav = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Collaboration", href: "/#collaboration" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const channels = [
  { id: "instagram", name: "Instagram", color: "var(--c-instagram)" },
  { id: "tiktok", name: "TikTok", color: "var(--c-tiktok)" },
  { id: "linkedin", name: "LinkedIn", color: "var(--c-linkedin)" },
  { id: "youtube", name: "YouTube", color: "var(--c-youtube)" },
  { id: "x", name: "X", color: "var(--c-x)" },
  { id: "facebook", name: "Facebook", color: "var(--c-facebook)" },
] as const;

export type Channel = (typeof channels)[number];

export const features = [
  {
    title: "Four-zoom calendar",
    body: "Switch between day, week, month and year without losing your place. The same plan, four lenses.",
    icon: "calendar",
  },
  {
    title: "Drag, drop, done",
    body: "Move a post from Wednesday to Friday with a flick. Reschedule a whole campaign in one motion.",
    icon: "drag",
  },
  {
    title: "Every channel, one plan",
    body: "Instagram, TikTok, LinkedIn, YouTube, X, Facebook — colour-coded and never confused.",
    icon: "channels",
  },
  {
    title: "Approvals built-in",
    body: "Clients comment, suggest, and approve right on the post. No screenshots in WhatsApp, ever.",
    icon: "approve",
  },
  {
    title: "Guest-safe share links",
    body: "Send a read-only link to a client. They see the plan; they don't see your other accounts.",
    icon: "link",
  },
  {
    title: "Export the month as PDF",
    body: "A printable, brand-clean calendar your client can sign off on — one click, no design work.",
    icon: "pdf",
  },
] as const;

export const useCases = [
  {
    audience: "Agencies",
    headline: "Run twenty clients without losing the plot.",
    points: [
      "A workspace per client, kept fully separate",
      "Internal review → client review → schedule",
      "Time-zoned so a Lagos post hits at noon Lagos, not noon for you",
    ],
  },
  {
    audience: "In-house teams",
    headline: "Marketing, design, and exec — finally on the same page.",
    points: [
      "Roles for editors, reviewers, and viewers",
      "Threaded comments on every post",
      "Version history so nothing is lost in a 'final-final.png' loop",
    ],
  },
  {
    audience: "Solo creators",
    headline: "Plan a quarter on Sunday. Forget it on Monday.",
    points: [
      "Idea inbox for half-formed thoughts",
      "Recurring slots for series ('Monday tips', 'Friday reel')",
      "PDF export to share with a coach, manager or sponsor",
    ],
  },
] as const;

export const steps = [
  {
    n: "01",
    title: "Drop your channels in",
    body: "Connect Instagram, TikTok, LinkedIn, YouTube, X and Facebook — or work brand-only and post yourself.",
  },
  {
    n: "02",
    title: "Build the plan",
    body: "Use templates for product launches, content series and seasonal pushes. Or start from a blank week.",
  },
  {
    n: "03",
    title: "Invite the people who matter",
    body: "Teammates as editors, clients as viewers, freelancers as guests. Permissions are obvious, not clever.",
  },
  {
    n: "04",
    title: "Ship and report",
    body: "Schedule, export, or hand off. See what's coming next week at a glance.",
  },
] as const;

export const faqs = [
  {
    q: "Is GiriFlow a scheduler or just a planner?",
    a: "Both. You can plan-only and hand off to your team to post, or connect your accounts and schedule directly from GiriFlow.",
  },
  {
    q: "Can clients leave comments without an account?",
    a: "Yes. Share-links open in a guest view where clients can comment, approve or request changes — no sign-up required.",
  },
  {
    q: "What does the PDF export look like?",
    a: "A clean, branded calendar — one page per week or month — with captions, channel tags, scheduled times and any approval status. Print-ready.",
  },
  {
    q: "Do you support multiple time zones?",
    a: "Every post has its own publish time zone. Your week always shows in yours; the post fires in the audience's.",
  },
  {
    q: "How is this different from a spreadsheet?",
    a: "Spreadsheets show rows; calendars show rhythm. GiriFlow shows the cadence of your brand — and lets two people work on it at once without overwriting each other.",
  },
  {
    q: "What about my GiriBooks account?",
    a: "Same family, same login (when both are connected). Invoices in GiriBooks, content in GiriFlow.",
  },
] as const;

export const pricingTiers = [
  {
    name: "Solo",
    price: "$0",
    cadence: "free, forever",
    summary: "For one person planning their own social.",
    features: [
      "1 workspace, 1 user",
      "Up to 3 channels",
      "Day, week, month views",
      "PDF export (watermarked)",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Studio",
    price: "$19",
    cadence: "per editor / month",
    summary: "For small teams and freelancers with clients.",
    features: [
      "Unlimited workspaces",
      "Unlimited channels",
      "Year view + recurring slots",
      "Guest share-links with comments",
      "Branded PDF export",
      "Role-based permissions",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: "Let's talk",
    cadence: "annual",
    summary: "For agencies running 10+ clients in parallel.",
    features: [
      "Everything in Studio",
      "Client portal with your logo",
      "SAML SSO + audit log",
      "API + Zapier",
      "Dedicated CSM",
    ],
    cta: "Book a call",
    highlight: false,
  },
] as const;
