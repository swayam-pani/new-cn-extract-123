import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import MapIcon from '@mui/icons-material/Map';
import CalculateIcon from '@mui/icons-material/Calculate';
import MessageIcon from '@mui/icons-material/Message';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Navigation = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Carbon Sync
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/calculator"
              startIcon={<CalculateIcon />}
            >
              Calculator
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/map"
              startIcon={<MapIcon />}
            >
              Route Planner
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/messages"
              startIcon={<MessageIcon />}
            >
              Messages
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/carpooling"
              startIcon={<DirectionsCarIcon />}
            >
              Carpooling
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.displayName ? user.displayName[0] : user.email[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
              >
                <MenuItem>
                  <Typography variant="body2">
                    {user.displayName || user.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/signup"
                variant="contained"
                sx={{ bgcolor: 'primary.light' }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 