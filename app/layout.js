import "./globals.css";
import ClientProviders from "./ClientProviders";
import Header from "@/components/custom/Header";

export const metadata = {
  title: "Frodo - AI Agent",
  description: "Your personal AI agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
