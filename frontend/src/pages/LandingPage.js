import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Shield, Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "AI-Powered Valuation",
      description: "Advanced algorithms analyze market data to estimate property values with precision"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Investment Metrics",
      description: "ROI, ROE, rental yields, and appreciation projections at your fingertips"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk-Based Strategies",
      description: "4 tailored strategies from conservative holds to aggressive flips"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Market Insights",
      description: "Real-time analysis of Italian property markets and investment opportunities"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#1A3C34]/5">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Building2 className="w-8 h-8 text-[#1A3C34]" />
              <span className="text-2xl font-serif font-medium text-[#1A3C34]">PropInvest</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                data-testid="nav-analyze-button"
                onClick={() => navigate('/analyze')}
                className="bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-6 py-5 font-medium transition-all hover:scale-105 active:scale-95"
              >
                Start Analysis
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-[#5C6B67] bg-[#D4F238]/20 px-4 py-2 rounded-full">
                  Investment Intelligence
                </span>
              </motion.div>
              
              <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-[#1A3C34]">
                Maximize Returns.
                <br />
                <span className="text-[#C87961]">Minimize Risk.</span>
              </h1>
              
              <p className="text-base md:text-lg leading-relaxed text-slate-600 max-w-xl">
                Analyze Italian real estate investments with AI-powered insights. Get instant property valuations, 
                ROI calculations, and personalized strategies based on your risk profile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="hero-get-started-button"
                onClick={() => navigate('/analyze')}
                className="bg-[#D4F238] text-[#1A3C34] hover:bg-[#E2FF45] rounded-full px-8 py-6 text-lg font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(212,242,56,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                data-testid="view-portfolio-button"
                onClick={() => navigate('/portfolio')}
                variant="outline"
                className="bg-[#F5F2EB] text-[#1A3C34] border border-[#1A3C34]/10 hover:border-[#1A3C34] rounded-full px-6 py-6 font-medium transition-all"
              >
                View Portfolio
              </Button>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">25k+</div>
                <div className="text-sm text-slate-600">Properties Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">€1.2B</div>
                <div className="text-sm text-slate-600">Total Value Assessed</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">98%</div>
                <div className="text-sm text-slate-600">Accuracy Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-5"
          >
            <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1758548157747-285c7012db5b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMHN1bmxpZ2h0fGVufDB8fHx8MTc2NjQ4OTA3MXww&ixlib=rb-4.1.0&q=85"
                alt="Modern apartment interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C34]/30 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-[#1A3C34] mb-4">
            Everything You Need to Invest Smarter
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Professional-grade tools designed for individual investors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              data-testid={`feature-card-${idx}`}
              className="bg-white rounded-2xl border border-[#1A3C34]/5 shadow-sm hover:shadow-md transition-all duration-300 p-6 md:p-8 group hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-[#D4F238]/20 flex items-center justify-center mb-4 text-[#1A3C34] group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-sans font-bold text-[#1A3C34] mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#1A3C34] rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 noise-texture"></div>
          <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-white mb-6">
              Ready to Make Smarter Investments?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Start analyzing properties today and discover opportunities tailored to your goals.
            </p>
            <Button
              data-testid="cta-button"
              onClick={() => navigate('/analyze')}
              className="bg-[#D4F238] text-[#1A3C34] hover:bg-[#E2FF45] rounded-full px-10 py-6 text-lg font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(212,242,56,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Analyze Your First Property
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A3C34]/5 py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-[#1A3C34]" />
            <span className="text-xl font-serif font-medium text-[#1A3C34]">PropInvest</span>
          </div>
          <p className="text-sm text-slate-600">
            © 2025 PropInvest. AI-powered real estate investment analysis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;