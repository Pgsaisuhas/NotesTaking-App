// Simulate API latency
const LATENCY = 500; // 0.5 seconds

export const loginUser = async (username, password) => {
	console.log(`Attempting login for user: ${username}`);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Dummy check: accept any username/password for demo
			if (username && password) {
				console.log("Dummy login successful");
				resolve({
					id: "user123",
					username: username,
					token: "dummy-jwt-token-" + Date.now(), // Simulate a token
				});
			} else {
				console.error("Dummy login failed: Username or password missing");
				reject(new Error("Invalid credentials (dummy check)"));
			}
		}, LATENCY);
	});
};

export const logoutUser = async () => {
	console.log("Logging out user");
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log("Dummy logout successful");
			resolve({ success: true });
		}, LATENCY / 2); // Faster logout
	});
};
