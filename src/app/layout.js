import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}