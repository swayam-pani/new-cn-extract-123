import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
  Stack
} from '@mui/material';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Carbon emission factors (kg CO2 per km)
const EMISSION_FACTORS = {
  car: 0.2,
  carpool: 0.1,
  transit: 0.04,
  bike: 0,
  walk: 0
};

const RouteMap = ({ onRouteSelect }) => {
  const [viewport, setViewport] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4,
    width: '100%',
    height: '400px'
  });

  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (source && destination) {
      calculateRoutes();
    }
  }, [source, destination]);

  const calculateRoutes = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${source.longitude},${source.latitude};${destination.longitude},` +
        `${destination.latitude}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distance = route.distance / 1000; // Convert to km
        
        const routeOptions = {
          distance,
          duration: route.duration / 60, // Convert to minutes
          emissions: {
            car: distance * EMISSION_FACTORS.car,
            carpool: distance * EMISSION_FACTORS.carpool,
            transit: distance * EMISSION_FACTORS.transit,
            bike: 0,
            walk: 0
          }
        };

        setRoutes(routeOptions);
      }
    } catch (error) {
      setError('Error calculating route');
      console.error('Error:', error);
    }
  };

  const handleSourceSearch = async (event) => {
    const query = event.target.value;
    if (!query) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const [longitude, latitude] = data.features[0].center;
        setSource({
          longitude,
          latitude,
          place_name: data.features[0].place_name
        });
      }
    } catch (error) {
      setError('Error searching location');
      console.error('Error:', error);
    }
  };

  const handleDestinationSearch = async (event) => {
    const query = event.target.value;
    if (!query) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const [longitude, latitude] = data.features[0].center;
        setDestination({
          longitude,
          latitude,
          place_name: data.features[0].place_name
        });
      }
    } catch (error) {
      setError('Error searching location');
      console.error('Error:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Source"
              onChange={handleSourceSearch}
              placeholder="Enter source location"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Destination"
              onChange={handleDestinationSearch}
              placeholder="Enter destination location"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 400, position: 'relative' }}>
        <ReactMapGL
          {...viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onMove={evt => setViewport(evt.viewport)}
        >
          {source && (
            <Marker
              longitude={source.longitude}
              latitude={source.latitude}
              anchor="bottom"
            >
              <div style={{ color: 'red', fontSize: '24px' }}>📍</div>
            </Marker>
          )}
          
          {destination && (
            <Marker
              longitude={destination.longitude}
              latitude={destination.latitude}
              anchor="bottom"
            >
              <div style={{ color: 'green', fontSize: '24px' }}>📍</div>
            </Marker>
          )}

          <NavigationControl position="top-right" />
        </ReactMapGL>
      </Paper>

      {routes && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">Route Information</Typography>
            <Typography>Distance: {routes.distance.toFixed(1)} km</Typography>
            <Typography>Duration: {routes.duration.toFixed(0)} minutes</Typography>
            
            <Typography variant="h6" sx={{ mt: 2 }}>Carbon Emissions</Typography>
            <Typography>By Car: {routes.emissions.car.toFixed(1)} kg CO2</Typography>
            <Typography>By Carpool: {routes.emissions.carpool.toFixed(1)} kg CO2</Typography>
            <Typography>By Transit: {routes.emissions.transit.toFixed(1)} kg CO2</Typography>
            <Typography color="success.main">By Bike/Walking: 0 kg CO2</Typography>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => onRouteSelect({
                source: source.place_name,
                destination: destination.place_name,
                distance: routes.distance,
                mode: 'carpool'
              })}
            >
              Find Carpool Partners
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RouteMap; 