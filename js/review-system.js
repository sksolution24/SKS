// Review system shared across pages
let carouselInitialized = false;

function initializeReviewSystem() {
    // only run form-related logic if reviewForm exists
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    const stars = document.querySelectorAll('.star-icon');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            document.getElementById('selectedRating').value = rating;
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-rating') <= rating ? '#0d6efd' : '#ddd';
            });
        });
        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-rating') <= rating ? '#0d6efd' : '#ddd';
            });
        });
    });
    
    const ratingContainer = document.getElementById('reviewRating');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            const selectedRating = document.getElementById('selectedRating').value;
            stars.forEach(s => {
                s.style.color = (selectedRating && s.getAttribute('data-rating') <= selectedRating) ? '#0d6efd' : '#ddd';
            });
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const rating = document.getElementById('selectedRating').value;
        if (!rating || rating == 0) {
            alert('Please select a rating');
            return;
        }
        const review = {
            name: document.getElementById('reviewName').value,
            profession: document.getElementById('reviewProfession').value,
            email: document.getElementById('reviewEmail').value,
            rating: parseInt(rating),
            text: document.getElementById('reviewText').value,
            // timestamp will be set in saveReviewToStorage using serverTimestamp()
        }; 
        // save to Firestore and add when written
        saveReviewToStorage(review).then(docRef => {
            addReviewToCarousel(review, docRef.id);
            // reset visuals
            form.reset();
            document.getElementById('selectedRating').value = 0;
            stars.forEach(s => s.style.color = '#ddd');
            // Review system shared across pages
            let carouselInitialized = false;

            function initializeReviewSystem() {
                // only run form-related logic if reviewForm exists
                const form = document.getElementById('reviewForm');
                if (!form) return;
    
                const stars = document.querySelectorAll('.star-icon');
                stars.forEach(star => {
                    star.addEventListener('click', function() {
                        const rating = this.getAttribute('data-rating');
                        document.getElementById('selectedRating').value = rating;
                        stars.forEach(s => {
                            s.style.color = s.getAttribute('data-rating') <= rating ? '#0d6efd' : '#ddd';
                        });
                    });
                    star.addEventListener('mouseenter', function() {
                        const rating = this.getAttribute('data-rating');
                        stars.forEach(s => {
                            s.style.color = s.getAttribute('data-rating') <= rating ? '#0d6efd' : '#ddd';
                        });
                    });
                });
    
                const ratingContainer = document.getElementById('reviewRating');
                if (ratingContainer) {
                    ratingContainer.addEventListener('mouseleave', function() {
                        const selectedRating = document.getElementById('selectedRating').value;
                        stars.forEach(s => {
                            s.style.color = (selectedRating && s.getAttribute('data-rating') <= selectedRating) ? '#0d6efd' : '#ddd';
                        });
                    });
                }

                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const rating = document.getElementById('selectedRating').value;
                    if (!rating || rating == 0) {
                        alert('Please select a rating');
                        return;
                    }
                    const review = {
                        name: document.getElementById('reviewName').value,
                        profession: document.getElementById('reviewProfession').value,
                        email: document.getElementById('reviewEmail').value,
                        rating: parseInt(rating),
                        text: document.getElementById('reviewText').value,
                        // timestamp will be set in saveReviewToStorage using serverTimestamp()
                    }; 
                    // save to Firestore and add when written
                    saveReviewToStorage(review).then(docRef => {
                        addReviewToCarousel(review, docRef.id);
                        // reset visuals
                        form.reset();
                        document.getElementById('selectedRating').value = 0;
                        stars.forEach(s => s.style.color = '#ddd');
                        alert('Thank you! Your review has been submitted successfully.');
                        setTimeout(reinitializeCarousel, 300);
                    }).catch(err => {
                        console.error('Error saving review', err);
                        alert('Failed to submit review. Please try again later.');
                    });
                });
            }

            function saveReviewToStorage(review) {
                // use Firestore server timestamp for consistency
                review.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                return db.collection('reviews').add(review);
            }

            function loadReviewsFromStorage() {
              // First, load existing reviews from Firestore
              db.collection('reviews').orderBy('timestamp')
                .get()
                .then(snapshot => {
                  snapshot.forEach(doc => {
                    addReviewToCarousel(doc.data(), doc.id);
                  });
                  console.log('Loaded ' + snapshot.size + ' existing reviews');
                })
                .catch(error => {
                  console.error('Error loading existing reviews:', error);
                });
  
              // Then set up real-time listener for new changes
              db.collection('reviews').orderBy('timestamp')
                .onSnapshot(snapshot => {
                  snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                      // Check if already in DOM to avoid duplicates
                      const checkExists = document.querySelector(`.testimonial-item[data-id="${change.doc.id}"]`);
                      if (!checkExists) {
                        addReviewToCarousel(change.doc.data(), change.doc.id);
                      }
                    } else if (change.type === 'removed') {
                      removeReview(change.doc.id);
                    }
                  });
                }, error => {
                  console.error('Error listening for review changes:', error);
                });
  
              // initialize carousel after initial load
              setTimeout(() => {
                if (!carouselInitialized) {
                  reinitializeCarousel();
                }
              }, 1000);
            }


            function addReviewToCarousel(review, docId) {
                const carousel = document.querySelector('.testimonial-carousel');
                if (!carousel) return;
                const starsCount = review.rating;
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<i class="fas fa-star me-1 ${i <= starsCount ? 'text-primary' : 'text-muted'}"></i>`;
                }
                const reviewHTML = `
                    <div class="testimonial-item border p-4 position-relative" data-id="${docId}">
                        <i class="fas fa-trash-alt remove-review text-danger" 
                           style="position:absolute; top:10px; right:10px; cursor:pointer;" 
                           data-id="${docId}" title="Delete review"></i>
                        <div class="d-flex align-items-center">
                            <div class="">
                                <img src="img/default-user.jpg" alt="Customer avatar" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                            </div>
                            <div class="ms-4">
                                <h4 class="text-secondary">${escapeHtml(review.name)}</h4>
                                <p class="m-0 pb-3">${escapeHtml(review.profession)}</p>
                                <div class="d-flex pe-5">
                                    ${starsHTML}
                                </div>
                            </div>
                        </div>
                        <div class="border-top mt-4 pt-3">
                            <p class="mb-0">${escapeHtml(review.text)}</p>
                        </div>
                    </div>
                `;
                carousel.insertAdjacentHTML('beforeend', reviewHTML);
                // attach delete handler
                const added = carousel.querySelector(`.testimonial-item[data-id="${docId}"]`);
                if (added) {
                    const btn = added.querySelector('.remove-review');
                    if (btn) {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const id = this.getAttribute('data-id');
                            removeReview(id);
                        });
                    }
                }
                // reinitialize carousel to include new item
                if (carouselInitialized) {
                    reinitializeCarousel();
                }
            }

            function removeReview(id) {
                // delete from Firestore
                db.collection('reviews').doc(id).delete();
                // remove from DOM if present
                const item = document.querySelector(`.testimonial-item[data-id="${id}"]`);
                if (item) item.parentElement.removeChild(item);
                setTimeout(reinitializeCarousel, 200);
            }

            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            function reinitializeCarousel() {
                const carousel = jQuery('.testimonial-carousel');
                if (!carousel.length) return;
                if (carousel.hasClass('owl-loaded')) {
                    carousel.trigger('destroy.owl.carousel');
                    carousel.removeClass('owl-loaded');
                    carousel.find('.owl-stage-outer').children().unwrap();
                    carousel.find('.owl-controls').remove();
                }
                carousel.owlCarousel({
                    items: 1,
                    loop: true,
                    margin: 20,
                    responsive: {
                        0: { items: 1 },
                        768: { items: 2 },
                        1200: { items: 3 }
                    },
                    autoplay: true,
                    autoplayTimeout: 5000,
                    autoplayHoverPause: true,
                    nav: false,
                    dots: true
                });
                carouselInitialized = true;
            }

            // page initialization
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    initializeReviewSystem();
                    loadReviewsFromStorage();
                    // carousel will be initialized by the addReviewToCarousel callback
                }, 500);
            });



