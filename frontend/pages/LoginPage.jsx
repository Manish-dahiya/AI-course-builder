import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import loginImg from "../src/assets/login.jpg"

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  // Guest login
  const handleGuestLogin = () => {
    // You can store guest info in local state or localStorage
    localStorage.setItem("guestUser", JSON.stringify({ name: "Guest" ,_id:"guestId"}));
    navigate("/"); // redirect to your protected route
  };

  return (
    <div className="min-h-screen w-full  flex flex-col sm:flex-row gap-10 items-center justify-center bg-gray-100">

      <div className="flex flex-col items-center  w-1/2 order-2 sm:order-1 sm:px-3 gap-4">
      <h1 className=" sm:text-3xl font-bold mb-8">AI Course Builder Login</h1>
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
          className="text-small px-1 sm:px-6  py-1 sm:py-2 w-1/2 bg-[#7cb1ff] text-white rounded hover:bg-green-700"
        >
          Signup
        </button>

        <button
          onClick={handleGuestLogin}
          className="text-small px-1 sm:px-6 py-1 sm:py-2 w-1/2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Continue as Guest
        </button>
      </div>

      <div className="flex justify-center order-1 sm:order-2 w-1/2">
        <img src={loginImg} alt="" className="" />
      </div>

    </div>
  );
}
