import type { Metadata } from "next";
import "./globals.css";
import { ActiveOrderBanner } from "@/components/active-order-banner";
import { Preloader } from "@/components/preloader";

export const metadata: Metadata = {
  title: "Serb Burger",
  description: "Сербский бургер - заказ онлайн",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className="font-sans antialiased bg-gray-50 text-gray-900"
      >
        <Preloader />
        <ActiveOrderBanner />
        {children}
      </body>
    </html>
  );
}
