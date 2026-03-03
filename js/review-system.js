// Review system shared across pages
// Helper utilities for Firestore availability, local caching, and sync
function isFirestoreAvailable() {
  try {
    if (!(window.firebase && firebase.firestore && db && typeof db.collection === 'function')) {
      return false;
    }
    // try a lightweight operation to trigger any immediate errors
    // (we'll ignore the returned value)
    db.collection('reviews');
    return true;
  } catch (e) {
    console.warn('Firestore not usable:', e);
    return false;
  }
}

function saveReviewLocally(review) {
  const stored = JSON.parse(localStorage.getItem('localReviews') || '[]');
  const id = 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  stored.push({ id, ...review });
  localStorage.setItem('localReviews', JSON.stringify(stored));
  return Promise.resolve({ id });
}

function loadLocalReviews() {
  const stored = JSON.parse(localStorage.getItem('localReviews') || '[]');
  stored.forEach(r => addReviewToCarousel(r, r.id));
  if (!carouselInitialized) setTimeout(reinitializeCarousel, 500);
}

function flushLocalReviews() {
  if (!isFirestoreAvailable()) return Promise.resolve();
  const stored = JSON.parse(localStorage.getItem('localReviews') || '[]');
  if (!stored.length) return Promise.resolve();
  const promises = stored.map(r => {
    const copy = Object.assign({}, r);
    delete copy.id;
    copy.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    return db.collection('reviews').add(copy);
  });
  return Promise.all(promises).then(() => {
    localStorage.removeItem('localReviews');
    // remove any local-only carousel entries to avoid duplicates
    document.querySelectorAll('.testimonial-item[data-id^="local-"]').forEach(el => el.remove());
  });
}

window.addEventListener('online', () => {
  console.log('Online again, attempting to sync local reviews');
  flushLocalReviews().then(() => {
    if (carouselInitialized) loadReviewsFromStorage();
  }).catch(console.error);
});

let carouselInitialized = false;

function initializeReviewSystem() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  const getStars = () => Array.from(document.querySelectorAll('.star-icon'));
  const ratingContainer = document.getElementById('reviewRating');

  if (ratingContainer) {
    ratingContainer.addEventListener('click', function(e) {
      const star = e.target.closest && e.target.closest('.star-icon');
      if (!star) return;
      const rating = parseInt(star.getAttribute('data-rating'), 10) || 0;
      const selected = document.getElementById('selectedRating');
      if (selected) selected.value = rating;
      getStars().forEach(s => {
        const r = parseInt(s.getAttribute('data-rating'), 10) || 0;
        s.style.color = r <= rating ? '#0d6efd' : '#ddd';
      });
    });

    ratingContainer.addEventListener('mouseover', function(e) {
      const star = e.target.closest && e.target.closest('.star-icon');
      if (!star) return;
      const rating = parseInt(star.getAttribute('data-rating'), 10) || 0;
      getStars().forEach(s => {
        const r = parseInt(s.getAttribute('data-rating'), 10) || 0;
        s.style.color = r <= rating ? '#0d6efd' : '#ddd';
      });
    });

    ratingContainer.addEventListener('mouseleave', function() {
      const selectedRating = parseInt(document.getElementById('selectedRating').value, 10) || 0;
      getStars().forEach(s => {
        const r = parseInt(s.getAttribute('data-rating'), 10) || 0;
        s.style.color = r <= selectedRating ? '#0d6efd' : '#ddd';
      });
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const rating = parseInt(document.getElementById('selectedRating').value, 10) || 0;
    if (!rating) { alert('Please select a rating'); return; }
    const review = {
      name: document.getElementById('reviewName').value,
      profession: document.getElementById('reviewProfession').value,
      email: document.getElementById('reviewEmail').value,
      rating: rating,
      text: document.getElementById('reviewText').value
    };
    saveReviewToStorage(review).then(docRef => {
      addReviewToCarousel(review, docRef.id);
      form.reset();
      document.getElementById('selectedRating').value = 0;
      getStars().forEach(s => s.style.color = '#ddd');
      setTimeout(reinitializeCarousel, 300);
    }).catch(err => {
      console.error('Error saving review', err);
      alert('Failed to submit review. Please try again later.');
    });
  });
}

