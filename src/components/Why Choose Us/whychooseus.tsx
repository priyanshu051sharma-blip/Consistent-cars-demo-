import React from "react";
import {
  FaBolt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTools,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

const features = [
  {
    icon: <FaBolt size={36} color="#0077ff" />,
    title: "Fast & Easy Booking",
    description:
      "Book your ride in just a few clicks, with no hassle or delays.",
  },
  {
    icon: <FaMapMarkerAlt size={36} color="#0077ff" />,
    title: "Any Pickup Location",
    description: "Choose your pickup spot, wherever you are in the city.",
  },
  {
    icon: <FaMoneyBillWave size={36} color="#0077ff" />,
    title: "No Booking Charges",
    description: "Enjoy our services without paying any hidden fees.",
  },
  {
    icon: <FaTools size={36} color="#0077ff" />,
    title: "Free Maintenance",
    description: "All vehicles are maintained at no extra cost to you.",
  },
  {
    icon: <FaShieldAlt size={36} color="#0077ff" />,
    title: "Fully Insured",
    description: "Drive worry-free with our comprehensive insurance coverage.",
  },
  {
    icon: <FaHeadset size={36} color="#0077ff" />,
    title: "24/7 Support",
    description: "Our team is here to assist you at any time, day or night.",
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
