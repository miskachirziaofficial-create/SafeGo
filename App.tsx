/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Driver, RideRequest, DriverOffer, RideCompletedStats } from './types';
import { DUMMY_USERS, DUMMY_DRIVERS, INITIAL_RIDE_HISTORY } from './dummyData';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import DriverDashboard from './components/DriverDashboard';
import CustomerDashboard from './components/CustomerDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Shared persistent memory state representing live system changes !
  const [drivers, setDrivers] = useState<Driver[]>(DUMMY_DRIVERS);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [driverOffers, setDriverOffers] = useState<DriverOffer[]>([]);
  const [rideHistory, setRideHistory] = useState<RideCompletedStats[]>(INITIAL_RIDE_HISTORY);

  // Filter lists passed to dashboards
  const customers = DUMMY_USERS.filter(u => u.role === 'customer');

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Shared Action: Toggle driver online status (Admin or Driver can do this)
  const handleToggleDriverOnline = (driverId: string) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((d) => (d.id === driverId ? { ...d, online: !d.online } : d))
    );
  };

  // Customer Dash Action: Add a search request
  const handleAddRideRequest = (req: RideRequest) => {
    setRideRequests((prev) => [...prev, req]);
  };

  // Customer Dash Action: Cancel search request
  const handleCancelRideRequest = (reqId: string) => {
    setRideRequests((prev) => prev.filter((r) => r.id !== reqId));
    setDriverOffers((prev) => prev.filter((o) => o.rideRequestId !== reqId));
  };

  // Customer Dash / Driver Dash Action: Add a driver offer
  const handleAddDriverOffer = (offer: DriverOffer) => {
    setDriverOffers((prev) => {
      // Avoid duplicate offers by the same driver on the same ride
      const exists = prev.some(
        (o) => o.rideRequestId === offer.rideRequestId && o.driverId === offer.driverId
      );
      if (exists) return prev;
      return [...prev, offer];
    });
  };

  // Customer Dash Action: Accept offer and bind driver to trip
  const handleAcceptOffer = (
    reqId: string, 
    driverId: string, 
    price: number, 
    eta: number, 
    distance: number
  ) => {
    setRideRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'active',
              driverId: driverId,
              acceptedPrice: price,
              etaMinutes: eta,
              distanceKm: distance,
              tripStatus: 'heading'
            }
          : r
      )
    );
  };

  // Driver Dash Action: Update simulated tracking step
  const handleSimulateRideStep = (
    rideRequestId: string, 
    nextStatus: 'heading' | 'arrived' | 'intrip' | 'completed'
  ) => {
    setRideRequests((prev) =>
      prev.map((r) => (r.id === rideRequestId ? { ...r, tripStatus: nextStatus } : r))
    );
  };

  // Customer Dash Action: Completed trip review aggregator
  const handleCompleteTrip = (newStats: RideCompletedStats) => {
    // Add record to completed ride logs
    setRideHistory((prev) => [newStats, ...prev]);

    // Fast cleanup of the request from active list to clear searching status
    setRideRequests((prev) => prev.filter(r => r.id !== newStats.id));
  };

  // Update live drivers aggregate database metrics
  const handleUpdateDriverStats = (driverId: string, isNewSafetyOnly: boolean, rating: number, safety: number) => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((d) => {
        if (d.id !== driverId) return d;

        // Calculate dynamic real average
        const newRatingCount = d.reviewsCount + 1;
        const newRatingAvg = parseFloat(
          ((d.rating * d.reviewsCount + rating) / newRatingCount).toFixed(2)
        );

        const newSafetyCount = d.safetyReviewsCount + 1;
        const newSafetyAvg = parseFloat(
          ((d.safetyScore * d.safetyReviewsCount + safety) / newSafetyCount).toFixed(2)
        );

        return {
          ...d,
          rating: newRatingAvg,
          reviewsCount: newRatingCount,
          safetyScore: newSafetyAvg,
          safetyReviewsCount: newSafetyCount
        };
      })
    );
  };

  // Main UI router based on authentication & session
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        drivers={drivers}
        customers={customers}
        rideHistory={rideHistory}
        onToggleDriverOnline={handleToggleDriverOnline}
      />
    );
  }

  if (currentUser.role === 'driver') {
    return (
      <DriverDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        drivers={drivers}
        rideRequests={rideRequests}
        driverOffers={driverOffers}
        rideHistory={rideHistory}
        onToggleOnline={handleToggleDriverOnline}
        onSendOffer={handleAddDriverOffer}
        onSimulateRideStep={handleSimulateRideStep}
      />
    );
  }

  // Otherwise, render Customer dashboard
  return (
    <CustomerDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      drivers={drivers}
      rideRequests={rideRequests}
      driverOffers={driverOffers}
      onAddRideRequest={handleAddRideRequest}
      onCancelRideRequest={handleCancelRideRequest}
      onAddDriverOffer={handleAddDriverOffer}
      onAcceptOffer={handleAcceptOffer}
      onCompleteTrip={handleCompleteTrip}
      onUpdateDriverStats={handleUpdateDriverStats}
    />
  );
}
