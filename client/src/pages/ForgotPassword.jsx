import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setSent(true);
      if (data.resetUrl) setDevUrl(data.resetUrl);
      toast.success('Reset link generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-2xl">DocuMind<span className="text-brand-400">AI</span></span>
        </Link>
        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">We sent a password reset link to <strong className="text-gray-200">{email}</strong></p>
              {devUrl && (
                <div className="bg-dark-700 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs text-yellow-400 mb-1 font-medium">Dev mode — reset URL:</p>
                  <Link to={devUrl.replace(window.location.origin, '')} className="text-xs text-brand-400 break-all hover:underline">
                    {devUrl}
                  </Link>
                </div>
              )}
              <Link to="/login" className="btn-secondary inline-flex text-sm">
                <ArrowLeft size={15} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1.5">Forgot password?</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? <Loader2 size={17} className="animate-spin" /> : 'Send reset link'}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1.5">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
