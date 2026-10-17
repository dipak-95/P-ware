import "./globals.css";

export const metadata = {
  title: "P-Ware Admin | Sanitaryware B2B",
  description: "Manufacturer Admin Portal for P-Ware B2B Sanitaryware system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
