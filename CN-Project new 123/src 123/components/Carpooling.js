import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import RouteMap from './Maps/RouteMap';

const Carpooling = ({ showSearch }) => {
  const [rides, setRides] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [openNotification, setOpenNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const { user } = useAuth();
  const [carpoolRoute, setCarpoolRoute] = useState(null);
  const [showCarpoolMatch, setShowCarpoolMatch] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Get tomorrow's date in YYYY-MM-DD format for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    const q = query(collection(db, 'rides'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rideData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(rideData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showSearch) {
      // Get route details from localStorage
      const savedRoute = localStorage.getItem('carpoolRoute');
      if (savedRoute) {
        setCarpoolRoute(JSON.parse(savedRoute));
      }
    }
  }, [showSearch]);

  // Check if two times are within 30 minutes of each other
  const isTimeMatching = (time1, time2) => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    
    return Math.abs(totalMinutes1 - totalMinutes2) <= 30;
  };

  const checkForMatches = async (newRide) => {
    const q = query(
      collection(db, 'rides'),
      where('source', '==', newRide.source.toLowerCase()),
      where('destination', '==', newRide.destination.toLowerCase()),
      where('date', '==', newRide.date),
      where('userId', '!=', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const matchedRide = doc.data();
        // Check if time is within 30 minutes
        if (isTimeMatching(matchedRide.time, newRide.time)) {
          setMatchedUser(matchedRide);
          setOpenNotification(true);
        }
      });
    });

    setTimeout(() => unsubscribe(), 10000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newRide = {
      userId: user.uid,
      userName: user.displayName || user.email,
      source: source.toLowerCase().trim(),
      destination: destination.toLowerCase().trim(),
      date: date,
      time: time,
      timestamp: serverTimestamp(),
      contact: user.email
    };

    await addDoc(collection(db, 'rides'), newRide);
    checkForMatches(newRide);

    // Clear form
    setSource('');
    setDestination('');
    setDate('');
    setTime('');
  };

  const handleCloseNotification = () => {
    setOpenNotification(false);
    setMatchedUser(null);
  };

  const handleRouteSelect = (routeDetails) => {
    if (routeDetails.mode === 'carpool') {
      // Show carpool matching interface
      setShowCarpoolMatch(true);
      setRouteInfo(routeDetails);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Eco-friendly Route Planner
        </Typography>
        <RouteMap onRouteSelect={handleRouteSelect} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Find Carpool Partners
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label="Source Location"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                label="Destination"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                label="Travel Date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minDate }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                label="Travel Time"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained"
                fullWidth
                disabled={!source || !destination || !date || !time}
              >
                Add Ride
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <List>
        {rides.map(ride => (
          <ListItem key={ride.id} sx={{ display: 'block', mb: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary">
                {ride.userName}
              </Typography>
              <Typography variant="body1">
                From: {ride.source}
              </Typography>
              <Typography variant="body1">
                To: {ride.destination}
              </Typography>
              <Typography variant="body1">
                Date: {new Date(ride.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                Time: {ride.time}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Posted: {ride.timestamp?.toDate().toLocaleString()}
              </Typography>
              {ride.userId !== user.uid && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Contact: {ride.contact}
                </Typography>
              )}
            </Paper>
          </ListItem>
        ))}
      </List>

      <Snackbar 
        open={openNotification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {matchedUser && (
            <>
              Match found! {matchedUser.userName} is traveling the same route!
              <Typography variant="body2">
                Date: {new Date(matchedUser.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                Time: {matchedUser.time}
              </Typography>
              <Typography variant="body2">
                Contact them at: {matchedUser.contact}
              </Typography>
            </>
          )}
        </Alert>
      </Snackbar>

      {carpoolRoute && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Looking for carpool partners</Typography>
            <Typography>From: {carpoolRoute.source}</Typography>
            <Typography>To: {carpoolRoute.destination}</Typography>
            <Typography>Distance: {carpoolRoute.distance} km</Typography>
            <Typography color="success.main">
              Potential CO2 saving: {
                (carpoolRoute.emissions.car - carpoolRoute.emissions.carpool).toFixed(2)
              } kg
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Carpooling;