import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  let postsListContainer = document.getElementById("posts-container");
  let postForm = document.getElementById("post-form");
  let loadingSpinner = document.getElementById("loading");
  let alert = document.getElementById("alert");

  loadPosts();

  postForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    hideAlert();

    const post = {
      userId: await getUserId(),
      title: postForm.elements["post-title"].value,
      body: postForm.elements["post-text"].value,
    };

    console.log("creating post...", post);
    api
      .createPost(post)
      .then((p) => {
        console.log("post created", p);
        postForm.reset();
        loadPosts();
      })
      .catch((err) => {
        console.error("post creating failed", err);
        showAlert("Произошла ошибка при отправке поста");
      })
      .finally(setSubmitting(false));
  });

  async function getUserId() {
    // имитируем длительную (1.2с) загрузку id пользователя из системы авторизации
    return new Promise((resolve) =>
      setTimeout(() => resolve(sessionStorage.getItem("userId")), 1200)
    );
  }

  function loadPosts() {
    setLoading(true);
    hideAlert();

    console.log("loading posts...");
    api
      .getAllPosts()
      .then((posts) => {
        console.log("posts loaded");
        console.table(posts);
        showPosts(posts);
      })
      .catch((err) => {
        console.error("posts load failed", err);
        showAlert("Произошла ошибка при загрузке списка постов");
      })
      .finally(setLoading(false));
  }

  function showPosts(posts) {
    const postsList = createPostsList();
    posts.forEach((p) => postsList.append(createPostListItem(p)));
    postsListContainer.replaceChildren(postsList);
  }

  function createPostsList() {
    const list = document.createElement("ul");
    list.className = "list-group list-group-flush";
    return list;
  }

  function createPostListItem(post) {
    const li = document.createElement("div");
    const card = document.createElement("li");
    const title = document.createElement("div");
    const text = document.createElement("div");

    li.append(card);
    card.append(title);
    card.append(text);

    card.className = "card";
    li.className = "list-group-item";
    title.className = "card-header";
    text.className = "card-body";

    title.innerHTML = `
    <strong class="badge text-bg-secondary bi bi-person-fill">
      ${post.userId}
    </strong>
    ${post.title}`;
    text.innerText = post.body;
    return li;
  }

  function setSubmitting(isSubmitting) {
    postForm.querySelector(".spinner-border").hidden = !isSubmitting;
    postForm.querySelector("button").disabled = isSubmitting;
  }

  function setLoading(isLoading) {
    loadingSpinner.hidden = !isLoading;
    if (isLoading) {
      postsListContainer.replaceChildren();
    }
    postForm.querySelector("button").disabled = isLoading;
  }

  function hideAlert() {
    alert.hidden = true;
  }
  function showAlert(text, color = "danger") {
    alert.hidden = false;
    alert.innerText = text;
    alert.className = "alert alert-" + color;
  }
});
