import React, { useContext } from 'react'
import { UserContext } from '../src/contexts/UserContextProvider'
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function UserProfilePopup({ profilePopup, setProfilePopup }) {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const { getAccessTokenSilently } = useAuth0();

    const handleProfileDelete = async () => {
        if (currentUser._id != "guestId") {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `http://localhost:5000/api/users/delete-profile/${currentUser._id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,  // ✅ Auth header added
                    },
                }
            );
            if (res.ok) {
                const data = await res.json();
                console.log(data.message);

                navigate("/login");
            }
            else console.log("response is not ok")
        }

        // clear local storage or context for guest user as well
        localStorage.removeItem("currentUser");
    }

    return (
        <div
            id="profile-div"
            className={`absolute top-4 right-4 bg-white shadow-lg rounded-lg p-2 sm:p-4 sm:w-64 h-20 sm:h-28 z-50 transform transition-all duration-300 ease-in-out 
            ${profilePopup ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-small font-semibold">{currentUser?.userName}</h3>
                <button
                    className="font-bold text-small"
                    onClick={() => setProfilePopup(!profilePopup)}
                >
                    X
                </button>
            </div>
            <p className="text-small text-gray-600">{currentUser?.userEmail}</p>

            <button className='text-small border-b border-red-600 text-red-600     hover:text-red-800' onClick={handleProfileDelete} >delete</button>
        </div>
    )
}

export default UserProfilePopup
