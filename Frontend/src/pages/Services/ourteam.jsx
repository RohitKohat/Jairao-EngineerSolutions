import React from "react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import "./Ourteam.css"; // Importing CSS file
import img1 from "../../assets/images/Screenshot 2025-03-26 142139.png"
import img2 from "../../assets/images/ss.png"
import img3 from "../../assets/images/rrk img.jpg"
const teamSections = [
  {
    title: "Founder",
    members: [
      {
        name: "ER.Sanyog D Uikey",
        position: "Founder & CEO",
        work: "Providing trusted solutions in home appliances and solar sales.",
        image: img1,
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    ],
  },
  {
    title: "Co-Founder",
    members: [
      {
        name: "Sameer D Uikey ",
        position: "Co-Founder",
        work: "Driving sustainable energy solutions through solar sales.",
        image: img2,
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    ],
  },
  {
    title: "Web-Developer",
    members: [
      {
        name: "Rohit R Kohat",
        position: "Lead Developer",
        work: "Develops and maintains the core software architecture.",
        image: img3,
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    ],
  },
];

const OurTeam = () => {
  return (
    <div className="team-container">
      <h2 className="team-title">Meet Our Team</h2>
      <div className="team-grid">
        {teamSections.map((section, idx) => (
          <div key={idx} className="team-card">
            <h3 className="team-card-title">{section.title}</h3>
            {section.members.map((member, index) => (
              <div key={index} className="team-member">
                <img src={member.image} alt={member.name} className="team-member-image" />
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-position">{member.position}</p>
                <p className="team-member-work">{member.work}</p>
                <div className="team-member-icons">
                  <a href={member.linkedin} className="icon-linkedin">
                    <FaLinkedin size={28} />
                  </a>
                  <a href={member.twitter} className="icon-twitter">
                    <FaTwitter size={28} />
                  </a>
                  <a href={member.github} className="icon-github">
                    <FaInstagram size={28} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurTeam;
