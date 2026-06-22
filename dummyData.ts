/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Driver } from './types';

// Unsplash high quality portrait links for realistic profile photos
const AVATARS = {
  women: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  ],
  men: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  ]
};

// 20 Mock Users (genders: mix of male & female, roles: customer, admin, driver-user)
export const DUMMY_USERS: User[] = [
  // Core Customer (for demo)
  {
    id: 'user-1',
    name: 'Andi Pratama',
    email: 'budi@safego.id',
    role: 'customer',
    gender: 'male',
    avatar: AVATARS.men[0],
    defaultGenderPref: 'all'
  },
  {
    id: 'user-2',
    name: 'Nurlaila Sari',
    email: 'sari@safego.id',
    role: 'customer',
    gender: 'female',
    avatar: AVATARS.women[0],
    defaultGenderPref: 'female' // default preference is Female ! Great for demonstration
  },
  // Admin User
  {
    id: 'user-admin',
    name: 'Rian Hidayat (Admin)',
    email: 'admin@safego.id',
    role: 'admin',
    gender: 'male',
    avatar: AVATARS.men[1]
  },
  // Other Customers
  { id: 'user-4', name: 'Dewi Lestari', email: 'dewi@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[1], defaultGenderPref: 'female' },
  { id: 'user-5', name: 'Citra Kirana', email: 'citra@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[2], defaultGenderPref: 'all' },
  { id: 'user-6', name: 'Ahmad Fauzi', email: 'ahmad@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[2], defaultGenderPref: 'all' },
  { id: 'user-7', name: 'Bambang Pamungkas', email: 'bambang@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[3], defaultGenderPref: 'male' },
  { id: 'user-8', name: 'Siti Rahma', email: 'siti@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[3], defaultGenderPref: 'female' },
  { id: 'user-9', name: 'Fajar Nugraha', email: 'fajar@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[4] },
  { id: 'user-10', name: 'Grace Natalie', email: 'grace@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[4] },
  { id: 'user-11', name: 'Hendra Wijaya', email: 'hendra@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[5] },
  { id: 'user-12', name: 'Indah Permata', email: 'indah@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[5] },
  { id: 'user-13', name: 'Joko Widodo', email: 'joko@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[6] },
  { id: 'user-14', name: 'Kartika Putri', email: 'kartika@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[6] },
  { id: 'user-15', name: 'Lukman Hakim', email: 'lukman@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[7] },
  { id: 'user-16', name: 'Mega Utami', email: 'mega@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[7] },
  // Drivers (represented as users for login flow)
  {
    id: 'user-driver-sarah',
    name: 'Sarah Putri (Driver Mobil)',
    email: 'sarah@safego.id',
    role: 'driver',
    gender: 'female',
    avatar: AVATARS.women[8]
  },
  {
    id: 'user-driver-budi',
    name: 'Budi Santoso (Driver Mobil)',
    email: 'driver@safego.id',
    role: 'driver',
    gender: 'male',
    avatar: AVATARS.men[8]
  },
  {
    id: 'user-driver-eko',
    name: 'Eko Prasetyo (Driver Motor)',
    email: 'eko.prasetyo@safego.id',
    role: 'driver',
    gender: 'male',
    avatar: AVATARS.men[1]
  },
  { id: 'user-19', name: 'Rani Wijaya', email: 'rani@safego.id', role: 'customer', gender: 'female', avatar: AVATARS.women[9] },
  { id: 'user-20', name: 'Taufik Hidayat', email: 'taufik@safego.id', role: 'customer', gender: 'male', avatar: AVATARS.men[9] }
];

// 20 Mock Drivers
export const DUMMY_DRIVERS: Driver[] = [
  // Female Drivers
  {
    id: 'driver-sarah',
    name: 'Sarah Putri',
    email: 'sarah@safego.id',
    gender: 'female',
    rating: 4.95,
    reviewsCount: 350,
    safetyScore: 4.88,
    safetyReviewsCount: 1200,
    vehicleName: 'Toyota Avanza Hitam',
    vehiclePlate: 'B 1234 SPG',
    avatar: AVATARS.women[8],
    online: true,
    lat: -6.2201,
    lng: 106.8152,
    isTopPicked: true,
    baseDistance: 1.2,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-putri',
    name: 'Putri Amalia',
    email: 'putri.amalia@safego.id',
    gender: 'female',
    rating: 4.85,
    reviewsCount: 125,
    safetyScore: 4.75,
    safetyReviewsCount: 320,
    vehicleName: 'Honda Beat Sporty Merah',
    vehiclePlate: 'B 4321 PAM',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2341,
    lng: 106.8291,
    isTopPicked: false,
    baseDistance: 4.5,
    vehicleType: 'motor'
  },
  {
    id: 'driver-diana',
    name: 'Diana Rossi',
    email: 'diana@safego.id',
    gender: 'female',
    rating: 4.90,
    reviewsCount: 210,
    safetyScore: 4.92,
    safetyReviewsCount: 650,
    vehicleName: 'Yamaha NMAX Hitam',
    vehiclePlate: 'B 2987 DRG',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2110,
    lng: 106.8041,
    isTopPicked: true,
    baseDistance: 2.1,
    vehicleType: 'motor'
  },
  {
    id: 'driver-ayu',
    name: 'Ayu Lestari',
    email: 'ayu.lestari@safego.id',
    gender: 'female',
    rating: 4.78,
    reviewsCount: 98,
    safetyScore: 4.65,
    safetyReviewsCount: 210,
    vehicleName: 'Suzuki Ertiga Abu-Abu',
    vehiclePlate: 'B 8274 ALY',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2412,
    lng: 106.8399,
    isTopPicked: false,
    baseDistance: 6.8,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-kartika',
    name: 'Kartika Sari',
    email: 'kartika.sari@safego.id',
    gender: 'female',
    rating: 4.65,
    reviewsCount: 45,
    safetyScore: 4.50,
    safetyReviewsCount: 88,
    vehicleName: 'Honda Vario 160 Putih',
    vehiclePlate: 'B 9134 KTS',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2555,
    lng: 106.8415,
    isTopPicked: false,
    baseDistance: 9.2,
    vehicleType: 'motor'
  },
  {
    id: 'driver-rachel',
    name: 'Rachel Amanda',
    email: 'rachel@safego.id',
    gender: 'female',
    rating: 4.92,
    reviewsCount: 180,
    safetyScore: 4.85,
    safetyReviewsCount: 410,
    vehicleName: 'Honda HRV Metalik',
    vehiclePlate: 'B 777 RAC',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    online: false,
    lat: -6.2167,
    lng: 106.8090,
    isTopPicked: false,
    baseDistance: 3.5,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-nadia',
    name: 'Nadia Saphira',
    email: 'nadia@safego.id',
    gender: 'female',
    rating: 4.89,
    reviewsCount: 310,
    safetyScore: 4.86,
    safetyReviewsCount: 920,
    vehicleName: 'Vespa Sprint Kuning',
    vehiclePlate: 'B 310 NAD',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    lat: -6.2198,
    lng: 106.8255,
    isTopPicked: true,
    baseDistance: 1.8,
    vehicleType: 'motor'
  },
  {
    id: 'driver-fitri',
    name: 'Fitri Handayani',
    email: 'fitri@safego.id',
    gender: 'female',
    rating: 4.70,
    reviewsCount: 80,
    safetyScore: 4.80,
    safetyReviewsCount: 150,
    vehicleName: 'Honda Mobilio Silver',
    vehiclePlate: 'B 8856 FTR',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80',
    lat: -6.2050,
    lng: 106.7900,
    isTopPicked: false,
    baseDistance: 5.4,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-shelly',
    name: 'Shelly Maria',
    email: 'shelly@safego.id',
    gender: 'female',
    rating: 4.98,
    reviewsCount: 420,
    safetyScore: 4.96,
    safetyReviewsCount: 1350,
    vehicleName: 'Toyota Innova Putih',
    vehiclePlate: 'B 2235 SHY',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    lat: -6.2220,
    lng: 106.8188,
    isTopPicked: true,
    baseDistance: 0.9,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-indah',
    name: 'Indah Kusuma',
    email: 'indah.k@safego.id',
    gender: 'female',
    rating: 4.82,
    reviewsCount: 152,
    safetyScore: 4.72,
    safetyReviewsCount: 390,
    vehicleName: 'Yamaha Mio Soul GT',
    vehiclePlate: 'B 1900 KSM',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    lat: -6.2132,
    lng: 106.8222,
    isTopPicked: false,
    baseDistance: 3.2,
    vehicleType: 'motor'
  },

  // Male Drivers
  {
    id: 'driver-budi',
    name: 'Budi Santoso',
    email: 'driver@safego.id',
    gender: 'male',
    rating: 4.80,
    reviewsCount: 450,
    safetyScore: 4.60,
    safetyReviewsCount: 950,
    vehicleName: 'Toyota Avanza Silver',
    vehiclePlate: 'B 9988 BDS',
    avatar: AVATARS.men[8],
    online: true,
    lat: -6.2245,
    lng: 106.8180,
    isTopPicked: false,
    baseDistance: 1.5,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-eko',
    name: 'Eko Prasetyo',
    email: 'eko.prasetyo@safego.id',
    gender: 'male',
    rating: 4.92,
    reviewsCount: 320,
    safetyScore: 4.85,
    safetyReviewsCount: 820,
    vehicleName: 'Honda Beat Fi Hitam',
    vehiclePlate: 'B 8123 EKP',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2105,
    lng: 106.8120,
    isTopPicked: true,
    baseDistance: 2.8,
    vehicleType: 'motor'
  },
  {
    id: 'driver-agus',
    name: 'Agus Setiawan',
    email: 'agus@safego.id',
    gender: 'male',
    rating: 4.75,
    reviewsCount: 220,
    safetyScore: 4.58,
    safetyReviewsCount: 510,
    vehicleName: 'Suzuki Ertiga Putih',
    vehiclePlate: 'B 3098 AGU',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2301,
    lng: 106.8001,
    isTopPicked: false,
    baseDistance: 4.1,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-doni',
    name: 'Doni Tata',
    email: 'doni@safego.id',
    gender: 'male',
    rating: 4.87,
    reviewsCount: 540,
    safetyScore: 4.78,
    safetyReviewsCount: 1400,
    vehicleName: 'Yamaha NMAX Silver',
    vehiclePlate: 'B 411 DNI',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2188,
    lng: 106.8288,
    isTopPicked: true,
    baseDistance: 1.9,
    vehicleType: 'motor'
  },
  {
    id: 'driver-roni',
    name: 'Roni Firmansyah',
    email: 'roni@safego.id',
    gender: 'male',
    rating: 4.60,
    reviewsCount: 88,
    safetyScore: 4.45,
    safetyReviewsCount: 120,
    vehicleName: 'Honda Vario Merah',
    vehiclePlate: 'B 7644 RON',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2625,
    lng: 106.8520,
    isTopPicked: false,
    baseDistance: 8.5,
    vehicleType: 'motor'
  },
  {
    id: 'driver-hendra',
    name: 'Hendra Saputra',
    email: 'hendra.s@safego.id',
    gender: 'male',
    rating: 4.88,
    reviewsCount: 195,
    safetyScore: 4.82,
    safetyReviewsCount: 500,
    vehicleName: 'Hyundai Creta Biru',
    vehiclePlate: 'B 499 HDS',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2140,
    lng: 106.7990,
    isTopPicked: false,
    baseDistance: 3.9,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-anton',
    name: 'Anton Wijaya',
    email: 'anton@safego.id',
    gender: 'male',
    rating: 4.90,
    reviewsCount: 280,
    safetyScore: 4.91,
    safetyReviewsCount: 710,
    vehicleName: 'Honda Civic Hitam',
    vehiclePlate: 'B 911 ANT',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2166,
    lng: 106.8111,
    isTopPicked: true,
    baseDistance: 2.3,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-reza',
    name: 'Reza Rahadian',
    email: 'reza@safego.id',
    gender: 'male',
    rating: 4.95,
    reviewsCount: 395,
    safetyScore: 4.92,
    safetyReviewsCount: 1100,
    vehicleName: 'Wuling Almaz Putih',
    vehiclePlate: 'B 220 REZ',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    online: false,
    lat: -6.2185,
    lng: 106.8201,
    isTopPicked: false,
    baseDistance: 1.1,
    vehicleType: 'mobil'
  },
  {
    id: 'driver-tomi',
    name: 'Tomi Gunawan',
    email: 'tomi@safego.id',
    gender: 'male',
    rating: 4.68,
    reviewsCount: 112,
    safetyScore: 4.54,
    safetyReviewsCount: 220,
    vehicleName: 'Yamaha Lexi Abu-Abu',
    vehiclePlate: 'B 6241 TOM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2330,
    lng: 106.8190,
    isTopPicked: false,
    baseDistance: 5.6,
    vehicleType: 'motor'
  },
  {
    id: 'driver-yudi',
    name: 'Yudi Hartono',
    email: 'yudi@safego.id',
    gender: 'male',
    rating: 4.84,
    reviewsCount: 140,
    safetyScore: 4.70,
    safetyReviewsCount: 290,
    vehicleName: 'Honda PCX 160 Hitam',
    vehiclePlate: 'B 813 YDH',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    online: true,
    lat: -6.2088,
    lng: 106.8310,
    isTopPicked: false,
    baseDistance: 3.7,
    vehicleType: 'motor'
  }
];

// Indonesian simulated locations with distances/prices
export interface LocationItem {
  name: string;
  address: string;
  district: string;
}

export const DUMMY_LOCATIONS: LocationItem[] = [
  { name: 'Grand Indonesia Mall', address: 'Jl. M.H. Thamrin No.1, Menteng', district: 'Jakarta Pusat' },
  { name: 'Mall Kelapa Gading', address: 'Jl. Boulevard Raya, Kelapa Gading', district: 'Jakarta Utara' },
  { name: 'gandaria-city Gandaria City Mall', address: 'Jl. Sultan Iskandar Muda, Kebayoran Lama', district: 'Jakarta Selatan' },
  { name: 'Central Park Mall', address: 'Jl. Letjen S. Parman No.28, Grogol Petamburan', district: 'Jakarta Barat' },
  { name: 'Stasiun Gambir', address: 'Jl. Medan Merdeka Timur No.1, Gambir', district: 'Jakarta Pusat' },
  { name: 'Bandara Halim Perdanakusuma', address: 'Jl. Halim Perdana Kusuma, Makasar', district: 'Jakarta Timur' },
  { name: 'Pacific Place Mall', address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan', district: 'Jakarta Selatan' },
  { name: 'Sarinah Thamrin', address: 'Jl. M.H. Thamrin No.11, Gondangdia', district: 'Jakarta Pusat' },
  { name: 'Kota Tua Jakarta', address: 'Jl. Pintu Besar Utara No.27, Taman Sari', district: 'Jakarta Barat' },
  { name: 'Pondok Indah Mall 2', address: 'Jl. Metro Pondok Indah, Kebayoran Lama', district: 'Jakarta Selatan' },
  { name: 'Stasiun Sudirman', address: 'Jl. Kendal No.1, Menteng', district: 'Jakarta Pusat' },
  { name: 'Taman Mini Indonesia Indah (TMII)', address: 'Jl. Raya Taman Mini, Cipayung', district: 'Jakarta Timur' },
  { name: 'Ancol Dreamland', address: 'Jl. Lodan Timur No.7, Pademangan', district: 'Jakarta Utara' },
  { name: 'Senayan City', address: 'Jl. Asia Afrika No.19, Gelora', district: 'Jakarta Selatan' },
  { name: 'Ragunan Zoo', address: 'Jl. Harsono RM No.1, Pasar Minggu', district: 'Jakarta Selatan' }
];

// Helper to calculate a dynamic simulated price based on names (to keep it deterministic but realistic)
export function getSimulatedPriceAndDistance(pickup: string, destination: string, vehicleType: 'motor' | 'mobil' = 'mobil') {
  if (!pickup || !destination || pickup === destination) {
    const defaultRec = vehicleType === 'motor' ? 12000 : 25000;
    const defaultMin = vehicleType === 'motor' ? 9000 : 18000;
    return { recommended: defaultRec, minimum: defaultMin, distance: 4.2 };
  }
  
  // Hash characters in the names to make a consistent distance
  let hash = 0;
  const combined = pickup + destination;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const absHash = Math.abs(hash);
  const distance = parseFloat(((absHash % 120) / 10 + 1.5).toFixed(1)); // 1.5 to 13.5 km
  
  // motor is cheaper per km (e.g., 2000 vs 4000) and lower base price (e.g., 6000 vs 12000)
  const pricePerKm = vehicleType === 'motor' ? 1800 : 4000;
  const basePrice = vehicleType === 'motor' ? 5000 : 12000;
  const recommended = Math.round((basePrice + (distance * pricePerKm)) / 1000) * 1000;
  const minimum = Math.round((recommended * 0.72) / 1000) * 1000; // ~28% discount allowed
  
  return {
    recommended,
    minimum,
    distance
  };
}

// Simulated Ride History Database for Admin dashboard
export const INITIAL_RIDE_HISTORY: any[] = [
  {
    id: 'ride-h1',
    driverName: 'Sarah Putri',
    driverGender: 'female',
    vehicleType: 'mobil',
    customerName: 'Nurlaila Sari',
    pickup: 'Grand Indonesia Mall',
    destination: 'Stasiun Sudirman',
    price: 22000,
    rating: 5,
    safetyScore: 5,
    timestamp: '2026-06-21 18:30',
    status: 'completed'
  },
  {
    id: 'ride-h2',
    driverName: 'Budi Santoso',
    driverGender: 'male',
    vehicleType: 'mobil',
    customerName: 'Ahmad Fauzi',
    pickup: 'Stasiun Gambir',
    destination: 'Sarinah Thamrin',
    price: 35000,
    rating: 4,
    safetyScore: 5,
    timestamp: '2026-06-21 19:45',
    status: 'completed'
  },
  {
    id: 'ride-h3',
    driverName: 'Diana Rossi',
    driverGender: 'female',
    vehicleType: 'motor',
    customerName: 'Dewi Lestari',
    pickup: 'Pondok Indah Mall 2',
    destination: 'Gandaria City Mall',
    price: 15000,
    rating: 5,
    safetyScore: 5,
    timestamp: '2026-06-21 21:10',
    status: 'completed'
  },
  {
    id: 'ride-h4',
    driverName: 'Anton Wijaya',
    driverGender: 'male',
    vehicleType: 'mobil',
    customerName: 'Grace Natalie',
    pickup: 'Senayan City',
    destination: 'Pacific Place Mall',
    price: 42000,
    rating: 4,
    safetyScore: 4,
    timestamp: '2026-06-22 01:25',
    status: 'completed'
  },
  {
    id: 'ride-h5',
    driverName: 'Nadia Saphira',
    driverGender: 'female',
    vehicleType: 'motor',
    customerName: 'Grace Natalie',
    pickup: 'Central Park Mall',
    destination: 'Kota Tua Jakarta',
    price: 24000,
    rating: 5,
    safetyScore: 5,
    timestamp: '2026-06-22 05:40',
    status: 'completed'
  }
];
