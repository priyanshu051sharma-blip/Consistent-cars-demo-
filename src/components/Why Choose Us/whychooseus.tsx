import React from "react";
import {
  FaUserTie,
  FaFemale,
  FaCarSide,
  FaBalanceScale,
  FaLock,
  FaClock,
  FaThumbsUp,
  FaBolt,
  FaSmile,
  FaCheckCircle,
} from "react-icons/fa";

const features = [
  {
    icon: <FaBolt size={36} color="#0077ff" />,
    title: "Quick Booking",
    description: "Book a ride in seconds with just a few easy steps.",
  },

  {
    icon: <FaUserTie size={36} color="#0077ff" />,
    title: "Professional Drivers",
    description: "Trained and courteous drivers for a safe journey.",
  },
  {
    icon: <FaFemale size={36} color="#0077ff" />,
    title: "Safe for Women",
    description: "We prioritize safety and comfort for every woman.",
  },
  {
    icon: <FaCarSide size={36} color="#0077ff" />,
    title: "Clean Cabs",
    description: "Hygienic and well-maintained cars for your comfort.",
  },
  {
    icon: <FaBalanceScale size={36} color="#0077ff" />,
    title: "Value for Money",
    description: "Affordable rides without compromising on quality.",
  },
  {
    icon: <FaLock size={36} color="#0077ff" />,
    title: "We Value Your Security",
    description: "Strong safety measures for every passenger.",
  },
  {
    icon: <FaCheckCircle size={36} color="#0077ff" />,
    title: "Reliable Drivers",
    description: "All our drivers are background-checked and trustworthy.",
  },
  {
    icon: <FaClock size={36} color="#0077ff" />,
    title: "We Value Time",
    description: "Punctual pickups and timely drop-offs guaranteed.",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section
      style={{
        background: "#222f35",
        padding: "60px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            Why Choose <span style={{ color: "#00ffff" }}>US?</span>
          </h2>
          <p style={{ color: "#4a5568", fontSize: 18 }}>
            Experience the difference with Consistent Cars
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 32,
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                padding: "32px 24px",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              className="whychooseus-card"
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #e0e7ef 0%, #c7d2fe 100%)",
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {feature.icon}
              </div>
              <h4
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#22223b",
                  marginBottom: 12,
                }}
              >
                {feature.title}
              </h4>
              <p style={{ color: "#6b7280", fontSize: 16, minHeight: 48 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .whychooseus-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;
