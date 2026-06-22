/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Driver, RideRequest, DriverOffer, RideCompletedStats } from '../types';
import { 
  Car, Star, ShieldCheck, DollarSign, Power, MapPin, 
  User as UserIcon, Send, Clock, Play, ThumbsUp, AlertCircle
} from 'lucide-react';

interface DriverDashboardProps {
  currentUser: User;
  onLogout: () => void;
  drivers: Driver[];
  rideRequests: RideRequest[];
  driverOffers: DriverOffer[];
  rideHistory: RideCompletedStats[];
  onToggleOnline: (driverId: string) => void;
  onSendOffer: (offer: Omit<DriverOffer, 'id'>) => void;
  onSimulateRideStep: (rideRequestId: string, nextStatus: 'heading' | 'arrived' | 'intrip' | 'completed') => void;
}

export default function DriverDashboard({
  currentUser,
  onLogout,
  drivers,
  rideRequests,
  driverOffers,
  rideHistory,
  onToggleOnline,
  onSendOffer,
  onSimulateRideStep
}: DriverDashboardProps) {
  
  // Find matching driver entity in our global drivers array based on logged-in email
  const driverEntity = drivers.find(d => d.email === currentUser.email) || {
    id: 'driver-default',
    name: currentUser.name,
    email: currentUser.email,
    gender: currentUser.gender as 'male' | 'female',
    rating: 4.88,
    reviewsCount: 150,
    safetyScore: 4.85,
    safetyReviewsCount: 300,
    vehicleName: 'Daihatsu Xenia Silver',
    vehiclePlate: 'B 3321 PXG',
    avatar: currentUser.avatar,
    online: true,
    lat: -6.2201,
    lng: 106.8152,
    isTopPicked: true,
    baseDistance: 1.5,
    vehicleType: 'mobil' as 'motor' | 'mobil'
  };

  const isOnline = driverEntity.online;

  // State for bidding modal or input form
  const [biddingRequest, setBiddingRequest] = useState<RideRequest | null>(null);
  const [customBidPrice, setCustomBidPrice] = useState<number>(20000);
  const [customEta, setCustomEta] = useState<number>(5);
  const [customDistance, setCustomDistance] = useState<number>(1.5);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate Driver metrics
  const driverCompletedRides = rideHistory.filter(h => h.driverId === driverEntity.id);
  const totalEarnings = driverCompletedRides.reduce((acc, curr) => acc + curr.price, 0);

  // Filter incoming ride requests suitable for this driver
  // Requirements: Driver is ONLINE, request is in 'searching' or 'negotiating' status, and matches gender preference + vehicleType!
  const eligibleRequests = rideRequests.filter(req => {
    if (!isOnline) return false;
    if (req.status !== 'searching' && req.status !== 'negotiating') return false;
    
    // Vehicle compatibility filter:
    if (req.vehicleType !== driverEntity.vehicleType) return false;

    // Gender compatibility filter:
    // If request gender preference is 'female', only female drivers see it
    // If 'male', only male drivers see it
    if (req.genderPreference === 'female' && driverEntity.gender !== 'female') return false;
    if (req.genderPreference === 'male' && driverEntity.gender !== 'male') return false;
    
    // Check if driver has already created an offer for this request
    const alreadyOffered = driverOffers.some(off => off.rideRequestId === req.id && off.driverId === driverEntity.id);
    return !alreadyOffered;
  });

  // Track currently active ride where this driver has been matched
  const activeRide = rideRequests.find(
    req => req.driverId === driverEntity.id && 
    (req.status === 'active' || req.status === 'completed') // wait completed is handled on the spot
  );

  const handleOpenBidModal = (req: RideRequest) => {
    setBiddingRequest(req);
    setCustomBidPrice(req.proposedPrice); // default to customer proposed price
    // set safe simulated distance & eta
    setCustomDistance(parseFloat((Math.random() * 4 + 0.8).toFixed(1)));
    setCustomEta(Math.round(customDistance * 3) || 4);
    setSuccessMessage('');
  };

  const handleSendCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingRequest) return;

    onSendOffer({
      rideRequestId: biddingRequest.id,
      driverId: driverEntity.id,
      priceOffered: customBidPrice,
      etaMinutes: customEta || 5,
      distanceKm: customDistance || 1.8
    });

    setSuccessMessage('Penawaran Anda berhasil dikirim ke pelanggan! Mohon tunggu konfirmasi.');
    setTimeout(() => {
      setBiddingRequest(null);
      setSuccessMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Driver Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl text-white">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">SafeGo</span>
                <span className="ml-2 text-xs bg-emerald-500 text-white px-2.5 py-0.5 rounded-full uppercase font-bold antialiased">
                  Driver Hub
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onToggleOnline(driverEntity.id)}
                className={`flex items-center px-4 py-1.5 rounded-xl text-xs font-bold gap-2 transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {isOnline ? 'ONLINE: SIAP TERIMA' : 'OFFLINE'}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold bg-white/10 text-white px-3.5 py-1.5 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Driver Summary Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={driverEntity.avatar}
              alt={driverEntity.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full border-2 border-blue-600 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900">{driverEntity.name}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  driverEntity.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {driverEntity.gender === 'female' ? 'Driver Perempuan' : 'Driver Laki-Laki'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  driverEntity.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-805 ring-1 ring-emerald-300' : 'bg-blue-100 text-blue-805 ring-1 ring-blue-300'
                }`}>
                  {driverEntity.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Armada: <span className="font-semibold text-slate-700">{driverEntity.vehicleName}</span> • Plat: <span className="font-mono bg-slate-100 px-1.5 py-0.25 rounded text-slate-800 font-bold">{driverEntity.vehiclePlate}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 self-stretch md:self-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating</span>
              <div className="flex items-center gap-1 justify-center mt-0.5">
                <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-extrabold text-slate-905">{driverEntity.rating.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">({driverEntity.reviewsCount} ulasan)</span>
            </div>

            <div className="border-l border-slate-200"></div>

            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Score</span>
              <div className="flex items-center gap-1 justify-center mt-0.5 text-emerald-600">
                <ShieldCheck className="h-4.5 w-4.5" />
                <span className="text-sm font-extrabold">{driverEntity.safetyScore.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">({driverEntity.safetyReviewsCount} anonim)</span>
            </div>

            <div className="border-l border-slate-200"></div>

            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Harian</span>
              <div className="flex items-center gap-0.5 justify-center mt-0.5 text-blue-600 font-extrabold">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">{(totalEarnings || 0).toLocaleString('id-ID')}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">({driverCompletedRides.length} trip)</span>
            </div>
          </div>
        </div>

        {/* Core Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active / Connected Trip Screen */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeRide ? (
              <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
                  Order Aktif Berjalan
                </div>

                <h3 className="text-md font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-600 animate-pulse fill-blue-600" />
                  Navigasi Penjemputan & Perjalanan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TITIK JEMPUT (PICKUP)</span>
                    <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {activeRide.pickupLocation}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TITIK TUJUAN (DESTINATION)</span>
                    <p className="text-sm font-extrabold text-blue-600 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {activeRide.destinationLocation}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" 
                      alt="Customer" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">CUSTOMER</p>
                      <p className="text-sm font-black text-slate-800">{activeRide.customerName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">HARGA SEPAKAT</p>
                    <p className="text-md font-black text-emerald-600">
                      Rp {(activeRide.acceptedPrice || activeRide.proposedPrice || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Simulated Timeline Stages for Driver to Push */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Simulasikan Status Perjalanan:</p>
                  
                  {(!activeRide.tripStatus || activeRide.tripStatus === 'heading') && (
                    <button
                      type="button"
                      onClick={() => onSimulateRideStep(activeRide.id, 'arrived')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      <Clock className="h-4 w-4" />
                      Kabari: "Saya Sudah Sampai di Titik Jemput"
                    </button>
                  )}

                  {activeRide.tripStatus === 'arrived' && (
                    <button
                      type="button"
                      onClick={() => onSimulateRideStep(activeRide.id, 'intrip')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      <Car className="h-4 w-4" />
                      Mulai Perjalanan ("Customer Sudah Naik")
                    </button>
                  )}

                  {activeRide.tripStatus === 'intrip' && (
                    <button
                      type="button"
                      onClick={() => onSimulateRideStep(activeRide.id, 'completed')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Selesaikan Trip ("Tiba di Lokasi Tujuan")
                    </button>
                  )}

                  {activeRide.tripStatus === 'completed' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                      🏁 Perjalanan telah selesai dilakukan! Customer sedang mengisi <b>Safety Score & Rating</b>. Dashboard Anda akan terupdate otomatis.
                    </div>
                  )}

                  {/* Micro Stage Status Text */}
                  <div className="mt-4 flex items-center justify-between text-xs px-2">
                    <span className={`font-bold ${activeRide.tripStatus === 'heading' || !activeRide.tripStatus ? 'text-blue-600' : 'text-slate-400'}`}>
                      1. Menuju Penjemputan
                    </span>
                    <span className="text-slate-300">➔</span>
                    <span className={`font-bold ${activeRide.tripStatus === 'arrived' ? 'text-amber-600' : 'text-slate-400'}`}>
                      2. Sampai di Lokasi
                    </span>
                    <span className="text-slate-300">➔</span>
                    <span className={`font-bold ${activeRide.tripStatus === 'intrip' ? 'text-blue-600' : 'text-slate-400'}`}>
                      3. Dalam Perjalanan
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-extrabold text-slate-905">
                    Order Masuk Sekitar Anda 📡
                  </h3>
                  {isOnline && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
                      Live GPS Aktif
                    </span>
                  )}
                </div>

                {!isOnline ? (
                  <div className="p-10 border border-dashed border-slate-200 text-center rounded-xl bg-slate-50">
                    <Power className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">Dashboard Anda Berstatus Offline</p>
                    <p className="text-xs text-slate-500 mt-1">Aktifkan status "ONLINE" di bagian header untuk mulai melihat dan menegosiasikan order penjemputan dari pelanggan.</p>
                  </div>
                ) : eligibleRequests.length === 0 ? (
                  <div className="p-10 border border-dashed border-slate-200 text-center rounded-xl bg-slate-50/50">
                    <div className="relative inline-block mb-2">
                      <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <Car className="h-8 w-8 text-blue-400 mx-auto" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Menunggu Order Baru...</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Pesanan otomatis disaring berdasarkan filter gender pelanggan dan lokasi dalam radius 8-10 KM.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {eligibleRequests.map(req => (
                      <div key={req.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-xs transition-all bg-slate-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] bg-blue-150 text-blue-800 px-2.5 py-0.5 rounded font-extrabold uppercase font-sans">
                              {req.genderPreference === 'female' ? '🌸 Customer Perempuan Only' : req.genderPreference === 'male' ? '👨 Customer Laki-Laki Only' : '👥 Bebas Gender'}
                            </span>
                            <span className={`text-[10px] ml-1.5 px-2 py-0.5 rounded font-extrabold uppercase ${
                              req.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {req.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">ID: {req.id}</span>
                          </div>
                          <span className="text-sm font-black text-emerald-600">
                            Tawaran: Rp {req.proposedPrice.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3.5 pt-1.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Jemput: <strong className="text-slate-800">{req.pickupLocation}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                            <span>Tujuan: <strong className="text-slate-800">{req.destinationLocation}</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenBidModal(req)}
                            className="flex-1 py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer text-center"
                          >
                            Kirim Penawaran Harga Baru
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side Panel: Earnings history / Profile Stats */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3.5 uppercase tracking-wider">
                Riwayat Trip Anda Hari Ini
              </h3>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {driverCompletedRides.map(h => (
                  <div key={h.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{h.customerName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{h.timestamp}</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        +Rp {h.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-1">
                      {h.pickupLocation} ➔ {h.destinationLocation}
                    </div>
                    
                    <div className="flex gap-2 items-center mt-1.5">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: h.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.25 rounded">
                        🟢 Safety: {h.safetyScore}
                      </span>
                    </div>
                  </div>
                ))}

                {driverCompletedRides.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs text-slate-400">
                    Belum ada perjalanan sukses terselesaikan hari ini.
                  </div>
                )}
              </div>
            </div>

            {/* InDrive System Rules Box */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-900 space-y-2">
              <span className="font-black flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-indigo-600" />
                Cara Kerja Sistem Bid InDrive:
              </span>
              <p className="leading-relaxed">
                Di <b>SafeGo</b>, pelanggan menetapkan harga awal yang wajar. Sebagai pengemudi, Anda diperkenankan melakukan tawar-menawar (bidding) dengan mengajukan tarif tandingan yang sesuai dengan jarak tempuh & estimasi kedatangan Anda. Pelanggan akan mendapatkan notifikasi instan dan berhak memilih tawaran terbaik!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* BID MODAL (COUNTER-OFFER) */}
      {biddingRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 transition-all">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-md font-bold text-slate-900">Kirim Penawaran (Bidding)</h3>
              <button 
                onClick={() => setBiddingRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                Tutup
              </button>
            </div>

            {successMessage ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-xl text-center font-bold">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSendCounterOffer} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <p className="text-slate-400 font-bold uppercase">Ringkasan Order Customer:</p>
                  <p className="font-extrabold text-slate-800">{biddingRequest.customerName}</p>
                  <p className="text-slate-600">Rute: {biddingRequest.pickupLocation} ➔ {biddingRequest.destinationLocation}</p>
                  <p className="text-slate-600">Customer menawarkan: <strong className="text-blue-600">Rp {biddingRequest.proposedPrice.toLocaleString('id-ID')}</strong></p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Tarif Ajuan Anda (Rp)
                  </label>
                  <input
                    type="number"
                    value={customBidPrice}
                    step={1000}
                    onChange={(e) => setCustomBidPrice(parseInt(e.target.value) || 0)}
                    className="w-full text-lg font-black text-emerald-600 border border-slate-200 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-blue-500/20 bg-slate-50/20"
                    placeholder="Contoh: 23000"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Anda bisa menyesuaikan harga, menaikkan untuk tawar-menawar atau menyepakati tawaran awal customer.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Estimasi Tiba (Menit)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={customEta}
                      onChange={(e) => setCustomEta(parseInt(e.target.value) || 5)}
                      className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-3 py-1.5 text-center bg-slate-50/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Jarak Menuju Penjemputan (KM)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      value={customDistance}
                      onChange={(e) => setCustomDistance(parseFloat(e.target.value) || 1.2)}
                      className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-3 py-1.5 text-center bg-slate-50/20"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer text-center"
                >
                  <Send className="h-4.5 w-4.5 inline mr-1.5" />
                  Kirim Ajuan Resmi
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
