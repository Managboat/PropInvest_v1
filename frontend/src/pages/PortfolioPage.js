import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, TrendingUp, Loader2, Building2, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-900" />
                <span className="text-xl font-bold text-slate-900">PropInvest</span>
              </div>
              <Button
                data-testid="back-home-button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
            <Button
              data-testid="new-analysis-button"
              onClick={() => navigate('/analyze')}
              className="bg-blue-900 text-white hover:bg-blue-800"
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
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Your Portfolio
            </h1>
            <p className="text-lg text-slate-600">
              {portfolio.length} {portfolio.length === 1 ? 'property' : 'properties'} analyzed
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-900" />
            </div>
          ) : portfolio.length === 0 ? (
            <Card data-testid="empty-portfolio" className="border-gray-200 text-center py-20">
              <CardContent>
                <Home className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Properties Yet</h3>
                <p className="text-slate-600 mb-6">
                  Start analyzing properties to build your investment portfolio
                </p>
                <Button
                  data-testid="start-analyzing-button"
                  onClick={() => navigate('/analyze')}
                  className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-6"
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
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      data-testid={`portfolio-card-${idx}`}
                      className="border-gray-200 hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                      onClick={() => navigate('/results/saved', { state: { analysis } })}
                    >
                      {/* Property Image */}
                      {propertyData.image_url && (
                        <div className="h-48 w-full relative overflow-hidden">
                          <img
                            src={propertyData.image_url}
                            alt={propertyData.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-2xl font-bold text-white">
                              €{(propertyData.price / 1000).toFixed(0)}k
                            </div>
                          </div>
                        </div>
                      )}

                      <CardHeader>
                        <CardTitle className="text-lg font-bold line-clamp-2 text-slate-900 group-hover:text-blue-900 transition-colors">
                          {propertyData.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {propertyData.location}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{propertyData.size_sqm} sqm</span>
                          <span className="text-slate-600">{propertyData.property_type}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs text-slate-600 mb-1">ROI</div>
                            <div className="font-bold text-blue-900">{metrics.roi}%</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-xs text-slate-600 mb-1">Yield</div>
                            <div className="font-bold text-green-700">
                              {metrics.long_term_rental_yield}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-gray-200">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span>{metrics.yoy_appreciation}% annual appreciation</span>
                        </div>

                        {/* Review/AI Insight Preview */}
                        {analysis.ai_insights && (
                          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 line-clamp-2">
                            {analysis.ai_insights}
                          </div>
                        )}
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