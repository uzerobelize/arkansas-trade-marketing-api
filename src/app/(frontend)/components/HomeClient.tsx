"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Calculator,
  Zap,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowRight,
  Check,
  X,
  Layers,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  Filter,
  MessageSquare,
  Menu,
  Info,
  ChevronRight,
  Award,
  PhoneCall,
  Hammer,
  Trophy,
  AlertTriangle,
  Cpu,
  Quote,
} from "lucide-react";
import { BookingModal } from "./BookingModal";
import Copyright from "./Copyright"
import SDI_Logo from "../assets/logo.png";

interface SimResult {
  status: "ACCEPTED" | "FILTERED";
  scope: string;
  val: string;
  smsText?: string;
  reason?: string;
  savings: string;
}

export interface HomePageContent {
  hero_tagline?: string | null;
  hero_headline?: string | null;
  hero_subheadline?: string | null;
  hero_cta_button_text?: string | null;
}

interface HomeClientProps {
  content?: HomePageContent | null;
}

export function HomeClient({ content }: HomeClientProps) {
  const heroTagline =
    content?.hero_tagline ||
    "Built By A Former Siding & Gutter Operator";
  const heroHeadline =
    content?.hero_headline ||
    "Stop Driving Across Little Rock For $300 Patch Jobs.";
  const heroSubheadline =
    content?.hero_subheadline ||
    "We build high-speed conversion assets and automated lead filters that dispatch $15k+ full siding and seamless gutter replacements straight to your phone in under 5 seconds.";
  const heroCtaButtonText =
    content?.hero_cta_button_text ||
    "Book Strategy Call";

  // Modal & Booking Flow State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  // 1: Intake Form, 2: Calendar & Slot, 3: Confirmation
  const [bookingStep, setBookingStep] = useState(1);

  // Calculator State
  const [jobSize, setJobSize] = useState<number>(20000);
  const [margin, setMargin] = useState<number>(15);
  const [leads, setLeads] = useState<number>(8);

  // Simulation State
  const [simType, setSimType] = useState<string>("full_siding");
  const [simPhone, setSimPhone] = useState<string>("(501) 555-0199");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Active Tab for Offer Stack
  const [selectedDeliverable, setSelectedDeliverable] = useState<number>(0);

  // Open booking modal helper
  const openModal = (step = 1) => {
    setBookingStep(step);
    setIsBookingOpen(true);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isBookingOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBookingOpen]);

  const netPerJob = jobSize * (margin / 100);
  const paybackJobs = Math.round((7500 / (netPerJob || 1)) * 10) / 10;
  const monthlyClosedJobs = Math.round(leads * 0.2 * 10) / 10;
  const monthlyNetCash = monthlyClosedJobs * netPerJob;
  const annualNetCash = Math.max(
    0,
    Math.round(monthlyNetCash * 12 - (7500 + 1500 * 12)),
  );

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      if (simType === "full_siding" || simType === "bundle") {
        setSimResult({
          status: "ACCEPTED",
          scope:
            simType === "bundle"
              ? "Siding + Seamless Gutters Package ($28,500)"
              : "Full Siding Replacement ($18,000)",
          val: simType === "bundle" ? "$28,500" : "$18,000",
          smsText: `NEW HIGH TICKET LEAD! ${simType === "bundle" ? "Full Package Siding+Gutters" : "Siding Replacement"} requested by Little Rock homeowner. Phone: ${simPhone || "(501) 555-0199"}. Tap to call back immediately.`,
          savings:
            "Estimated Profit Margin: " +
            (simType === "bundle" ? "$4,275" : "$2,700"),
        });
      } else {
        setSimResult({
          status: "FILTERED",
          scope: "Minor Vinyl Board Patch ($450)",
          val: "$450",
          reason: "Project scope under $2,000 minimum threshold",
          savings:
            "Contractor Saved: 1.5 Hours & $35 In Fuel Wasted On Low-Margin Quote Drive",
        });
      }
    }, 800);
  };

  const deliverables = [
    {
      id: "01",
      title: "High-Speed Conversion Asset",
      val: "$6,000 Value",
      desc: "Sub-second React mobile architecture optimized specifically for Little Rock rural and suburban cellular connections to maximize lead retention.",
      details: [
        "Sub-second load times",
        "Mobile-first responsive design",
        "Custom project photo galleries",
        "Local trust badges & schema",
      ],
    },
    {
      id: "02",
      title: "5-Sec Speed-To-Lead Instant SMS",
      val: "$2,000 Value",
      desc: "Direct SMS webhooks that dispatch qualified lead phone numbers to your smartphone within 5 seconds of form completion.",
      details: [
        "5-second text notifications",
        "Click-to-call integration",
        "CRM lead backup logging",
        "Automated customer auto-responder",
      ],
    },
    {
      id: "03",
      title: "Margin-Maximizer Intake Funnel",
      val: "$1,500 Value",
      desc: "Multi-step smart forms that subtly nudge homeowners toward high-margin full replacement wraps and gutter add-ons.",
      details: [
        "Automatic repair job filtering",
        "Scope estimation calculator",
        "Material preference collector",
        "Insurance claim qualification",
      ],
    },
    {
      id: "04",
      title: "Done-For-You Media Pipeline",
      val: "$3,600/yr Value",
      desc: "Send us raw job-site photos from your phone; we re-format, enhance, and publish them to build extreme hyper-local authority.",
      details: [
        "Monthly project formatting",
        "Before & After showcasing",
        "Google Profile image uploads",
        "Local neighborhood geotagging",
      ],
    },
    {
      id: "05",
      title: "Little Rock SEO & GBP Alignment",
      val: "$1,500 Value",
      desc: "Deep technical SEO targeting Pulaski County search terms along with Google Business Profile citation alignment.",
      details: [
        "Pulaski County geotargeting",
        "Google Map Pack optimization",
        "Local structured schema markup",
        "Review booster workflow",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#002D3C] font-sans antialiased selection:bg-[#F9C846] selection:text-[#002D3C]">
      {/* Top Exclusivity Bar */}
      <div className="bg-[#002D3C] text-white font-bold text-xs md:text-sm py-2.5 px-4 text-center tracking-wide shadow-md relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F96E46] animate-ping"></span>
          <span>
            LITTLE ROCK METRO EXCLUSIVITY: Capped at 1 New Trade Operator /
            Month &bull;{" "}
            <span className="underline underline-offset-2 text-[#F9C846]">
              1 Territory Slot Remaining for Next Month
            </span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#0093B3]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center text-[#F9C846] font-black text-xl shadow-md">
                <img
                  src={SDI_Logo.src}
                  alt="Company Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#002D3C] block leading-none">
                  SDI
                </span>
                <span className="text-xs font-bold text-[#0093B3] tracking-widest uppercase">
                  Workbench
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#002D3C]/80">
              <a
                href="#roi-calculator"
                className="hover:text-[#0093B3] transition-colors"
              >
                Net Profit Calculator
              </a>
              <a
                href="#case-study"
                className="hover:text-[#0093B3] transition-colors"
              >
                Case Study
              </a>
              <a
                href="#operator-story"
                className="hover:text-[#0093B3] transition-colors"
              >
                Fellow Tradesman vs Agency
              </a>
              <a
                href="#demo-simulator"
                className="hover:text-[#0093B3] transition-colors"
              >
                Intake Demo
              </a>
              <a
                href="#engine-stack"
                className="hover:text-[#0093B3] transition-colors"
              >
                Offer Stack
              </a>
              <a
                href="#guarantee"
                className="hover:text-[#0093B3] transition-colors"
              >
                Guarantee
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openModal(1)}
                className="px-5 py-2.5 rounded-xl bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Book Strategy Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-[#002D3C] hover:text-[#0093B3] p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#0093B3]/20 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a
              href="#roi-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Net Profit Calculator
            </a>
            <a
              href="#case-study"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Case Study
            </a>
            <a
              href="#operator-story"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Operator vs Agency
            </a>
            <a
              href="#demo-simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Intake Demo
            </a>
            <a
              href="#engine-stack"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Offer Stack
            </a>
            <a
              href="#guarantee"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#002D3C] hover:text-[#0093B3] font-semibold"
            >
              Guarantee
            </a>
          </div>
        )}
      </nav>

      {/* Hero Header */}
      <header className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#E8EBF7]/60 via-white to-white">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0093B3]/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#F96E46]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8EBF7] border border-[#0093B3]/30 text-[#002D3C] text-xs sm:text-sm font-bold mb-8 shadow-sm">
              <Hammer className="w-4 h-4 text-[#F96E46]" />
              <span>{heroTagline}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#002D3C] leading-[1.1] mb-8">
              {heroHeadline}
            </h1>

            <p className="text-base sm:text-xl text-[#002D3C]/80 font-medium leading-relaxed mb-10 max-w-3xl mx-auto">
              {heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={() => openModal(1)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span>{heroCtaButtonText}</span>
              </button>
              <a
                href="#roi-calculator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-[#E8EBF7]/50 text-[#002D3C] font-extrabold text-base border-2 border-[#0093B3] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5 text-[#0093B3]" />
                <span>Run Net Profit Calculator</span>
              </a>
            </div>

            {/* Proof Metric Badges */}
            <div className="pt-8 border-t border-[#0093B3]/20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
              <div className="bg-white p-5 rounded-2xl border border-[#0093B3]/25 shadow-sm">
                <div className="text-2xl font-extrabold text-[#002D3C] font-mono">
                  $7,500{" "}
                  <span className="text-xs text-[#002D3C]/60 font-sans font-normal">
                    flat build
                  </span>
                </div>
                <div className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Zero agency fluff or hidden bloat
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#0093B3]/25 shadow-sm">
                <div className="text-2xl font-extrabold text-[#0093B3] font-mono">
                  &lt; 5 Sec
                </div>
                <div className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Speed-to-lead SMS dispatches
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#0093B3]/25 shadow-sm">
                <div className="text-2xl font-extrabold text-[#F96E46] font-mono">
                  $2,000+
                </div>
                <div className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Automatic low-margin repair filter
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#0093B3]/25 shadow-sm">
                <div className="text-2xl font-extrabold text-[#002D3C] font-mono">
                  100% Risk-Free
                </div>
                <div className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Retainer frozen until 5 qualified leads
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ROI Calculator Section */}
      <section
        id="roi-calculator"
        className="py-20 bg-[#F8FAFC] border-y border-[#0093B3]/20 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-[#0093B3] font-extrabold text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0093B3]" />
              <span>Mathematical Accountability</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#002D3C] tracking-tight mb-4">
              Calculate Your Net Cash Yield
            </h2>
            <p className="text-[#002D3C]/80 text-base md:text-lg">
              We anchor our fee against{" "}
              <strong className="text-[#002D3C] bg-[#F9C846]/30 px-1.5 py-0.5 rounded">
                Net Cash Profit
              </strong>{" "}
              landing in your business account, not gross pipeline illusions. We
              only make money, when you make money. Adjust the sliders to test
              your breakeven math.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Sliders Controls */}
            <div className="lg:col-span-7 space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#0093B3]/30 shadow-lg">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-extrabold text-[#002D3C] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0093B3]" />
                    <span>Average Siding / Gutter Job Size ($)</span>
                  </label>
                  <span className="font-mono font-bold text-[#002D3C] bg-[#E8EBF7] px-3 py-1 rounded-lg border border-[#0093B3]/30 text-sm">
                    ${jobSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  value={jobSize}
                  onChange={(e) => setJobSize(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E8EBF7] rounded-lg appearance-none cursor-pointer accent-[#0093B3]"
                />
                <div className="flex justify-between text-xs text-[#002D3C]/60 mt-2 font-semibold">
                  <span>$5,000 (Gutters)</span>
                  <span>$20,000 (Vinyl/Fiber)</span>
                  <span>$50,000 (Full Wrap)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-extrabold text-[#002D3C] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#F96E46]" />
                    <span>Target Net Profit Margin (%)</span>
                  </label>
                  <span className="font-mono font-bold text-[#F96E46] bg-[#F96E46]/10 px-3 py-1 rounded-lg border border-[#F96E46]/30 text-sm">
                    {margin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E8EBF7] rounded-lg appearance-none cursor-pointer accent-[#F96E46]"
                />
                <div className="flex justify-between text-xs text-[#002D3C]/60 mt-2 font-semibold">
                  <span>5% (Tight)</span>
                  <span>15% (Industry Avg)</span>
                  <span>35% (High Margin)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-extrabold text-[#002D3C] flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#0093B3]" />
                    <span>Est. Qualified Engine Leads / Month</span>
                  </label>
                  <span className="font-mono font-bold text-[#0093B3] bg-[#0093B3]/10 px-3 py-1 rounded-lg border border-[#0093B3]/30 text-sm">
                    {leads} Leads
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={leads}
                  onChange={(e) => setLeads(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E8EBF7] rounded-lg appearance-none cursor-pointer accent-[#0093B3]"
                />
                <div className="flex justify-between text-xs text-[#002D3C]/60 mt-2 font-semibold">
                  <span>2 (Conservative)</span>
                  <span>8 (Standard)</span>
                  <span>30 (Peak Season)</span>
                </div>
              </div>

              <div className="p-4 bg-[#E8EBF7]/60 rounded-xl border border-[#0093B3]/20 text-xs text-[#002D3C]/80 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#0093B3] shrink-0 mt-0.5" />
                <span>
                  Model assumes a conservative 20% conversion rate (1 out of 5
                  qualified leads closed). Real-world contractor close rates
                  typically range from 20% to 35%.
                </span>
              </div>
            </div>

            {/* Outputs Display Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#002D3C] text-white p-8 rounded-2xl border-2 border-[#0093B3] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#F9C846] text-[#002D3C] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Net Cash Yield
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#E8EBF7]/70 font-bold block mb-1">
                      Net Cash Profit Per Closed Job
                    </span>
                    <div className="text-3xl font-black text-white font-mono">
                      ${Math.round(netPerJob).toLocaleString()}
                    </div>
                  </div>

                  <hr className="border-[#0093B3]/30" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-[#E8EBF7]/70 font-medium block">
                        Payback Point ($7.5k)
                      </span>
                      <div className="text-2xl font-extrabold text-[#F9C846] font-mono mt-1">
                        {paybackJobs} Jobs
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[#E8EBF7]/70 font-medium block">
                        Est. Monthly Closed Jobs
                      </span>
                      <div className="text-2xl font-extrabold text-white font-mono mt-1">
                        {monthlyClosedJobs} Jobs
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#0093B3]/30" />

                  <div className="bg-[#0093B3]/20 p-5 rounded-xl border border-[#0093B3]/40">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#F9C846] block mb-1">
                      Projected Annual Net Cash Added
                    </span>
                    <div className="text-4xl font-black text-white font-mono">
                      ${annualNetCash.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-[#E8EBF7]/70 block mt-1">
                      After deducting full $7.5k build + 12 mo retainer ($18k)
                    </span>
                  </div>

                  <button
                    onClick={() => openModal(1)}
                    className="w-full py-3.5 bg-[#F96E46] hover:bg-[#e25d36] text-white font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Lock In This ROI Potential</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Case Study: Tidd Siding */}
      <section
        id="case-study"
        className="py-20 bg-gradient-to-b from-white via-[#E8EBF7]/40 to-white relative overflow-hidden border-b border-[#0093B3]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-[#002D3C] text-white rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-[#0093B3] shadow-2xl relative overflow-hidden">
            {/* Decorative ambient glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0093B3]/20 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F96E46]/15 blur-3xl rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              {/* Top Tag */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9C846] text-[#002D3C] text-xs font-black uppercase tracking-wider shadow-sm">
                  <Trophy className="w-4 h-4 text-[#002D3C]" />
                  <span>HERO CASE STUDY: TIDD SIDING</span>
                </div>
                <span className="text-xs font-mono text-[#0093B3] font-bold tracking-widest uppercase">
                  Little Rock / Pulaski County, AR
                </span>
              </div>

              {/* Headline & Subhead */}
              <div className="max-w-4xl mb-12">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
                  From Wasteful Drive-Times to{" "}
                  <span className="text-[#F9C846]">
                    100% Engine-Driven Revenue
                  </span>
                </h2>
                <p className="text-base sm:text-xl text-[#E8EBF7]/90 font-medium leading-relaxed">
                  After partnering with SDI Workbench, the custom intake &
                  dispatch platform we deployed became the{" "}
                  <strong className="text-white underline decoration-[#F9C846] underline-offset-4">
                    sole generator of new jobs
                  </strong>{" "}
                  for Tidd Siding—delivering high-margin full replacements with
                  zero dependency on lead brokers or cold outreach.
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                <div className="bg-[#001D27] p-5 sm:p-6 rounded-2xl border border-[#0093B3]/40 shadow-inner">
                  <div className="text-3xl sm:text-4xl font-black text-[#F9C846] font-mono mb-1">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    Inbound Job Generation
                  </div>
                  <div className="text-[11px] text-[#E8EBF7]/60">
                    Sole customer acquisition engine for their business
                  </div>
                </div>

                <div className="bg-[#001D27] p-5 sm:p-6 rounded-2xl border border-[#0093B3]/40 shadow-inner">
                  <div className="text-3xl sm:text-4xl font-black text-[#0093B3] font-mono mb-1">
                    &lt; 5 Sec
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    Lead Dispatch Speed
                  </div>
                  <div className="text-[11px] text-[#E8EBF7]/60">
                    Instant SMS alert dispatched to phone on job submission
                  </div>
                </div>

                <div className="bg-[#001D27] p-5 sm:p-6 rounded-2xl border border-[#0093B3]/40 shadow-inner">
                  <div className="text-3xl sm:text-4xl font-black text-[#F96E46] font-mono mb-1">
                    $0 Wasted
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    Fuel On Tire Kickers
                  </div>
                  <div className="text-[11px] text-[#E8EBF7]/60">
                    Automated filter cut out 100% of $500 patch inquiries
                  </div>
                </div>

                <div className="bg-[#001D27] p-5 sm:p-6 rounded-2xl border border-[#0093B3]/40 shadow-inner">
                  <div className="text-3xl sm:text-4xl font-black text-[#F9C846] font-mono mb-1">
                    3.8x ROI
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    Annual Net Profit
                  </div>
                  <div className="text-[11px] text-[#E8EBF7]/60">
                    Clear net profitability generated in year one
                  </div>
                </div>
              </div>

              {/* Narrative Story Breakdown */}
              <div className="grid lg:grid-cols-3 gap-6 mb-12 text-sm">
                <div className="bg-[#001D27]/80 p-6 rounded-2xl border border-[#0093B3]/30">
                  <div className="flex items-center gap-2 text-[#F96E46] font-extrabold uppercase text-xs tracking-wider mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>The Challenge</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Tidd Siding was constantly burning fuel driving across
                    Pulaski County to estimate $350 vinyl repairs. Meanwhile,
                    high-ticket $20k+ full siding replacement jobs were being
                    snatched up by corporate franchises responding in minutes.
                  </p>
                </div>

                <div className="bg-[#001D27]/80 p-6 rounded-2xl border border-[#0093B3]/30">
                  <div className="flex items-center gap-2 text-[#0093B3] font-extrabold uppercase text-xs tracking-wider mb-3">
                    <Cpu className="w-4 h-4" />
                    <span>The Engine Solution</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    SDI Workbench deployed a sub-second conversion site, an
                    automatic scope-filtering intake form, and a custom
                    speed-to-lead webhook pushing verified homeowner requests to
                    their smartphones in 5 seconds flat.
                  </p>
                </div>

                <div className="bg-[#001D27]/80 p-6 rounded-2xl border border-[#0093B3]/30">
                  <div className="flex items-center gap-2 text-[#F9C846] font-extrabold uppercase text-xs tracking-wider mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>The Outcome</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    The SDI engine became Tidd Siding’s single source for all
                    new siding wrap and gutter bundle jobs. They completely cut
                    out third-party lead brokers and now operate with total
                    revenue predictability.
                  </p>
                </div>
              </div>

              {/* Testimonial Quote */}
              <div className="bg-[#001D27] p-8 rounded-2xl border-l-4 border-[#F9C846] mb-10 relative">
                <Quote className="w-10 h-10 text-[#0093B3]/30 absolute top-4 right-4" />
                <p className="text-base sm:text-lg text-gray-100 font-medium italic leading-relaxed mb-4 relative z-10">
                  &ldquo;Before SDI Workbench, we spent half our week driving
                  around quoting tiny repairs that barely covered gas. Now,
                  every lead that pops up on my phone is a homeowner ready for a
                  full siding replacement or seamless gutter package. The engine
                  SDI built literally drives 100% of our new business.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0093B3] flex items-center justify-center font-extrabold text-white text-sm">
                    TS
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-sm">
                      Owner &amp; Operator
                    </div>
                    <div className="text-xs text-[#0093B3] font-semibold">
                      Tidd Siding &bull; Little Rock, AR
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <button
                  onClick={() => openModal(1)}
                  className="px-5 py-2.5 rounded-xl bg-[#F96E46] hover:bg-[#e25d36] text-white font-black text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-3"
                >
                  <Zap className="w-5 h-5 text-white" />
                  <span>Book A Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Story Section */}
      <section id="operator-story" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-[#0093B3] font-extrabold text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-[#0093B3]" />
              <span>Field Credibility</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#002D3C] tracking-tight mb-4">
              Why Traditional Agencies Fail Trade Contractors
            </h2>
            <p className="text-[#002D3C]/80 text-base md:text-lg">
              Agencies sell digital tools to trade owners because they&apos;ve
              never stepped foot on a scaffolding rig. Here is how we differ
              from generic boardroom marketers pitching to job sites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Generic Agency */}
            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-red-200 relative shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#002D3C]">
                    Traditional Web Agency
                  </h3>
                  <span className="text-xs text-[#002D3C]/60 font-semibold">
                    Sells fancy layouts &amp; vanity lead numbers
                  </span>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-[#002D3C]/80">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Brags about &ldquo;pipeline volume&rdquo;:</strong>{" "}
                    Counts $150 caulk repair requests as &ldquo;high-value
                    leads&rdquo;.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Slow form-to-inbox routing:</strong> Leads sit in
                    email inboxes for hours while competitors respond first.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bloated WordPress sites:</strong> Take 6+ seconds to
                    load on job-site mobile connections, losing 40% of traffic.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero job-costing awareness:</strong> Doesn&apos;t
                    understand labor, materials, or Arkansas weather patterns.
                  </span>
                </li>
              </ul>
            </div>

            {/* Adaptive Trade Engine */}
            <div className="bg-[#002D3C] text-white p-8 rounded-2xl border-2 border-[#0093B3] shadow-xl relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0093B3] text-white flex items-center justify-center text-xl font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Adaptive Trade Engine&trade;
                  </h3>
                  <span className="text-xs text-[#F9C846] font-extrabold uppercase tracking-wider">
                    Operator-led net profit architecture
                  </span>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-[#E8EBF7]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F9C846] shrink-0 mt-0.5" />
                  <span>
                    <strong>Low-Margin Auto Filter:</strong> Screens out
                    tire-kickers seeking repairs under $2,000, protecting your
                    fuel &amp; time.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F9C846] shrink-0 mt-0.5" />
                  <span>
                    <strong>5-Second Speed-to-Lead SMS:</strong> Dispatches
                    instant text messages directly to your cell phone when full
                    replacement leads arrive.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F9C846] shrink-0 mt-0.5" />
                  <span>
                    <strong>Sub-Second High Speed Architecture:</strong> Instant
                    loading on mobile phones even with poor signal in rural
                    Pulaski county.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F9C846] shrink-0 mt-0.5" />
                  <span>
                    <strong>Solo-Operator Engineered:</strong> Designed by
                    someone who understands job site overhead, crew pacing, and
                    net margin cash flow.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Intake Simulator Section */}
      <section
        id="demo-simulator"
        className="py-20 bg-[#F8FAFC] border-y border-[#0093B3]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-[#0093B3] font-extrabold text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0093B3]" />
              <span>Live Interactive Prototype</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#002D3C] tracking-tight mb-4">
              Test Drive The Intake &amp; Filtering Engine
            </h2>
            <p className="text-[#002D3C]/80 text-base">
              Try submitting a simulated lead below. See how high-margin
              replacement packages trigger instant contractor SMS dispatches
              while low-margin patch jobs get politely filtered.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#0093B3]/30 p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-[#0093B3]/20 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F96E46]"></span>
                <span className="w-3 h-3 rounded-full bg-[#F9C846]"></span>
                <span className="w-3 h-3 rounded-full bg-[#0093B3]"></span>
                <span className="text-xs font-mono text-[#002D3C]/60 ml-2 hidden sm:inline font-semibold">
                  Little Rock Contractor Intake Prototype v2.4
                </span>
              </div>
              <span className="text-xs bg-[#0093B3]/10 text-[#0093B3] border border-[#0093B3]/30 px-3 py-1 rounded-full font-bold">
                Interactive Prototype
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-extrabold text-[#002D3C] mb-3">
                  Select Simulated Homeowner Scope:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSimType("full_siding")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      simType === "full_siding"
                        ? "border-[#0093B3] bg-[#E8EBF7] ring-2 ring-[#0093B3]/40"
                        : "border-[#0093B3]/20 bg-white hover:border-[#0093B3]/40"
                    }`}
                  >
                    <div className="text-xs font-black text-[#0093B3] uppercase tracking-wider mb-1">
                      High Margin
                    </div>
                    <div className="font-extrabold text-[#002D3C] text-sm">
                      Full Siding Replacement
                    </div>
                    <div className="text-xs text-[#002D3C]/70 mt-1 font-semibold">
                      $15,000 - $35,000
                    </div>
                  </button>

                  <button
                    onClick={() => setSimType("bundle")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      simType === "bundle"
                        ? "border-[#F96E46] bg-[#F96E46]/10 ring-2 ring-[#F96E46]/40"
                        : "border-[#0093B3]/20 bg-white hover:border-[#0093B3]/40"
                    }`}
                  >
                    <div className="text-xs font-black text-[#F96E46] uppercase tracking-wider mb-1">
                      Max Value
                    </div>
                    <div className="font-extrabold text-[#002D3C] text-sm">
                      Siding + Seamless Gutters
                    </div>
                    <div className="text-xs text-[#002D3C]/70 mt-1 font-semibold">
                      $20,000 - $45,000
                    </div>
                  </button>

                  <button
                    onClick={() => setSimType("repair")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      simType === "repair"
                        ? "border-gray-400 bg-gray-100 ring-2 ring-gray-400/40"
                        : "border-[#0093B3]/20 bg-white hover:border-[#0093B3]/40"
                    }`}
                  >
                    <div className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">
                      Low Margin
                    </div>
                    <div className="font-extrabold text-[#002D3C] text-sm">
                      Minor Board Patch
                    </div>
                    <div className="text-xs text-[#002D3C]/70 mt-1 font-semibold">
                      Under $1,500
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002D3C]/80 mb-1">
                  Simulated Customer Phone Number
                </label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-lg px-4 py-2.5 text-sm text-[#002D3C] font-semibold outline-none focus:border-[#0093B3]"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-4 bg-[#F96E46] hover:bg-[#e25d36] disabled:opacity-50 text-white font-extrabold rounded-xl text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      Simulating Smart Routing &amp; Speed-To-Lead Dispatch...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-white" />
                    <span>Run Intake Simulation</span>
                  </>
                )}
              </button>

              {/* Simulation Result Output Display */}
              {simResult && (
                <div
                  className={`mt-6 p-6 rounded-xl border-2 ${
                    simResult.status === "ACCEPTED"
                      ? "bg-[#E8EBF7]/80 border-[#0093B3]"
                      : "bg-[#F8FAFC] border-[#F96E46]/60"
                  } shadow-md transition-all animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {simResult.status === "ACCEPTED" ? (
                        <span className="px-3 py-1 rounded-full bg-[#0093B3] text-white text-xs font-black tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> LEAD
                          QUALIFIED &amp; DISPATCHED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#F96E46] text-white text-xs font-black tracking-wide flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5" /> LOW-MARGIN JOB
                          FILTERED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#002D3C]/70">
                      Response Speed: 3.8 Seconds
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#002D3C]/70 font-semibold">
                        Project Type:
                      </span>
                      <span className="font-extrabold text-[#002D3C]">
                        {simResult.scope}
                      </span>
                    </div>

                    {simResult.reason && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#002D3C]/70 font-semibold">
                          Filter Trigger:
                        </span>
                        <span className="font-bold text-[#F96E46]">
                          {simResult.reason}
                        </span>
                      </div>
                    )}

                    <div className="p-3 bg-white rounded-lg border border-[#0093B3]/30 text-xs font-mono text-[#002D3C] font-bold flex items-start gap-2 shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#F96E46] shrink-0 mt-0.5" />
                      <span>{simResult.savings}</span>
                    </div>

                    {simResult.status === "ACCEPTED" && simResult.smsText && (
                      <div className="mt-4 pt-4 border-t border-[#0093B3]/20">
                        <div className="text-xs font-black text-[#002D3C] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#0093B3]" />{" "}
                          Simulated Contractor Phone SMS Notification
                        </div>
                        <div className="p-4 bg-[#002D3C] text-white border border-[#0093B3]/40 rounded-xl text-xs leading-relaxed font-sans shadow-inner">
                          {simResult.smsText}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#0093B3]/30 text-[11px] text-[#0093B3] font-bold">
                            <span className="text-[#E8EBF7]">
                              Auto-action: Click to dial lead within 60 secs
                            </span>
                            <span className="underline cursor-pointer flex items-center gap-1 text-[#F9C846]">
                              <PhoneCall className="w-3 h-3" /> Call{" "}
                              {simPhone || "(501) 555-0199"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Offer Stack Deliverables Section */}
      <section id="engine-stack" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-[#0093B3] font-extrabold text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0093B3]" />
              <span>Complete System Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#002D3C] tracking-tight mb-4">
              What Is Inside The Trade Engine&trade;
            </h2>
            <p className="text-[#002D3C]/80 text-base md:text-lg">
              Everything built and delivered in a done-for-you turnkey setup. No
              missing technical components, no hidden plugin subscriptions, zero
              fluff.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Deliverable Nav Buttons */}
            <div className="lg:col-span-5 space-y-3">
              {deliverables.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDeliverable(idx)}
                  className={`w-full p-5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedDeliverable === idx
                      ? "bg-[#E8EBF7] border-[#0093B3] text-[#002D3C] shadow-md ring-1 ring-[#0093B3]"
                      : "bg-white border-[#0093B3]/20 text-[#002D3C]/70 hover:border-[#0093B3]/40 hover:text-[#002D3C]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-mono font-black ${selectedDeliverable === idx ? "text-[#F96E46]" : "text-[#002D3C]/40"}`}
                    >
                      {item.id}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#002D3C]">
                        {item.title}
                      </h4>
                      <span className="text-xs text-[#0093B3] font-bold">
                        {item.val}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${selectedDeliverable === idx ? "text-[#0093B3] translate-x-1" : "text-[#002D3C]/30"}`}
                  />
                </button>
              ))}
            </div>

            {/* Deliverable Details Display Card */}
            <div className="lg:col-span-7 bg-[#F8FAFC] p-8 rounded-2xl border-2 border-[#0093B3]/30 shadow-lg relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#0093B3]/20">
                <span className="text-xs font-mono font-black text-[#002D3C] bg-[#E8EBF7] px-3 py-1 rounded-full border border-[#0093B3]/30">
                  COMPONENT #{deliverables[selectedDeliverable].id}
                </span>
                <span className="text-xs font-extrabold text-[#0093B3] bg-[#0093B3]/10 px-3 py-1 rounded-full border border-[#0093B3]/30">
                  {deliverables[selectedDeliverable].val}
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#002D3C] mb-4">
                {deliverables[selectedDeliverable].title}
              </h3>

              <p className="text-[#002D3C]/80 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                {deliverables[selectedDeliverable].desc}
              </p>

              <h4 className="text-xs font-black uppercase tracking-widest text-[#002D3C]/70 mb-4">
                Key Specifications &amp; Features:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {deliverables[selectedDeliverable].details.map(
                  (detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-[#0093B3]/20 text-xs font-bold text-[#002D3C] shadow-sm"
                    >
                      <Check className="w-4 h-4 text-[#F96E46] shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ),
                )}
              </div>

              <div className="pt-6 border-t border-[#0093B3]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#002D3C]/70 font-semibold">
                  Includes full ongoing monitoring and maintenance.
                </div>
                <button
                  onClick={() => openModal(1)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Claim This Offer Stack</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section
        id="guarantee"
        className="py-20 bg-[#F8FAFC] border-y border-[#0093B3]/20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-[#0093B3] shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#E8EBF7] border-2 border-[#0093B3] text-[#0093B3] flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-12 h-12 text-[#0093B3]" />
            </div>

            <div>
              <div className="inline-block bg-[#002D3C] text-[#F9C846] text-xs font-black px-3.5 py-1 rounded-full mb-3 uppercase tracking-wider">
                100% Risk-Free Performance Lock
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#002D3C] mb-3">
                The 5-Qualified-Lead Retainer Freeze Guarantee
              </h3>
              <p className="text-[#002D3C]/80 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                After your initial engine build, your monthly maintenance
                retainer is frozen at zero until your new platform delivers{" "}
                <strong className="text-[#002D3C] bg-[#F9C846]/30 px-1">
                  5 fully qualified siding or gutter replacement lead
                  opportunities
                </strong>{" "}
                directly to your phone. If we don&apos;t deliver, you don&apos;t
                pay monthly maintenance. Simple as that.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#002D3C] font-extrabold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0093B3]" /> Zero
                  Long-Term Contracts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0093B3]" /> Exclusive
                  Pulaski Territory
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0093B3]" /> Direct
                  Cell Phone Alert Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#002D3C] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F9C846] flex items-center justify-center text-[#002D3C] font-black text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm">
              Adaptive Web Solutions LLC
            </span>
          </div>

          <p className="text-center md:text-left text-[#E8EBF7]/80 font-medium">
            Engineered exclusively for siding, gutter, and exterior contractors
            in Little Rock &amp; Central Arkansas. &copy;{" "}
            {<Copyright/>} All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-[#E8EBF7] font-semibold">
            <a href="#roi-calculator" className="hover:text-[#F9C846]">
              ROI Calculator
            </a>
            <a href="#demo-simulator" className="hover:text-[#F9C846]">
              Demo Prototype
            </a>
            <a href="#engine-stack" className="hover:text-[#F9C846]">
              Deliverables
            </a>
          </div>
        </div>
      </footer>

      {/* 9. FIXED INTERACTIVE STRATEGY CALL BOOKING CALENDAR MODAL */}
      <BookingModal
        isOpen={isBookingOpen}
        initialStep={bookingStep}
        onClose={() => setIsBookingOpen(false)}
        onBookingComplete={(_) => console.log("booked")}
      />
    </div>
  );
}
