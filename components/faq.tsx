"use client";

import { ArrowRight, Plus, Minus } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const faqs = [
  {
    question: "Which Product Should I Buy?",
    answer: `Each cheat is built specifically for its respective game, offering different features and compatibility levels. Before purchasing, make sure the product status shows "Undetected (Working)", confirm that it supports your Windows version, and look for products labeled as the "Safest Option" for the best protection against detection.

If you're still unsure which product to choose, feel free to contact our support team — we'll help you pick the safest and most compatible option for your setup.`,
  },
  {
    question: "What's the difference between cheats?",
    answer: `The difference comes down to the game supported, included features, and customization. Some cheats include advanced visuals or extra aimbot features, while others are optimized for maximum stealth. Full comparisons are available on each product's page.`,
  },
  {
    question: "Will this get me banned?",
    answer: `Our software is carefully developed to stay undetected using the latest bypass methods. We recommend to use cheats labeled as "Safest Option" and avoid suspicious gameplay to reduce detection risk.`,
  },
  {
    question: "How do I get support?",
    answer: `We offer 24/7 customer support through our Discord server. Our team of experts is always ready to help you with installation, troubleshooting, or any questions you might have about our products.`,
  },
  {
    question: "What payment methods do you accept?",
    answer: `We accept various payment methods including cryptocurrency, PayPal, and major credit cards. All transactions are processed securely and your information is protected with industry-standard encryption.`,
  },
];

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a] relative overflow-hidden" id="faq">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#6b7280]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#6b7280]/5 blur-[100px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Center the FAQ items */}
        <div className="max-w-4xl mx-auto">
          {/* Title centered above */}
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl font-black text-white mb-6"
            >
              Frequently Asked
              <br />
              <span className="text-[#6b7280] relative inline-block group">
                Questions
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-transparent rounded-full" />
                <span className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#6b7280] to-transparent rounded-full blur-md opacity-60" />
              </span>
            </h2>
            <p className="text-white/60 leading-relaxed max-w-2xl mx-auto">
              Browse common questions and get clear answers without digging
              through support. Can't find what you're looking for? Our team is here to help.
            </p>
          </div>

          {/* FAQ items */}
          <div className="space-y-4">{faqs.map((faq, index) => {
              const isExpanded = expandedIndex === index;
              const isHovered = hoveredIndex === index;
              
              return (
                <div
                  key={index}
                  className={`relative bg-gradient-to-r from-[#111111] to-[#0a1010] border-2 rounded-2xl overflow-hidden transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-10"
                  } ${
                    isExpanded 
                      ? "border-[#6b7280] shadow-xl shadow-[#6b7280]/20" 
                      : isHovered 
                      ? "border-[#6b7280]/50 shadow-lg shadow-[#6b7280]/10" 
                      : "border-[#262626]"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280]/50 transition-all duration-500 ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  }`} />

                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-[#6b7280]/5 to-transparent transition-opacity duration-500 ${
                      isExpanded || isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Question header */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="relative w-full flex items-start gap-4 p-6 text-left transition-all duration-300"
                  >
                    {/* Number badge */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-all duration-500 ${
                        isExpanded 
                          ? "bg-[#6b7280] scale-110 shadow-lg shadow-[#6b7280]/40 rotate-0" 
                          : isHovered 
                          ? "bg-[#6b7280]/80 scale-105" 
                          : "bg-[#6b7280]/60"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-white font-bold text-lg mb-1 transition-all duration-300 ${
                          isExpanded || isHovered ? "text-[#6b7280]" : ""
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    {/* Expand/collapse icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-[#6b7280]/20 flex items-center justify-center transition-all duration-500 ${
                      isExpanded ? "bg-[#6b7280] rotate-180 scale-110" : isHovered ? "bg-[#6b7280]/30 scale-105" : ""
                    }`}>
                      {isExpanded ? (
                        <Minus className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#6b7280]" />
                      )}
                    </div>
                  </button>

                  {/* Answer with smooth expand/collapse */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pl-20">
                        {/* Vertical accent line */}
                        <div className="relative pl-4 border-l-2 border-[#6b7280]/30">
                          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                            {faq.answer.split("contact our support team").map((part, i, arr) =>
                              i < arr.length - 1 ? (
                                <span key={i}>
                                  {part}
                                  <a
                                    href="https://discord.gg/ring-0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#6b7280] font-medium underline hover:text-[#9ca3af] transition-colors duration-300"
                                  >
                                    contact our support team
                                  </a>
                                </span>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner glow on hover/expand */}
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-[#6b7280]/20 blur-3xl rounded-full transition-opacity duration-500 ${
                    isExpanded || isHovered ? "opacity-100" : "opacity-0"
                  }`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-500 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-[#0a0a1a] to-[#0a0a0a] border-2 border-[#6b7280]/30">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-white/60 text-sm">
                Join our Discord community and get instant support from our team
              </p>
            </div>
            <a
              href="https://discord.gg/ring-0"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[#6b7280] hover:bg-[#9ca3af] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Join Discord</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}