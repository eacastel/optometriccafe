export function ReviewStars() {
  return (
    <div className="review-stars" role="img" aria-label="5 out of 5 stars">
      <span className="google-star-icons" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <i key={index} />)}
      </span>
    </div>
  );
}
