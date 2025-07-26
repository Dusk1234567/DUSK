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
          <div>
            <div className="text-2xl font-bold minecraft-green mb-4">
              <i className="fas fa-cube mr-2"></i>
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
          
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('products')}
                  className="minecraft-gray hover:text-minecraft-green transition-colors duration-300 text-left"
                >
                  Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="minecraft-gray hover:text-minecraft-green transition-colors duration-300 text-left"
                >
                  Reviews
                </button>
              </li>
              <li>
                <a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">
                  Server Status
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">FAQ</a></li>
              <li><a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">Refund Policy</a></li>
              <li><a href="#" className="minecraft-gray hover:text-minecraft-green transition-colors duration-300">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Server Info</h4>
            <div className="space-y-2">
              <p className="minecraft-gray">
                IP: <span className="minecraft-green font-mono">lifesteal.server.com</span>
              </p>
              <p className="minecraft-gray">
                Version: <span className="minecraft-green">1.20.x</span>
              </p>
              <p className="minecraft-gray">
                Players: <span className="minecraft-green">247/500</span>
              </p>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-minecraft-green rounded-full mr-2 animate-pulse"></div>
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
