import { useState } from "react";

function Register() {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      "Registration form is ready. Account creation will be enabled after backend integration."
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">CREATE ACCOUNT</p>

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
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="graduationYear">Graduation year</label>

            <select
              id="graduationYear"
              name="graduationYear"
              defaultValue=""
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
              minLength={8}
              required
            />

            <small>Use at least 8 characters.</small>
          </div>

          <button type="submit" className="primary-button full">
            Create account
          </button>

          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        <p className="auth-disclaimer">
          This form is currently a frontend demonstration. It does not create
          an account or save your details.
        </p>
      </section>
    </main>
  );
}

export default Register;