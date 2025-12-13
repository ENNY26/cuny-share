import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../src/api/axios.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: email input, 2: OTP verification, 3: new password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use a longer timeout for forgot password request (60 seconds)
      const response = await axios.post('/api/auth/forgot-password', { email }, {
        timeout: 60000 // 60 seconds timeout
      });
      console.log('Forgot password response:', response.data);
      setMessage('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error data:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Use a longer timeout for resend OTP request (60 seconds)
      const response = await axios.post('/api/auth/resend-otp', { email, purpose: 'reset' }, {
        timeout: 60000 // 60 seconds timeout
      });
      console.log('Resend OTP response:', response.data);
      setMessage('New OTP sent!');
    } catch (err) {
      console.error('Resend OTP error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error data:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

   const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // call verify-reset-otp (validates reset OTP only)
      await axios.post('/api/auth/verify-reset-otp', { email, otp });
      setMessage('OTP verified! Set your new password');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">
            {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'New Password'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Enter your email to receive a reset code' : 
             step === 2 ? 'Enter the 6-digit code sent to your email' : 
             'Create a new password for your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Didn't receive code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-indigo-600 hover:underline disabled:opacity-70"
              >
                Resend OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;