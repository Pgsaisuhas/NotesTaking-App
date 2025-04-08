import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { login, loading, error } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();
		const success = await login(username, password);
		if (success) {
			// Navigate to the dashboard or intended page upon successful login
			console.log("Login successful, navigating to dashboard.");
			navigate("/");
		} else {
			console.log("Login failed, not navigating."); // Add log
		}
		// Error state is handled by the context and displayed in LoginPage
	};

	return (
		<form onSubmit={handleSubmit} className="login-form">
			<h2>Login</h2>
			{error && <p className="error-message">{error}</p>}
			<div>
				<label htmlFor="username">Username:</label>
				<input
					type="text"
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					disabled={loading}
				/>
			</div>
			<div>
				<label htmlFor="password">Password:</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={loading}
				/>
			</div>
			<button type="submit" disabled={loading}>
				{loading ? "Logging in..." : "Login"}
			</button>
			<p>
				<small>Hint: Any username/password will work for this demo.</small>
			</p>
		</form>
	);
}

export default Login;
