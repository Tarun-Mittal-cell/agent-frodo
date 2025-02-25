// app/page.js
import Hero from "@/components/custom/Hero";
import WebsiteGenerator from "@/components/custom/WebsiteGenerator";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Hero />

      <div className="py-16">
        <WebsiteGenerator />
      </div>

      <footer className="container mx-auto px-4 py-8 border-t border-slate-800">
        <p className="text-center text-slate-500">
          Powered by Dumpling - Modern Website Generator
        </p>
      </footer>
    </div>
  );
}
