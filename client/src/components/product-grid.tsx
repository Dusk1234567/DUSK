import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Crown, Coins } from "lucide-react";
import ProductCard from "./product-card";
import ProductDetailModal from "./product-detail-modal";
import { Product } from "@shared/schema";

export default function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products.filter(product => {
    if (activeFilter === "all") return true;
    return product.category === activeFilter;
  });

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const filterButtons = [
    { id: "all", label: "All Products", icon: null },
    { id: "ranks", label: "Server", icon: Crown },
    { id: "coins", label: "VPS", icon: Coins },
  ];

  return (
    <>
      {/* Filter Section */}
      <section id="products" className="py-12 bg-light-slate/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 minecraft-green animate-slide-up">Our Products</h2>
            <p className="text-xl minecraft-gray animate-fade-in stagger-1">Choose from our premium selection of SERVER'S and VPS</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filterButtons.map((filter, index) => (
              <Button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-3 font-bold transition-all duration-300 hover-lift animate-scale-in ${
                  activeFilter === filter.id
                    ? "bg-minecraft-green text-dark-slate animate-glow"
                    : "bg-light-slate border border-minecraft-gray/30 hover:bg-minecraft-green hover:text-dark-slate"
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {filter.icon && <filter.icon className="h-4 w-4 mr-2 hover-rotate transition-transform duration-300" />}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-light-slate rounded-xl p-6 animate-pulse animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="h-48 bg-minecraft-gray/20 rounded mb-4 animate-shimmer"></div>
                  <div className="h-4 bg-minecraft-gray/20 rounded mb-2"></div>
                  <div className="h-4 bg-minecraft-gray/20 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-minecraft-gray/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  animationDelay={index * 0.1}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl minecraft-gray">No products found for the selected filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal with Reviews */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
