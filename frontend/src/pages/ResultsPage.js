import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2, MapPin, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const analysis = location.state?.analysis;

  if (!analysis) {
    navigate('/analyze');
    return null;
  }

  const { property_data, metrics, strategies, ai_insights } = analysis;

  const handleSaveAnalysis = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/save-analysis`, {
        analysis_id: analysis.id
      });
      toast.success('Analysis saved to portfolio!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save analysis');
    } finally {
      setSaving(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medium': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'medium-high': return 'bg-slate-200 text-slate-800 border-slate-400';
      case 'high': return 'bg-slate-300 text-slate-900 border-slate-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-900" />
                <span className="text-xl font-bold text-slate-900">PropInvest</span>
              </div>
              <Button
                data-testid="back-to-analyze-button"
                variant="ghost"
                onClick={() => navigate('/analyze')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
            <Button
              data-testid="save-analysis-button"
              onClick={handleSaveAnalysis}
              disabled={saving}
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Portfolio
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
        {/* Property Header with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="property-header"
        >
          <Card className="border-gray-200 shadow-lg overflow-hidden">
            {property_data.image_url && (
              <div className="h-64 md:h-96 w-full relative">
                <img
                  src={property_data.image_url}
                  alt={property_data.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {property_data.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property_data.location}</span>
                    </div>
                    <span>•</span>
                    <span>{property_data.property_type}</span>
                  </div>
                </div>
              </div>
            )}
            
            <CardContent className="p-6 md:p-8 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-blue-900">
                    €{property_data.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    €{(property_data.price / property_data.size_sqm).toFixed(0)}/sqm
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="space-y-1">
                  <div className="text-sm text-slate-600">Size</div>
                  <div className="text-xl font-bold text-slate-900">{property_data.size_sqm} sqm</div>
                </div>
                {property_data.rooms && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Rooms</div>
                    <div className="text-xl font-bold text-slate-900">{property_data.rooms}</div>
                  </div>
                )}
                {property_data.bathrooms && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Bathrooms</div>
                    <div className="text-xl font-bold text-slate-900">{property_data.bathrooms}</div>
                  </div>
                )}
                {property_data.monthly_expenses && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Monthly Expenses</div>
                    <div className="text-xl font-bold text-slate-900">€{property_data.monthly_expenses.toFixed(0)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Investment Metrics</h2>
            <p className="text-slate-600">Comprehensive financial analysis and projections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ROI */}
            <Card data-testid="metric-roi" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Return on Investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-900">{metrics.roi}%</div>
                <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(metrics.roi, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* ROE */}
            <Card data-testid="metric-roe" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Return on Equity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-900">{metrics.roe}%</div>
                <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(metrics.roe, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Cap Rate */}
            <Card data-testid="metric-cap-rate" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Cap Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-700">{metrics.cap_rate}%</div>
                <div className="text-sm text-slate-600 mt-2">Annual NOI / Price</div>
              </CardContent>
            </Card>

            {/* Monthly Cash Flow */}
            <Card data-testid="metric-cash-flow" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Monthly Cash Flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${metrics.monthly_cash_flow >= 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                  €{metrics.monthly_cash_flow.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 mt-2">After expenses</div>
              </CardContent>
            </Card>

            {/* Rental Yields */}
            <Card data-testid="metric-short-rental" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Short-term Rental Yield</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{metrics.short_term_rental_yield}%</div>
                <div className="text-sm text-slate-600 mt-2">Airbnb / Vacation</div>
              </CardContent>
            </Card>

            <Card data-testid="metric-long-rental" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">Long-term Rental Yield</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{metrics.long_term_rental_yield}%</div>
                <div className="text-sm text-slate-600 mt-2">Traditional lease</div>
              </CardContent>
            </Card>

            {/* Appreciation */}
            <Card data-testid="metric-appreciation" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">YoY Appreciation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-700">{metrics.yoy_appreciation}%</div>
                <div className="text-sm text-slate-600 mt-2">Historical average</div>
              </CardContent>
            </Card>

            {/* 5-Year Projection */}
            <Card data-testid="metric-projected-value" className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-600">5-Year Projected Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">
                  €{(metrics.projected_5yr_value / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  +€{((metrics.projected_5yr_value - property_data.price) / 1000).toFixed(0)}k gain
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card data-testid="ai-insights" className="border-gray-200 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-blue-900">
                <Home className="w-6 h-6" />
                AI Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-slate-700">{ai_insights}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Investment Strategies</h2>
            <p className="text-slate-600">Tailored approaches based on risk tolerance and goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strategy, idx) => (
              <Card
                key={idx}
                data-testid={`strategy-${strategy.risk_level}`}
                className={`border transition-all hover:shadow-xl ${
                  strategy.is_premium
                    ? 'bg-gradient-to-br from-slate-900 to-blue-900 text-white border-blue-800'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getRiskColor(strategy.risk_level)} font-semibold border`}>
                      {strategy.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <CardTitle className={`text-2xl font-bold ${strategy.is_premium ? 'text-white' : 'text-slate-900'}`}>
                    {strategy.strategy_name}
                  </CardTitle>
                  <CardDescription className={strategy.is_premium ? 'text-blue-100' : 'text-slate-600'}>
                    {strategy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!strategy.is_premium ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Expected Return</div>
                          <div className="font-bold text-slate-900">{strategy.expected_return}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Time Horizon</div>
                          <div className="font-bold text-slate-900">{strategy.time_horizon}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Initial Investment</div>
                          <div className="font-bold text-blue-900">{strategy.initial_investment}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Monthly Income</div>
                          <div className="font-bold text-blue-600">{strategy.monthly_income}</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs font-semibold text-slate-600 mb-3">KEY POINTS</div>
                        <ul className="space-y-2">
                          {strategy.key_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                              <span className="text-slate-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Premium Strategy</h3>
                      <p className="text-blue-100 mb-6">
                        Unlock detailed implementation plans, financial projections, and risk mitigation strategies
                      </p>
                      <Button className="bg-white text-blue-900 hover:bg-gray-100 font-semibold">
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;