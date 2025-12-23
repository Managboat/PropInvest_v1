import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Shield, Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Seed sample data on mount
    axios.post(`${API}/seed-sample-data`).catch(err => console.log('Sample data already seeded'));
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "AI-Powered Valuation",
      description: "Advanced algorithms analyze market data to estimate property values with precision"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Investment Metrics",
      description: "ROI, ROE, cap rates, rental yields, and appreciation projections"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk-Based Strategies",
      description: "4 tailored strategies from conservative holds to aggressive flips"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Market Insights",
      description: "Real-time analysis of Italian property markets and opportunities"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Building2 className="w-7 h-7 text-blue-900" />
              <span className="text-xl font-bold text-slate-900">PropInvest</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                data-testid="nav-analyze-button"
                onClick={() => navigate('/analyze')}
                className="bg-blue-900 text-white hover:bg-blue-800 rounded-lg px-6 py-5 font-medium transition-all"
              >
                Start Analysis
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-4 py-2 rounded-full">
                Investment Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
              Smarter Real Estate
              <span className="block text-blue-900">Investment Decisions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              AI-powered property analysis for Italian real estate. Get instant valuations, ROI calculations, and personalized strategies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                data-testid="hero-get-started-button"
                onClick={() => navigate('/analyze')}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                data-testid="view-portfolio-button"
                onClick={() => navigate('/portfolio')}
                className="bg-white text-slate-900 border-2 border-gray-300 hover:border-gray-400 rounded-lg px-8 py-6 text-lg font-semibold transition-all"
              >
                View Portfolio
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-slate-900">25k+</div>
                <div className="text-sm text-slate-600">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">€1.2B</div>
                <div className="text-sm text-slate-600">Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">98%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
                alt="Modern property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto bg-white rounded-3xl my-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional-grade tools for smarter investment decisions
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
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Invest Smarter?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of investors making data-driven decisions
          </p>
          <Button
            data-testid="cta-button"
            onClick={() => navigate('/analyze')}
            className="bg-white text-blue-900 hover:bg-gray-100 rounded-lg px-10 py-6 text-lg font-bold transition-all hover:shadow-xl"
          >
            Analyze Your First Property
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-blue-900" />
            <span className="text-lg font-bold text-slate-900">PropInvest</span>
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