document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login if not authenticated
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "home.html";
    return;
  }

  const cookbookNameInput = document.getElementById("cookbookNameInput");
  const createCookbookButton = document.getElementById("createCookbookButton");
  const cookbooksContainer = document.getElementById("cookbooksContainer");

  let cookbooks =
    JSON.parse(localStorage.getItem(`cookbooks_${currentUser}`)) || [];

  // Function to display the cookbooks
  function displayCookbooks() {
    cookbooksContainer.innerHTML = "";
    cookbooks.forEach((cookbook, index) => {
      const cookbookCard = document.createElement("div");
      cookbookCard.className = "col-md-4 mb-4";
      cookbookCard.innerHTML = `
        <div class="card h-100">
          <img src="images/book_cover.jpg" class="card-img-top" alt="Cookbook Cover">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${cookbook.name}</h5>
            <p class="card-text text-secondary">${cookbook.recipes.length} recipes</p>
            <div class="mt-auto">
              <button class="btn btn-primary btn-block btn-submit" onclick="viewCookbook(${index})">View</button>
              <button class="btn btn-danger btn-block" onclick="deleteCookbook(${index})">Delete</button>
            </div>
          </div>
        </div>
      `;
      cookbooksContainer.appendChild(cookbookCard);
    });
  }

  // Function to create a new cookbook
  createCookbookButton.addEventListener("click", function () {
    const cookbookName = cookbookNameInput.value.trim();
    if (cookbookName) {
      cookbooks.push({ name: cookbookName, recipes: [] });
      localStorage.setItem(
        `cookbooks_${currentUser}`,
        JSON.stringify(cookbooks)
      );
      displayCookbooks();
      cookbookNameInput.value = "";
    }
  });

  // Function to view a cookbook's recipes
  window.viewCookbook = function (index) {
    window.location.href = `cookbook.html?id=${index}`;
  };

  // Function to delete a cookbook
  window.deleteCookbook = function (index) {
    cookbooks.splice(index, 1);
    localStorage.setItem(`cookbooks_${currentUser}`, JSON.stringify(cookbooks));
    displayCookbooks();
  };

  displayCookbooks();
});
