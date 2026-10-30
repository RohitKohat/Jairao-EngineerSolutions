import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./ProductItem.css";

const ProductItem = ({ item }) => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  const formatPrice = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const price = item.price || 0;
  const finalPrice = item.final_price || item.price || 0;
  const discount = item.discount || 0;
  const availability =
    item.is_active !== false && (item.stock == null || item.stock > 0);

  // ═══ IMAGE URL RESOLVER ═══
  const resolveImage = () => {
    const src = item.image || item.image_url;
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const base = url || "http://localhost:8000";
    return `${base}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  const imageUrl = resolveImage();

  return (
    <div
      className="food-item"
      onClick={() => navigate(`/product/${item.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="food-item-img-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="food-item-img-placeholder">No Image</div>';
            }}
          />
        ) : (
          <div className="food-item-img-placeholder">No Image</div>
        )}
      </div>

      <div className="food-item-info p-3">
        <h5 className="card-title mb-1">{item.name}</h5>
        <p className="card-text mb-2">
          {item.category}
          {item.brand ? ` · ${item.brand}` : ""}
        </p>

        <div className="food-item-price">
          {discount > 0 ? (
            <>
              <span className="original-price">{formatPrice(price)}</span>
              <span className="final-price">{formatPrice(finalPrice)}</span>
            </>
          ) : (
            <span className="final-price">{formatPrice(finalPrice)}</span>
          )}
        </div>

        <div className="food-item-availability-wrap mt-2">
          <span
            className={`food-item-availability ${
              availability ? "available" : "out-of-stock"
            }`}
          >
            {availability ? "✓ In Stock" : "✕ Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;