import React, { createContext, useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export const UserContext = createContext();

function UserContextProvider({ children }) {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const [currentUser, setCurrentUser] = useState(() => {
        const guest = localStorage.getItem("guestUser");
        return guest ? JSON.parse(guest) : null;
    });
    useEffect(() => {
        const fetchOrCreateUser = async () => {
            const guest = localStorage.getItem("guestUser");
            if (guest) {
                setCurrentUser(JSON.parse(guest));
                return;
            }

            if (isAuthenticated && user) {
                try {
                    const token = await getAccessTokenSilently();
                    const res = await fetch("http://localhost:5000/api/users/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: user.name,
                            email: user.email
                        })
                    });

                    const data = await res.json();
                    console.log(data.user)
                    setCurrentUser(data.user);
                } catch (err) {
                    console.error("Failed to sync user:", err);
                }
            }
        };

        fetchOrCreateUser();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;
