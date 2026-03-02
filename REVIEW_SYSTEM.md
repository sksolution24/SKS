# Review System Documentation

## Overview
A dynamic review submission system has been added to the testimonials page that allows customers to submit their feedback directly through a user-friendly form.

## Features

### 1. **Review Submission Form**
Located at the bottom of the testimonials section with the following fields:
- **Client Name** - Customer's full name (required)
- **Profession** - Customer's profession/title (required)
- **Email Address** - Contact email (required, validated)
- **Rating** - 5-star interactive rating system with hover effects
- **Review Text** - Detailed feedback textarea (required)
- **Submit Button** - Submits the review

### 2. **Interactive Star Rating**
- Click on stars to select a rating (1-5)
- Hover effects show which rating is being selected
- Visual feedback with color change (gray to primary blue)
- Selected rating is highlighted after clicking
- Required field - user must select a rating to submit

### 3. **Data Storage**
- Reviews are stored in browser's **localStorage** under the key `customerReviews`
- Data persists across browser sessions
- Each review includes:
  - Customer name
  - Profession
  - Email address
  - Rating (1-5)
  - Review text
  - Timestamp of submission

### 4. **Automatic Display**
- New reviews are automatically added to the testimonial carousel
- Reviews are displayed with the same styling as existing testimonials
- Default user avatar (img/default-user.jpg) is used for new submissions
- Star ratings are displayed as visual stars
- Reviews appear in the scrolling carousel with existing testimonials

## How It Works

### Form Submission Process:
1. User fills out all required fields in the review form
2. User selects a star rating (1-5)
3. User clicks "Submit Review"
4. Review is validated (all fields required, rating selected)
5. Review data is saved to browser's localStorage
6. Review is immediately added to the testimonial carousel
7. Form is cleared and user receives confirmation message
8. Carousel is refreshed to include new review

### Data Loading:
- On page load, existing reviews from localStorage are automatically loaded
- Reviews are added to the testimonial carousel in the order they were submitted
- Carousel auto-plays and allows users to scroll through reviews

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage feature supported in IE 8+
- Requires JavaScript enabled

## Customization

### To Change Storage Backend:
If you want to use a server-side database instead of localStorage, modify the following functions in testimonial.html:
- `saveReviewToStorage(review)` - Change to send data to backend API
- `loadReviewsFromStorage()` - Change to fetch data from backend API

#### Using Google Sheets
You can use a Google Sheet as a lightweight shared datastore by exposing it via one of the following methods:

1. **Google Apps Script Web App**
   - Create a new Google Sheet and open **Extensions > Apps Script**.
   - Write a script with `doGet(e)`/`doPost(e)` handlers that read/write rows.
   - Deploy the script as a *web app* and grant access to **Anyone, even anonymous**.
   - In the review JS, use `fetch()` to POST new reviews to the web app URL and GET the sheet contents. The sheet rows act as your review records.
   - Example POST in JS:
     ```js
     function saveReviewToStorage(review) {
       return fetch(webAppUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(review)
       });
     }
     ```
   - GET the reviews during load with `fetch(webAppUrl + '?action=list')` and append results.
   - Make sure to convert sheet rows to the same object structure and back.

2. **Third‑party wrappers** (SheetDB, Sheety, etc.)
   - Sign up for a service that turns a sheet into a REST API.
   - Configure the service to point at your Google Sheet.
   - Use the provided API endpoint exactly like a normal backend in the JS code above.

> **Notes:**
> - Google Sheets is free and quick to set up, but not designed for high traffic.
> - There is a limit on read/write operations (per user and per minute) and the web app may take a second or two to respond.
> - All clients will see updates as soon as they reload or if you poll for changes; for real‑time push you'd still need web sockets or a refresh mechanism.

After implementing either method, update the `saveReviewToStorage`/`loadReviewsFromStorage` functions in `review-system.js` to call the sheet API instead of `localStorage`.  Replace the current storage section of the docs with this information.

### Using Firebase as the Backend
If you prefer a more robust real-time solution without managing a server, Firebase is a great choice. Here's how to adapt the review system:

