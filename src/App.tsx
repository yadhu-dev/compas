import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [session, setSession] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Routes>
          <Route 
            path="/login" 
            element={!session ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={
              session ? (
                <Dashboard 
                  session={session} 
                  theme={theme} 
                  setTheme={setTheme}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;