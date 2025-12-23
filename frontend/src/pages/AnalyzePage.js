import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, FileInput, ArrowLeft, Loader2 } from 'lucide-react';
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
  
  // URL input
  const [url, setUrl] = useState('');
  
  // Manual input
  const [manualData, setManualData] = useState({
    title: '',
    location: '',
    price: '',
    property_type: 'Apartment',
    size_sqm: '',
    rooms: '',
    bathrooms: ''
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
      // Navigate to results with the analysis data
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
      toast.error('Please fill in all required fields (title, location, price)');
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
        bathrooms: manualData.bathrooms ? parseInt(manualData.bathrooms) : null
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
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#1A3C34]/5">
        <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <Button
              data-testid="back-button"
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#1A3C34] hover:bg-[#1A3C34]/5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
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
            <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-[#1A3C34]">
              Analyze a Property
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Enter a property URL from immobiliare.it or manually input property details
            </p>
          </div>

          <Card className="border-[#1A3C34]/5 shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Property Information</CardTitle>
              <CardDescription>Choose your input method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="url" data-testid="url-tab">
                    <Link2 className="w-4 h-4 mr-2" />
                    URL Import
                  </TabsTrigger>
                  <TabsTrigger value="manual" data-testid="manual-tab">
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
                      className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-6 text-lg shadow-inner"
                    />
                    <p className="text-sm text-slate-500">
                      Paste a link from immobiliare.it and we'll extract all the details automatically
                    </p>
                  </div>

                  <Button
                    data-testid="analyze-url-button"
                    onClick={handleUrlAnalysis}
                    disabled={loading}
                    className="w-full bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-8 py-6 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-xl"
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
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        data-testid="location-input"
                        placeholder="e.g., Milan, Lombardy"
                        value={manualData.location}
                        onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
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
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size (sqm)</Label>
                      <Input
                        id="size"
                        data-testid="size-input"
                        type="number"
                        placeholder="85"
                        value={manualData.size_sqm}
                        onChange={(e) => setManualData({ ...manualData, size_sqm: e.target.value })}
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
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
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
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
                        className="bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Property Type</Label>
                      <select
                        id="type"
                        data-testid="property-type-select"
                        value={manualData.property_type}
                        onChange={(e) => setManualData({ ...manualData, property_type: e.target.value })}
                        className="w-full bg-white border-0 ring-1 ring-[#1A3C34]/10 focus:ring-2 focus:ring-[#1A3C34] rounded-xl px-4 py-3"
                      >
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Villa</option>
                        <option>Studio</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    data-testid="analyze-manual-button"
                    onClick={handleManualAnalysis}
                    disabled={loading}
                    className="w-full bg-[#1A3C34] text-white hover:bg-[#142E28] rounded-full px-8 py-6 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-xl"
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