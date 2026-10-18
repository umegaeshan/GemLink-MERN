import { useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  function login(loginData) {
    setUser(loginData.user);
    setToken(loginData.token);
  }

  function logout() {
    setUser(null);
    setToken("");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;