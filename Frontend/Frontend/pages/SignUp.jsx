import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { ArrowRight, ArrowLeft, Sparkles, SkipForward } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    school: '',
    level: '',
    isAlumni: false,
    email: '',
    password: ''
  });
  
  const [signupQuestions, setSignupQuestions] = useState({
    whatWouldYouLikeToDo: '',
    howDidYouHearAboutUs: '',
    interests: [],
    additionalInfo: ''
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const interestOptions = [
    'Buying items',
    'Selling items',
    'Finding study materials',
    'Connecting with students',
    'Campus events',
    'Textbooks',
    'Furniture',
    'Electronics'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (name, value) => {
    setSignupQuestions(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setSignupQuestions(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e, skipQuestions = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/auth/signup', {
        ...formData,
        signupQuestions: skipQuestions ? {} : signupQuestions
      });
      setMessage('OTP sent to your email!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/auth/verify', {
        email: formData.email,
        otp
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.post('/api/auth/resend-otp', { email: formData.email });
      setMessage(response.data?.message || 'New OTP sent!');
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Resend OTP error:', err);
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      }
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            CUNY Share
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'Create your account'}
            {step === 2 && 'Tell us about yourself (Optional)'}
            {step === 3 && 'Verify your email'}
          </p>

          {/* Progress bar */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-blue-600' : s < step ? 'w-2 bg-blue-400' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-sm">
            {message}
          </div>
        )}

        {/* -------------------- STEP 1 -------------------- */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">School</label>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">Select your school</option>
                <option value="City College">City College</option>
                <option value="Hunter College">Hunter College</option>
                <option value="Baruch College">Baruch College</option>
                <option value="Brooklyn College">Brooklyn College</option>
                <option value="Queens College">Queens College</option>
                <option value="Lehman College">Lehman College</option>
                <option value="John Jay College">John Jay College</option>
                <option value="York College">York College</option>
                <option value="Medgar Evers College">Medgar Evers College</option>
                <option value="College of Staten Island">College of Staten Island</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Select your level</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="isAlumni"
                  checked={formData.isAlumni}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-3 text-sm text-gray-700">I am an alumni</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition font-semibold"
            >
              Continue <ArrowRight size={20} />
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Log in
              </button>
            </div>
          </form>
        )}

        {/* -------------------- STEP 2 -------------------- */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What would you like to do with this app?
              </label>
              <textarea
                value={signupQuestions.whatWouldYouLikeToDo}
                onChange={(e) =>
                  handleQuestionChange('whatWouldYouLikeToDo', e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="I'd like to buy and sell items with other students..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                value={signupQuestions.howDidYouHearAboutUs}
                onChange={(e) =>
                  handleQuestionChange('howDidYouHearAboutUs', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">Select an option</option>
                <option value="Friend/Classmate">Friend/Classmate</option>
                <option value="Social Media">Social Media</option>
                <option value="Campus Advertisement">Campus Advertisement</option>
                <option value="Search Engine">Search Engine</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What are you interested in? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      signupQuestions.interests.includes(interest)
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Anything else you'd like to share?
              </label>
              <textarea
                value={signupQuestions.additionalInfo}
                onChange={(e) =>
                  handleQuestionChange('additionalInfo', e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Optional additional information..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 transition font-medium"
              >
                <ArrowLeft size={20} /> Back
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  <>
                    <SkipForward size={20} /> Skip
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  <>
                    Continue <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* -------------------- STEP 3 -------------------- */}
        {step === 3 && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-blue-600" size={40} />
              </div>
              <p className="text-gray-600">We've sent a 6-digit code to</p>
              <p className="font-semibold text-lg">{formData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                maxLength={6}
                required
                className="w-full px-4 py-4 border-2 rounded-xl text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>

            <div className="text-center text-sm">
              Didn't receive code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || resending}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;