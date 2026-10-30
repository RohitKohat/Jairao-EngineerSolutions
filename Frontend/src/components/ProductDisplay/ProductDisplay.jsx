import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductDisplay.css";

import banner1 from "../../assets/images/banner1.png";
import banner2 from "../../assets/images/banner2.png";
import banner3 from "../../assets/images/banner3.png";
import banner4 from "../../assets/images/banner4.png";
import banner5 from "../../assets/images/banner5.png";
import banner6 from "../../assets/images/banner8.png";
import banner7 from "../../assets/images/banner9.png";
import banner8 from "../../assets/images/banner10.png";

const ProductDisplay = () => {
  const navigate = useNavigate();

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const animRef1 = useRef(null);
  const animRef2 = useRef(null);
  const scrollPos1 = useRef(0);
  const scrollPos2 = useRef(0);
  const isPaused1 = useRef(false);
  const isPaused2 = useRef(false);

  const banners = [
    { image: banner1, category: "Air-Conditioner" },
    { image: banner2, category: "Refrigerator" },
    { image: banner3, category: "Washing Machine" },
    { image: banner4, category: "Water Purifier" },
    { image: banner5, category: "Deep Freezer" },
    { image: banner7, category: "TV" },
    { image: banner8, category: "Air Cooler" },
  ];

  const services = [
    { image: banner1, category: "AC", link: "/Services/ac" },
    { image: banner2, category: "Refrigerator", link: "/Services/refrigerator" },
    { image: banner3, category: "Washing Machine", link: "/Services/washingMachine" },
    { image: banner4, category: "Water Purifier", link: "/Services/waterPurifier" },
    { image: banner6, category: "Solar", link: "/solar" },
  ];

  const handleCategoryClick = (item) => {
    const link =
      item.link || `/shop?category=${encodeURIComponent(item.category)}`;
    navigate(link);
  };

  const startScroll = (container, scrollPosRef, animRef, isPausedRef) => {
    if (!container) return;

    const speed = 1.2;

    const step = () => {
      if (!isPausedRef.current) {
        scrollPosRef.current += speed;
        if (scrollPosRef.current >= container.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        container.scrollLeft = scrollPosRef.current;
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    startScroll(containerRef1.current, scrollPos1, animRef1, isPaused1);
    startScroll(containerRef2.current, scrollPos2, animRef2, isPaused2);

    return () => {
      cancelAnimationFrame(animRef1.current);
      cancelAnimationFrame(animRef2.current);
    };
  }, []);

  const renderItem = (item, index) => (
    <div
      key={index}
      onClick={() => handleCategoryClick(item)}
      className="pd-card"
      style={{ backgroundImage: `url(${item.image})` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(item)}
    >
      <div className="pd-card-label">{item.category}</div>
    </div>
  );

  const renderBannerRow = (items, ref, isPausedRef) => (
    <div
      ref={ref}
      className="pd-row"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      onTouchStart={() => { isPausedRef.current = true; }}
      onTouchEnd={() => { isPausedRef.current = false; }}
    >
      {[...items, ...items].map((item, index) => renderItem(item, index))}
    </div>
  );

  return (
    <div className="pd-wrapper">
      <div className="pd-section">
        <div className="pd-heading-wrapper">
          <h2 className="pd-heading">Discover The Collections</h2>
        </div>
        {renderBannerRow(banners, containerRef1, isPaused1)}
      </div>

      <div className="pd-section">
        <div className="pd-heading-wrapper">
          <h2 className="pd-heading">Our Services</h2>
        </div>
        {renderBannerRow(services, containerRef2, isPaused2)}
      </div>
    </div>
  );
};

export default ProductDisplay;