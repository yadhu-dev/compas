import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Download, Trash2, Search, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface DashboardProps {
  session: any;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, theme, setTheme }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  type EmpStatus = {
    id: number;
    empid: string;
    empname: string;
    Date: string;
    Time: string;
  };

  const [data, setData] = useState<EmpStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [timeFilter, setTimeFilter] = useState('30');


  const [showSessionWarning, setShowSessionWarning] = useState(false);


  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const warningTimer = setTimeout(() => {
      setShowSessionWarning(true);
    }, 1740000); // 29 minutes (30s before 30m)

    const logoutTimer = setTimeout(() => {
      handleLogout();
    }, 1800000); // 30 minutes

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [session]);



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('empStatus')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setData(data || []);
      console.log('Fetched data:', data); // Make sure the data is correct
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EmployeeData');
    XLSX.writeFile(wb, 'employee_data.xlsx');
  };

  const handleDelete = async () => {
    if (deletePassword === 'admin123') {
      try {
        const { error } = await supabase
          .from('empStatus')
          .delete()
          .neq('id', 0);

        if (error) throw error;
        setShowDeleteConfirm(false);
        setDeletePassword('');
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    } else {
      alert('Invalid password');
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = (
      (item.empid && item.empid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.empname && item.empname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesDate = !selectedDate || item.Date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const getChartData = () => {
    if (!data.length) return [];

    // Step 1: Convert all Time strings to Date objects
    const times = data.map(item => {
      const [h, m, s] = item.Time.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, s, 0);
      return date;
    });

    // Step 2: Find min and max times
    const minTime = new Date(Math.min(...times.map(t => t.getTime())));
    const maxTime = new Date(Math.max(...times.map(t => t.getTime())));

    // Step 3: Round down minTime and round up maxTime to nearest hour
    minTime.setMinutes(20, 0, 0);
    maxTime.setMinutes(20, 0, 0);
    if (maxTime.getMinutes() > 20) maxTime.setHours(maxTime.getHours() + 1);

    // Step 4: Create bins and initialize counts
    const bins: { [key: string]: number } = {};
    const binLabels: string[] = [];

    let bin = new Date(minTime);
    while (bin <= maxTime) {
      const label = bin.toTimeString().slice(0, 5); // HH:MM
      bins[label] = 0;
      binLabels.push(label);
      bin.setHours(bin.getHours() + 1);
    }

    // Step 5: Count how many entries fall into each bin
    times.forEach(t => {
      const binTime = new Date(t);
      binTime.setMinutes(20, 0, 0);
      const label = binTime.toTimeString().slice(0, 5);
      if (bins[label] !== undefined) {
        bins[label]++;
      }
    });

    // Step 6: Convert to chart format
    return binLabels.map(label => ({
      time: label,
      count: bins[label]
    }));
  };
  

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className="relative h-[120px]">
        <div
          className={`absolute inset-0 bg-cover bg-center bg-gray-200 ${theme === 'dark' ? '' : ''}`}
          style={{
            backgroundImage: 'url(/assets/bgimg.avif)',
            opacity: 0.7
          }}
        ></div>

        <div className="relative z-10 flex items-center justify-between p-4 shadow-lg py-9" >
          <div className="flex items-center space-x-16 ml-8">
            {/* <Compass className="w-8 h-8" /> */}
            <img className={`${theme === 'dark' ? 'bg-gray-200/40 pr-8 pl-8 pb-4 pt-2 -mt-2 rounded-lg' : 'pr-8 pl-8 pb-4 pt-2 -mt-2 rounded-lg'}`} src="/assets/compass.png" alt="" height={'60px'} width={'220px'} />

          </div>

          <div className="flex items-center space-x-16 mr-9 ">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full 
             bg-black text-white 
             dark:bg-white dark:text-black 
             hover:opacity-80 transition-colors"
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>

            <span className="text-base inline-flex items-center gap-1 font-semibold">
              Developed by
              <span className="text-lg italic font-bold flex items-center gap-1 ml-2">
                <a href="https://www.miccroten.com/" className="flex items-center gap-1">
                  <img src="/assets/fav-icon.png" alt="Miccroten Logo" width="25" height="25" />
                  MICCROTEN
                </a>
              </span>
            </span>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-white hover:bg-red-600 ${theme === 'dark' ? 'bg-red-950 border-2 border-red-500' : 'bg-red-500'}`}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Clock className='w-16 h-16 animate-spin' ></Clock>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-900" />
              <input
                type="text"
                placeholder="Search by EmpID or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded border backdrop-blur-md `}
                style={{
                  backgroundColor: theme === 'dark' ? 'black' : 'rgb(0 13 46 / 93%)',
                  color: 'white',
                  borderColor: theme === 'dark' ? '#50e500' : 'rgba(255, 255, 255, 0.2)',
                  boxShadow:
                    theme === 'dark'
                      ? '0 4px 10px rgba(0, 255, 0, 0.37)' // Green shadow
                      : '0 4px 10px rgba(17, 53, 252, 0.52)', // Blue shadow
                }}
              />
            </div>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded border"
            style={{
              backgroundColor: theme === 'dark' ? 'black' : 'rgb(0 13 46 / 93%)',
              color: 'white',
              borderColor: theme === 'dark' ? '#50e500' : 'rgba(255, 255, 255, 0.2)',
              boxShadow:
                theme === 'dark'
                  ? '0 4px 10px rgba(0, 255, 0, 0.32)' // Green shadow
                  : '0 4px 10px rgba(17, 53, 252, 0.52)', // Blue shadow
            }}

          />

          <style>
            {`
                input[type="date"]::-webkit-calendar-picker-indicator {
                filter: invert(1); 
              }
            `}
          </style>


          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`px-4 py-2 text-white rounded hover:bg-red-600 flex items-center space-x-2 ${theme === 'dark' ? 'border-2 border-red-500 bg-red-950' : 'bg-red-500'}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className={`px-4 py-2 text-white rounded hover:bg-green-600 flex items-center space-x-2 ${theme === 'dark' ? 'bg-green-950 border-2 border-green-500' : 'bg-green-500'}`}
          >
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>

        <div className={`mb-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Employee Records</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className={`mb-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-[rgb(0_18_122_/_23%)]' : 'bg-[rgb(91_18_195_/_10%)]'
              }`}>


              {/* Group data by day */}
              {Object.entries(
                filteredData.reduce((acc, item) => {
                  const day = new Date(item.Date).toLocaleDateString('en-US', { weekday: 'long' });
                  if (!acc[day]) acc[day] = [];
                  acc[day].push(item);
                  return acc;
                }, {} as Record<string, typeof filteredData>)
              ).map(([day, items]) => (
                <div key={day} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{day}</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
                        style={{
                          boxShadow:
                            theme === 'dark'
                              ? '0 4px 10px rgba(0, 255, 0, 0.3)' // Green shadow
                              : '0 4px 10px rgba(0, 0, 255, 0.3)' // Blue shadow
                        }}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Date</div>
                            <div>{new Date(item.Date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Time</div>
                            <div>{item.Time}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">EmpID</div>
                            <div>{item.empid}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">EmpName</div>
                            <div>{item.empname}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>


        {/* Graph Section */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-violet-100'}`}>

          <h2 className="text-2xl font-bold mb-4">Graphical Visualization</h2>
          <div className="mt-12">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1 rounded border "
              style={{
                backgroundColor: theme === 'dark' ? 'rgb(22 61 2 / 77%)' : 'rgb(0 13 46 / 93%)',
                color: 'white',
                borderColor: theme === 'dark' ? '#ffff006e' : 'rgba(255, 255, 255, 0.2)',
                boxShadow:
                  theme === 'dark'
                    ? '0 4px 10px rgba(0, 255, 0, 0.12)' // Green shadow
                    : '0 4px 10px rgba(17, 53, 252, 0.52)', // Blue shadow
              }}
            >
              <option value="30">Last 30 Minutes</option>
              <option value="45">Last 45 Minutes</option>
              <option value="60">Last 60 Minutes</option>
            </select>
          </div>

          <div className="mb-4 flex justify-end ml-40">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              
              className="px-3 py-1 rounded border"
              style={{
                backgroundColor: theme === 'dark' ? 'rgb(22 61 2 / 77%)' : 'rgb(0 13 46 / 93%)',
                color: 'white',
                borderColor: theme === 'dark' ? '#ffff006e' : 'rgba(255, 255, 255, 0.2)',
                boxShadow:
                  theme === 'dark'
                    ? '0 4px 10px rgba(0, 255, 0, 0.12)' // Green shadow
                    : '0 4px 10px rgba(17, 53, 252, 0.52)', // Blue shadow
              }}
            />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    return (
                      <div style={{ background: 'transparent', color: 'white', padding: '10px' }}>
                        <div>Count: {payload[0].value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill={theme === 'dark' ? 'rgba(28, 77, 12, 0.71)' : 'rgba(12, 27, 77, 0.88)'}
                maxBarSize={90}
                radius={[5, 5, 0, 0]}
                stroke={theme === 'dark' ? 'rgba(158, 201, 17, 0.71)' : 'rgba(14, 54, 185, 0.88)'}
                strokeWidth={1}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>


        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(4, 11, 64, 0.9)' : 'rgb(0 0 0 / 84%)',
              color: 'white',
              borderColor: theme === 'dark' ? '#ffff006e' : 'rgba(255, 255, 255, 0.2)',
              boxShadow:
                theme === 'dark'
                  ? '-2px 4px 10px 3px rgb(6, 3, 92)' // Green shadow
                  : '-3px 3px 10px 6px rgb(255 5 5 / 55%)', // Blue shadow
            }}>
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <div className="mb-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-2 rounded border bg-black-100 text-black"

                placeholder="Enter password"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Session Expiration Warning */}
      {showSessionWarning && (
        <div
          className="fixed bottom-4 right-4 text-black dark:text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce"
          style={{
            backgroundColor: 'rgba(224, 168, 28, 0.66)',
          }}
        >
          ⚠️ Your session will expire soon
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
