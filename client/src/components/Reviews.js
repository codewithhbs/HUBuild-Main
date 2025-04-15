import React, { useState, useEffect } from "react";
import "./Reviews.css";
import toast from "react-hot-toast";
import axios from "axios";

const Reviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [fade, setFade] = useState(false);
  const [reviews, setReview] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/v1/get-all-testimonial');
      setReview(data.data);
    } catch (error) {
      console.log("Internal server error in getting reviews");
      // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    setFade(true);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!reviews.length || isPaused) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews.length, isPaused]);

  const handleImageClick = (index) => {
    setIsPaused(true); // Pause auto-scroll when user interacts
    setFade(false);
    setTimeout(() => {
      setCurrentReview(index);
      setFade(true);
    }, 300);

    // Resume auto-scroll after 5 seconds of inactivity
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  return (
    <div>
      <section className="as_customer_wrapper review-bg py-5 hitesh_styling">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2 className="as_heading as_heading_center">What My Client Say</h2>
              <p className="text-center">
                Our clients rave about our exceptional service, innovative designs, and the seamless experience we provide, ensuring their vision comes to life.
              </p>
              <div style={{ padding: '20px' }} className="row">
                <div style={{display: 'flex'}} className="col-lg-12 col-md-12 align-items-center">
                  {reviews.length > 0 && (
                    <div
                      style={{ width: '100%', marginBottom: '20px' }}
                      className={`as_customer_box text-center fade ${fade ? "in" : "out"}`}
                    >
                      <p className="as_margin0">{reviews[currentReview].testimonial}</p>
                      <h3>
                        {reviews[currentReview].name} -{" "}
                        <span>{reviews[currentReview].destination}</span>
                      </h3>
                    </div>
                  )}
                </div>

                <div className="col-lg-12 col-md-12 as_customer_img_parent gap-3 justify-content-center align-items-center">
                  {reviews && reviews.map((review, index) => (
                    <div
                      key={index}
                      className="as_customer_img"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={review?.image?.url}
                        alt={review.name}
                        className={`img-fluid img-thumbnail ${index === currentReview ? "border-primary" : ""
                          }`}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reviews;