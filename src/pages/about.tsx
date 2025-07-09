import React from "react";
import AIChatBot from "../components/AIChabot/AIChatbot";

const stats = [
  { number: "18", label: "Years of Experience" },
  { number: "200+", label: "Successful Rides" },
  { number: "450+", label: "Happy Customers" },
];

const About: React.FC = () => {
  return (
    <main className="bg-[#222f35] min-h-screen">
      <section className="py-16 px-6 md:px-16 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 text-center text-[#00ffff]">
            About Us
          </h1>
          <p className="mb-4 text-lg">
            Consistent Cars (CC) is a premier Car Rental company and the best
            Cab service provider in Pune renowned since 2005. Mr. Himanshu
            Mandke, our leading agency, is a management graduate and he worked
            as a Sr. Manager in India’s leading travel company, started
            Consistent Cars (CC) with just one car though it was a challenge to
            meet the requirements of the customers with just one car at the
            disposal. But the sincerity to serve did not go unnoticed and soon
            the company was associated with many cars and corporate clients.
          </p>
          <p className="mb-4 text-lg">
            We are one of the leading online car service company agency
            providing reliable Local and outstation cabs with online booking,
            tracking & payment facility.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-4 text-[#00ffff]">
            Our Customers: Who We Serve
          </h2>
          <p className="mb-6 text-lg">
            At Consistent Cars, we cater to a diverse range of travelers in
            Pune, Goa, and nearby destinations, all of whom share a need for
            reliable, comfortable, and convenient transportation.
          </p>

          <div className="grid gap-8">
            {[
              {
                title: "Business Travelers",
                desc: "Business travelers rely on us for timely and stress-free airport transfers and corporate travel, ensuring they arrive at their destinations on time and in comfort.",
              },
              {
                title: "Tourists & Vacationers",
                desc: "Tourists and vacationers enjoy hassle-free journeys to top destinations like Lonavala, Mahabaleshwar, and Goa, with our safe and comfortable vehicles offering the perfect way to explore.",
              },
              {
                title: "Families & Groups",
                desc: "Families and groups appreciate our spacious vehicles for group trips, weekend getaways, and family vacations, providing ample space and comfort for everyone.",
              },
              {
                title: "Locals & Residents",
                desc: "Locals and residents choose Consistent Cars for intercity travel, airport drops, and special events, knowing they can rely on our punctual and professional service.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-md">{item.desc}</p>
              </div>
            ))}

            <p className="mt-6 text-lg">
              Our customers trust us for personalized, high-quality service
              every step of the way, whether they’re traveling for business,
              leisure, or a family outing.
            </p>
            <p className="text-lg">
              From the past 15 years, we are highly recommended local and
              outstation Car on the Hire service provider in entire India for
              top quality service at discounted rates, for complete transparency
              and outstanding customer service.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#222f35] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
            >
              <h4 className="text-4xl font-extrabold text-blue-900 mb-2">
                {stat.number}
              </h4>
              <p className="text-gray-800 font-medium text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <AIChatBot />
    </main>
  );
};

export default About;
