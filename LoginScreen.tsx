/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DUMMY_USERS } from '../dummyData';
import { Shield, Car, Users, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(true);

  // Filter helpers based on selected role
  const quickSelectUsers = DUMMY_USERS.filter((u) => {
    if (role === 'admin') return u.role === 'admin';
    if (role === 'driver') return u.id.includes('driver');
    return u.role === 'customer' && !u.id.includes('driver') && u.id !== 'user-admin';
  });

  const handleQuickSelect = (user: User) => {
    setEmail(user.email);
    setPassword('safego123'); // dummy password
    handleDirectLogin(user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Silakan masukkan email Anda');
      return;
    }
    
    // Check if user exists in dummy database
    const matchedUser = DUMMY_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (matchedUser) {
      handleDirectLogin(matchedUser);
    } else {
      // Create a dynamic user if not found just to support custom entries
      const generatedUser: User = {
        id: `user-custom-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: role,
        gender: role === 'driver' ? 'female' : 'male',
        avatar: role === 'driver' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        defaultGenderPref: 'all'
      };
      handleDirectLogin(generatedUser);
    }
  };

  const handleDirectLogin = (user: User) => {
    setErrorMsg('');
    onLoginSuccess(user);
  };

  const handleGoogleLogin = () => {
    // Simulate interactive loading
    setErrorMsg('Menghubungkan ke Google...');
    setTimeout(() => {
      // Choose a sensible default user based on selected role
      let selectedUser = quickSelectUsers[0];
      if (!selectedUser) {
        selectedUser = DUMMY_USERS[0];
      }
      onLoginSuccess({
        ...selectedUser,
        name: `${selectedUser.name} (Google)`
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* SafeGo Branded Logo */}
        <div className="inline-flex items-center justify-center bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/20 mb-4 transform hover:scale-105 transition-all">
          <Car className="h-8 w-8 text-white mr-1" />
          <span className="text-2xl font-black tracking-tight">SafeGo</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Masuk ke SafeGo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Prototype Transportasi Online Berbasis Keamanan & Kesetaraan Gender
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Tab Selector for User Roles */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Pilih Role Masuk
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'customer'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Pengguna</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('driver');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'driver'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg text-xs text-amber-800">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Alamat Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@safego.id"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Masuk Sekarang
              </button>
            </div>
          </form>

          {/* Google Login Trigger */}
          <div className="mt-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">Atau cara instan</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl shadow-xs bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.09-1.39-1.39-2.23z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Google (Dummy)
            </button>
          </div>

          {/* Quick Select Panel */}
          {showQuickSelect && (
            <div className="mt-6 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Quick select akun tugas kuliah:
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickSelect(false)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Sembunyikan
                </button>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {quickSelectUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="w-full text-left text-xs bg-white text-slate-700 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold">{u.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono italic">
                      {u.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                      {u.defaultGenderPref ? ` (Pref: ${u.defaultGenderPref})` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
