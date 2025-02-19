document.addEventListener("DOMContentLoaded", async function () {
  // Redirect to login if not authenticated
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "home.html";
    return;
  }
});
