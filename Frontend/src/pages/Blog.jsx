import { Link } from "react-router-dom";
import heroImage1 from "../assets/images/c61ae78d-d7f4-4c96-86f9-da50156332c9.png";
import post1 from "../assets/images/hotel.avif";
import post2 from "../assets/images/hcltech.avif";
import post3 from "../assets/images/N1_1482130301.jpg";
import "./Blog.css";

const blogPosts = [
  {
    id: 1,
    image: post1,
    title: "Hotel Dwarkamai – Reinvent Luxury - Nagpur",
    date: "Dec 19, 2021",
    author: "Team Jay Rao",
    excerpt: "A deep dive into how our engineering solutions transformed the luxury hospitality experience in Nagpur.",
    link: "#",
  },
  {
    id: 2,
    image: post2,
    title: "HCL Technologies Nagpur",
    date: "Dec 15, 2021",
    author: "Team Jay Rao",
    excerpt: "How we delivered large-scale appliance installation and maintenance for one of Nagpur's biggest tech campuses.",
    link: "#",
  },
  {
    id: 3,
    image: post3,
    title: "Tech-Mahindra Nagpur",
    date: "Dec 12, 2021",
    author: "Team Jay Rao",
    excerpt: "A commercial project spotlight on smart appliance systems deployed at Tech-Mahindra's Nagpur office.",
    link: "#",
  },
];

const Blog = () => {
  return (
    <div className="blog-page">
      
      {/* ---------- Hero Section ---------- */}
      <section className="blog-hero">
        <div className="blog-hero-container">
          
          <div className="blog-hero-text">
            <span className="blog-eyebrow">Insights & Stories</span>
            <h1 className="blog-hero-title">
              Latest from Our <span>Journal</span>
            </h1>
            <p className="blog-hero-subtitle">
              Discover project stories, appliance tips, solar insights, and
              behind-the-scenes from the Jay Rao Engineer Solutions team.
            </p>
          </div>

          <div className="blog-hero-image">
            <img src={heroImage1} alt="Blog" />
          </div>

        </div>
      </section>

      {/* ---------- Blog Posts ---------- */}
      <section className="blog-section">
        <div className="blog-container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.id} className="post-entry">
                
                {/* Thumbnail */}
                <Link to={post.link} className="post-thumbnail">
                  <img src={post.image} alt={post.title} />
                  <span className="post-date-badge">{post.date}</span>
                </Link>

                {/* Content */}
                <div className="post-content-entry">
                  <h3>
                    <Link to={post.link}>{post.title}</Link>
                  </h3>

                  <p className="post-excerpt">{post.excerpt}</p>

                  <div className="post-meta">
                    <span className="post-author">
                      By <strong>{post.author}</strong>
                    </span>
                    <Link to={post.link} className="read-more-btn">
                      Read More →
                    </Link>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Blog;