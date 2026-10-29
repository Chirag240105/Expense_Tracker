import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../context/Context";
import { LuMenu, LuX } from "react-icons/lu";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

const LandingNav = () => {
  const navigate = useNavigate();
  const { token } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS
      .map(({ href }) => document.querySelector(href))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visibleSection) setActiveSection(visibleSection.target.id);
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">ET</span>
          </div>
          <span className={`text-lg font-bold ${scrolled ? "text-gray-800" : "text-white"}`}>ExpenseVerse</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-current={activeSection === l.href.slice(1) ? "location" : undefined}
              className={`text-sm font-medium transition ${activeSection === l.href.slice(1) ? (scrolled ? "text-green-700" : "text-emerald-300") : (scrolled ? "text-gray-600 hover:text-green-600" : "text-gray-200 hover:text-white")}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-100 hover:bg-white/10"}`}
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Get started free
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden rounded-lg p-2 transition ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t px-4 pb-4 pt-2 space-y-3 backdrop-blur-md ${scrolled ? "border-gray-100 bg-white/95" : "border-white/10 bg-gray-950/95"}`}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${scrolled ? "text-gray-700 hover:text-green-600" : "text-gray-100 hover:text-emerald-300"}`}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate("/auth")}
              className={`w-full rounded-lg border py-2 text-sm font-medium ${scrolled ? "border-gray-200 text-gray-700" : "border-gray-600 text-gray-100"}`}
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"
            >
              Get started free
            </button>
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-200/30" aria-hidden="true">
        <div
          className="h-full bg-emerald-500 origin-left"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
};

export default LandingNav;
