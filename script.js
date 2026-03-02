document.getElementById("reviewForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("submit-review.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Review submitted successfully!");
      loadReviews();
      document.getElementById("reviewForm").reset();
    } else {
      alert("Error: " + data.error);
    }
  })
  .catch(err => console.error("Fetch error:", err));
});

function loadReviews() {
  fetch("get-reviews.php")
    .then(res => res.json())
    .then(reviews => {
      const carousel = document.querySelector(".testimonial-carousel");
      carousel.innerHTML = "";

      reviews.forEach(r => {
        let stars = "";
        for (let i = 0; i < r.rating; i++) {
          stars += `<i class="fas fa-star me-1 text-primary"></i>`;
        }
        for (let i = r.rating; i < 5; i++) {
          stars += `<i class="far fa-star me-1 text-primary"></i>`;
        }

        const item = `
          <div class="testimonial-item border p-4">
            <div class="d-flex align-items-center">
              <div class="">
                <img src="${r.photo}" alt="Customer testimonial" style="width:80px;height:80px;object-fit:cover;border-radius:50%;">
              </div>
              <div class="ms-4">
                <h4 class="text-secondary">${r.name}</h4>
                <p class="m-0 pb-3">${r.profession || ""}</p>
                <div class="d-flex pe-5">${stars}</div>
              </div>
            </div>
            <div class="border-top mt-4 pt-3">
              <p class="mb-0">${r.review}</p>
            </div>
          </div>`;
        
        carousel.innerHTML += item;
      });
    });
}

// Load reviews on page load
window.onload = loadReviews;