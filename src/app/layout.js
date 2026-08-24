import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "ChoiceKraft — Quality Stationery for School, Office & Creativity",
  description:
    "ChoiceKraft is your trusted destination for affordable, high-quality stationery across India. Note books printed and bound in our own facility, plus pens, files and office essentials.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} h-full antialiased`}
    >
      {/* Browser extensions (Grammarly, password managers, ...) stamp their own
          attributes onto <body> before React hydrates. Only this element's own
          attributes are exempted; children still report real mismatches. */}
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-white"
      >
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingActions />
          <ScrollToTop />
        </CartProvider>
      </body>
    </html>
  );
}
