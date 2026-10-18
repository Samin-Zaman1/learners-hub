'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiErrorMessage } from '@/lib/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      // Login without role - let backend auto-detect from database
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });
      if (res.data?.ok) {
        const userRole = res.data.role;
        setMsg(`Logged in as ${userRole.toLowerCase()}: ${res.data.email}`);
        
        // Store user info and token in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userEmail', res.data.email);
        
        // Redirect based on role from backend
        setTimeout(() => {
          if (userRole === 'INSTRUCTOR') {
            router.push('/instructor');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        setMsg(res.data?.message || 'Login failed');
      }
    } catch (error: unknown) {
      setMsg(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f3f5f7',
        p: { xs: 1.5, md: 4 },
      }}
    >
      {/* Outer frame like the mock */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          minHeight: { md: '92vh' },
          p: { xs: 2, md: 4 },
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }
          }}
        >
          {/* LEFT: Sign-in form */}
          <Box
            sx={{
              flex: { xs: '1', md: '0 0 40%' },
              display: 'flex',
              alignItems: 'center',
              borderRight: { md: '1px solid #eef0f2' },
              pr: { md: 4 },
              py: { xs: 2, md: 0 },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
              {/* Logo top-left */}
              <Box sx={{ mb: 3 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="Learners Hub Logo"
                  sx={{
                    height: 40,
                    width: 'auto',
                  }}
                />
              </Box>

              <Typography variant="h5" fontWeight={700} gutterBottom>
                Welcome to Learners Hub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sign in with your account credentials. You&apos;ll be automatically directed to your dashboard.
              </Typography>

              <form onSubmit={handleSubmit} noValidate>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Email Address
                </Typography>
                <TextField
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  size="medium"
                  margin="dense"
                />

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                  Password
                </Typography>
                <TextField
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="dense"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 1, mb: 3 }}>
                  <Link href="/forgot-password" style={{ fontSize: 12, color: '#6b7280' }}>
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    borderRadius: 2,
                    background:
                      'linear-gradient(45deg, rgba(99,91,255,1) 0%, rgba(118,75,162,1) 100%)',
                    boxShadow: '0 6px 14px rgba(99,91,255,.18)',
                    '&:hover': { filter: 'brightness(.95)' },
                  }}
                >
                  {loading ? 'Signing In…' : 'Sign in'}
                </Button>

                <Typography
                  sx={{
                    mt: 2,
                    minHeight: 36,
                    textAlign: 'center',
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: msg.startsWith('Logged in')
                      ? 'rgba(46, 204, 113, .08)'
                      : msg
                      ? 'rgba(231, 76, 60, .08)'
                      : 'transparent',
                    border: msg ? '1px solid' : 'none',
                    borderColor: msg.startsWith('Logged in') ? 'success.main' : 'error.main',
                  }}
                  color={
                    msg.startsWith('Logged in')
                      ? 'success.main'
                      : msg
                      ? 'error.main'
                      : 'text.secondary'
                  }
                  variant="body2"
                >
                  {msg}
                </Typography>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" style={{ color: '#635bff', fontWeight: 600 }}>
                      Sign up here
                    </Link>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Link href="/" style={{ color: '#764ba2' }}>
                      ← Back to Home
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Box>
          </Box>

          {/* RIGHT: Illustration + headline panel */}
          <Box sx={{ flex: { xs: '1', md: '0 0 60%' }, pl: { md: 4 } }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, md: 4 },
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  width: '100%',
                  maxWidth: 820,
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fff',
                }}
              >
                {/* Marketing Illustration */}
                <Box
                  component="img"
                  src="/main-image.svg"
                  alt="Learners Hub Platform Illustration"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    mb: 2,
                  }}
                />

                <Typography
                  align="center"
                  sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, mb: 1 }}
                >
                  “Simplifies Course and Class Management”
                </Typography>
                <Typography align="center" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
                  Simplifies how teachers organize lessons and manage classroom tasks, making the
                  teaching process more efficient and effective.
                </Typography>

                {/* Tiny carousel dots placeholder like the mock */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 3 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#e5e7eb' }} />
                  <Box sx={{ width: 18, height: 6, borderRadius: 999, bgcolor: '#c7c9ff' }} />
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#e5e7eb' }} />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
