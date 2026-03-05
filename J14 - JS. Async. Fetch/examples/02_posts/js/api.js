export const api = {
  host: "https://jsonplaceholder.typicode.com/",

  getUrl(path) {
    return new URL(path, this.host);
  },

  getPost(id) {
    return fetch(this.getUrl(`/posts/${id}`))
    .then((response) =>
      response.json()
    );
  },

  getPostComments(id) {
    return fetch(this.getUrl(`/posts/${id}/comments`))
    .then((response) => response.json());
  },

  getAllPosts() {
    return fetch(this.getUrl("/posts/"))
    .then((response) => response.json());
  },

  getPostsOfUser(userId) {
    return fetch(this.getUrl(`/posts?userId=${userId}`))
    .then((response) => response.json());
  },

  createPost(post) {
    return fetch(this.getUrl("/posts/"), {
      method: "POST",
      body: JSON.stringify(post),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => response.json());
  },

  deletePost(id) {
    return fetch(this.getUrl(`/posts/${id}`), {
      method: "DELETE",
    });
  },
};
