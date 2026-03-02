// legacy script.js review handlers have been disabled because the new
// review-system-fixed.js implementation handles everything (including
// offline/localStorage fallback and Firebase integration).
// The old PHP endpoints (submit-review.php, get-reviews.php) are no longer
// used and produced 405 errors in the console.

console.log('script.js loaded but no longer active; review handling moved to review-system-fixed.js');

// Load reviews on page load
window.onload = loadReviews;