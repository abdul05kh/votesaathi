'use client';

import { useState } from 'react';
import { MapPin, Navigation, Search, Bell, Clock } from 'lucide-react';

export default function PollingPathfinder() {
  const [voterId, setVoterId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [boothData, setBoothData] = useState<{
    name: string;
    address: string;
    distance: string;
    time: string;
    wait: string;
    lat: number;
    lng: number;
  } | null>(null);

  /**
   * Simulates an ECI Voter ID lookup to retrieve polling booth information.
   * In production, this would integrate with the live ECI API.
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API lookup delay for a realistic feel
    setTimeout(() => {
      setBoothData({
        name: 'Government Primary School, Booth 42',
        address: 'Main Road, Near Panchayat Bhawan',
        distance: '1.2 km',
        time: '15 mins walking',
        wait: 'Low (~5 mins)',
        lat: 28.6139,
        lng: 77.2090
      });
      setIsSearching(false);
    }, 1500);
  };

  const handleRemind = () => {
    alert("Reminder set! We will notify you at 8:00 AM on Election Day.");
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Find Your Polling Booth</h2>
          <p className="text-slate-600 dark:text-slate-400">Enter your Voter ID (EPIC Number) to get live directions and wait times.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={voterId}
              onChange={(e) => setVoterId(e.target.value.toUpperCase())}
              aria-label="Voter ID Number"
              placeholder="e.g. ABC1234567"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent uppercase font-semibold text-lg dark:text-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching || !voterId.trim()}
            className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Locate Booth'
            )}
          </button>
        </form>

        {boothData && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Info Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{boothData.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{boothData.address}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Navigation className="text-primary" size={20} />
                    <div>
                      <span className="font-semibold block">{boothData.distance} away</span>
                      <span className="text-sm opacity-80">{boothData.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Clock className="text-green-500" size={20} />
                    <div>
                      <span className="font-semibold block">Live Wait Time</span>
                      <span className="text-sm opacity-80">{boothData.wait}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                  <button 
                    aria-label="Get directions to booth"
                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Navigation size={18} /> Direct Me
                  </button>
                  <button 
                    onClick={handleRemind} 
                    aria-label="Set election day reminder"
                    className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Bell size={18} aria-hidden="true" /> Remind
                  </button>
                </div>
              </div>

              {/* Map Embed */}
              <div className="h-64 md:h-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://maps.google.com/maps?q=${boothData.lat},${boothData.lng}&hl=es;z=14&amp;output=embed`}
                  className="absolute inset-0"
                ></iframe>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
