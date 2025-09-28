import React, { useContext, useState } from "react";
import reviewVideo from "../src/assets/review.mp4"
import { UserContext } from "../src/contexts/UserContextProvider";

function UsersReviews() {

    const { currentUser, review, setReview, rating, setRating, allReviews, setAllReviews, postReview } = useContext(UserContext)
    

    const handleSubmit = () => {
        if (!review || rating === 0) {
            alert("Please enter a review and give a rating!");
            return;
        }

        postReview(review) //<-----------api call
        setReview("");
        setRating(0);
    };

    return (
        <div className="p-6 bg-[#dbeafe] rounded-lg shadow-md">
            <div className="bg-[#161d29] h-1 border rounded-2xl" > </div>

            <div className="flex flex-wrap  justify-around my-10">
                <video src={reviewVideo} loop muted autoPlay />
                
            { currentUser?._id!="guestId" &&
                <section>
                    {/* Input section */}
                    <h2 className="text-lg font-semibold mb-10">Wanna Write a review ? </h2>
                    <textarea
                        className="  sm:w-full border rounded-md p-2 "
                        rows="5"
                        placeholder="Write your review..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    ></textarea>


                    <div className="flex gap-10 justify-center">
                        {/* Stars */}
                        <div className="flex gap-2  ">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`cursor-pointer sm:text-4xl ${rating >= star ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleSubmit}
                            className="sm:px-4 sm:py-2 px-1 py-1 bg-blue-600 text-small text-white rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>

                    </div>
                </section>
                
                }

            </div>

            {/* Reviews Marquee */}
            <div className="overflow-hidden mt-6">
                <h1 className="font-semibold  sm:text-xl">What People Say About Us</h1>
                <div className="flex gap-6 animate-marquee mt-4 sm:mt-16 whitespace-nowrap">
                    {allReviews && allReviews.map((r, idx) => (
                        <div
                            key={idx}
                            className="w-32 sm:w-72 bg-[#155dfc] shadow-md rounded-lg p-2 sm:p-4 border"
                        >
                            <p className="text-white text-small text-wrap ">{r.text.slice(0, 100) + "..."}</p>
                            <div className="flex text-yellow-400 mt-4 sm:mt-10">
                                {"★".repeat(r.rating)}
                                {"☆".repeat(5 - r.rating)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Marquee Animation */}
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 15s linear infinite;
        }
      `}</style>
        </div>
    );
}

export default UsersReviews;
