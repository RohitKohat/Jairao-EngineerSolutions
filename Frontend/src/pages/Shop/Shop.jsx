import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa";
import { StoreContext } from "../../context/StoreContext";
import ProductItem from "../../components/ProductItem/ProductItem";
import "./Shop.css";

// ═══ Hero images ═══
import heroImage1 from "../../assets/images/51xYCxjhGqL._SL1500_ (1)-Photoroom.png";
import heroImage2 from "../../assets/images/21bivbS4ilL (1).png";
import heroImage3 from "../../assets/images/3116W0Ow3iL (1)-Photoroom (1)-Photoroom.png";
import heroImage4 from "../../assets/images/71Kv4RUvrxL._SL1500_ (1)-Photoroom (1)-Photoroom.png";
import heroImage5 from "../../assets/images/41yl8eW3s1L._SL1200_ (1)-Photoroom.png";
import heroImage6 from "../../assets/images/01_7e9498e70c.png";
import heroImage7 from "../../assets/images/40_c37e9128-e2d6-400e-b536-b41ede464ac9.png";

const slides = [
  { image: heroImage1, title: "Air-Conditioner" },
  { image: heroImage2, title: "Refrigerator" },
  { image: heroImage3, title: "Washing Machine" },
  { image: heroImage4, title: "Water Purifier" },
  { image: heroImage5, title: "Deep Freezer" },
  { image: heroImage6, title: "Air Cooler" },
  { image: heroImage7, title: "TV" },
];

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const initialCategory = queryParams.get("category") || "all";
  const initialBrand = queryParams.get("brand") || "all";

  const {
    product_list: productItems,
    cartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    getCartArray,
    getCartTotal,
    getCartCount,
    url,
  } = useContext(StoreContext);

  const [category, setCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [priceRange, setPriceRange] = useState(["", ""]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setCategory(initialCategory);
    setSelectedBrand(initialBrand);
  }, [initialCategory, initialBrand]);

  const categories = [
    "all",
    "Air-Conditioner",
    "Refrigerator",
    "Washing Machine",
    "Water Purifier",
    "Deep Freezer",
    "Air Cooler",
    "TV",
  ];

  const brandOptions = {
    "Air-Conditioner": ["Voltas", "LG", "Godrej", "Blue Star", "Haier"],
    Refrigerator: ["Whirlpool", "Samsung", "Haier", "Godrej"],
    "Washing Machine": ["LG", "Godrej", "Whirlpool", "Haier"],
    "Water Purifier": ["Kent", "Aquaguard", "Pureit"],
    "Deep Freezer": ["Godrej", "Haier", "Blue Star"],
    "Air Cooler": ["Godrej", "Haier", "Blue Star"],
    TV: ["Haier", "Samsung", "LG", "Mi"],
    all: [],
  };

  const brands = brandOptions[category] || [];

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedBrand("all");
    navigate(`/shop?category=${encodeURIComponent(newCategory)}`);
  };

  const handleBrandChange = (newBrand) => {
    setSelectedBrand(newBrand);
    navigate(
      `/shop?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(newBrand)}`
    );
  };

  const filteredItems = (productItems || []).filter((item) => {
    const isCategoryMatch =
      category === "all" ||
      (item.category || "").toLowerCase() === category.toLowerCase();
    const isBrandMatch =
      selectedBrand === "all" ||
      (item.brand || "").toLowerCase() === selectedBrand.toLowerCase();
    const min = priceRange[0] === "" ? 0 : Number(priceRange[0]);
    const max = priceRange[1] === "" ? Infinity : Number(priceRange[1]);
    const itemPrice = item.final_price || item.price || 0;
    const isPriceMatch = itemPrice >= min && itemPrice <= max;
    return isCategoryMatch && isBrandMatch && isPriceMatch;
  });

  const cartArray = getCartArray();
  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  const resolveImage = (item) => {
    const src = item.image || item.image_url;
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const base = url || "http://localhost:8000";
    return `${base}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  const handleRemoveFull = (itemId) => {
    removeItemCompletely(itemId);
  };

  // ═══ Carousel ═══
  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
  };

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSlide = (index) => {
    setActiveSlide(index);
    stopInterval();
    startInterval();
  };

  return (
    <div className="shop-page">
      {/* ═══════════ HERO CAROUSEL ═══════════ */}
      <div
        className="hero-carousel"
        onMouseEnter={stopInterval}
        onMouseLeave={startInterval}
      >
        <div className="carousel-counter">
          {String(activeSlide + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>

        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`hero-slide ${
              index === activeSlide ? "hero-slide--active" : ""
            }`}
          >
            <div className="container h-100">
              <div className="row align-items-center h-100">
                <div className="col-lg-6 text-white">
                  {/* ✅ Small floating text completely removed */}
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">
                    Shop Now for Smart, Reliable, and Modern Home Appliances
                  </p>
                  <button
                    className="hero-btn"
                    onClick={() => handleCategoryChange(slide.title)}
                  >
                    Shop Now →
                  </button>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center">
                  <img
                    src={slide.image}
                    className={`hero-img ${
                      index === activeSlide ? "hero-img--active" : ""
                    }`}
                    alt={slide.title}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                index === activeSlide ? "carousel-dot--active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ═══════════ CART DRAWER ═══════════ */}
      <div
        className={`cart-drawer-overlay ${cartOpen ? "cart-drawer--open" : ""}`}
        onClick={() => setCartOpen(false)}
      >
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <button
            className="cart-drawer-back-btn"
            onClick={() => setCartOpen(false)}
          >
            ← Back to Shopping
          </button>

          <div className="cart-drawer-header">
            <h2>Your Cart</h2>
            <span className="cart-drawer-count">{cartCount} items</span>
          </div>

          {cartArray.length === 0 ? (
            <div className="cart-drawer-empty">
              <p>Your cart is empty.</p>
              <button
                className="btn btn-primary"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-drawer-items">
                {cartArray.map((item) => {
                  const imgUrl = resolveImage(item);
                  return (
                    <div key={item.id} className="cart-drawer-item">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="cart-drawer-item-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="cart-drawer-item-img">📦</div>
                      )}
                      <div className="cart-drawer-item-info">
                        <h4>{item.name}</h4>
                        <p className="cart-drawer-item-price">
                          ₹
                          {(
                            (item.final_price || item.price || 0) * item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                        <div className="cart-drawer-item-qty">
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <button
                        className="cart-drawer-item-remove"
                        onClick={() => handleRemoveFull(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-drawer-footer">
                <div className="cart-drawer-total">
                  <span>Total</span>
                  <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                </div>
                <button
                  className="btn btn-primary w-100 cart-drawer-checkout"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ FILTER BAR + PRODUCT GRID ═══════════ */}
      <Container fluid className="shop-container">
        <div className="shop-filter-bar">
          <div className="shop-filter-categories">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "primary" : "outline-primary"}
                onClick={() => handleCategoryChange(cat)}
                className={`category-btn ${category === cat ? "active" : ""}`}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>

          <div className="shop-filter-right">
            {brands.length > 0 && (
              <Form.Select
                className="shop-brand-select"
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Form.Select>
            )}

            <div className="shop-price-wrap">
              <span className="shop-price-label">Price (₹)</span>
              <Form.Control
                type="number"
                placeholder="Min"
                className="shop-price-input"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
              />
              <span className="shop-price-sep">–</span>
              <Form.Control
                type="number"
                placeholder="Max"
                className="shop-price-input"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
              />
            </div>
          </div>
        </div>

        <Row className="g-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const qty = cartItems[item.id] || 0;

              return (
                <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                  <div className="shop-product-card">
                    <ProductItem item={item} />

                    {/* ═══ SINGLE DYNAMIC ACTION (owned by Shop) ═══ */}
                    {qty > 0 ? (
                      <div className="quantity-selector">
                        <button
                          className="qty-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => addToCart(item.id)}
                          aria-label="Increase quantity"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="shop-add-to-cart-btn"
                        onClick={() => {
                          addToCart(item.id);
                          setCartOpen(true);
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                    )}
                  </div>
                </Col>
              );
            })
          ) : (
            <Col>
              <div className="shop-empty">
                <div className="shop-empty-icon">🔍</div>
                <h4>No products found</h4>
                <p>Try adjusting your filters or browse a different category.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setCategory("all");
                    setSelectedBrand("all");
                    setPriceRange(["", ""]);
                    navigate("/shop");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Shop;