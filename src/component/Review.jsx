import React, { useState, useRef, useEffect } from 'react';
import './Review.css';

const Review = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      comment: "Excellent product! Highly recommended.",
      date: "2024-01-15"
    },
    {
      id: 2,
      name: "Jane Smith",
      rating: 4,
      comment: "Good quality, fast delivery. Very satisfied.",
      date: "2024-01-10"
    }
  ]);

  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [sortBy, setSortBy] = useState('date'); // New: Sorting state
  const [filterRating, setFilterRating] = useState(0); // New: Filter by rating

  const nameInputRef = useRef(null);
  const commentTextareaRef = useRef(null);
  const formContainerRef = useRef(null);
  const reviewCountRef = useRef(2);

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (showForm && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [showForm]);

  const StarRating = ({ rating, interactive = false, onRatingChange }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const starContainerRef = useRef(null);

    const handleClick = (value) => {
      if (interactive && onRatingChange) {
        onRatingChange(value);
        setFormErrors(prev => ({ ...prev, rating: '' }));
      }
    };

    const handleMouseEnter = (value) => {
      if (interactive) {
        setHoveredRating(value);
      }
    };

    const handleMouseLeave = () => {
      if (interactive) {
        setHoveredRating(0);
      }
    };

    const handleKeyDown = (e, value) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleClick(value);
      }
    };

    return (
      <div 
        className="star-rating" 
        ref={starContainerRef}
        role={interactive ? "radiogroup" : "img"}
        aria-label={`${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyDown(e, star)}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? "radio" : "presentation"}
            aria-checked={interactive ? star === rating : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const validateForm = () => {
    const errors = {};
    
    if (!newReview.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (newReview.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    
    if (!newReview.comment.trim()) {
      errors.comment = 'Review comment is required';
    } else if (newReview.comment.trim().length < 10) {
      errors.comment = 'Review must be at least 10 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (formErrors.name && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (formErrors.comment && commentTextareaRef.current) {
        commentTextareaRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const review = {
      id: Date.now(),
      ...newReview,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews(prevReviews => [review, ...prevReviews]);
    reviewCountRef.current += 1;
    
    setNewReview({ name: '', rating: 0, comment: '' });
    setFormErrors({});
    setShowForm(false);
    setIsSubmitting(false);
    
    if (nameInputRef.current) nameInputRef.current.value = '';
    if (commentTextareaRef.current) commentTextareaRef.current.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({
      ...prev,
      rating
    }));
  };

  const handleFormToggle = () => {
    setShowForm(prev => !prev);
    if (showForm) {
      setNewReview({ name: '', rating: 0, comment: '' });
      setFormErrors({});
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setNewReview({ name: '', rating: 0, comment: '' });
    setFormErrors({});
  };

  // New: Sorting and filtering logic
  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating || new Date(b.date) - new Date(a.date);
      }
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="review-container">
      <div className="review-header">
        <h2>Customer Reviews</h2>
        <div className="review-controls">
          <div className="review-stats">
            <div className="average-rating">
              <StarRating rating={Math.round(averageRating)} />
              <span className="rating-text">{averageRating} out of 5</span>
            </div>
            <div className="total-reviews">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </div>
          </div>
          <div className="review-filters">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date (Newest)</option>
              <option value="rating">Sort by Rating (Highest)</option>
            </select>
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>All Ratings</option>
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>{rating} Stars</option>
              ))}
            </select>
          </div>
          <button 
            className="add-review-btn"
            onClick={handleFormToggle}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="review-form-container" ref={formContainerRef}>
          <form className="review-form" onSubmit={handleSubmit}>
            <h3>Add Your Review</h3>
            
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                ref={nameInputRef}
                type="text"
                id="name"
                name="name"
                value={newReview.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
                className={formErrors.name ? 'error' : ''}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <span className="error-message">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>Rating *</label>
              <StarRating 
                rating={newReview.rating} 
                interactive={true}
                onRatingChange={handleRatingChange}
              />
              {formErrors.rating && (
                <span className="error-message">{formErrors.rating}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="comment">Review *</label>
              <textarea
                ref={commentTextareaRef}
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                required
                placeholder="Share your experience... (minimum 10 characters)"
                rows="4"
                className={formErrors.comment ? 'error' : ''}
                disabled={isSubmitting}
              />
              {formErrors.comment && (
                <span className="error-message">{formErrors.comment}</span>
              )}
              <div className="character-count">
                {newReview.comment.length} characters
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancelForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews match the selected filters.</p>
          </div>
        ) : (
          sortedAndFilteredReviews.map((review, index) => (
            <div 
              key={review.id} 
              className="review-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="review-header-card">
                <div className="reviewer-info">
                  <h4>{review.name}</h4>
                  <span className="review-date">{review.date}</span>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Review;
