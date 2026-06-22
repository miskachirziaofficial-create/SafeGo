/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'customer' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: 'male' | 'female';
  avatar: string;
  defaultGenderPref?: 'all' | 'male' | 'female';
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female';
  rating: number;
  reviewsCount: number;
  safetyScore: number;
  safetyReviewsCount: number;
  vehicleName: string;
  vehiclePlate: string;
  avatar: string;
  online: boolean;
  lat: number;
  lng: number;
  isTopPicked: boolean; // Custom flag for recommendation system
  baseDistance: number; // Simulated base distance in km to user's pickup point
  vehicleType: 'motor' | 'mobil'; // Type of vehicle
}

export interface RideRequest {
  id: string;
  customerId: string;
  customerName: string;
  pickupLocation: string;
  destinationLocation: string;
  proposedPrice: number;
  status: 'searching' | 'negotiating' | 'active' | 'completed' | 'cancelled';
  genderPreference: 'all' | 'male' | 'female';
  vehicleType: 'motor' | 'mobil'; // Preferred vehicle type for this request
  driverId?: string; // Driver who is currently matched
  acceptedPrice?: number;
  etaMinutes?: number;
  distanceKm?: number;
  tripStatus?: 'heading' | 'arrived' | 'intrip' | 'completed';
}

export interface DriverOffer {
  id: string;
  rideRequestId: string;
  driverId: string;
  priceOffered: number;
  etaMinutes: number;
  distanceKm: number;
}

export interface RideCompletedStats {
  id: string;
  driverId: string;
  driverName: string;
  driverGender?: 'male' | 'female';
  vehicleType?: 'motor' | 'mobil';
  customerName: string;
  pickupLocation: string;
  destinationLocation: string;
  price: number;
  rating: number;
  safetyScore: number;
  reviewText?: string;
  timestamp: string;
}
