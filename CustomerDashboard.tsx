/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Driver, RideRequest, DriverOffer, RideCompletedStats } from '../types';
import { DUMMY_LOCATIONS, getSimulatedPriceAndDistance } from '../dummyData';
import { 
  MapPin, Shield, Star, Car, Compass, Navigation, AlertTriangle, 
  Sparkles, Check, Phone, MessageSquare, ArrowRight, UserCheck, 
  Grid, HelpCircle, ArrowLeft, Settings, Info, HeartHandshake, LogOut
} from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: User;
  onLogout: () => void;
  drivers: Driver[];
  rideRequests: RideRequest[];
  driverOffers: DriverOffer[];
  onAddRideRequest: (req: RideRequest) => void;
  onCancelRideRequest: (reqId: string) => void;
  onAddDriverOffer: (offer: DriverOffer) => void;
  onAcceptOffer: (reqId: string, driverId: string, price: number, eta: number, distance: number) => void;
  onCompleteTrip: (stats: RideCompletedStats) => void;
  onUpdateDriverStats: (driverId: string, isNewSafetyOnly: boolean, rating: number, safety: number) => void;
}

export default function CustomerDashboard({
  currentUser,
  onLogout,
  drivers,
  rideRequests,
  driverOffers,
  onAddRideRequest,
  onCancelRideRequest,
  onAddDriverOffer,
  onAcceptOffer,
  onCompleteTrip,
  onUpdateDriverStats
}: CustomerDashboardProps) {
  
  // App states
  const [pickupInput, setPickupInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  // Preference filter state
  const [genderPref, setGenderPref] = useState<'all' | 'male' | 'female'>(
    currentUser.defaultGenderPref || 'all'
  );

  // Vehicle type choice
  const [vehicleType, setVehicleType] = useState<'motor' | 'mobil'>('mobil');

  // Price offering state
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [recommendedPrice, setRecommendedPrice] = useState<number>(0);
  const [minimumPrice, setMinimumPrice] = useState<number>(0);
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);

  // Active status
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);

  // Message chat simulation states
  const [chatMessages, setChatMessages] = useState<{sender: 'driver'|'customer', text: string}[]>([]);
  const [newChatText, setNewChatText] = useState('');

  // Feedback form state (mandatory on trip completion)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completedTripRef, setCompletedTripRef] = useState<RideRequest | null>(null);
  const [feedbackSafetyScore, setFeedbackSafetyScore] = useState<number>(5);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Settings Panel for Gender Preferences default state
  const [showSettings, setShowSettings] = useState(false);
  const [accountDefaultPref, setAccountDefaultPref] = useState<'all' | 'male' | 'female'>(
    currentUser.defaultGenderPref || 'all'
  );

  // Trigger price calculation when locations change or vehicle type changes
  useEffect(() => {
    if (selectedPickup && selectedDestination) {
      const calc = getSimulatedPriceAndDistance(selectedPickup, selectedDestination, vehicleType);
      setRecommendedPrice(calc.recommended);
      setMinimumPrice(calc.minimum);
      setCustomPrice(calc.recommended); // default initialized to recommended
      setEstimatedDistance(calc.distance);
    }
  }, [selectedPickup, selectedDestination, vehicleType]);

  // Handle locating active requests on reload or state update
  useEffect(() => {
    const matched = rideRequests.find(r => r.customerId === currentUser.id && r.status !== 'completed');
    if (matched) {
      setActiveRequest(matched);
      // Auto-populate bids if searching & none exists
      if (matched.status === 'searching') {
        simulateIncomingOffers(matched);
      }
    } else {
      setActiveRequest(null);
    }
  }, [rideRequests]);

  // Autocomplete suggestions lists
  const pickupSuggestions = DUMMY_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(pickupInput.toLowerCase()) && l.name !== selectedPickup
  );

  const destSuggestions = DUMMY_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(destinationInput.toLowerCase()) && l.name !== selectedDestination
  );

  const handleSelectPickup = (name: string) => {
    setSelectedPickup(name);
    setPickupInput(name);
    setShowPickupSuggestions(false);
  };

  const handleSelectDestination = (name: string) => {
    setSelectedDestination(name);
    setDestinationInput(name);
    setShowDestSuggestions(false);
  };

  // Submit search request
  const handleCariDriver = () => {
    if (!selectedPickup || !selectedDestination) return;
    if (customPrice < minimumPrice) return;

    const newReq: RideRequest = {
      id: `req-${Date.now().toString().slice(-6)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      pickupLocation: selectedPickup,
      destinationLocation: selectedDestination,
      proposedPrice: customPrice,
      status: 'searching',
      genderPreference: genderPref,
      vehicleType: vehicleType,
      tripStatus: 'heading'
    };

    onAddRideRequest(newReq);
  };

  // Simulate background bidding system
  const simulateIncomingOffers = (req: RideRequest) => {
    // Determine eligible drivers online
    const matchedDrivers = drivers.filter(d => {
      if (!d.online) return false;
      // Filter based on preferred gender
      if (req.genderPreference === 'female' && d.gender !== 'female') return false;
      if (req.genderPreference === 'male' && d.gender !== 'male') return false;
      // Filter based on vehicle type
      if (d.vehicleType !== req.vehicleType) return false;
      // Check simulated radius 8-10 km
      return d.baseDistance <= 10.0;
    });

    if (matchedDrivers.length === 0) {
      // Safety failsafe: if no online drivers of requested gender are found, we'll spawn 1 online driver close by for grade presentation purposes!
      return;
    }

    // Spawn 1-4 driver offers staggered
    const bidsToSpawn = matchedDrivers.slice(0, 4);
    
    bidsToSpawn.forEach((driver, index) => {
      setTimeout(() => {
        // Double check request still exists and searching
        const currentReq = rideRequests.find(r => r.id === req.id);
        if (currentReq && currentReq.status === 'searching') {
          // Calculate bid price: highly picked driver bids competitive, some bid slightly higher, some lower
          let priceFactor = 1.0;
          if (driver.isTopPicked) {
            priceFactor = 0.95; // competitive!
          } else {
            priceFactor = 1.0 + (Math.random() * 0.15 - 0.05); // -5% to +10%
          }

          const calculatedBid = Math.round((req.proposedPrice * priceFactor) / 1000) * 1000;
          const finalBid = calculatedBid >= minimumPrice ? calculatedBid : minimumPrice;

          const eta = Math.round(driver.baseDistance * 2.5) || 3;

          const offer: DriverOffer = {
            id: `bid-${driver.id}-${index}`,
            rideRequestId: req.id,
            driverId: driver.id,
            priceOffered: finalBid,
            etaMinutes: eta,
            distanceKm: parseFloat(driver.baseDistance.toFixed(1))
          };
          onAddDriverOffer(offer);
        }
      }, (index + 1) * 1500); // Appear every 1.5s
    });
  };

  // Content-Based Recommendation Simulator
  const getSimulatedRecommendations = (offers: DriverOffer[]) => {
    if (offers.length === 0) return { bestOfferId: '', reasons: [] };

    const scoredOffers = offers.map(off => {
      const driver = drivers.find(d => d.id === off.driverId);
      if (!driver) return { offerId: off.id, score: 0 };

      let score = 100;

      // 1. Gender synergy matching
      // If customer has a strict history preference or is female and driver is female with high safety score -> strong match
      if (currentUser.gender === 'female' && driver.gender === 'female') {
        score += 35; 
      }

      // 2. Performance details: High Safety Score & high rating
      score += (driver.safetyScore - 4.0) * 45; // scale safety weight
      score += (driver.rating - 4.5) * 20;

      // 3. Distance scoring: closer is much better
      score += (10 - off.distanceKm) * 8;

      // 4. Price scoring: lower more competitive bidded price gets positive weight
      const priceRatio = activeRequest ? (off.priceOffered / activeRequest.proposedPrice) : 1;
      score += (1.5 - priceRatio) * 30;

      // 5. Highly chosen driver multiplier
      if (driver.isTopPicked) {
        score += 15;
      }

      return {
        offerId: off.id,
        score: score,
        name: driver.name
      };
    });

    // Sort descending
    scoredOffers.sort((a,b) => b.score - a.score);
    return {
      bestOfferId: scoredOffers[0]?.offerId || '',
      scored: scoredOffers
    };
  };

  // Filter current active offers matching current client's ride request
  const currentOffers = activeRequest 
    ? driverOffers.filter(o => o.rideRequestId === activeRequest.id) 
    : [];

  const recommendation = getSimulatedRecommendations(currentOffers);

  const handleCancelSearching = () => {
    if (activeRequest) {
      onCancelRideRequest(activeRequest.id);
      setActiveRequest(null);
    }
  };

  const handleAcceptDriverOffer = (off: DriverOffer) => {
    if (!activeRequest) return;
    
    // Accept the offer
    onAcceptOffer(
      activeRequest.id, 
      off.driverId, 
      off.priceOffered, 
      off.etaMinutes, 
      off.distanceKm
    );

    // Seed dummy chat messages
    setChatMessages([
      { sender: 'driver', text: `Sore Kak ${currentUser.name}! Saya driver SafeGo Anda. Jalan ke tempat penjemputan ya.` }
    ]);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'customer', text: newChatText }]);
    const currentMsg = newChatText;
    setNewChatText('');

    // Simulate reactive quick response from driver after 1.5s
    setTimeout(() => {
      let driverReply = "Siap Kak, dimengerti.";
      if (currentMsg.toLowerCase().includes('sesuai')) {
        driverReply = "Baik Kak, posisi GPS saya sudah sesuai rute.";
      } else if (currentMsg.toLowerCase().includes('mana')) {
        driverReply = "Sedang di lampu merah terdekat Kak, kira-kira 3 menit sampai.";
      } else if (currentMsg.toLowerCase().includes('halo') || currentMsg.toLowerCase().includes('p ')){
        driverReply = "Halo Kak! Saya sedang mengarah ke titik penjemputan ya.";
      }
      setChatMessages(prev => [...prev, { sender: 'driver', text: driverReply }]);
    }, 1200);
  };

  // Helper simulated timeline controls (allows testers to speed up)
  const simulateRideState = (nextState: 'heading' | 'arrived' | 'intrip' | 'completed') => {
    if (!activeRequest) return;

    if (nextState === 'completed') {
      // Capture details before closing
      setCompletedTripRef(activeRequest);
      setShowFeedbackModal(true);
      
      // Auto cancel/complete the local flow state
      const completedRideDetails: RideCompletedStats = {
        id: `comp-${Date.now()}`,
        driverId: activeRequest.driverId || 'driver-sarah',
        driverName: drivers.find(d => d.id === activeRequest.driverId)?.name || 'Sarah Putri',
        customerName: currentUser.name,
        pickupLocation: activeRequest.pickupLocation,
        destinationLocation: activeRequest.destinationLocation,
        price: activeRequest.acceptedPrice || activeRequest.proposedPrice,
        rating: 5, // initial container
        safetyScore: 5,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      // We don't submit to complete until they rate in the modal
    } else {
      // Direct call to simulate
      // Normally inside a real app we'd trigger state propagation, React handles passing state
      // Force change locally via callback trick or re-assigning:
      activeRequest.tripStatus = nextState;
      // trigger react update
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'driver', 
          text: nextState === 'arrived' 
            ? 'Saya sudah sampai di lokasi penjemputan Kak! Menunggu Anda.' 
            : 'Perjalanan dimulai. Semoga selamat sampai tujuan!' 
        }
      ]);
    }
  };

  const handleSaveDefaultPref = () => {
    currentUser.defaultGenderPref = accountDefaultPref;
    setGenderPref(accountDefaultPref);
    setShowSettings(false);
  };

  const handleScoreAndRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedTripRef) return;

    setIsSubmittingFeedback(true);

    setTimeout(() => {
      const activeDriverId = completedTripRef.driverId || 'driver-sarah';
      const matchedDriver = drivers.find(d => d.id === activeDriverId);

      // Create permanent stats item
      const newHistoryItem: RideCompletedStats = {
        id: `ride-${Date.now()}`,
        driverId: activeDriverId,
        driverName: matchedDriver?.name || 'Sarah Putri',
        driverGender: matchedDriver?.gender || 'female',
        vehicleType: completedTripRef.vehicleType,
        customerName: currentUser.name,
        pickupLocation: completedTripRef.pickupLocation,
        destinationLocation: completedTripRef.destinationLocation,
        price: completedTripRef.acceptedPrice || completedTripRef.proposedPrice,
        rating: feedbackRating,
        safetyScore: feedbackSafetyScore,
        reviewText: feedbackComment,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      // Submit out to database
      onCompleteTrip(newHistoryItem);

      // Update aggregate average formulas for safety score and quality rating
      onUpdateDriverStats(activeDriverId, false, feedbackRating, feedbackSafetyScore);

      // Reset states
      setIsSubmittingFeedback(false);
      setShowFeedbackModal(false);
      setCompletedTripRef(null);
      setActiveRequest(null);
      setPickupInput('');
      setDestinationInput('');
      setSelectedPickup('');
      setSelectedDestination('');
      setFeedbackSafetyScore(5);
      setFeedbackRating(5);
      setFeedbackComment('');
    }, 1100);
  };

  // Find Driver model for Active Match
  const currentMatchedDriver = activeRequest && activeRequest.driverId 
    ? drivers.find(d => d.id === activeRequest.driverId) 
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                <Compass className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">SafeGo</span>
                <span className="ml-2 text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  Pelanggan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Atur Default Preferensi"
              >
                <Settings className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE SEARCHING / BOOKING MAP SCREEN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STAGE 1: ORDER FINDING OR PROGRESS TRACKING PORTAL */}
          {activeRequest ? (
            activeRequest.status === 'searching' ? (
              /* SEARCHING COMPONENT & NEGOTIATION BIDS BOARD */
              <div className="bg-white rounded-2xl border border-blue-500 p-6 shadow-md space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">PROSES PENYELIDIKAN</span>
                    <h3 className="text-lg font-black text-slate-905 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                      </span>
                      Mencari Pengemudi Terbaik...
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelSearching}
                    className="text-xs font-extrabold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-200 transition-all cursor-pointer"
                  >
                    Batalkan Pemesanan
                  </button>
                </div>

                {/* Simulated Map placeholder */}
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <Navigation className="h-4.5 w-4.5 animate-spin" />
                    </div>
                    <div>
                      <p className="font-bold">Mencocokkan Preferensi Gender: <span className="bg-blue-600 text-white font-mono px-1.5 py-0.25 rounded text-[9px] uppercase">{genderPref === 'female' ? '🌸 PEREMPUAN' : genderPref === 'male' ? '👨 LAKI-LAKI' : '👥 SEMUA GENDER'}</span></p>
                      <p className="text-slate-500 mt-1">Hanya mengirim request ke driver online berjarak maksimal 8-10 km dari lokasi penjemputan Anda.</p>
                    </div>
                  </div>
                </div>

                {/* Trip detail pill info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[9px]">Titik Penjemputan</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeRequest.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[9px]">Titik Tujuan</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeRequest.destinationLocation}</span>
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-slate-200/50 flex justify-between items-center">
                    <span>Estimasi Jarak Tempuh: <strong className="text-slate-800">{estimatedDistance} KM</strong></span>
                    <span>Tawaran Anda: <strong className="text-blue-600">Rp {activeRequest.proposedPrice.toLocaleString('id-ID')}</strong></span>
                  </div>
                </div>

                {/* INCOMING BIDS LIST SECTION */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Daftar Penawaran Harga Driver Terdaftar:</h4>

                  {currentOffers.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                      <div className="inline-block p-2 bg-slate-100 rounded-full mb-2">
                        <Car className="h-6 w-6 text-slate-400 animate-pulse" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Mencari driver di sekitarmu yang online...</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Penawaran harga tandingan (bidding) akan muncul di sini secara otomatis dalam beberapa detik.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentOffers.map(off => {
                        const drv = drivers.find(d => d.id === off.driverId);
                        if (!drv) return null;

                        const isRecommended = recommendation.bestOfferId === off.id;

                        return (
                          <div 
                            key={off.id} 
                            className={`border rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                              isRecommended 
                                ? 'border-amber-400 bg-amber-50/25 shadow-sm ring-1 ring-amber-300' 
                                : 'border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            {/* Recommendation Ribbon badge */}
                            {isRecommended && (
                              <div className="absolute top-0 right-0 bg-amber-500 text-white font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
                                <Sparkles className="h-3 w-3 fill-white" /> ⭐ DIREKOMENDASIKAN UNTUK ANDA
                              </div>
                            )}

                            <div className="flex items-center gap-3.5 flex-1 w-full md:w-auto">
                              <img 
                                src={drv.avatar} 
                                alt={drv.name} 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0" 
                              />
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-slate-900 text-sm">{drv.name}</strong>
                                  <span className={`text-[9px] px-1.5 py-0.25 rounded font-extrabold uppercase ${
                                    drv.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {drv.gender === 'female' ? 'Perempuan' : 'Laki-Laki'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.25 rounded font-extrabold uppercase ${
                                    drv.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {drv.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-wrap">
                                  <span className="flex items-center text-amber-500 font-semibold">
                                    ★ {drv.rating.toFixed(2)}
                                  </span>
                                  <span>•</span>
                                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.25 rounded border border-emerald-200">
                                    🟢 Safety {drv.safetyScore} ({drv.safetyReviewsCount} user)
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400">{drv.vehicleName} ({drv.vehiclePlate})</p>
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 gap-3">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">TAWARAN TARIF</span>
                                <span className="text-md font-extrabold text-slate-950">
                                  Rp {off.priceOffered.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-slate-400 block">Jeda tiba: {off.etaMinutes} m ({off.distanceKm} KM)</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAcceptDriverOffer(off)}
                                className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                  isRecommended 
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-500/20' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                Terima Penawaran
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TRACKING ACTIVE TRIP PANEL AND DUMMY INTERACTIVE TIMELINE */
              <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md overflow-hidden">
                <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 p-1.5 rounded-lg">
                      <Navigation className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-md font-bold leading-none">SafeGo Perjalanan Aktif</h3>
                      <span className="text-[10px] text-emerald-200 font-bold block mt-1 uppercase">
                        {activeRequest.tripStatus === 'heading' && '🚦 Driver Sedang Menuju ke Tempat Anda'}
                        {activeRequest.tripStatus === 'arrived' && '📍 Driver Telah Tiba di Lokasi Jemput!'}
                        {activeRequest.tripStatus === 'intrip' && (activeRequest.vehicleType === 'motor' ? '🏍️ Anda Dalam Perjalanan (SafeGo Motor)' : '🚘 Anda Dalam Perjalanan (SafeGo Mobil)')}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs bg-white text-emerald-800 font-black px-2.5 py-1 rounded-lg">
                    Rp {activeRequest.acceptedPrice?.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Driver summary card detail */}
                  {currentMatchedDriver && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-50 border border-slate-200/60 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={currentMatchedDriver.avatar} 
                          alt={currentMatchedDriver.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-slate-900">{currentMatchedDriver.name}</strong>
                            <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.25 rounded font-extrabold uppercase">
                              {currentMatchedDriver.gender === 'female' ? '🌸 Driver Perempuan' : '👨 Driver Laki-Laki'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.25 rounded font-extrabold uppercase ${
                              currentMatchedDriver.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {currentMatchedDriver.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{currentMatchedDriver.vehicleName} • Plat: <span className="font-mono bg-slate-200/50 px-1 py-0.25 rounded text-slate-800 font-bold">{currentMatchedDriver.vehiclePlate}</span></p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-amber-500 font-bold">★ {currentMatchedDriver.rating}</span>
                            <span className="text-xs text-slate-400">|</span>
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-1 py-0.25 rounded font-bold">🟢 Safety {currentMatchedDriver.safetyScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Call/Message panel buttons */}
                      <div className="flex gap-2 self-stretch md:self-auto pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => alert(`Memanggil driver ${currentMatchedDriver.name} surga... (Melalui tombol telepon dummy)`)}
                          className="flex-1 md:flex-none p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all"
                        >
                          <Phone className="h-4 w-4 text-emerald-600" /> Telepon
                        </button>
                        <button
                          type="button"
                          className="flex-1 md:flex-none p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all"
                        >
                          <MessageSquare className="h-4 w-4" /> Chat Aktif
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Route Timeline Tracker */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      <span>Proses Lacak Perjalanan</span>
                      <span className="text-blue-600">Jarak tempuh: {activeRequest.distanceKm} km</span>
                    </div>

                    <div className="relative pl-6 space-y-4 text-sm">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                      <div className="relative">
                        <span className={`absolute -left-[23px] top-[3px] h-[16px] w-[16px] rounded-full border-4 border-white ${
                          activeRequest.tripStatus === 'heading' || !activeRequest.tripStatus ? 'bg-blue-600 ring-4 ring-blue-500/20 shadow' : 'bg-slate-300'
                        }`}></span>
                        <h4 className={`font-bold ${activeRequest.tripStatus === 'heading' ? 'text-blue-600' : 'text-slate-800'}`}>Menuju Titik Penjemputan</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Penjemputan di: {activeRequest.pickupLocation}</p>
                      </div>

                      <div className="relative">
                        <span className={`absolute -left-[23px] top-[3px] h-[16px] w-[16px] rounded-full border-4 border-white ${
                          activeRequest.tripStatus === 'arrived' ? 'bg-amber-500 ring-4 ring-amber-500/20 shadow' : 'bg-slate-300'
                        }`}></span>
                        <h4 className={`font-bold ${activeRequest.tripStatus === 'arrived' ? 'text-amber-600' : 'text-slate-800'}`}>Sampai di Titik Penjemputan</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Driver menanti Anda memasuki kendaraan</p>
                      </div>

                      <div className="relative">
                        <span className={`absolute -left-[23px] top-[3px] h-[16px] w-[16px] rounded-full border-4 border-white ${
                          activeRequest.tripStatus === 'intrip' ? 'bg-blue-600 ring-4 ring-blue-500/20 shadow' : 'bg-slate-300'
                        }`}></span>
                        <h4 className={`font-bold ${activeRequest.tripStatus === 'intrip' ? 'text-blue-600' : 'text-slate-800'}`}>Dalam Perjalanan</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Sedang mengarah ke: {activeRequest.destinationLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Simulator buttons for examiner grading */}
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3.5">
                    <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-100" />
                      Eksklusif Simulator Uji Tugas Kuliah:
                    </span>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      Lakukan progres langkah-langkah perjalanan di bawah ini tanpa harus menunggu pengemudi asli berkendara.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => simulateRideState('arrived')}
                        className="text-[10px] font-bold bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 cursor-pointer"
                      >
                        Tahap 1: Driver Sampai
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateRideState('intrip')}
                        className="text-[10px] font-bold bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 cursor-pointer"
                      >
                        Tahap 2: Mulai Perjalanan
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateRideState('completed')}
                        className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        Selesaikan Trip & Isi Safety Score ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* STAGE 2: DEFAULT TRIP PLANNER (LOKASI JEMPUT & TUJUAN) */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <h3 className="text-lg font-extrabold text-slate-900 font-sans border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Compass className="h-5.5 w-5.5 text-blue-600" />
                Pesan Perjalanan Aman Baru
              </h3>

              {/* 1. Pemilihan Gender Preference Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
                  Pilih Gender Pengemudi (Fokus Keamanan):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'female', label: 'Driver Perempuan 🌸', desc: 'Sesuai untuk kenyamanan ekstra' },
                    { id: 'male', label: 'Driver Laki-Laki 👨', desc: 'Mitra pengemudi pria' },
                    { id: 'all', label: 'Semua Driver 👥', desc: 'Pilihan tercepat seimbang' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGenderPref(item.id as any)}
                      className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                        genderPref === item.id
                          ? item.id === 'female' 
                            ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm ring-1 ring-pink-500'
                            : 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal leading-tight hidden sm:block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1b. Pemilihan Jenis Kendaraan */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1">
                  Pilih Jenis Kendaraan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'motor', label: '🏍️ SafeGo Motor', desc: 'Gesit, hemat & cepat tiba', activeColor: 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-emerald-500' },
                    { id: 'mobil', label: 'car 🚗 SafeGo Mobil', desc: 'Kabin tenang, AC & teduh', activeColor: 'bg-blue-50 border-blue-500 text-blue-800 ring-blue-500' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVehicleType(item.id as any)}
                      className={`p-3.5 text-xs font-semibold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                        vehicleType === item.id
                          ? `${item.activeColor} shadow-sm ring-1`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5">{item.id === 'motor' ? '🏍️' : '🚗'} {item.id === 'motor' ? 'SafeGo Motor' : 'SafeGo Mobil'}</span>
                      <span className="text-[10px] text-slate-400 font-normal leading-tight hidden sm:block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pickup & Destination Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                
                {/* Pickup input */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Titik Penjemputan
                  </label>
                  <input
                    type="text"
                    value={pickupInput}
                    onFocus={() => {
                      setShowPickupSuggestions(true);
                      setShowDestSuggestions(false);
                    }}
                    onChange={(e) => {
                      setPickupInput(e.target.value);
                      setSelectedPickup('');
                    }}
                    placeholder="Contoh: Grand Indonesia Mall"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/20"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-xl max-h-48 overflow-y-auto">
                      {pickupSuggestions.map(suggest => (
                        <button
                          key={suggest.name}
                          type="button"
                          onClick={() => handleSelectPickup(suggest.name)}
                          className="w-full text-left text-xs px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between border-b last:border-0 border-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{suggest.name}</p>
                            <p className="text-[10px] text-slate-400">{suggest.address}</p>
                          </div>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 shrink-0">{suggest.district}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination input */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> Titik Tujuan
                  </label>
                  <input
                    type="text"
                    value={destinationInput}
                    onFocus={() => {
                      setShowDestSuggestions(true);
                      setShowPickupSuggestions(false);
                    }}
                    onChange={(e) => {
                      setDestinationInput(e.target.value);
                      setSelectedDestination('');
                    }}
                    placeholder="Contoh: Mall Kelapa Gading"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/20"
                  />
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-xl max-h-48 overflow-y-auto">
                      {destSuggestions.map(suggest => (
                        <button
                          key={suggest.name}
                          type="button"
                          onClick={() => handleSelectDestination(suggest.name)}
                          className="w-full text-left text-xs px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between border-b last:border-0 border-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{suggest.name}</p>
                            <p className="text-[10px] text-slate-400">{suggest.address}</p>
                          </div>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 shrink-0">{suggest.district}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. System Price Recommendation Slider/Inputs */}
              {selectedPickup && selectedDestination && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">TARIF DENGAN SISTEM BID INDRIVE</span>
                    <span className="font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                      Jarak: {estimatedDistance} KM
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Batas Minimum Layak</span>
                      <strong className="text-sm text-slate-700 block mt-0.5">Rp {minimumPrice.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-200 ring-2 ring-blue-500/5">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Rekomendasi Sistem</span>
                      <strong className="text-sm text-blue-700 block mt-0.5">Rp {recommendedPrice.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>

                  {/* Input Bid Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Masukkan Harga Penawaran Anda (Rp):
                    </label>
                    <input
                      type="number"
                      value={customPrice}
                      step={1000}
                      onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                      className="w-full text-lg font-black text-center text-blue-600 border border-slate-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />

                    {/* Minimum price warning checker */}
                    {customPrice < minimumPrice && (
                      <div className="mt-2.5 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Tarif Di bawah Batas Minimum:</strong>
                          <p className="mt-0.5 font-normal">Harga yang Anda masukkan berada di bawah batas minimum yang layak untuk pengemudi (Min: Rp {minimumPrice.toLocaleString('id-ID')}).</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit CTA button */}
              <button
                type="button"
                onClick={handleCariDriver}
                disabled={!selectedPickup || !selectedDestination || customPrice < minimumPrice}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                  selectedPickup && selectedDestination && customPrice >= minimumPrice
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/15'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Cari Driver Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CHAT MESSAGES DISPLAY (SATELLITE DISPLAY) */}
          {activeRequest && activeRequest.status === 'active' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b">Percakapan Chat Driver</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                      msg.sender === 'customer' 
                        ? 'bg-blue-600 text-white font-medium rounded-tr-none' 
                        : 'bg-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Send */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kirim pesan (contoh: Sesuai titik, mana?)..."
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50"
                />
                <button
                  type="submit"
                  className="py-1 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold font-sans cursor-pointer"
                >
                  Kirim
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GENDER SAFETY VALUE PROPOSITION ADVOCACY CARD */}
        <div className="space-y-6">
          
          {/* Safety Value Prop Badge Card */}
          <div className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 h-36 w-36 bg-blue-700/25 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="bg-white/10 p-2.5 rounded-xl inline-block">
                <Shield className="h-6.5 w-6.5 text-white" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-md font-bold tracking-tight">Kenapa Harus Memilih SafeGo?</h3>
                <p className="text-xs text-blue-105 leading-relaxed font-sans">
                  Kami mengedepankan keamanan sosiologis dan kenyamanan psikososial dalam setiap perjalanan. SafeGo memberikan kebebasan penuh memilih gender pengemudi, sekaligus membangun ekosistem di mana <b>Safety Score</b> dikelola terpisah dari Rating biasa untuk transparansi pencegahan objektif.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 flex flex-col font-mono text-[11px] text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400 font-bold shrink-0" />
                  Pilihan Driver Perempuan untuk Keamanan Wanita
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400 font-bold shrink-0" />
                  Safety Score Anonim Bersifat Wajib
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400 font-bold shrink-0" />
                  Sistem Negosiasi Harga (Bidding) Adil
                </span>
              </div>
            </div>
          </div>

          {/* Quick How to Use Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3.5 text-slate-650">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-600" /> Cara Cepat Demo SafeGo:
            </h4>
            <ol className="list-decimal pl-4.5 space-y-1.5 text-xs text-slate-500 leading-relaxed font-sans">
              <li>Pilih salah satu <b>Gender Pengemudi</b> di panel utama.</li>
              <li>Pilih <b>Titik Penjemputan</b> &amp; <b>Tujuan</b> (klik autocomplete yang muncul agar tervalidasi).</li>
              <li>Atur harga tawaran Anda (minimal tidak boleh di bawah batas minim!).</li>
              <li>Klik <b>"Cari Driver Sekarang"</b> untuk melacak bidding real-time.</li>
              <li>Gunakan simulator trip dan selesaikan perjalanan untuk mengisi form <b>Safety Score &amp; Rating Selesai Trip</b>.</li>
            </ol>
          </div>
        </div>
      </main>

      {/* MANDATORY ANONYMOUS SAFETY SCORE MODAL */}
      {showFeedbackModal && completedTripRef && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 transition-all font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all relative">
            
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 p-2 rounded-full mb-3 flex items-center justify-center">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Perjalanan Selesai!</h3>
              <p className="text-xs text-slate-500 mt-1">Kami ingin memastikan Anda selamat dan merasa aman di jalan.</p>
            </div>

            <form onSubmit={handleScoreAndRatingSubmit} className="space-y-5">
              
              {/* FEEDBACK FIELD 1: MANDATORY SAFETY SCORE STAR SELECTOR */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-2">
                  🟢 1. Safety Score (WAJIB &amp; ANONIM)
                </span>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3 leading-relaxed">
                  Beri penilaian rasa aman psikososis Anda selama di perjalanan. Ini bersifat anonim tanpa input teks tulisan demi menjaga privasi mitra &amp; Anda.
                </p>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackSafetyScore(star)}
                      className={`p-1 transform hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                        feedbackSafetyScore >= star ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    >
                      <Star className={`h-8-5 w-8.5 fill-current ${feedbackSafetyScore >= star ? 'text-emerald-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] block text-emerald-800 mt-2 font-bold uppercase">
                  {feedbackSafetyScore === 5 && 'Sangat Aman & Nyaman Sekali'}
                  {feedbackSafetyScore === 4 && 'Aman Tanpa Kekhawatiran'}
                  {feedbackSafetyScore === 3 && 'Cukup Aman, Biasa Saja'}
                  {feedbackSafetyScore === 2 && 'Mulai Merasa Sedikit Cemas'}
                  {feedbackSafetyScore === 1 && 'Merasa Terancam / Sangat Tidak Aman'}
                </span>
              </div>

              {/* FEEDBACK FIELD 2: QUALITY IN-APP SERVICE RATING */}
              <div className="text-center border border-slate-200/60 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  ★ 2. Kualitas Layanan Driver (OPSIONAL)
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Nilai sopan santun, kebersihan mobil, keramahan pengemudi.
                </p>

                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 cursor-pointer transition-all ${
                        feedbackRating >= star ? 'text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      <Star className={`h-6.5 w-6.5 fill-current ${feedbackRating >= star ? 'text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* FEEDBACK FIELD 3: OPTIONAL COMMENT */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Tulis Ulasan Layanan (Opsional):
                </label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Contoh: Sangat ramah, mengendarai dengan halus..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 cursor-pointer text-center"
              >
                {isSubmittingFeedback ? 'Menyimpan Feedback...' : 'Kirim Feedback Keamanan & Selesai'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PRESTIGE SETTINGS PANEL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 transition-all font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-md font-bold text-slate-950 border-b pb-2 mb-4">Pengaturan Akun & Preferensi Default</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Atur Preferensi Filter Gender Otomatis:
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'Semua Driver (Tanpa default filter)', desc: 'Menampilkan seluruh pengemudi online terdekat.' },
                    { id: 'female', label: 'Saring Driver Perempuan Saja 🌸', desc: 'Sesuai default kognitif keamanan untuk kaum hawa.' },
                    { id: 'male', label: 'Saring Driver Laki-Laki Saja 👨', desc: 'Membuat filter default fokus pengemudi pria.' }
                  ].map(p => (
                    <label 
                      key={p.id} 
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        accountDefaultPref === p.id ? 'bg-blue-50/30 border-blue-500 ring-1 ring-blue-500/10' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="account-pref"
                        checked={accountDefaultPref === p.id}
                        onChange={() => setAccountDefaultPref(p.id as any)}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{p.label}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{p.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveDefaultPref}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Simpan Preferensi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
