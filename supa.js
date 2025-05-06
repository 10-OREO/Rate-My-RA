import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = 'https://fjxqfqsttjvoobmdvpzf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeHFmcXN0dGp2b29ibWR2cHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDIzMTEsImV4cCI6MjA1ODUxODMxMX0.XYc0L58nbhGqHZDwBgvgt5YDVWE2A3FFk3GeYv1R2gE';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Sign up
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { error } = await supabase
        .from('users')
        .insert([{ email, password, is_active: true }]);

      if (error) {
        alert("Error creating user: " + error.message);
      } else {
        alert(`User ${email} created successfully!`);
        window.location.href = "login.html";
      }
    });
  }

  // Log in
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { data, error } = await supabase
        .from('users')
        .select('email, password, is_active')
        .eq('email', email)
        .single();

      if (error) {
        alert("Error fetching user: " + error.message);
      } else if (data && data.password === password) {
        await supabase
          .from('users')
          .update({ is_active: true })
          .eq('email', data.email);

        alert("Welcome, " + data.email + "!");
        window.location.href = "home.html";
      } else {
        alert("Invalid email or password.");
      }
    });
  }

  // Login/Logout Button
  const loginBtn = document.getElementById('login-button');
  if (loginBtn) {
    supabase
      .from('users')
      .select('email')
      .eq('is_active', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          loginBtn.textContent = 'Login';
          loginBtn.onclick = () => {
            window.location.href = 'login.html';
          };
        } else {
          loginBtn.textContent = 'Logout';
          loginBtn.onclick = async () => {
            await supabase
              .from('users')
              .update({ is_active: false })
              .eq('email', data.email);
            alert('Logged out.');
            window.location.reload();
          };
        }
      });
  }

  // Submit Review
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const ra = document.getElementById('ra').value;
      const review_text = document.getElementById('review').value;
      const rating = parseInt(document.getElementById('rating').value);

      const { error } = await supabase
        .from('reviews')
        .insert([{ ra_name: ra, review_text: review_text, rating: rating }]);

      if (error) {
        alert("Error submitting review: " + error.message);
      } else {
        const message = document.getElementById('message');
        if (message) {
          message.textContent = `Thank you for reviewing ${ra}! Your review has been submitted.`;
        }
        // Redirect to the RA's profile page
        window.location.href = `ra_profile.html?ra_name=${ra}`;
      }
    });
  }

  // Display all reviews on the "all_reviews.html" page
  const reviewsList = document.getElementById('reviews-list');
  if (reviewsList) {
    (async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        reviewsList.innerHTML = `<p>Error loading reviews: ${error.message}</p>`;
        return;
      }

      if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet.</p>';
      } else {
        reviews.forEach(function (review) {
          const reviewElement = document.createElement('div');
          reviewElement.classList.add('review');
          reviewElement.innerHTML = `
            <p><strong>RA:</strong> ${review.ra_name}</p>
            <p><strong>Review:</strong> ${review.review_text}</p>
            <p><strong>Rating:</strong> ${review.rating}</p>
            <hr />
          `;
          reviewsList.appendChild(reviewElement);
        });
      }
    })();
  }

  // RA Profile Page: Display Reviews for a Specific RA or All RAs
  const raProfileReviewsList = document.getElementById('ra-profile-reviews-list');
  if (raProfileReviewsList) {
    (async () => {
      const query = window.location.search;
      let raName = null;

      if (query.startsWith("?")) {
        const params = query.substring(1).split("&");
        for (const param of params) {
          const [key, value] = param.split("=");
          if (key === "ra_name") {
            raName = decodeURIComponent(value);
            break;
          }
        }
      }

      let reviews;
      let error;

      if (raName) {
        ({ data: reviews, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('ra_name', raName)
          .order('created_at', { ascending: false }));
      } else {
        ({ data: reviews, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false }));
      }

      if (error) {
        raProfileReviewsList.innerHTML = `<p>Error loading reviews: ${error.message}</p>`;
        return;
      }

      if (!reviews || reviews.length === 0) {
        raProfileReviewsList.innerHTML = '<p>No reviews found.</p>';
      } else {
        reviews.forEach(function (review) {
          const reviewElement = document.createElement('div');
          reviewElement.classList.add('review');
          reviewElement.innerHTML = `
            <p><strong>RA:</strong> ${review.ra_name}</p>
            <p><strong>Review:</strong> ${review.review_text}</p>
            <p><strong>Rating:</strong> ${review.rating}</p>
            <hr />
          `;
          raProfileReviewsList.appendChild(reviewElement);
        });
      }
    })();
  }

  // Create RA Profile Form
  const raProfileForm = document.getElementById('ra-profile-form');
  if (raProfileForm) {
    raProfileForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('ra-name').value;
      const hall = document.getElementById('ra-hall').value;

      // Check if RA already exists
      const { data: existingRA, error: fetchError } = await supabase
        .from('ra_profile')
        .select('*')
        .eq('ra_name', name)
        .single();

      if (existingRA) {
        alert(`An RA profile for "${name}" already exists.`);
        return;
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        alert("Error checking existing profile: " + fetchError.message);
        return;
      }

      // Insert if not found
      const { error: insertError } = await supabase
        .from('ra_profile')
        .insert([{ ra_name: name, ra_hall: hall }]);

      const message = document.getElementById('profile-message');
      if (insertError) {
        alert("Error creating profile: " + insertError.message);
      } else {
        alert(`RA profile for ${name} created successfully!`);
        raProfileForm.reset();
      }
    });
  }

  // Display all RA profiles
const raProfilesList = document.getElementById('ra-profiles-list');
if (raProfilesList) {
  (async () => {
    const { data: profiles, error } = await supabase
      .from('ra_profile')
      .select('*')
      .order('ra_name', { ascending: true });

    if (error) {
      raProfilesList.innerHTML = `<p>Error loading RA profiles: ${error.message}</p>`;
      return;
    }

    if (!profiles || profiles.length === 0) {
      raProfilesList.innerHTML = '<p>No RA profiles found.</p>';
    } else {
      profiles.forEach(function (profile) {
        const profileElement = document.createElement('div');
        profileElement.classList.add('ra-profile');
        profileElement.innerHTML = `
          <p><strong>Name:</strong> ${profile.ra_name}</p>
          <p><strong>Hall:</strong> ${profile.ra_hall}</p>
          <hr />
        `;
        raProfilesList.appendChild(profileElement);
      });
    }
  })();
}

});
