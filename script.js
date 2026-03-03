// legacy review code removed – the functionality now lives entirely in
// js/review-system.js (which includes offline/localStorage fallback,
// Firebase support, and carousel handling). Any old PHP endpoints are no
// longer used.

console.log('script.js loaded; no active behavior in this file');

// (no loadReviews call) -- review initialization occurs via
// review-system.js on DOMContentLoaded.