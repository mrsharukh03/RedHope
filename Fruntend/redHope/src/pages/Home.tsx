import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, ArrowRight, ShieldCheck, Activity, MapPin } from 'lucide-react';
import { receiverAPI } from '../services/api';

export const Home: React.FC = () => {
  const [activeRequests, setActiveRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const reqs = await receiverAPI.getMyRequests(); // Fallback handles this seamlessly
        // Slice top 3 urgent requests
        const filtered = reqs.filter(r => r.status === 'Pending').slice(0, 3);
        setActiveRequests(filtered);
      } catch (err) {
        console.warn('Failed to load active requests for homepage');
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="relative min-h-screen red-gradient-bg">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blood-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blood-950/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blood-950/50 border border-blood-500/20 text-blood-400 text-xs font-semibold">
              <Activity className="w-4 h-4 animate-pulse" /> Every Drop Counts, Every Second Matters
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-50 leading-[1.1]">
              Connecting Blood <span className="text-blood-500 text-glow">Donors</span> and <span className="text-blood-500 text-glow">Receivers</span> in Real-Time
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
              RedHope is a decentralized blood management network that maps compatible donors with urgent patient requests instantly based on location and real-time availability.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/signup"
                className="px-8 py-4 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg shadow-blood-600/20 hover:shadow-blood-600/40 transition-all duration-300 flex items-center gap-2 group hover:-translate-y-0.5"
              >
                Become a Donor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 text-neutral-200 hover:text-white font-bold rounded-xl transition-all duration-300"
              >
                Request Blood
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative flex justify-center">
            {/* Main Hero Image */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-neutral-800/80 animate-float">
              <img
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=600"
                alt="Blood donation process"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
              
              {/* Overlapping Info Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blood-600/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blood-500 fill-blood-500" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-neutral-100">Urgent Request Solver</h4>
                  <p className="text-[11px] text-neutral-400">Instantly matches compatible types</p>
                </div>
              </div>
            </div>
            {/* Decorative background aura */}
            <div className="absolute -z-10 w-[120%] h-[120%] bg-blood-600/10 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section className="border-y border-neutral-900 bg-neutral-950/60 py-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1,200+', label: 'Registered Donors', icon: Users },
              { value: '450+', label: 'Successful Matches', icon: Heart },
              { value: '150+', label: 'Critical Requests Met', icon: ShieldCheck },
              { value: '100%', label: 'Free Platform', icon: Award },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-blood-950/60 border border-blood-800/30 flex items-center justify-center mb-1 text-blood-500">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">{stat.value}</div>
                <div className="text-xs sm:text-sm text-neutral-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-neutral-100">Simple 3-Step Lifecycle</h2>
          <p className="text-neutral-400">Connecting users and coordinating lifesaving donations has never been easier or faster.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create Account & Profile',
              desc: 'Sign up and configure your blood group, coordinate location, and donation availability.',
              img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400'
            },
            {
              step: '02',
              title: 'Publish / Review Requests',
              desc: 'Receivers post active patient needs. Nearby compatible donors are automatically calculated.',
              img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400'
            },
            {
              step: '03',
              title: 'Approve & Coordinate',
              desc: 'Confirm responses, connect with hospital locations, and log completed actions to save lives.',
              img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400'
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full text-left">
              <div className="h-44 relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-neutral-950/60 flex items-center justify-between p-6">
                  <span className="text-4xl font-extrabold text-blood-500 opacity-80">{item.step}</span>
                </div>
              </div>
              <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Blood Requests Feed */}
      {activeRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="glass-panel rounded-3xl p-8 border border-neutral-800/80 text-left">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-neutral-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blood-500 animate-pulse"></span>
                  Active Hospital Requests
                </h3>
                <p className="text-xs text-neutral-400">Currently awaiting compatible local donors</p>
              </div>
              <Link 
                to="/login" 
                className="text-xs font-bold text-blood-400 hover:text-blood-300 transition-colors flex items-center gap-1 group"
              >
                View all in Dashboard <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {activeRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-neutral-950 p-5 rounded-2xl border border-neutral-900 flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  {req.urgency === 'Critical' && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-blood-950 border-b border-l border-blood-500/30 rounded-bl-xl text-[10px] font-bold text-blood-400 uppercase tracking-widest">
                      Critical
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blood-950/80 border border-blood-500/20 text-sm font-bold text-blood-500 flex items-center justify-center">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-200 line-clamp-1">{req.patientName}</h4>
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-500" /> {req.hospitalName}, {req.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-900 pt-3">
                    <span className="text-[11px] text-neutral-400 font-medium">
                      Units: <span className="font-bold text-neutral-100">{req.unitsRequired}</span>
                    </span>
                    <Link
                      to="/login"
                      className="text-xs font-bold px-3 py-2 bg-blood-950/50 hover:bg-blood-900/30 border border-blood-800/40 hover:border-blood-600 text-blood-400 hover:text-blood-300 rounded-lg transition-colors"
                    >
                      Donate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Footer banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-blood-900/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blood-600/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
              Ready to Save a Life Today?
            </h3>
            <p className="text-sm sm:text-base text-neutral-400">
              Registration takes less than 2 minutes. Your presence on the map could make all the difference in a critical emergency.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/signup"
                className="px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
