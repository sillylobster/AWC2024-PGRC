document.addEventListener("DOMContentLoaded", function () {
  // Fetch user information from localStorage
  let users = JSON.parse(localStorage.getItem("user")) || [];
  let currentUserEmail = localStorage.getItem("currentUser");
  let currentUser = users.find((user) => user.mail === currentUserEmail) || {};

  // Populate the profile details
  document.getElementById("profileName").textContent = currentUser.name || "";
  document.getElementById("profileLastName").textContent =
    currentUser.lname || "";
  document.getElementById("profileEmail").textContent = currentUser.mail || "";
  document.getElementById("profileTags").textContent =
    currentUser.tags?.join(", ") || "";

  // Populate the form fields
  document.getElementById("name").value = currentUser.name || "";
  document.getElementById("lname").value = currentUser.lname || "";
  document.getElementById("email").value = currentUser.mail || "";

  // Function to fetch tags from TheMealDB API
  async function fetchTagsFromAPI() {
    const url = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.meals.map((meal) => meal.strCategory);
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  }

  // Function to populate tags in the form
  async function populateTags() {
    const availableTags = await fetchTagsFromAPI();

    const tagsContainer = document.getElementById("tagsContainer");
    availableTags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("tag-button");
      button.textContent = tag;
      if (currentUser.tags?.includes(tag)) {
        button.classList.add("selected");
      }
      button.addEventListener("click", () => {
        button.classList.toggle("selected");

        // Limit selection to 3 tags
        const selectedTags = document.querySelectorAll(".tag-button.selected");
        if (selectedTags.length > 3) {
          button.classList.remove("selected");
          alert("You can only select up to 3 tags.");
        }
      });
      tagsContainer.appendChild(button);
    });
  }

  // Call the function to populate tags
  populateTags();

  // Fetch user reviews from localStorage
  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  const userReviews = reviews.filter(
    (review) => review.email === currentUserEmail
  );

  // Populate the reviews section
  const reviewsList = document.getElementById("reviewsList");
  userReviews.forEach((review, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <strong>Meal ID:</strong> ${review.mealId} <br>
      <strong>Rating:</strong> ${review.rating} <br>
      <strong>Comment:</strong> ${review.comment} <br>
      <strong>Date:</strong> ${review.date} <br>
      <button type="button" class="btn btn-danger btn-sm mt-2 delete-review" data-index="${index}">Delete Review</button>
      <a href="recipe.html?id=${review.mealId}" class="btn btn-primary btn-submit btn-sm mt-2 view-review">View Review</a>
    `;
    reviewsList.appendChild(li);
  });

  // Handle menu clicks
  document
    .getElementById("profileMenu")
    .addEventListener("click", function (e) {
      e.preventDefault();
      if (e.target.tagName === "A") {
        document
          .querySelectorAll(".section")
          .forEach((section) => section.classList.add("d-none"));
        const sectionId = e.target.getAttribute("data-section");
        document.getElementById(sectionId).classList.remove("d-none");
      }
    });

  // Handle form submission for profile updates
  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Get updated form data
      let name = document.getElementById("name").value;
      let lname = document.getElementById("lname").value;
      let password = document.getElementById("password").value;
      let email = document.getElementById("email").value;
      let tags = Array.from(
        document.querySelectorAll(".tag-button.selected")
      ).map((btn) => btn.textContent);

      // Find the index of the current user in the users array
      let currentUserIndex = users.findIndex(
        (user) => user.mail === currentUserEmail
      );

      if (validateModificationForm()) {
        if (currentUserIndex !== -1) {
          // Update user's profile data
          users[currentUserIndex].name = name;
          users[currentUserIndex].lname = lname;
          users[currentUserIndex].pass = password || currentUser.pass;
          users[currentUserIndex].mail = email;
          users[currentUserIndex].tags = tags;

          // Save updated users array back to localStorage
          localStorage.setItem("user", JSON.stringify(users));

          // Optionally, update current user session data
          localStorage.setItem("currentUser", email);

          // Show success message
          alert("Profile updated successfully.");

          // Update profile details
          document.getElementById("profileName").textContent = name;
          document.getElementById("profileLastName").textContent = lname;
          document.getElementById("profileEmail").textContent = email;
          document.getElementById("profileTags").textContent = tags.join(", ");

          // Switch back to profile details view
          document.getElementById("profileDetails").classList.remove("d-none");
          document.getElementById("profileForm").classList.add("d-none");
        } else {
          console.error("Current user not found in users array.");
          alert("Failed to update profile. Please try again.");
        }
      }
    });

  // Show the profile form when "Modify" button is clicked
  document
    .getElementById("modifyButton")
    .addEventListener("click", function () {
      document.getElementById("profileDetails").classList.add("d-none");
      document.getElementById("profileForm").classList.remove("d-none");
    });

  // Handle logout
  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      window.location.href = "home.html";
    });

  // Handle account deletion modal display
  document
    .getElementById("deleteAccountButton")
    .addEventListener("click", function () {
      var deleteModal = new bootstrap.Modal(
        document.getElementById("deleteAccountModal")
      );
      deleteModal.show();
    });

  // Handle account deletion confirmation
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", function () {
      try {
        // Retrieve the array of users from localStorage
        let users = JSON.parse(localStorage.getItem("user")) || [];
        // Retrieve the email of the current user to delete
        let currentUserEmail = localStorage.getItem("currentUser");
        // Filter out the current user from the users array
        let updatedUsers = users.filter(
          (user) => user.mail !== currentUserEmail
        );
        // Update localStorage with the modified users array
        localStorage.setItem("user", JSON.stringify(updatedUsers));
        // Optionally, clear the current user session
        localStorage.removeItem("currentUser");
        // Remove user's reviews from localStorage
        let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        let remainingReviews = reviews.filter(
          (review) => review.email !== currentUserEmail
        );
        localStorage.removeItem("cookbooks_" + currentUserEmail);
        localStorage.setItem("reviews", JSON.stringify(remainingReviews));
        // Redirect to login page
        window.location.href = "home.html";
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred while deleting the user.");
      }
    });

  // Handle review deletion
  reviewsList.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-review")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      if (!isNaN(index) && index >= 0 && index < userReviews.length) {
        if (confirm("Are you sure you want to delete this review?")) {
          // Remove review from local storage
          let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
          reviews.splice(index, 1);
          localStorage.setItem("reviews", JSON.stringify(reviews));
          // Remove review from UI
          e.target.parentNode.remove();
          alert("Review deleted successfully.");
        }
      } else {
        console.error("Invalid review index:", index);
      }
    }
  });

  // Ensure the modal backdrop is removed when the modal is hidden
  document
    .getElementById("deleteAccountModal")
    .addEventListener("hidden.bs.modal", function () {
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    });
});

function validateModificationForm() {
  const password = document.getElementById("password");
  const password2 = document.getElementById("password2");
  const name = document.getElementById("name");
  const lname = document.getElementById("lname");
  const email = document.getElementById("email");

  let isValid = true;

  // Retrieve the current user data from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  // Check if the email is already used by another user
  const users = JSON.parse(localStorage.getItem("user")) || [];

  if (
    users.some(
      (user) => user.email === email.value && user.mail !== currentUser.email
    )
  ) {
    alert("Email is already used by another user");
    email.classList.add("border-danger");
    isValid = false;
  } else {
    email.classList.remove("border-danger");
  }

  // Check if passwords match
  if (password.value !== password2.value) {
    alert("Passwords do not match");
    password.classList.add("border-danger");
    password2.classList.add("border-danger");
    isValid = false;
  } else {
    password.classList.remove("border-danger");
    password2.classList.remove("border-danger");
  }

  // Check if password length is at least 8 characters (only if a new password is provided)
  if (password.value && password.value.length < 8) {
    alert("Password must be at least 8 characters long");
    password.classList.add("border-danger");
    isValid = false;
  } else {
    password.classList.remove("border-danger");
  }

  // Check if first name is at least 3 characters long
  if (name.value.length < 3) {
    alert("First name must be at least 3 characters long");
    name.classList.add("border-danger");
    isValid = false;
  } else {
    name.classList.remove("border-danger");
  }

  // Check if last name is at least 3 characters long
  if (lname.value.length < 3) {
    alert("Last name must be at least 3 characters long");
    lname.classList.add("border-danger");
    isValid = false;
  } else {
    lname.classList.remove("border-danger");
  }

  return isValid;
}
