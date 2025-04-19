import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import { supabase } from '../lib/supabase';

import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: ['Welcome to Compass IT', 'Please login to continue'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true
    });

    return () => {
      typed.destroy();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert('An unknown error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white/10 p-8 rounded-lg shadow-lg border-2 border-blue-500 w-[500px] backdrop-blur-lg bg-opacity-30">
        <div className="flex justify-center mb-6 bg-gray-50/20 pb-4 pt-4">
          {/* <Compass className="w-16 h-16 text-blue-500" /> */}
          <img src="/assets/compass.png" alt="" height={'60px'} width={'200px'}/>
        </div>

        <div className="mb-8 text-center text-xl font-semibold text-blue-600 bg-black/60 rounded-lg">
          <span ref={typedElement}></span>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-3 px-4 bg-blue-500 rounded-lg text-white font-medium",
              "transition-all hover:bg-blue-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Clock className="w-6 h-6 text-white animate-spin" />
                </motion.div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default Login;