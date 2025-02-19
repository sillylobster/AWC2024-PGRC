document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login if not authenticated
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "home.html";
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const cookbookId = urlParams.get("id");
  const resultsContainer = document.getElementById("results");
  const cookbookNameContainer = document.getElementById("cookbookName");
  const editCookbookNameBtn = document.getElementById("editCookbookNameBtn");

  const cookbooks =
    JSON.parse(localStorage.getItem(`cookbooks_${currentUser}`)) || [];
  const cookbook = cookbooks[cookbookId];

  if (!cookbook) {
    cookbookNameContainer.querySelector("h1").innerHTML = "Cookbook not found!";
    return;
  }

  const cookbookNameElement = cookbookNameContainer.querySelector("h1");
  cookbookNameElement.innerHTML = cookbook.name;

  // Function to handle in-line editing of cookbook name
  editCookbookNameBtn.addEventListener("click", function () {
    // Hide the edit button
    editCookbookNameBtn.style.display = "none";
    const currentName = cookbook.name;
    cookbookNameElement.innerHTML = `
      <input type="text" id="editCookbookNameInput" class="form-control d-inline w-auto" value="${currentName}">
      <button id="saveCookbookNameBtn" class="btn btn-primary ms-2">Save</button>
      <button id="cancelCookbookNameBtn" class="btn btn-secondary ms-2">Cancel</button>
    `;

    const editCookbookNameInput = document.getElementById(
      "editCookbookNameInput"
    );
    const saveCookbookNameBtn = document.getElementById("saveCookbookNameBtn");
    const cancelCookbookNameBtn = document.getElementById(
      "cancelCookbookNameBtn"
    );

    saveCookbookNameBtn.addEventListener("click", function () {
      const newName = editCookbookNameInput.value.trim();
      if (newName) {
        cookbook.name = newName;
        localStorage.setItem(
          `cookbooks_${currentUser}`,
          JSON.stringify(cookbooks)
        );
        cookbookNameElement.innerHTML = newName;
      } else {
        cookbookNameElement.innerHTML = currentName;
      }
      // Show the edit button
      editCookbookNameBtn.style.display = "inline-block";
    });

    cancelCookbookNameBtn.addEventListener("click", function () {
      cookbookNameElement.innerHTML = currentName;
      // Show the edit button
      editCookbookNameBtn.style.display = "inline-block";
    });
  });

  function displayMeals(meals) {
    // Clear previous results
    resultsContainer.innerHTML = "";

    if (meals.length === 0) {
      resultsContainer.innerHTML = `
        <div class="text-center">
          <p>No recipes added yet.</p>
          <a href="index.html" class="btn btn-primary btn-submit">Browse Recipes</a>
        </div>
      `;
      return;
    }

    meals.forEach((meal, index) => {
      const mealCard = `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <img data-src="${meal.strMealThumb}" class="card-img-top lazy" alt="${meal.strMeal}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${meal.strMeal}</h5>
              <div class="mt-auto">
                <a href="recipe.html?id=${meal.idMeal}" class="btn btn-primary btn-submit mt-auto">View Recipe</a>
                <button class="btn btn-danger btn-remove" data-index="${index}">Remove Recipe</button>
              </div>
            </div>
          </div>
        </div>
      `;
      resultsContainer.innerHTML += mealCard;
    });

    // Lazy load images
    const lazyImages = document.querySelectorAll(".lazy");
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((image) => {
      observer.observe(image);
    });

    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll(".btn-remove");
    removeButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const indexToRemove = event.target.getAttribute("data-index");
        // Remove recipe from array
        cookbook.recipes.splice(indexToRemove, 1); 

        // Update local storage
        localStorage.setItem(
          `cookbooks_${currentUser}`,
          JSON.stringify(cookbooks)
        );

        // Re-display meals
        displayMeals(cookbook.recipes);
      });
    });
  }

  displayMeals(cookbook.recipes);
});
