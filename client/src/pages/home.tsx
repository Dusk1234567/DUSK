import Header from "@/components/header";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import CartSidebar from "@/components/cart-sidebar";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import FloatingParticles from "@/components/floating-particles";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-slate text-white relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />
        <Hero />
        <ProductGrid />
        <Testimonials />
        <Footer />
        <CartSidebar />
      </div>
    </div>
  );
}
