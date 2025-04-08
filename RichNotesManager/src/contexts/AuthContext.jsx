// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser as apiLogin, logoutUser as apiLogout } from "../api/auth";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "notesAppUser"; // Key for localStorage

export const AuthProvider = ({ children }) => {
	// Initialize state by trying to load from localStorage first
	const [user, setUser] = useState(() => {
		try {
			const storedUser = localStorage.getItem(USER_STORAGE_KEY);
			if (storedUser) {
				console.log("Found user in localStorage, initializing state.");
				return JSON.parse(storedUser);
			}
		} catch (error) {
			console.error("Failed to parse user from localStorage", error);
			localStorage.removeItem(USER_STORAGE_KEY); // Clear corrupted data
		}
		return null; // Default to null if nothing valid is found
	});

	const [loading, setLoading] = useState(false); // Still track loading state
	const [initLoading, setInitLoading] = useState(true); // Track initial load check
	const [error, setError] = useState(null);

	// Effect to set initLoading false after initial check (whether user was found or not)
	useEffect(() => {
		setInitLoading(false);
		console.log("AuthContext initial load check complete. User:", user);
	}, [user]); // Run when user state is confirmed initially

	const login = async (username, password) => {
		setLoading(true);
		setError(null);
		try {
			console.log("Attempting API login...");
			const userData = await apiLogin(username, password);
			console.log("API login successful, received:", userData);
			setUser(userData);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData)); // <-- Save to localStorage
			console.log("User data saved to localStorage.");
			setLoading(false);
			return true; // Indicate success
		} catch (err) {
			console.error("Login failed in AuthContext:", err);
			setError(err.message || "Failed to log in");
			setUser(null);
			localStorage.removeItem(USER_STORAGE_KEY); // <-- Clear on failure too
			setLoading(false);
			return false; // Indicate failure
		}
	};

	const logout = async () => {
		setLoading(true);
		try {
			await apiLogout(); // Call dummy API logout
			console.log("API logout successful.");
		} catch (err) {
			console.error("Dummy API logout failed (continuing local logout):", err);
			// We still proceed with local logout even if API call fails in demo
		} finally {
			console.log("Clearing user state and localStorage.");
			setUser(null);
			localStorage.removeItem(USER_STORAGE_KEY); // <-- Remove from localStorage
			setLoading(false);
			setError(null); // Clear any previous errors on logout
		}
	};

	// Important: Ensure `isAuthenticated` reflects the current `user` state
	const isAuthenticated = !!user;

	// Value provided to consuming components
	const value = {
		user,
		login,
		logout,
		loading: loading || initLoading, // Combine loading states for consumers
		authLoading: loading, // Specific API loading state if needed
		initLoading, // Expose initial loading state if needed elsewhere
		error,
		isAuthenticated,
	};

	// Render children only after initial loading check is complete
	// Or show a global loading indicator
	// if (initLoading) {
	//    return <div>Loading Application...</div>; // Optional global loading screen
	// }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};
