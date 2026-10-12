const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function apiRequest(endpoint, options = {}) {
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
...options,
headers: {
"Content-Type": "application/json",
...options.headers,
},
});

const data = await response.json().catch(() => ({}));

if (!response.ok) {
const message =
typeof data.detail === "string"
? data.detail
: "Request failed. Please try again.";

```
throw new Error(message);
```

}

return data;
}

export function registerUser({ full_name, email, password }) {
return apiRequest("/auth/register", {
method: "POST",
body: JSON.stringify({ full_name, email, password }),
});
}

export function loginUser({ email, password }) {
return apiRequest("/auth/login", {
method: "POST",
body: JSON.stringify({ email, password }),
});
}

export function getCurrentUser(token) {
return apiRequest("/auth/me", {
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
});
}

export function analyzeOpportunity({ subject, sender_email, email_body, url }, token) {
  return apiRequest("/verification/analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject,
      sender_email,
      email_body,
      url,
    }),
  });
}
export function getVerificationHistory(token) {
  return apiRequest("/verification/history", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}