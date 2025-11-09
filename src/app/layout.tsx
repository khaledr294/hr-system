import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"] });

export const metadata = {
  title: "شركة ساعد للإستقدام",
  description: "نظام إدارة شركة ساعد للإستقدام",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={kufi.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

