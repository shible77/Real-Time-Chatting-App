export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export function saveUserName(username: string) {
  localStorage.setItem("username", username);
}

export function getUserName() {
  return localStorage.getItem("username");
}

export function removeUserName() {
  localStorage.removeItem("username");
}