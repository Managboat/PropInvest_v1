import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, FileInput, ArrowLeft, Loader2, Building2, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  const [step, setStep] = useState(1); // 1 = input property, 2 = purchase details
  const [extractedProperty, setExtractedProperty] = useState(null);
  
  const [url, setUrl] = useState('');
  
  const [manualData, setManualData] = useState({
    title: '',
    location: '',
    price: '',
    property_type: 'Apartment',
    size_sqm: '',
    rooms: '',
    bathrooms: '',
    renovation_needed: false
  });

  const [purchaseDetails, setPurchaseDetails] = useState({
    mortgage_percentage: '80',
    mortgage_rate: '3.5',
    mortgage_years: '25',
    is_first_home: true,
    purchase_tax_rate: '2',
    notary_fees: '2000',
    agency_fees_percentage: '3',
    annual_property_tax: '1000',
    maintenance_percentage: '1'
  });

  const handleExtractFromUrl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a property URL');
      return;
    }

    setLoading(true);
    try {
      // Extract property data from URL
      const response = await axios.post(`${API}/extract-property`, { url });
      setExtractedProperty(response.data);
      setStep(2);
      toast.success('Property data extracted! Now configure purchase details.');
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract property data.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToFinancing = () => {
    if (!manualData.title || !manualData.location || !manualData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handleFinalAnalysis = async () => {
    setLoading(true);
    try {
      let payload;
      
      if (activeTab === 'url' && extractedProperty) {
        payload = {
          ...extractedProperty,
          purchase_details: purchaseDetails
        };
      } else {
        payload = {
          title: manualData.title,
          location: manualData.location,
          price: parseFloat(manualData.price),
          property_type: manualData.property_type,
          size_sqm: manualData.size_sqm ? parseFloat(manualData.size_sqm) : 80,
          rooms: manualData.rooms ? parseInt(manualData.rooms) : null,
          bathrooms: manualData.bathrooms ? parseInt(manualData.bathrooms) : null,
          renovation_needed: manualData.renovation_needed,
          purchase_details: purchaseDetails
        };
      }

      const response = await axios.post(`${API}/analyze`, payload);
      toast.success('Analysis complete!');
      navigate('/results/new', { state: { analysis: response.data } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze property.');
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
                data-testid="back-button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Analizza una Proprietà
            </h1>
            <p className="text-lg text-slate-600">
              {step === 1 ? 'Passo 1: Dettagli Proprietà' : 'Passo 2: Acquisto e Finanziamento'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
              step >= 1 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`h-1 w-20 ${
              step >= 2 ? 'bg-blue-900' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
              step >= 2 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-gray-200 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Informazioni Proprietà</CardTitle>
                    <CardDescription className="text-slate-600">Scegli il metodo di input</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100">
                        <TabsTrigger 
                          value="url" 
                          data-testid="url-tab" 
                          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white text-slate-700"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          URL Import
                        </TabsTrigger>
                        <TabsTrigger 
                          value="manual" 
                          data-testid="manual-tab" 
                          className="data-[state=active]:bg-blue-900 data-[state=active]:text-white text-slate-700"
                        >
                          <FileInput className="w-4 h-4 mr-2" />
                          Manual Entry
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="url" className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="url" className="text-slate-900">Property URL</Label>
                          <Input
                            id="url"
                            data-testid="url-input"
                            type="url"
                            placeholder="https://www.immobiliare.it/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-12 border-slate-300"
                          />
                          <p className="text-sm text-slate-500">
                            Paste a link from immobiliare.it
                          </p>
                        </div>

                        <Button
                          data-testid="extract-url-button"
                          onClick={handleExtractFromUrl}
                          disabled={loading}
                          className="w-full bg-blue-900 text-white hover:bg-blue-800 h-12 text-base font-semibold"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Estrazione...
                            </>
                          ) : (
                            'Estrai Dati Proprietà'
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="title" className="text-slate-900">Property Title *</Label>
                            <Input
                              id="title"
                              data-testid="title-input"
                              placeholder="e.g., Charming Apartment in Milan"
                              value={manualData.title}
                              onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-slate-900">Location *</Label>
                            <Input
                              id="location"
                              data-testid="location-input"
                              placeholder="Milan, Lombardy"
                              value={manualData.location}
                              onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-900">Price (€) *</Label>
                            <Input
                              id="price"
                              data-testid="price-input"
                              type="number"
                              placeholder="250000"
                              value={manualData.price}
                              onChange={(e) => setManualData({ ...manualData, price: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="size" className="text-slate-900">Size (sqm) *</Label>
                            <Input
                              id="size"
                              data-testid="size-input"
                              type="number"
                              placeholder="85"
                              value={manualData.size_sqm}
                              onChange={(e) => setManualData({ ...manualData, size_sqm: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rooms" className="text-slate-900">Rooms</Label>
                            <Input
                              id="rooms"
                              data-testid="rooms-input"
                              type="number"
                              placeholder="3"
                              value={manualData.rooms}
                              onChange={(e) => setManualData({ ...manualData, rooms: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bathrooms" className="text-slate-900">Bathrooms</Label>
                            <Input
                              id="bathrooms"
                              data-testid="bathrooms-input"
                              type="number"
                              placeholder="2"
                              value={manualData.bathrooms}
                              onChange={(e) => setManualData({ ...manualData, bathrooms: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-900">Property Type</Label>
                            <select
                              id="type"
                              data-testid="property-type-select"
                              value={manualData.property_type}
                              onChange={(e) => setManualData({ ...manualData, property_type: e.target.value })}
                              className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900"
                            >
                              <option>Apartment</option>
                              <option>House</option>
                              <option>Villa</option>
                              <option>Studio</option>
                              <option>Penthouse</option>
                            </select>
                          </div>

                          <div className="md:col-span-2 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="renovation"
                              checked={manualData.renovation_needed}
                              onChange={(e) => setManualData({ ...manualData, renovation_needed: e.target.checked })}
                              className="w-4 h-4 accent-blue-900"
                            />
                            <Label htmlFor="renovation" className="cursor-pointer text-slate-900">Property needs renovation</Label>
                          </div>
                        </div>

                        <Button
                          data-testid="continue-to-financing-button"
                          onClick={handleContinueToFinancing}
                          className="w-full bg-blue-900 text-white hover:bg-blue-800 h-12 text-base font-semibold"
                        >
                          Continue to Financing
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Property Summary */}
                {extractedProperty && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Property Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-slate-600">Price</div>
                          <div className="text-lg font-bold text-slate-900">€{extractedProperty.price?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Size</div>
                          <div className="text-lg font-bold text-slate-900">{extractedProperty.size_sqm} sqm</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Rooms</div>
                          <div className="text-lg font-bold text-slate-900">{extractedProperty.rooms || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Type</div>
                          <div className="text-lg font-bold text-slate-900">{extractedProperty.property_type}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Purchase Details Form */}
                <Card className="border-gray-200 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Dettagli Acquisto e Finanziamento</CardTitle>
                    <CardDescription className="text-slate-600">Richiesto per analisi accurata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-900">Finanziamento Mutuo (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="80"
                          value={purchaseDetails.mortgage_percentage}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, mortgage_percentage: e.target.value})}
                          className="border-slate-300"
                        />
                        <p className="text-xs text-slate-500">Set to 0 for cash purchase (no mortgage)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Mortgage Interest Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="3.5"
                          value={purchaseDetails.mortgage_rate}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, mortgage_rate: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Mortgage Duration (years)</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={purchaseDetails.mortgage_years}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, mortgage_years: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Property Classification</Label>
                        <select
                          value={purchaseDetails.is_first_home ? 'first' : 'second'}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, is_first_home: e.target.value === 'first', purchase_tax_rate: e.target.value === 'first' ? '2' : '9'})}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900"
                        >
                          <option value="first">Prima Casa - 2% Purchase Tax</option>
                          <option value="second">Seconda Casa - 9% Purchase Tax</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Notary Fees (€)</Label>
                        <Input
                          type="number"
                          placeholder="2000"
                          value={purchaseDetails.notary_fees}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, notary_fees: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Real Estate Agency Fees (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="3"
                          value={purchaseDetails.agency_fees_percentage}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, agency_fees_percentage: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Annual Property Tax (IMU) (€)</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={purchaseDetails.annual_property_tax}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, annual_property_tax: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900">Annual Maintenance (% of value)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="1"
                          value={purchaseDetails.maintenance_percentage}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, maintenance_percentage: e.target.value})}
                          className="border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        Back to Property Details
                      </Button>
                      <Button
                        data-testid="analyze-final-button"
                        onClick={handleFinalAnalysis}
                        disabled={loading}
                        className="flex-1 bg-blue-900 text-white hover:bg-blue-800 h-12 text-base font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Complete Analysis'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzePage;