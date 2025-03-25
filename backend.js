function sign_up_users() {
    document.getElementById("signup-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        let users = JSON.parse(localStorage.getItem("users")) || {};

        if (users[username]) {
            alert("Username already taken. Please try another one.");
            return;
        }
        users[username] = password;
            localStorage.setItem("users", JSON.stringify(users));

            alert("Sign-up successful! You can now log in.");
            window.location.href = "login.html"; 
        });
}

function log_in_users() {
    document.getElementById("login-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        let users = JSON.parse(localStorage.getItem("users")) || {};

        if (users[username] && users[username] === password) {
            localStorage.setItem("loggedInUser", username); // Store logged-in user
            alert("Welcome, " + username + "!");
            window.location.href = "home.html"; // Redirect to homepage
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
}

function user_review() {
    document.getElementById('review-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const ra = document.getElementById('ra').value;
        const reviewText = document.getElementById('review').value;
        const reviewRating = document.getElementById('rating').value;
        const review = { ra, reviewText, reviewRating };

        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

        reviews.push(review);

        localStorage.setItem('reviews', JSON.stringify(reviews));

        const message = document.getElementById('message');
        message.textContent = `Thank you for your review, ${ra}! Your review has been submitted.`;

        window.location.href = 'all_reviews.html';
    });
}

function review_display() {
    document.addEventListener('DOMContentLoaded', function () {
            const reviewsList = document.getElementById('reviews-list');

            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

            if (reviews.length === 0) {
                reviewsList.innerHTML = '<p>No reviews yet.</p>';
            } else {
                reviews.forEach(function (review) {
                    const reviewElement = document.createElement('div');
                    reviewElement.classList.add('review');
                    reviewElement.innerHTML = `
                        <p><strong>RA:</strong> ${review.ra}</p>
                        <p><strong>Review:</strong> ${review.reviewText}</p>
                        <p><strong>Rating:</strong> ${review.reviewRating}</p>
                        <hr />
                    `;
                    reviewsList.appendChild(reviewElement);
                });
            }
        });
}

function logged_in_user_check() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const logButton = document.getElementById("login-button");
    const signUpButton = document.getElementById("signup-button");

    if (loggedInUser) {
        logButton.innerText = "Log Out";
        logButton.onclick = function() {
            localStorage.removeItem("loggedInUser");
            window.location.reload();
        };

        signUpButton.style.display = "none";

    } else {
        logButton.innerText = "Log In";
        logButton.onclick = function() {
            window.location.href = "login.html";
        };

    }
}