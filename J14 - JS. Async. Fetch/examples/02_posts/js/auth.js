document.addEventListener("DOMContentLoaded", () => {
  let userIdElement = document.getElementById("user-id");
  let userId = 1 + Math.round(Math.random() * 10);
  sessionStorage.setItem("userId", userId);
  userIdElement.innerText = userId;
});
