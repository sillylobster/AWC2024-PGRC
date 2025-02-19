document.addEventListener("DOMContentLoaded", () => {
  fetchTags();
});

async function fetchTags() {
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
    );
    const data = await response.json();
    const tagsContainer = document.getElementById("tagsContainer");
    if (tagsContainer) {
      data.meals.forEach((tag) => {
        const tagButton = document.createElement("button");
        tagButton.type = "button";
        tagButton.className = "tag-button btn btn-outline-primary";
        tagButton.textContent = tag.strCategory;
        tagButton.onclick = () => toggleTag(tagButton);
        tagsContainer.appendChild(tagButton);
      });
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
}

function toggleTag(tagButton) {
  const selectedTags = document.querySelectorAll(".tag-button.selected");
  if (tagButton.classList.contains("selected")) {
    tagButton.classList.remove("selected");
  } else if (selectedTags.length < 3) {
    tagButton.classList.add("selected");
  } else {
    alert("You can select up to 3 tags only");
  }
}

function saveUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || [];

    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value;
    const lname = document.getElementById("lname").value;
    const email = document.getElementById("email").value;
    const selectedTags = Array.from(
      document.querySelectorAll(".tag-button.selected")
    ).map((button) => button.textContent);

    const newUser = {
      name: name,
      lname: lname,
      pass: password,
      mail: email,
      tags: selectedTags,
    };

    if (user.some((user1) => user1.mail === newUser.mail)) {
      alert("User already exists");
      return false;
    } else {
      user.push(newUser);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "login.html";
    }

    console.log(newUser);
    console.log(user);
  } catch (error) {
    console.error("Error saving user:", error);
  }

  return false;
}

function togglePasswordVisibility(
  inputId = "password",
  iconId = "togglePasswordIcon"
) {
  const passwordInput = document.getElementById(inputId);
  const togglePasswordIcon = document.getElementById(iconId);

  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";

  togglePasswordIcon.classList.toggle("bi-eye");
  togglePasswordIcon.classList.toggle("bi-eye-slash");
}

function validateForm() {
  const password = document.getElementById("password");
  const password2 = document.getElementById("password2");
  const name = document.getElementById("name");
  const lname = document.getElementById("lname");
  const email = document.getElementById("email");

  let isValid = true;

  // Check if the email is already used
  const user = JSON.parse(localStorage.getItem("user")) || [];

  if (user.some((user1) => user1.mail === email.value)) {
    alert("Email is already used");
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

  // Check if password length is at least 8 characters
  if (password.value.length < 8) {
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

  if (isValid) {
    return saveUser();
  }

  return false;
}
