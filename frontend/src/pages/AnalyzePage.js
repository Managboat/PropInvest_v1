import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, FileInput, ArrowLeft, Loader2, Building2 } from 'lucide-react';
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
  
  const [url, setUrl] = useState('');
  
  const [manualData, setManualData] = useState({
    title: '',
    location: '',
    price: '',
    property_type: 'Apartment',
    size_sqm: '',
    rooms: '',
    bathrooms: '',
    monthly_expenses: '',
    renovation_needed: false
  });

  const handleUrlAnalysis = async () => {
    if (!url.trim()) {
      toast.error('Please enter a property URL');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/analyze`, { url });
      toast.success('Property analyzed successfully!');
      navigate('/results/new', { state: { analysis: response.data } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalysis = async () => {
    if (!manualData.title || !manualData.location || !manualData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: manualData.title,
        location: manualData.location,
        price: parseFloat(manualData.price),
        property_type: manualData.property_type,
        size_sqm: manualData.size_sqm ? parseFloat(manualData.size_sqm) : 80,
        rooms: manualData.rooms ? parseInt(manualData.rooms) : null,
        bathrooms: manualData.bathrooms ? parseInt(manualData.bathrooms) : null,
        monthly_expenses: manualData.monthly_expenses ? parseFloat(manualData.monthly_expenses) : null,
        renovation_needed: manualData.renovation_needed
      };

      const response = await axios.post(`${API}/analyze`, payload);
      toast.success('Property analyzed successfully!');
      navigate('/results/new', { state: { analysis: response.data } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze property. Please try again.');
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
      <div className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Analyze a Property
            </h1>
            <p className="text-lg text-slate-600">
              Enter a property URL or manually input details
            </p>
          </div>

          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Property Information</CardTitle>
              <CardDescription>Choose your input method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="url" data-testid="url-tab" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Link2 className="w-4 h-4 mr-2" />
                    URL Import
                  </TabsTrigger>
                  <TabsTrigger value="manual" data-testid="manual-tab" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <FileInput className="w-4 h-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="url">Property URL</Label>
                    <Input
                      id="url"
                      data-testid="url-input"
                      type="url"
                      placeholder="https://www.immobiliare.it/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-sm text-slate-500">
                      Paste a link from immobiliare.it and we'll extract all details
                    </p>
                  </div>

                  <Button
                    data-testid="analyze-url-button"
                    onClick={handleUrlAnalysis}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-base font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Property'
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="title">Property Title *</Label>
                      <Input
                        id="title"
                        data-testid="title-input"
                        placeholder="e.g., Charming Apartment in Milan"
                        value={manualData.title}
                        onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        data-testid="location-input"
                        placeholder="Milan, Lombardy"
                        value={manualData.location}
                        onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (€) *</Label>
                      <Input
                        id="price"
                        data-testid="price-input"
                        type="number"
                        placeholder="250000"
                        value={manualData.price}
                        onChange={(e) => setManualData({ ...manualData, price: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size (sqm) *</Label>
                      <Input
                        id="size"
                        data-testid="size-input"
                        type="number"
                        placeholder="85"
                        value={manualData.size_sqm}
                        onChange={(e) => setManualData({ ...manualData, size_sqm: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthly_expenses">Monthly Expenses (€)</Label>
                      <Input
                        id="monthly_expenses"
                        data-testid="monthly-expenses-input"
                        type="number"
                        placeholder="500"
                        value={manualData.monthly_expenses}
                        onChange={(e) => setManualData({ ...manualData, monthly_expenses: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rooms">Rooms</Label>
                      <Input
                        id="rooms"
                        data-testid="rooms-input"
                        type="number"
                        placeholder="3"
                        value={manualData.rooms}
                        onChange={(e) => setManualData({ ...manualData, rooms: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        data-testid="bathrooms-input"
                        type="number"
                        placeholder="2"
                        value={manualData.bathrooms}
                        onChange={(e) => setManualData({ ...manualData, bathrooms: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Property Type</Label>
                      <select
                        id="type"
                        data-testid="property-type-select"
                        value={manualData.property_type}
                        onChange={(e) => setManualData({ ...manualData, property_type: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
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
                        className="w-4 h-4"
                      />
                      <Label htmlFor="renovation" className="cursor-pointer">Property needs renovation</Label>
                    </div>
                  </div>

                  <Button
                    data-testid="analyze-manual-button"
                    onClick={handleManualAnalysis}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-base font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Property'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzePage;