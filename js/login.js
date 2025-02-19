function loginUser() {
  var users = JSON.parse(localStorage.getItem("user"));

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  var authenticatedUser = users.find(
    (user) => user.mail === email && user.pass === password
  );

  if (authenticatedUser) {
    localStorage.setItem("currentUser", email);
    window.location.href = "index.html";
  } else {
    alert("Invalid email or password");
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  }

  return false;
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const togglePasswordIcon = document.getElementById("togglePasswordIcon");

  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";

  togglePasswordIcon.classList.toggle("bi-eye");
  togglePasswordIcon.classList.toggle("bi-eye-slash");
}
