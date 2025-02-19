document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login if not authenticated
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "home.html";
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const mealId = urlParams.get("id");

  fetchRecipeDetails(mealId);
});

async function fetchRecipeDetails(id) {
  const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    displayRecipe(data.meals[0], id);
    displayReviews(id);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

function displayRecipe(meal, mealId) {
  const recipeDetails = document.getElementById("recipeDetails");
  const ingredients = [];

  // Collect all ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }

  // Construct HTML for displaying recipe details
  const recipeHTML = `
    <div class="card">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${meal.strMealThumb}" class="img-fluid" alt="${
    meal.strMeal
  }">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${meal.strMeal}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Ingredients</h6>
            <ul class="list-group mb-3">
              ${ingredients
                .map(
                  (ingredient) =>
                    `<li class="list-group-item">${ingredient}</li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      </div>
      <div class="row g-0">
        <div class="card-body">
          <h5>Instructions</h5>
          <p class="card-text">${meal.strInstructions}</p>
          <a href="${
            meal.strSource
          }" class="btn btn-primary btn-submit" target="_blank">Source</a>
        </div>
      </div>
      <div class="row g-0">
        <div class="card-body">
          <h5>Leave a Review</h5>
          <form id="reviewForm">
            <div class="mb-3">
              <label for="rating" class="form-label">Rating</label>
              <select id="rating" class="form-select" required>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="comment" class="form-label">Comment</label>
              <textarea id="comment" class="form-control" rows="3" ></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-submit">Submit Review</button>
          </form>
          <h5 class="mt-4">Reviews</h5>
          <div id="reviewsList">
            <!-- Reviews will be dynamically added here -->
          </div>
        </div>
      </div>
    </div>
  `;

  recipeDetails.innerHTML = recipeHTML;

  document
    .getElementById("reviewForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      submitReview(mealId);
    });
}

function submitReview(mealId) {
  const email = localStorage.getItem("currentUser");
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;

  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.push({
    email,
    mealId,
    rating,
    comment,
    date: new Date().toLocaleString(),
  });
  localStorage.setItem("reviews", JSON.stringify(reviews));

  displayReviews(mealId);
  document.getElementById("reviewForm").reset();
}

function displayReviews(mealId) {
  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  const reviewsList = document.getElementById("reviewsList");

  const mealReviews = reviews.filter((review) => review.mealId === mealId);

  if (mealReviews.length === 0) {
    reviewsList.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
  } else {
    reviewsList.innerHTML = mealReviews
      .map(
        (review) => `
        <div class="mb-3">
          <div class="card">
            <div class="card-body">
              <h5>${review.email}</h5>
              <h6>${review.rating} Stars</h6>
              <p class="card-text">${review.comment}</p>
              <p class="text-muted">${review.date}</p>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }
}
