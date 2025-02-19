document.addEventListener("DOMContentLoaded", async function () {
  // Redirect to login if not authenticated
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "home.html";
    return;
  }

  const resultsContainer = document.getElementById("results");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const letterDropdownMenu = document.getElementById("letterDropdownMenu");
  const categoryDropdownMenu = document.getElementById("categoryDropdownMenu");
  const ingredientDropdownMenu = document.getElementById(
    "ingredientDropdownMenu"
  );
  const loadingSpinner = document.getElementById("loading");
  const cookbookList = document.getElementById("cookbookList");
  const selectedFiltersElem = document.getElementById("selectedFilters");

  let allMeals = [];
  let selectedMeal = null;
  let activeCategoryFilter = null;
  let activeLetterFilter = null;
  let activeIngredientFilter = null;

  async function fetchAllRecipes() {
    try {
      const fetchPromises = [];
      for (let i = 97; i <= 122; i++) {
        const fetchPromise = fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?f=${String.fromCharCode(
            i
          )}`
        )
          .then((response) => response.json())
          .then((data) => data.meals || []);
        fetchPromises.push(fetchPromise);
      }
      allMeals = await Promise.all(fetchPromises);
      return allMeals.flat();
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  }

  // Function to fetch categories
  async function fetchCategories() {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/categories.php"
      );
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  // Function to fetch Ingredients
  async function fetchIngredients() {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
      );
      const data = await response.json();
      localStorage.setItem("ingredients", JSON.stringify(data.meals));
      return data.meals;
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return [];
    }
  }

  // sort allMeals alphabetically by name
  function sortMealsAlphabetically(allMeals) {
    return allMeals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
  }

  // display 100 meals
  function displayMeals(allMeals) {
    resultsContainer.innerHTML = "";

    const mealsToDisplay = allMeals.slice(0, 100);

    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    mealsToDisplay.forEach((meal) => {
      const reviewsMeal = reviews.filter(
        (review) => review.mealId === meal.idMeal
      );
      const mealCard = `
   <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img data-src="${meal.strMealThumb}" class="card-img-top lazy" alt="${meal.strMeal}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <p class="card-text text-secondary">${reviewsMeal.length} reviews</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <a href="recipe.html?id=${meal.idMeal}" class="btn btn-primary btn-recipe">View Recipe</a>
                            <button class="btn btn-add" onclick="openCookbookModal('${meal.idMeal}')">
                                <i class="bi bi-plus"></i>
                            </button>
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
  }

  // Show loading spinner
  function showLoadingSpinner() {
    loadingSpinner.style.display = "block";
  }

  // Hide loading spinner
  function hideLoadingSpinner() {
    loadingSpinner.style.display = "none";
  }

  //handle the search functionality
  function handleSearch() {
    const query = searchInput.value.toLowerCase();
    const filteredMeals = allMeals.filter((meal) =>
      meal.strMeal.toLowerCase().includes(query)
    );
    applyFilters(filteredMeals);
  }

  // Load recipes from local storage or fetch them if not available
  showLoadingSpinner();
  try {
    const storedMeals = localStorage.getItem("allMeals");
    if (storedMeals) {
      allMeals = JSON.parse(storedMeals);
    } else {
      allMeals = await fetchAllRecipes();
      localStorage.setItem("allMeals", JSON.stringify(allMeals));
    }
  } catch (error) {
    console.error("Error parsing or fetching allMeals:", error);
    allMeals = await fetchAllRecipes();
    localStorage.setItem("allMeals", JSON.stringify(allMeals));
  }
  hideLoadingSpinner();

  const sortedMeals = sortMealsAlphabetically(allMeals);
  displayMeals(sortedMeals);

  // Add search functionality
  searchInput.addEventListener("input", handleSearch);
  searchButton.addEventListener("click", handleSearch);

  // Add Enter key functionality
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  // Add letters to dropdown
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  letters.forEach((letter) => {
    const letterItem = document.createElement("li");
    letterItem.innerHTML = `<a class="dropdown-item" href="#">${letter}</a>`;
    letterItem.addEventListener("click", () => handleLetterFilter(letter));
    letterDropdownMenu.appendChild(letterItem);
  });

  // Fetch categories and add to dropdown
  const categories = await fetchCategories();
  categories.forEach((category) => {
    const categoryItem = document.createElement("li");
    categoryItem.innerHTML = `<a class="dropdown-item" href="#">${category.strCategory}</a>`;
    categoryItem.addEventListener("click", () =>
      handleCategoryFilter(category.strCategory)
    );
    categoryDropdownMenu.appendChild(categoryItem);
  });

  // Fetch ingredients and add to dropdown
  const ingredients = await fetchIngredients();
  ingredients.forEach((ingredient) => {
    const ingredientItem = document.createElement("li");
    ingredientItem.innerHTML = `<a class="dropdown-item" href="#">${ingredient.strIngredient}</a>`;
    ingredientItem.addEventListener("click", () =>
      handleIngredientFilter(ingredient.strIngredient)
    );
    ingredientDropdownMenu.appendChild(ingredientItem);
  });

  // Function to handle filtering by letter
  function handleLetterFilter(letter) {
    activeLetterFilter = letter;
    updateSelectedFiltersUI();
    applyFilters(allMeals);
  }

  // Function to handle filtering by category
  function handleCategoryFilter(category) {
    activeCategoryFilter = category;
    updateSelectedFiltersUI();
    applyFilters(allMeals);
  }

  // Function to handle filtering by ingredient
  function handleIngredientFilter(ingredient) {
    activeIngredientFilter = ingredient;
    updateSelectedFiltersUI();
    applyFilters(allMeals);
  }

  // Function to update selected filters UI
  function updateSelectedFiltersUI() {
    selectedFiltersElem.innerHTML = "";

    if (activeLetterFilter) {
      const filterItem = document.createElement("span");
      filterItem.className = "badge bg-secondary me-2";
      filterItem.textContent = `Letter: ${activeLetterFilter} `;
      const closeBtn = document.createElement("button");
      closeBtn.className = "btn-close btn-close-white";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", () => {
        activeLetterFilter = null;
        updateSelectedFiltersUI();
        applyFilters(allMeals);
      });
      filterItem.appendChild(closeBtn);
      selectedFiltersElem.appendChild(filterItem);
    }

    if (activeCategoryFilter) {
      const filterItem = document.createElement("span");
      filterItem.className = "badge bg-secondary me-2";
      filterItem.textContent = `Category: ${activeCategoryFilter} `;
      const closeBtn = document.createElement("button");
      closeBtn.className = "btn-close btn-close-white";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", () => {
        activeCategoryFilter = null;
        updateSelectedFiltersUI();
        applyFilters(allMeals);
      });
      filterItem.appendChild(closeBtn);
      selectedFiltersElem.appendChild(filterItem);
    }

    if (activeIngredientFilter) {
      const filterItem = document.createElement("span");
      filterItem.className = "badge bg-secondary me-2";
      filterItem.textContent = `Ingredient: ${activeIngredientFilter} `;
      const closeBtn = document.createElement("button");
      closeBtn.className = "btn-close btn-close-white";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", () => {
        activeIngredientFilter = null;
        updateSelectedFiltersUI();
        applyFilters(allMeals);
      });
      filterItem.appendChild(closeBtn);
      selectedFiltersElem.appendChild(filterItem);
    }
  }

  // apply active filters
  function applyFilters(meals) {
    let filteredMeals = [...meals];

    if (activeLetterFilter) {
      filteredMeals = filteredMeals.filter((meal) =>
        meal.strMeal.toLowerCase().startsWith(activeLetterFilter.toLowerCase())
      );
    }

    if (activeCategoryFilter) {
      filteredMeals = filteredMeals.filter(
        (meal) =>
          meal.strCategory.toLowerCase() === activeCategoryFilter.toLowerCase()
      );
    }

    if (activeIngredientFilter) {
      filteredMeals = filteredMeals.filter((meal) => {
        // Check all possible ingredients
        for (let i = 1; i <= 20; i++) {
          const ingredientField = `strIngredient${i}`;
          if (
            meal[ingredientField] &&
            meal[ingredientField]
              .toLowerCase()
              .includes(activeIngredientFilter.toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      });
    }

    displayMeals(filteredMeals);
  }

  // Function to open the cookbook modal
  window.openCookbookModal = function (mealId) {
    selectedMeal = allMeals.find((meal) => meal.idMeal === mealId);
    const cookbooks =
      JSON.parse(localStorage.getItem(`cookbooks_${currentUser}`)) || [];
    cookbookList.innerHTML = "";

    if (cookbooks.length === 0) {
      const createBookButton = document.createElement("button");
      createBookButton.className = "btn btn-primary btn-submit";
      createBookButton.innerText = "Create Recipe Book";
      createBookButton.onclick = function () {
        window.location.href = "book.html";
      };
      cookbookList.appendChild(createBookButton);
    } else {
      cookbooks.forEach((cookbook, index) => {
        const cookbookItem = document.createElement("li");
        cookbookItem.className = "list-group-item";
        cookbookItem.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <span>${cookbook.name}</span>
            <button class="btn btn-primary btn-sm btn-submit" onclick="addRecipeToCookbook(${index})">Add</button>
          </div>
        `;
        cookbookList.appendChild(cookbookItem);
      });
    }

    const cookbookModal = new bootstrap.Modal(
      document.getElementById("cookbookModal")
    );
    cookbookModal.show();
  };

  // Function to add the selected meal to a cookbook
  window.addRecipeToCookbook = function (index) {
    if (selectedMeal) {
      const cookbooks =
        JSON.parse(localStorage.getItem(`cookbooks_${currentUser}`)) || [];
      const selectedCookbook = cookbooks[index];

      // Check if the recipe already exists in the cookbook
      if (
        selectedCookbook.recipes.some(
          (recipe) => recipe.idMeal === selectedMeal.idMeal
        )
      ) {
        alert(
          `Recipe "${selectedMeal.strMeal}" is already in cookbook "${selectedCookbook.name}"`
        );
      } else {
        // Add the recipe to the cookbook
        if (!selectedCookbook.recipes) {
          selectedCookbook.recipes = [];
        }
        selectedCookbook.recipes.push(selectedMeal);
        localStorage.setItem(
          `cookbooks_${currentUser}`,
          JSON.stringify(cookbooks)
        );
        alert(
          `Recipe "${selectedMeal.strMeal}" added to cookbook "${selectedCookbook.name}"`
        );
      }

      // Hide the modal
      const cookbookModal = bootstrap.Modal.getInstance(
        document.getElementById("cookbookModal")
      );
      cookbookModal.hide();
    }
  };
});
