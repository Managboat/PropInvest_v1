import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Home, Calendar, Lock, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
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
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium-high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#1A3C34]/5 sticky top-0 z-50">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <Button
              data-testid="back-to-analyze-button"
              variant="ghost"
              onClick={() => navigate('/analyze')}
              className="text-[#1A3C34] hover:bg-[#1A3C34]/5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              New Analysis
            </Button>
            <Button
              data-testid="save-analysis-button"
              onClick={handleSaveAnalysis}
              disabled={saving}
              className="bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-6 py-5"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Portfolio
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        {/* Property Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="property-header"
        >
          <Card className="border-[#1A3C34]/5 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="font-serif text-3xl md:text-4xl mb-2">
                    {property_data.title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {property_data.location} • {property_data.property_type}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-mono font-bold text-[#1A3C34]">
                    €{property_data.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    €{(property_data.price / property_data.size_sqm).toFixed(0)}/sqm
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-600">Size</div>
                  <div className="text-xl font-mono font-semibold">{property_data.size_sqm} sqm</div>
                </div>
                {property_data.rooms && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Rooms</div>
                    <div className="text-xl font-mono font-semibold">{property_data.rooms}</div>
                  </div>
                )}
                {property_data.bathrooms && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600">Bathrooms</div>
                    <div className="text-xl font-mono font-semibold">{property_data.bathrooms}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-serif text-3xl font-medium text-[#1A3C34] mb-6">Investment Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="metric-roi" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>Return on Investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">{metrics.roi}%</div>
                <Progress value={Math.min(metrics.roi, 100)} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="metric-roe" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>Return on Equity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">{metrics.roe}%</div>
                <Progress value={Math.min(metrics.roe, 100)} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="metric-short-rental" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>Short-term Rental Yield</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#C87961]">{metrics.short_term_rental_yield}%</div>
                <Progress value={metrics.short_term_rental_yield * 10} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="metric-long-rental" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>Long-term Rental Yield</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#C87961]">{metrics.long_term_rental_yield}%</div>
                <Progress value={metrics.long_term_rental_yield * 10} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="metric-appreciation" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>YoY Appreciation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">{metrics.yoy_appreciation}%</div>
              </CardContent>
            </Card>

            <Card data-testid="metric-projected-value" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow md:col-span-2">
              <CardHeader className="pb-3">
                <CardDescription>Projected 5-Year Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">
                  €{metrics.projected_5yr_value.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  +€{(metrics.projected_5yr_value - property_data.price).toLocaleString()} gain
                </div>
              </CardContent>
            </Card>

            <Card data-testid="metric-estimated-value" className="border-[#1A3C34]/5 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription>AI Estimated Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-[#1A3C34]">
                  €{metrics.estimated_value.toLocaleString()}
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
          <Card data-testid="ai-insights" className="border-[#1A3C34]/5 shadow-lg bg-gradient-to-br from-white to-[#D4F238]/5">
            <CardHeader>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#1A3C34]" />
                AI Market Insights
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
          <h2 className="font-serif text-3xl font-medium text-[#1A3C34] mb-6">Investment Strategies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strategy, idx) => (
              <Card
                key={idx}
                data-testid={`strategy-${strategy.risk_level}`}
                className={`border transition-all hover:shadow-lg ${
                  strategy.is_premium
                    ? 'border-[#D4F238]/50 bg-[#0F1211] text-white relative overflow-hidden'
                    : 'border-[#1A3C34]/5 hover:-translate-y-1'
                }`}
              >
                {strategy.is_premium && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-[#D4F238]" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getRiskColor(strategy.risk_level)}>
                      {strategy.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-2xl">{strategy.strategy_name}</CardTitle>
                  <CardDescription className={strategy.is_premium ? 'text-white/70' : ''}>
                    {strategy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!strategy.is_premium ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Expected Return</div>
                          <div className="font-semibold">{strategy.expected_return}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Time Horizon</div>
                          <div className="font-semibold">{strategy.time_horizon}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 mb-2">Key Points</div>
                        <ul className="space-y-1 text-sm">
                          {strategy.key_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#D4F238] mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto mb-4 text-[#D4F238]" />
                      <p className="text-white/90 mb-4">
                        Unlock premium strategies with detailed implementation plans
                      </p>
                      <Button className="bg-[#D4F238] text-[#1A3C34] hover:bg-[#E2FF45] rounded-full px-6 py-5">
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