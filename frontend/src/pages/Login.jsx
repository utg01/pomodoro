import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Chrome, Zap, Timer, ListTodo, BarChart3 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome! 🎉",
        description: "Successfully signed in with Google"
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#1a1a24] flex items-center justify-center p-4">
      <Toaster />
      
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Timer className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Pomodoro
              </h1>
              <p className="text-gray-400 text-sm font-mono">Focus Timer</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Stay focused.<br />
              Get things done.
            </h2>
            <p className="text-gray-400 text-lg">
              Track your productivity with the Pomodoro technique. 
              Sign in to sync your data across all devices.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <span>Focus sessions with customizable timers</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-blue-400" />
              </div>
              <span>Task management and tracking</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <span>Statistics and productivity insights</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <Card className="p-8 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Welcome back</h3>
              <p className="text-gray-400">Sign in to continue your productivity journey</p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 py-6 text-lg font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Chrome className="w-6 h-6" />
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-500 text-center">
                By signing in, you agree to sync your data with Firebase.
                Your data is secure and private.
              </p>
            </div>

            {/* Demo info */}
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-sm text-cyan-400 font-mono text-center">
                🔐 Secure authentication powered by Firebase
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
