import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Check, ArrowLeft, Sparkles, Crown, Rocket, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Base',
      price: '9.90',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-slate-600 to-slate-700',
      description: 'Perfect for getting started',
      features: [
        'View all 4 investment strategies',
        'Complete financial projections',
        'ROI, ROE, and cash flow analysis',
        'AI-powered property valuation',
        'Investment quality score (1-10)',
        'Save analyses to portfolio'
      ],
      cta: 'Get Base',
      badge: null
    },
    {
      name: 'Premium',
      price: '29.90',
      icon: <Crown className="w-8 h-8" />,
      color: 'from-blue-900 to-blue-800',
      description: 'Most popular for serious investors',
      features: [
        'Everything in Base, plus:',
        'Detailed business plan for each strategy',
        'Editable revenue & cost projections',
        'Complete cost breakdown (taxes, notary, fees)',
        'Annual profit/loss statements',
        'Add or remove custom cost lines',
        'Export business plans to PDF'
      ],
      cta: 'Get Premium',
      badge: 'POPULAR'
    },
    {
      name: 'Pro',
      price: '79.90',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-blue-800 to-slate-800',
      description: 'For investors who want expert guidance',
      features: [
        'Everything in Premium, plus:',
        '15-minute video consultation',
        'Review your analysis with expert',
        'Get personalized recommendations',
        'Strategy selection guidance',
        'Risk mitigation advice',
        'Priority email support'
      ],
      cta: 'Get Pro',
      badge: null
    },
    {
      name: 'Executive',
      price: '2-4%',
      priceSubtext: 'of investment value',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'from-slate-900 to-blue-900',
      description: 'Full-service investment management',
      features: [
        'Everything in Pro, plus:',
        'Complete project planning',
        'Implementation management',
        'Vendor coordination',
        'Renovation oversight (if needed)',
        'Property management setup',
        'Ongoing support & monitoring',
        'Dedicated account manager'
      ],
      cta: 'Contact Sales',
      badge: 'ENTERPRISE'
    }
  ];

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
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unlock advanced features and expert guidance to maximize your real estate investments
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`border-gray-200 hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden ${
                plan.badge ? 'ring-2 ring-blue-900' : ''
              }`}>
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-900 text-white border-0">{plan.badge}</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">€{plan.price}</span>
                      {!plan.priceSubtext && <span className="text-slate-600">one-time</span>}
                    </div>
                    {plan.priceSubtext && (
                      <div className="text-sm text-slate-600 mt-1">{plan.priceSubtext}</div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90 h-12 font-semibold`}
                    onClick={() => {
                      if (plan.name === 'Executive') {
                        window.location.href = 'mailto:sales@propinvest.com?subject=Executive Plan Inquiry';
                      } else {
                        // TODO: Integrate payment gateway
                        alert(`Payment integration for ${plan.name} plan coming soon!`);
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Yes! You can upgrade to any plan at any time. You'll only pay the difference.</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Are these one-time payments?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Yes, Base, Premium, and Pro are one-time payments per property analysis. Executive is project-based.</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">What's included in the consultation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Pro plan includes a 15-minute video call with a real estate investment expert to review your analysis and provide recommendations.</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">How does Executive pricing work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Executive is 2-4% of your total investment value, based on project scope and complexity. Contact us for a custom quote.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-white p-8">
            <CardContent>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Not sure which plan is right for you?</h3>
              <p className="text-slate-600 mb-6">Start with Base and upgrade anytime as your needs grow.</p>
              <Button 
                onClick={() => navigate('/analyze')}
                className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-6 text-lg font-semibold"
              >
                Start Free Analysis
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;