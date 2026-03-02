(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Team carousel
    $(".team-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        dots: false,
        loop: true,
        margin: 50,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Testimonial carousel

    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: true,
        dots: true,
        loop: true,
        margin: 0,
        nav : true,
        navText: false,
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


     // Fact Counter

     $(document).ready(function(){
        $('.counter-value').each(function(){
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
            },{
                duration: 2000,
                easing: 'easeInQuad',
                step: function (now){
                    $(this).text(Math.ceil(now));
                }
            });
        });
    });


/// Review System

document.getElementById("reviewForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const reviewData = {
    name: document.getElementById("name").value,
    profession: document.getElementById("profession").value,
    rating: document.getElementById("rating").value,
    review: document.getElementById("review").value
  };

  // Send to backend (example using fetch)
  fetch("/submit-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData)
  })
  .then(res => res.json())
  .then(data => {
    alert("Review submitted successfully!");
    location.reload(); // reload to show new testimonial
  })
  .catch(err => console.error(err));
});



app.post("/submit-review", (req, res) => {
  const { name, profession, rating, review } = req.body;

  // Save to database (pseudo-code)
  db.collection("reviews").insertOne({ name, profession, rating, review });

  res.json({ success: true });
});

app.get("/reviews", async (req, res) => {
  const reviews = await db.collection("reviews").find().toArray();
  res.json(reviews);
});


fetch("/reviews")
  .then(res => res.json())
  .then(reviews => {
    const carousel = document.querySelector(".testimonial-carousel");
    reviews.forEach(r => {
      const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      const item = `
        <div class="testimonial-item border p-4">
          <div class="d-flex align-items-center">
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





})(jQuery);

