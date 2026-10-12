import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
const [formData, setFormData] = useState({
fullName: "",
email: "",
college: "",
graduationYear: "",
password: "",
});

const [message, setMessage] = useState("");
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
setMessage("");
setError("");


if (formData.fullName.trim().length < 2) {
  setError("Please enter your full name.");
  return;
}

if (formData.password.length < 8) {
  setError("Password must contain at least 8 characters.");
  return;
}

setIsLoading(true);

try {
  const result = await registerUser({
    full_name: formData.fullName.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  });

  setMessage(
    result.message || "Registration successful! You can now sign in."
  );

  setFormData({
    fullName: "",
    email: "",
    college: "",
    graduationYear: "",
    password: "",
  });
} catch (requestError) {
  setError(
    requestError.message ||
      "Registration failed. Please try again."
  );
} finally {
  setIsLoading(false);
}


}

return ( <main className="auth-page"> <section className="auth-card"> <p className="eyebrow">CREATE ACCOUNT</p>

```
    <h1>Join OfferTrace</h1>

    <p className="auth-description">
      Create your account to organize and review internship and job
      opportunity verification reports.
    </p>

    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          autoComplete="name"
          value={formData.fullName}
          onChange={handleChange}
          minLength={2}
          maxLength={150}
          required
        />
      </div>

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
        <label htmlFor="college">College / University</label>
        <input
          id="college"
          name="college"
          type="text"
          placeholder="Enter your college name"
          autoComplete="organization"
          value={formData.college}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="graduationYear">Graduation year</label>
        <select
          id="graduationYear"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select your graduation year
          </option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
          <option value="2029">2029</option>
          <option value="2030">2030</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          maxLength={128}
          required
        />
        <small>Use at least 8 characters.</small>
      </div>

      <button
        type="submit"
        className="primary-button full"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
    </form>

    <p className="auth-footer">
      Already have an account? <Link to="/login">Sign in</Link>
    </p>

    <p className="auth-disclaimer">
      Your account is created through the OfferTrace authentication API.
    </p>
  </section>
</main>


);
}

export default Register;
