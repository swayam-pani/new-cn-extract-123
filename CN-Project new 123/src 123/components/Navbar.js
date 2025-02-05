import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/calculator">
            Carbon Calculator
          </Button>
          <Button color="inherit" component={Link} to="/map">
            Route Planner
          </Button>
          <Button color="inherit" component={Link} to="/carpool">
            Carpooling
          </Button>
          <Button color="inherit" component={Link} to="/messages">
            Messages
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 