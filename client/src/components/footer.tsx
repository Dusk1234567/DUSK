import { ExternalLink } from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="footer" className="bg-dark-slate border-t border-minecraft-green/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="animate-slide-in-left stagger-1">
            <div className="text-2xl font-bold minecraft-green mb-4 hover-glow transition-all duration-300 cursor-pointer">
              <i className="fas fa-cube mr-2 animate-wiggle"></i>
              LifeSteal Shop
            </div>
            <p className="minecraft-gray mb-4">
              Your trusted Minecraft server shop for premium ranks and coins. Level up your gaming experience today!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">
                <ExternalLink className="h-5 w-5" />
              </a>
              <a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">
                <ExternalLink className="h-5 w-5" />
              </a>
              <a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="animate-slide-in-left stagger-2">
            <h4 className="font-bold text-white mb-4 animate-fade-in">Quick Links</h4>
            <ul className="space-y-2">
              <li className="animate-slide-up stagger-1">
                <button 
                  onClick={() => scrollToSection('products')}
                  className="minecraft-gray hover:text-minecraft-green transition-all duration-300 text-left hover-scale"
                >
                  Products
                </button>
              </li>
              <li className="animate-slide-up stagger-2">
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="minecraft-gray hover:text-minecraft-green transition-all duration-300 text-left hover-scale"
                >
                  Reviews
                </button>
              </li>
              <li className="animate-slide-up stagger-3">
                <a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">
                  Support
                </a>
              </li>
              <li className="animate-slide-up stagger-4">
                <a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">
                  Server Status
                </a>
              </li>
            </ul>
          </div>
          
          <div className="animate-slide-in-left stagger-3">
            <h4 className="font-bold text-white mb-4 animate-fade-in">Support</h4>
            <ul className="space-y-2">
              <li className="animate-slide-up stagger-1"><a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">FAQ</a></li>
              <li className="animate-slide-up stagger-2"><a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">Contact Us</a></li>
              <li className="animate-slide-up stagger-3"><a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">Refund Policy</a></li>
              <li className="animate-slide-up stagger-4"><a href="#" className="minecraft-gray hover:text-minecraft-green transition-all duration-300 hover-scale">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="animate-slide-in-left stagger-4">
            <h4 className="font-bold text-white mb-4 animate-fade-in">Server Info</h4>
            <div className="space-y-2">
              <p className="minecraft-gray animate-slide-up stagger-1">
                IP: <span className="minecraft-green font-mono hover-glow transition-all duration-300">lifesteal.server.com</span>
              </p>
              <p className="minecraft-gray animate-slide-up stagger-2">
                Version: <span className="minecraft-green hover-glow transition-all duration-300">1.20.x</span>
              </p>
              <p className="minecraft-gray animate-slide-up stagger-3">
                Players: <span className="minecraft-green hover-glow transition-all duration-300">247/500</span>
              </p>
              <div className="flex items-center animate-slide-up stagger-4">
                <div className="w-3 h-3 bg-minecraft-green rounded-full mr-2 animate-pulse hover-scale transition-transform duration-300"></div>
                <span className="minecraft-green">Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-minecraft-green/20 mt-8 pt-8 text-center">
          <p className="minecraft-gray">
            &copy; 2024 LifeSteal Shop. All rights reserved. Not affiliated with Mojang Studios.
          </p>
        </div>
      </div>
    </footer>
  );
}
