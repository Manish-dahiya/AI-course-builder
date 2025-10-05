import React, { createContext, useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { API_BASE_URL } from '../utility/helper';
import { socket } from '../utility/socket';


export const UserContext = createContext();

function UserContextProvider({ children }) {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    const [currentUser, setCurrentUser] = useState(() => {
        const guest = localStorage.getItem("guestUser");
        return guest ? JSON.parse(guest) : null;
    });

    // ✅ connect socket when user changes (real or guest)
    useEffect(() => {
        if (!currentUser) return;

        // connect to socket
        if (!socket.connected) socket.connect();

        // register user or guest
        socket.emit("register", currentUser._id);
        console.log("🧠 Registered socket for:", currentUser._id);

        const handleCourseReady = (data) => {
            alert("Your course is ready!");
            console.log("Course ready event:", data);
        };

        socket.on("courseReady", handleCourseReady);


        return () => {
            socket.disconnect();
            console.log("Socket disconnected");
            socket.off("courseReady", handleCourseReady);

        };
    }, [currentUser]);



    //user reviews section
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [allReviews, setAllReviews] = useState([]);


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


    async function postReview(text) {
        const newReview = {
            userName: currentUser?.userName,
            userEmail: currentUser?.userEmail,
            text,
            rating
        };


        const res = await fetch(`${API_BASE_URL}/api/users/user-review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "review": { "userName": currentUser?.userName, "userEmail": currentUser?.userEmail, "text": text, "rating": rating } })
        })

        if (res.ok) {
            setAllReviews([newReview, ...allReviews]); // update instantly
            const data = await res.json();
            console.log(data.message);
            // fetchAllReviews(); // sync with DB

        }
        else console.log("error in posting review")
    }

    async function fetchAllReviews() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/all-reviews`);
            if (res.ok) {
                const data = await res.json();
                console.log(data.all_reviews);
                setAllReviews(data.all_reviews);
            }
            else console.log("error in fetching all reviews")
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAllReviews();
    }, [])

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, review, setReview, rating, setRating, allReviews, setAllReviews, postReview }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;
