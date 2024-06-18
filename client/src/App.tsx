import React, { useState, useEffect } from "react";
import {
  register,
  login,
  getProtectedResource,
  refreshToken,
  hasPermission,
} from "./authService";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState([])
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Failed to refresh token", error);
      }
    }, 14 * 60 * 1000); // Refresh token every 14 minutes
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await register(username, password, permissions);
      setMessage(data);
    } catch (error) {
      setMessage("Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      setMessage("Logged in");
    } catch (error) {
      setMessage("Login failed");
    }
  };

  const handleGetProtectedResource = async () => {
    try {
      const data = await getProtectedResource();
      setMessage(data);
    } catch (error) {
      setMessage("Access denied");
    }
  };

  return (
    <div>
      <h1>Mocked Cognito</h1>

      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="text"
          value={permissions}
          onChange={(e) => setPermissions(e.target.value.split(","))}
          placeholder="Permissions (comma separated)"
          required
        />
        <button type="submit">Register</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {hasPermission(["read"]) && (
        <div>
          <h2>Protected Resource</h2>
          <button onClick={handleGetProtectedResource}>
            Get Protected Resource
          </button>
        </div>
      )}

      <p>{message}</p>
    </div>
  );
}

export default App;
