export interface HomePageGlobal {
  heroTagline: string;
  heroHeadline: string;
  heroSubheadline?: string;
  heroCtaButtonText?: string;
  updatedAt?: string;
}

export const DEFAULT_HOME_PAGE_CONTENT: HomePageGlobal = {
  heroTagline: "Built By Someone Who’s Worked On A Roof In The July Summer Heat • Not Someone Who Sweats Over PowerPoint Slides",

  heroHeadline: 'Stop Buying "Vanity Leads".<br><span class="bg-gradient-to-r from-[#0093B3] via-[#002D3C] to-[#F96E46] bg-clip-text text-transparent">Build A Net Cash Engine.</span>',

  heroSubheadline: 'We build high-speed customer acquisition platforms specifically engineered for Little Rock siding, gutter, and exterior contractors. Designed to pay for itself in <span class="text-[#F96E46] font-extrabold underline decoration-[#F96E46]/40">just 3 closed jobs</span> and filter out low-margin tire kickers before you waste fuel.',

  heroCtaButtonText: "Apply For Your Territory Slot",
};
