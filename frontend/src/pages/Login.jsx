import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
email: "",
password: "",
});

const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);

function handleChange(event) {
const { name, value } = event.target;


setFormData((previous) => ({
  ...previous,
  [name]: value,
}));


}

async function handleSubmit(event) {
event.preventDefault();
setError("");
setIsLoading(true);


try {
  const result = await loginUser({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  });

  if (!result.access_token) {
    throw new Error("Login failed. Please try again.");
  }

  // Temporary local authentication storage.
  // We will improve session handling in a later security step.
  sessionStorage.setItem("offertrace_access_token", result.access_token);
  sessionStorage.setItem(
    "offertrace_user",
    JSON.stringify(result.user)
  );

  navigate("/");
} catch (requestError) {
  setError(
    requestError.message || "Unable to sign in. Please try again."
  );
} finally {
  setIsLoading(false);
}


}

return ( <main className="auth-page"> <section className="auth-card"> <p className="eyebrow">WELCOME BACK</p>

    <h1>Sign in to OfferTrace</h1>

    <p className="auth-description">
      Sign in to review your internship and job opportunity verification
      reports.
    </p>

    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="email">Email address</label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="primary-button full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
    </form>

    <p className="auth-footer">
      Don't have an account? <Link to="/register">Create account</Link>
    </p>
  </section>
</main>


);
}

export default Login;
