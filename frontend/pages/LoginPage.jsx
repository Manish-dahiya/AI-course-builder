import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import loginImg from "../src/assets/login.jpg"
import { UserContext } from "../src/contexts/UserContextProvider";
import { useContext } from "react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext)

  // Guest login
  const handleGuestLogin = () => {
    const guestObj = { userName: "Guest", _id: "guestId", courses: [] };

    localStorage.setItem("guestUser", JSON.stringify(guestObj));
    setCurrentUser(guestObj); //  store as object, not raw string

    navigate("/");

  };

  return (
    <div className="min-h-screen w-full  flex flex-col sm:flex-row gap-10 items-center justify-center bg-gray-100">

      <div className="flex flex-col items-center  w-1/2 order-2 sm:order-1 sm:px-3 gap-4">
        <h1 className=" sm:text-3xl font-bold mb-8">PromptCourse Login</h1>
        <button
          onClick={() => loginWithRedirect()}
          className="text-small px-1 sm:px-6 py-1 sm:py-2 w-1/2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>

        <button
          onClick={() =>
            loginWithRedirect({ screen_hint: "signup" })
          }
          className="text-small px-1 sm:px-6  py-1 sm:py-2 w-1/2 bg-[#7cb1ff] text-white rounded hover:bg-blue-400"
        >
          Signup
        </button>

        <button
          onClick={handleGuestLogin}
          className=" text-small px-1 sm:px-6 py-1 sm:py-2 w-1/2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
           Guest
        </button>
      </div>

      <div className="flex justify-center order-1 sm:order-2 w-1/2">
        <img src={loginImg} alt="" className="" />
      </div>

    </div>
  );
}
