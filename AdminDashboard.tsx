/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Driver, RideCompletedStats } from '../types';
import { 
  Users, ShieldCheck, Cpu, Star, HeartPulse, Activity, 
  MapPin, RefreshCw, Filter, Search, UserCheck, Check, Power
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
  drivers: Driver[];
  customers: User[];
  rideHistory: RideCompletedStats[];
  onToggleDriverOnline: (driverId: string) => void;
}

export default function AdminDashboard({
  currentUser,
  onLogout,
  drivers,
  customers,
  rideHistory,
  onToggleDriverOnline
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'drivers' | 'history'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Compute live statistics based on state passed down
  const totalUsers = customers.length;
  const totalDrivers = drivers.length;
  const onlineDriversCount = drivers.filter(d => d.online).length;
  const totalRides = rideHistory.length;

  const avgDriverRating = parseFloat(
    (drivers.reduce((acc, curr) => acc + curr.rating, 0) / drivers.length).toFixed(2)
  ) || 4.8;

  const avgDriverSafetyScore = parseFloat(
    (drivers.reduce((acc, curr) => acc + curr.safetyScore, 0) / drivers.length).toFixed(2)
  ) || 4.8;

  // Filter listings
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' ? true : d.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">SafeGo</span>
                <span className="ml-1.5 text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full antialiased uppercase">
                  Admin Panel
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                />
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 hover:text-slate-900 cursor-pointer transition-all"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'stats', label: 'Ringkasan Statistik', icon: Cpu },
              { id: 'users', label: 'Daftar Pengguna', icon: Users },
              { id: 'drivers', label: 'Daftar Driver', icon: Check },
              { id: 'history', label: 'Monitoring Perjalanan', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSearchQuery('');
                  }}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all gap-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: OVERVIEW STATISTICS */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              
              <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jumlah Pengguna</dt>
                  <dd className="text-2xl font-bold text-slate-900">{totalUsers}</dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Driver Terdaftar</dt>
                  <dd className="text-2xl font-bold text-slate-900">{totalDrivers}</dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                  <div className="relative">
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <Power className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Driver Sedang Online</dt>
                  <dd className="text-2xl font-bold text-slate-900">{onlineDriversCount}</dd>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Perjalanan Selesai</dt>
                  <dd className="text-2xl font-bold text-slate-900">{totalRides}</dd>
                </div>
              </div>
            </div>

            {/* Monitoring Metrics Ratings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Rating Kualitas Layanan Rata-rata
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                    Excellent
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-slate-950">{avgDriverRating}</span>
                  <span className="text-sm text-slate-500">/ 5.0 bintang dari semua review</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(avgDriverRating / 5) * 100}%` }}></div>
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  Rating dihitung secara kumulatif dari seluruh perjalanan berdasarkan penilaian feedback opsional customer untuk menilai ramah tamah, pemeliharaan armada mobil, dan kenyamanan berkendara.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartPulse className="h-5 w-5 text-emerald-500" />
                    Safety Score Rata-rata Pelanggan
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    Sangat Aman
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-slate-950">{avgDriverSafetyScore}</span>
                  <span className="text-sm text-slate-500">/ 5.0 bintang keamanan anonim</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(avgDriverSafetyScore / 5) * 100}%` }}></div>
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  Fitur <b>Safety Score Anonim</b> wajib diisi di akhir perjalanan oleh pelanggan untuk merekam seberapa aman & nyaman sosiologis mereka berjalan bersama pengemudi. Data diakumulasikan tanpa komentar publik demi privasi penuh.
                </p>
              </div>
            </div>

            {/* Quick Map Simulation Info */}
            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative z-10 max-w-xl">
                <h3 className="text-lg font-bold">SafeGo Gender-Equality Prototype</h3>
                <p className="text-sm text-blue-100 mt-1 leading-relaxed">
                  Sistem monitoring terus memvalidasi ketersediaan armada. Pengguna perempuan terbantu mendapatkan pengemudi perempuan di area Jakarta melalui filter gender otomatis, memaksimalkan <i>mind safety</i> di malam hari.
                </p>
              </div>
              <div className="bg-blue-700 text-white font-mono px-4 py-3 rounded-xl border border-blue-500 text-xs sm:self-center">
                <span className="text-blue-300 font-bold block mb-1">DENGAR PENDUDUK:</span>
                • 50% Driver Laki-laki<br/>
                • 50% Driver Perempuan<br/>
                • Radius Pencarian: 8 - 10 KM
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-xs rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Pengguna Aktif</h3>
                <p className="text-xs text-slate-500">Tampilan lengkap pelanggan terdaftar di sistem SafeGo</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari user (nama, email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Default Preferensi</th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                  {filteredCustomers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.gender === 'female' ? 'perempuan' : 'laki-laki'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                        {user.defaultGenderPref === 'female' && 'Preferensi Driver Perempuan'}
                        {user.defaultGenderPref === 'male' && 'Preferensi Driver Laki-Laki'}
                        {(user.defaultGenderPref === 'all' || !user.defaultGenderPref) && 'Semua Driver (Tanpa Filter)'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <UserCheck className="h-3.5 w-3.5" />
                          Aktif (Terintegrasi)
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-xs">
                        Tidak ada pengguna yang cocok dengan pencarian Anda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVER MANAGEMENT */}
        {activeTab === 'drivers' && (
          <div className="bg-white shadow-xs rounded-2xl border border-slate-200 overflow-hidden">
            
            {/* Filtering Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Mitra Pengemudi SafeGo</h3>
                <p className="text-xs text-slate-500">Manajemen status online, penilaian score dan data armada</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-lg text-xs">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <button 
                    onClick={() => setGenderFilter('all')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${genderFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Semua
                  </button>
                  <button 
                    onClick={() => setGenderFilter('female')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${genderFilter === 'female' ? 'bg-pink-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Perempuan
                  </button>
                  <button 
                    onClick={() => setGenderFilter('male')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${genderFilter === 'male' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Laki-Laki
                  </button>
                </div>

                <div className="relative flex-1 md:w-60 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nama, plat, kendaraan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Drivers list table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mitra Driver</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Model Armada</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kualitas Rating</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">🟢 Safety Score</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status Online</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <img 
                          src={driver.avatar} 
                          alt={driver.name} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border" 
                        />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-2">
                            {driver.name}
                            {driver.isTopPicked && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.25 rounded-md">
                                Recommended
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{driver.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-slate-800">{driver.vehicleName}</p>
                          <span className={`text-[9px] px-1.5 py-0.25 rounded font-extrabold uppercase ${
                            driver.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {driver.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono font-bold uppercase">{driver.vehiclePlate}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {driver.gender === 'female' ? 'Perempuan' : 'Laki-Laki'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-slate-900">{driver.rating.toFixed(2)}</span>
                          <span className="text-xs text-slate-400">({driver.reviewsCount} ulasan)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">
                            🟢 {driver.safetyScore.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">({driver.safetyReviewsCount} pengguna)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => onToggleDriverOnline(driver.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1 cursor-pointer select-none transition-all ${
                            driver.online 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${driver.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {driver.online ? 'ONLINE' : 'OFFLINE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                        Tidak ada driver yang cocok dengan penyaringan Anda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RIDE HISTORY / MONITORING */}
        {activeTab === 'history' && (
          <div className="bg-white shadow-xs rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 font-sans">Aktivitas & Log Perjalanan Real-time</h3>
              <p className="text-xs text-slate-500">Mantan monitoring trip aktif, transaksi pembayaran serta safety score anonim yang terkumpul</p>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Driver SafeGo</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rute Perjalanan (Jemput → Tujuan)</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Biaya Order</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating & Safety Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {rideHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">{item.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{item.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-slate-900">{item.driverName}</span>
                          <span className={`text-[10px] px-1.5 py-0.25 rounded-md ${
                            item.driverGender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.driverGender === 'female' ? 'P' : 'L'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.25 rounded-md ${
                            item.vehicleType === 'motor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.vehicleType === 'motor' ? '🏍️ Motor' : '🚗 Mobil'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded truncate max-w-[120px]">{item.pickupLocation}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded truncate max-w-[120px]">{item.destinationLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                            ))}
                            <span className="text-xs text-slate-500 ml-1">Layanan</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                              🟢 {item.safetyScore.toFixed(1)} Safety
                            </span>
                            {item.reviewText && (
                              <span className="text-xs text-slate-400 max-w-[100px] truncate" title={item.reviewText}>
                                "{item.reviewText}"
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rideHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                        Belum ada riwayat transaksi perjalanan di sistem saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
