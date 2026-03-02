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
            timestamp: new Date().toISOString()
        };
        saveReviewToStorage(review);
        addReviewToCarousel(review);
        form.reset();
        document.getElementById('selectedRating').value = 0;
        stars.forEach(s => s.style.color = '#ddd');
        alert('Thank you! Your review has been submitted successfully.');
        setTimeout(reinitializeCarousel, 300);
    });
}

function saveReviewToStorage(review) {
    let reviews = JSON.parse(localStorage.getItem('customerReviews')) || [];
    reviews.push(review);
    localStorage.setItem('customerReviews', JSON.stringify(reviews));
}

function loadReviewsFromStorage() {
    const reviews = JSON.parse(localStorage.getItem('customerReviews')) || [];
    reviews.forEach(review => {
        addReviewToCarousel(review);
    });
}

function addReviewToCarousel(review) {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;
    const starsCount = review.rating;
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="fas fa-star me-1 ${i <= starsCount ? 'text-primary' : 'text-muted'}"></i>`;
    }
    const reviewHTML = `
        <div class="testimonial-item border p-4 position-relative" data-ts="${review.timestamp}">
            <i class="fas fa-trash-alt remove-review text-danger" 
               style="position:absolute; top:10px; right:10px; cursor:pointer;" 
               data-ts="${review.timestamp}" title="Delete review"></i>
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
    const added = carousel.querySelector(`.testimonial-item[data-ts="${review.timestamp}"]`);
    if (added) {
        const btn = added.querySelector('.remove-review');
        if (btn) {
            btn.addEventListener('click', function() {
                const ts = this.getAttribute('data-ts');
                removeReview(ts);
            });
        }
    }
}

function removeReview(timestamp) {
    let reviews = JSON.parse(localStorage.getItem('customerReviews')) || [];
    reviews = reviews.filter(r => r.timestamp !== timestamp);
    localStorage.setItem('customerReviews', JSON.stringify(reviews));
    const item = document.querySelector(`.testimonial-item[data-ts="${timestamp}"]`);
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
        loadReviewsFromStorage();
        reinitializeCarousel();
        initializeReviewSystem();
    }, 500);
});