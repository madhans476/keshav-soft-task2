// scripts/site-context.mjs
//
// Global variables passed into every page template — the kind of data
// that would come from a CMS or config file in a larger project
// (site name, year, social links). Keeping it here means the footer
// copyright year, brand name, etc. are defined exactly once.

export const siteContext = {
  siteName: 'Orbiq',
  year: new Date().getFullYear(),
  social: {
    twitter: '#',
    linkedin: '#',
    github: '#',
    instagram: '#',
  },
};
