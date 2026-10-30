import { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { StoreContext } from "../../context/StoreContext";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { product_list, addToCart, url } = useContext(StoreContext) || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!product_list || !Array.isArray(product_list) || product_list.length === 0) {
    return (
      <div className="food-details-loading">
        <div className="fd-loader"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  const productItem = product_list.find(
    (item) => String(item.id) === String(id)
  );

  if (!productItem) {
    return (
      <div className="food-details-not-found">
        <h3>🔍 Product not found</h3>
        <p>This item may have been removed or is temporarily unavailable.</p>
        <Button className="btn btn-primary" onClick={() => navigate("/shop")}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const {
    name,
    price,
    description,
    image,
    discount,
    final_price,
    category,
    brand,
    is_active,
    stock,
  } = productItem;

  const availability = is_active !== false && (stock == null || stock > 0);

  const formatPrice = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handleAddToCart = () => {
    addToCart(productItem.id);
    setTimeout(() => navigate("/cart"), 300);
  };

  const descriptionPoints = description
    ? description.split(/\n|,/).map((point) => point.trim()).filter(Boolean)
    : ["No description available"];

  const discountPercent =
    !discount || discount === 0
      ? 0
      : Math.round(((price - final_price) / price) * 100);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${url}${image}`
    : "";

  return (
    <div className="food-details-wrapper">
      <Container className="food-details-container">
        <Row className="align-items-center g-5">
          <Col lg={6} md={12} className="image-container">
            <div className="food-image-wrap">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="food-image" />
              ) : (
                <div className="food-image-placeholder">No Image</div>
              )}

              {discountPercent > 0 && (
                <span className="food-detail-badge">-{discountPercent}% OFF</span>
              )}

              <span
                className={`food-detail-stock ${
                  availability ? "in-stock" : "out-of-stock"
                }`}
              >
                {availability ? "✓ In Stock" : "✕ Out of Stock"}
              </span>
            </div>
          </Col>

          <Col lg={6} md={12} className="text-container">
            <div className="food-meta-chips">
              {category && <span className="meta-chip">{category}</span>}
              {brand && brand !== "unknown" && (
                <span className="meta-chip">{brand}</span>
              )}
            </div>

            <h1 className="food-name">{name}</h1>

            <h5 className="food-description-title">Product Highlights</h5>
            <ul className="food-description-list">
              {descriptionPoints
                .slice(0, showFullDescription ? descriptionPoints.length : 3)
                .map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
            </ul>

            {descriptionPoints.length > 3 && (
              <button
                className="view-more-button"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "− View Less" : "+ View More"}
              </button>
            )}

            <div className="food-item-price">
              {discountPercent > 0 ? (
                <>
                  <span className="original-price">{formatPrice(price)}</span>
                  <span className="final-price">{formatPrice(final_price)}</span>
                  <span className="savings-tag">
                    You save {formatPrice(price - final_price)}
                  </span>
                </>
              ) : (
                <span className="final-price">{formatPrice(price)}</span>
              )}
            </div>

            <div className="food-detail-actions">
              <Button
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={!availability}
              >
                <span>🛒</span>
                {availability ? "Add to Cart" : "Out of Stock"}
              </Button>

              <Button
                className="buy-now-button"
                onClick={() => {
                  addToCart(productItem.id);
                  setTimeout(() => navigate("/cart"), 300);
                }}
                disabled={!availability}
              >
                Buy Now
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductDetails;