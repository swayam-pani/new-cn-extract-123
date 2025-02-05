import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import CarbonCalculator from './components/CarbonCalculator';
import Carpooling from './components/Carpooling';
import RouteMap from './components/Maps/RouteMap';
import MessageBoard from './components/MessageBoard';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

function App() {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<CarbonCalculator />} />
        <Route path="/calculator" element={<CarbonCalculator />} />
        <Route path="/map" element={<RouteMap />} />
        <Route path="/carpool" element={<Carpooling />} />
        <Route path="/messages" element={<MessageBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App; 