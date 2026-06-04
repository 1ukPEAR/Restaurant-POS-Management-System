import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const decoded = jwtDecode(parsed.token);
                if (decoded.exp * 1000 < Date.now()) {
                    console.warn("⏰ Token expired, clearing...");
                    localStorage.removeItem("user");
                    setUser(null);
                } else {
                    setUser(parsed);
                }
            } catch (err) {
                console.error("❌ Invalid token:", err);
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);


    const loginUser = async (username, password) => {
        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            const userData = {
                username,
                role: data.role,
                token: data.token,
            };

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            return { success: true, role: data.role };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };


    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
