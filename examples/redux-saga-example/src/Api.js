const authorize = (user, password) =>
  fetch("http://our-backend.local/authorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user,
      password
    })
  })
    .then(result => (result.ok ? result.json() : Promise.reject(result)))
    .then(body => body.token);

const storeItem = items =>
  Object.keys(items).forEach(key =>
    window.localStorage.setItem(key, items[key])
  );

const clearItem = key => window.localStorage.removeItem(key);

export default {
  authorize,
  storeItem,
  clearItem
};
