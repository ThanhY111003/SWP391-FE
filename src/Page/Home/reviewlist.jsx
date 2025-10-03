import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reviewlist.css"; // Create corresponding CSS for styling

const defaultImageUrl = "https://path/to/default-image.jpg";

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("/api/reviews");
        setReviews(response.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error loading reviews.</p>;

  return (
    <section className="reviews">
      <div className="container text-center">
        <h2>What Our Clients Say</h2>
        <div className="row">
          {reviews.map((review) => (
            <div className="col" key={review.id}>
              {/* Rating source section */}
              {review.source && (
                <div className="rating">
                  <img
                    src={review.logoUrl || defaultImageUrl}
                    alt={`${review.source} logo`}
                    onError={(e) => (e.target.src = defaultImageUrl)} // Fallback if image is broken
                  />
                  <h4>{review.source.toUpperCase()}</h4>
                  <h1>{review.rating}</h1>
                  <p>{review.reviewsCount} reviews</p>
                </div>
              )}

              {/* User review section */}
              {review.reviewText && (
                <div className="user-review">
                  <div className="image-wrapper">
                    <img
                      src={review.profileImageUrl || defaultImageUrl}
                      alt="Profile"
                      onError={(e) => (e.target.src = defaultImageUrl)} // Fallback if image is broken
                    />
                  </div>
                  <p>
                    {review.reviewText}
                    <br />
                    <small>{review.reviewerName}</small>
                  </p>
                  <div className="star-rating">
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="https://tse3.mm.bing.net/th?id=OIP.a29kCmEBy6k8EiQG5Sf-AQHaFj&pid=Api&P=0&h=220"
                        alt="Star"
                      />
                    ))}
                    <p>{review.starRating} / 5</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsList;
