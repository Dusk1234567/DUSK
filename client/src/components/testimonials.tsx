import { Star, User } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "CraftMaster99",
      rating: 5,
      comment: "Amazing service! Got my VIP rank instantly and the perks are incredible. Totally worth it!",
      avatar: "minecraft-green"
    },
    {
      name: "BlockBuilder2023",
      rating: 5,
      comment: "Best coin prices I've found. The bonus coins make it such a great deal. Fast and reliable!",
      avatar: "neon-cyan"
    },
    {
      name: "PvPLegend",
      rating: 5,
      comment: "The LEGEND rank is absolutely worth it. The exclusive features are game-changing!",
      avatar: "yellow-400"
    }
  ];

  const getAvatarColorClass = (color: string) => {
    switch (color) {
      case "minecraft-green":
        return "bg-minecraft-green";
      case "neon-cyan":
        return "bg-neon-cyan";
      case "yellow-400":
        return "bg-yellow-400";
      default:
        return "bg-minecraft-green";
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-light-slate/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 minecraft-green animate-slide-up">What Our Players Say</h2>
          <p className="text-xl minecraft-gray animate-fade-in stagger-1">Join thousands of satisfied customers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-light-slate p-6 rounded-xl border border-minecraft-green/20 hover-lift transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${0.2 + index * 0.2}s` }}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${getAvatarColorClass(testimonial.avatar)} rounded-full flex items-center justify-center mr-4 animate-pulse-slow hover-scale transition-transform duration-300`}>
                  <User className="h-6 w-6 text-dark-slate" />
                </div>
                <div>
                  <h4 className="font-bold animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.2}s` }}>{testimonial.name}</h4>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-current hover-scale transition-transform duration-300" 
                        style={{ animationDelay: `${0.6 + index * 0.2 + i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="minecraft-gray animate-fade-in" style={{ animationDelay: `${0.8 + index * 0.2}s` }}>"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