1. **Create a Firebase Project:**
   - Go to the [Firebase console](https://console.firebase.google.com) and create a new project.
   - Enable **Firestore** (or Realtime Database) in test mode for rapid prototyping.

2. **Add Firebase SDK to HTML pages:**
   ```html
   <!-- Add these before other scripts -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
   <script>
     const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       // other values from your console
     };
     firebase.initializeApp(firebaseConfig);
     const db = firebase.firestore();
   </script>
   ```

3. **Modify storage functions in `review-system.js`:**
   ```js
   function saveReviewToStorage(review) {
     // return promise for chaining
     return db.collection('reviews').add(review);
   }

   function loadReviewsFromStorage() {
     // realtime listener
     db.collection('reviews').orderBy('timestamp')
       .onSnapshot(snapshot => {
         // clear existing carousel items first if desired
         snapshot.docChanges().forEach(change => {
           if (change.type === 'added') {
             addReviewToCarousel(change.doc.data());
           } else if (change.type === 'removed') {
             // remove from DOM using timestamp or id
             removeReview(change.doc.id);
           }
         });
       });
   }
   ```
   - Store `review.timestamp` as a Firestore field. You may also store `id` using `doc.id` if needed.

4. **Handle deletion:**
   ```js
   function removeReview(id) {
     db.collection('reviews').doc(id).delete();
   }
   ```
   - Update `addReviewToCarousel` to save the document ID in the element (e.g. `data-id="${reviewId}"`).

5. **Realtime updates:**
   - Because the listener is active, any new review submitted from any client will pop into every open page automatically without reload.
   - Deletions propagate as well.

6. **Security rules (important before production):**
   - In the Firebase console, set Firestore rules to restrict who can write or delete. For example:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /reviews/{review} {
           allow read: if true;
           allow write: if request.time < timestamp.date(2026, 12, 31);
         }
       }
     }
     ```
     (Change to appropriate conditions.)

This Firebase setup provides a scalable, instant synchronization layer so that all visitors—across devices and tabs—see submitted reviews in real time.

### To Change Default Avatar:
Update the image path in the `addReviewToCarousel()` function:
```javascript
<img src="img/your-image.jpg" alt="Customer avatar"
```

### To Change Form Styling:
Edit the CSS classes in `css/style.css`:
- `#reviewForm` - Main form styling
- `.star-icon` - Star rating styling
- `.review-rating` - Rating container styling

## Features & Functionality

### Form Validation:
- All fields are required
- Email format is validated
- Rating must be selected (1-5)
- Text fields are escaped to prevent HTML injection

### Security:
- HTML content from user input is escaped before display
- Prevents XSS (Cross-Site Scripting) attacks
- Safe handling of special characters in names and reviews

### User Experience:
- Form includes visual feedback (hover effects, color changes)
- Success message displayed after submission
- Form automatically clears after submission
- Carousel automatically updates with new review

## Data Structure

Each review object in localStorage contains:
```json
{
  "name": "Customer Name",
  "profession": "Job Title",
  "email": "customer@email.com",
  "rating": 5,
  "text": "Review text here...",
  "timestamp": "2026-03-02T10:30:45.123Z"
}
```

## Troubleshooting

### Reviews Not Appearing:
1. Check if JavaScript is enabled in browser
2. Check browser's localStorage is not disabled
3. Clear browser cache and reload page
4. Check browser console for errors (F12 → Console)

### Form Not Submitting:
1. Ensure all fields are filled
2. Ensure a rating is selected
3. Check if email format is valid
4. Verify JavaScript is enabled

### Reviews Not Persisting:
1. Check if localhost storage is enabled
2. Try clearing browser cache
3. Check if private/incognito mode is being used (localStorage may be disabled)

## Future Enhancements

Possible improvements:
1. Backend API integration for persistent server storage
2. Email verification for submitted reviews
3. Admin panel to moderate reviews
4. Pagination for displaying reviews
5. Filtering reviews by rating
6. Image upload for customer profile pictures
7. Social sharing of reviews
8. Average rating calculation and display

## Technical Details

### JavaScript Libraries Used:
- jQuery (for carousel management)
- Bootstrap 5 (for form styling)
- Owl Carousel (for testimonial display)
- Font Awesome (for star icons)

### Files Modified:
- `testimonial.html` - Added form HTML and JavaScript
- `css/style.css` - Added custom styling for review system

### No Server Required:
This system works entirely on the client-side using browser localStorage, making it suitable for static websites without backend infrastructure.
