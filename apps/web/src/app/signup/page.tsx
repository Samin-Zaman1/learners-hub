'use client';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from 'next/link';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton,
  Avatar 
} from '@mui/material';
import axios from 'axios';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setMsg('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await axios.post(`${apiUrl}/auth/signup`, { 
        email, 
        password,
        role 
      });
      if (res.data.ok) setMsg('Signup successful! You can now log in.');
      else setMsg(res.data.message || 'Signup failed');
    } catch {
      setMsg('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f3f5f7', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: { xs: 2, md: 4 }
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          maxWidth: 520, 
          width: '100%', 
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          bgcolor: '#fff'
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="Learners Hub Logo"
            sx={{
              height: 48,
              width: 'auto',
            }}
          />
        </Box>

        <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
          Join Learners Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
          Create your account to start learning or teaching
        </Typography>

        <form onSubmit={handleSignup}>
          {/* Role Selection */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            I want to join as
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={role}
            onChange={(_, v) => v && setRole(v)}
            fullWidth
            sx={{
              mb: 3,
              '& .MuiToggleButton-root': { 
                textTransform: 'none', 
                py: 1.5,
                border: '1px solid #e5e7eb',
                borderRadius: '8px !important',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, rgba(99,91,255,1) 0%, rgba(118,75,162,1) 100%)',
                  color: 'white',
                  border: '1px solid transparent',
                  boxShadow: '0 4px 12px rgba(99,91,255,.25)',
                  '&:hover': {
                    filter: 'brightness(.95)',
                  }
                },
                '&:hover': {
                  borderColor: '#c7c9ff',
                  bgcolor: '#f8fafc'
                }
              },
            }}
          >
            <ToggleButton value="STUDENT">
              <Box display="flex" alignItems="center" gap={1}>
                👩‍🎓 Student
              </Box>
            </ToggleButton>
            <ToggleButton value="INSTRUCTOR">
              <Box display="flex" alignItems="center" gap={1}>
                👨‍🏫 Instructor
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Name Fields - Temporarily removed */}
          {/* <Box display="flex" gap={2} mb={2}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
            />
          </Box> */}

          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
            Email Address
          </Typography>
          <TextField
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            size="medium"
            margin="dense"
            required
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
            Password
          </Typography>
          <TextField
            placeholder="Create a password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="dense"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
            Confirm Password
          </Typography>
          <TextField
            placeholder="Re-enter your password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="dense"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography
            sx={{
              mt: 2,
              minHeight: 36,
              textAlign: 'center',
              p: 1,
              borderRadius: 1,
              backgroundColor: msg.includes('successful')
                ? 'rgba(46, 204, 113, .08)'
                : msg
                ? 'rgba(231, 76, 60, .08)'
                : 'transparent',
              border: msg ? '1px solid' : 'none',
              borderColor: msg.includes('successful') ? 'success.main' : 'error.main',
            }}
            color={
              msg.includes('successful')
                ? 'success.main'
                : msg
                ? 'error.main'
                : 'text.secondary'
            }
            variant="body2"
          >
            {msg}
          </Typography>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ 
              mt: 3, 
              py: 1.4, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, rgba(99,91,255,1) 0%, rgba(118,75,162,1) 100%)',
              boxShadow: '0 6px 14px rgba(99,91,255,.18)',
              '&:hover': { 
                filter: 'brightness(.95)',
                boxShadow: '0 8px 18px rgba(99,91,255,.25)'
              },
            }}
          >
            {loading ? 'Creating Account...' : `Create ${role === 'STUDENT' ? 'Student' : 'Instructor'} Account`}
          </Button>
        </form>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#635bff', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link href="/" style={{ color: '#764ba2', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}