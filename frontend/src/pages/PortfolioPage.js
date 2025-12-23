import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#1A3C34]/5">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <Button
              data-testid="back-home-button"
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#1A3C34] hover:bg-[#1A3C34]/5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Home
            </Button>
            <Button
              data-testid="new-analysis-button"
              onClick={() => navigate('/analyze')}
              className="bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-6 py-5"
            >
              New Analysis
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-[#1A3C34] mb-4">
              Your Portfolio
            </h1>
            <p className="text-lg text-slate-600">
              Review your saved property analyses
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#1A3C34]" />
            </div>
          ) : portfolio.length === 0 ? (
            <Card data-testid="empty-portfolio" className="border-[#1A3C34]/5 text-center py-20">
              <CardContent>
                <Home className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="font-serif text-2xl text-[#1A3C34] mb-2">No Properties Yet</h3>
                <p className="text-slate-600 mb-6">
                  Start analyzing properties to build your investment portfolio
                </p>
                <Button
                  data-testid="start-analyzing-button"
                  onClick={() => navigate('/analyze')}
                  className="bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-8 py-6"
                >
                  Analyze Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item, idx) => {
                const analysis = item.analysis;
                const propertyData = analysis.property_data;
                const metrics = analysis.metrics;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      data-testid={`portfolio-card-${idx}`}
                      className="border-[#1A3C34]/5 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                      onClick={() => navigate('/results/saved', { state: { analysis } })}
                    >
                      <CardHeader>
                        <CardTitle className="font-serif text-xl line-clamp-2">
                          {propertyData.title}
                        </CardTitle>
                        <CardDescription>
                          {propertyData.location} • {propertyData.property_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-mono font-bold text-[#1A3C34]">
                            €{propertyData.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-slate-600">
                            {propertyData.size_sqm} sqm
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#F5F2EB] rounded-lg p-3">
                            <div className="text-xs text-slate-600 mb-1">ROI</div>
                            <div className="font-mono font-bold text-[#1A3C34]">{metrics.roi}%</div>
                          </div>
                          <div className="bg-[#F5F2EB] rounded-lg p-3">
                            <div className="text-xs text-slate-600 mb-1">Rental Yield</div>
                            <div className="font-mono font-bold text-[#C87961]">
                              {metrics.long_term_rental_yield}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>{metrics.yoy_appreciation}% YoY appreciation</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioPage;