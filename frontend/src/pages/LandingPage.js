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
      title: "Valutazione AI",
      description: "Algoritmi avanzati analizzano i dati di mercato per stimare il valore con precisione"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Metriche Investimento",
      description: "ROI, ROE, cash flow e proiezioni di apprezzamento a portata di mano"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Strategie Basate sul Rischio",
      description: "4 strategie personalizzate da hold conservativi a flip aggressivi"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Insights di Mercato",
      description: "Analisi in tempo reale dei mercati immobiliari italiani e opportunità"
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
              className="flex items-center gap-4"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
                className="text-slate-700 hover:text-slate-900 font-medium"
              >
                Piani
              </Button>
              <Button 
                data-testid="nav-analyze-button"
                onClick={() => navigate('/analyze')}
                className="bg-blue-900 text-white hover:bg-blue-800 rounded-lg px-6 py-5 font-medium transition-all"
              >
                Inizia Analisi
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
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
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-4 py-2 rounded-full">
                  Analisi AI-Powered
                </span>
              </motion.div>
              
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900">
                Scopri Quanto Guadagnare
                <span className="block text-blue-900 mt-2">Con Il Tuo Investimento Immobiliare</span>
              </h1>
              
              <p className="text-base md:text-lg leading-relaxed text-slate-600 max-w-xl">
                Strategie di investimento personalizzate in pochi minuti grazie ad AI generativa, con indicazioni su ricavi e modelli di business.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="hero-get-started-button"
                onClick={() => navigate('/analyze')}
                className="bg-blue-900 text-white hover:bg-blue-800 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:shadow-lg"
              >
                Inizia Analisi Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-white text-slate-900 border-2 border-gray-300 hover:border-gray-400 rounded-lg px-8 py-6 text-lg font-semibold transition-all"
              >
                Vedi Piani
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
                <div className="text-3xl font-mono font-bold text-slate-900">25k+</div>
                <div className="text-sm text-slate-600">Proprietà</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-slate-900">€1.2B</div>
                <div className="text-sm text-slate-600">Analizzati</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-slate-900">98%</div>
                <div className="text-sm text-slate-600">Accuratezza</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5"
          >
            <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://customer-assets.emergentagent.com/job_smart-realty-16/artifacts/3zzjo9cb_88c21b63007714b6001c31681cbb1eb0.jpg"
                alt="Luxury property Porto Cervo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                  <div className="text-sm font-semibold text-blue-900 mb-1">INVESTIMENTO DI LORENZO</div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">Appartamento Porto Cervo, Sardegna</div>
                  <div className="text-sm text-slate-600 mb-3">Strategia: Ristruttura e Rivendi</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-slate-600">ROI 5 anni</div>
                      <div className="text-lg font-bold text-blue-900">32%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Cash Flow</div>
                      <div className="text-lg font-bold text-slate-900">€25k/anno</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Score</div>
                      <div className="text-lg font-bold text-blue-900">8/10</div>
                    </div>
                  </div>
                </div>
              </div>
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
            Tutto Ciò di Cui Hai Bisogno
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Strumenti professionali per investimenti più intelligenti
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
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-900">
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
            Pronto a Investire in Modo Più Intelligente?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di investitori che prendono decisioni basate sui dati
          </p>
          <Button
            data-testid="cta-button"
            onClick={() => navigate('/analyze')}
            className="bg-white text-blue-900 hover:bg-gray-100 rounded-lg px-10 py-6 text-lg font-bold transition-all hover:shadow-xl"
          >
            Analizza La Tua Prima Proprietà
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