function saveReviewToStorage(review) {
  if (!isFirestoreAvailable()) {
    // no backend available, store locally
    review.timestamp = Date.now();
    alert('Review saved locally; it will sync when a connection becomes available.');
    return saveReviewLocally(review);
  }
  review.timestamp = firebase.firestore.FieldValue.serverTimestamp();
  return db.collection('reviews').add(review).catch(err => {
    console.warn('Firestore write failed, falling back to local', err);
    alert('Unable to reach the review server; your review was stored locally and will be sent when possible.');
    review.timestamp = Date.now();
    return saveReviewLocally(review);
  });
}

function loadReviewsFromStorage() {
  if (!isFirestoreAvailable()) {
    console.warn('Firestore unavailable, loading from local storage');
    loadLocalReviews();
    return;
  }

  db.collection('reviews').orderBy('timestamp').get()
    .then(snapshot => {
      snapshot.forEach(doc => addReviewToCarousel(doc.data(), doc.id));

      // set up real-time listener only after initial load succeeds
      db.collection('reviews').orderBy('timestamp').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            if (!document.querySelector(`.testimonial-item[data-id="${change.doc.id}"]`)) {
              addReviewToCarousel(change.doc.data(), change.doc.id);
            }
          } else if (change.type === 'removed') {
            removeReview(change.doc.id);
          }
        });
      }, err => console.error('Error listening for review changes:', err));
    }).catch(err => {
      console.error('Error loading existing reviews (falling back to localStorage):', err);
      loadLocalReviews();
    });

  setTimeout(() => { if (!carouselInitialized) reinitializeCarousel(); }, 1000);
}

function addReviewToCarousel(review, docId) {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;
  const starsCount = review.rating || 0;
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) starsHTML += `<i class="fas fa-star me-1 ${i <= starsCount ? 'text-primary' : 'text-muted'}"></i>`;
  const reviewHTML = `
    <div class="testimonial-item border p-4 position-relative" data-id="${docId}">
      <i class="fas fa-trash-alt remove-review text-danger" data-id="${docId}" title="Delete review" style="position:absolute; top:10px; right:10px; cursor:pointer;"></i>
      <div class="d-flex align-items-center">
        <div><img src="img/default-user.jpg" alt="Customer avatar" style="width:60px;height:60px;border-radius:50%;object-fit:cover;"></div>
        <div class="ms-4">
          <h4 class="text-secondary">${escapeHtml(review.name)}</h4>
          <p class="m-0 pb-3">${escapeHtml(review.profession)}</p>
          <div class="d-flex pe-5">${starsHTML}</div>
        </div>
      </div>
      <div class="border-top mt-4 pt-3"><p class="mb-0">${escapeHtml(review.text)}</p></div>
    </div>
  `;
  carousel.insertAdjacentHTML('beforeend', reviewHTML);
  const added = carousel.querySelector(`.testimonial-item[data-id="${docId}"]`);
  if (added) {
    const btn = added.querySelector('.remove-review');
    if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); removeReview(this.getAttribute('data-id')); });
  }
  if (carouselInitialized) reinitializeCarousel();
}

function removeReview(id) {
  if (isFirestoreAvailable() && !id.startsWith('local-')) {
    db.collection('reviews').doc(id).delete().catch(console.error);
  } else {
    const stored = JSON.parse(localStorage.getItem('localReviews') || '[]')
      .filter(r => r.id !== id);
    localStorage.setItem('localReviews', JSON.stringify(stored));
  }

  const item = document.querySelector(`.testimonial-item[data-id="${id}"]`);
  if (item) item.parentElement.removeChild(item);
  setTimeout(reinitializeCarousel, 200);
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text || ''; return div.innerHTML; }

function reinitializeCarousel() {
  const carousel = jQuery('.testimonial-carousel');
  if (!carousel.length) return;
  if (carousel.hasClass('owl-loaded')) {
    carousel.trigger('destroy.owl.carousel');
    carousel.removeClass('owl-loaded');
    carousel.find('.owl-stage-outer').children().unwrap();
    carousel.find('.owl-controls').remove();
  }
  carousel.owlCarousel({ items:1, loop:true, margin:20, responsive:{0:{items:1},768:{items:2},1200:{items:3}}, autoplay:true, autoplayTimeout:5000, autoplayHoverPause:true, nav:false, dots:true });
  carouselInitialized = true;
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    initializeReviewSystem();
    if (isFirestoreAvailable()) {
      flushLocalReviews().then(loadReviewsFromStorage).catch(err => {
        console.error('Error flushing local reviews on startup', err);
        loadReviewsFromStorage();
      });
    } else {
      loadReviewsFromStorage();
    }
  }, 500);
});
