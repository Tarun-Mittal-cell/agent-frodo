import "./globals.css";
import ClientProviders from "./ClientProviders";

export const metadata = {
  title: "Frodo - AI Agent",
  description: "Your personal AI agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
