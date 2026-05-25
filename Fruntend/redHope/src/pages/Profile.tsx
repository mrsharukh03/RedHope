import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { MapPicker } from '../components/MapPicker';
import { User, Phone, Calendar, Heart, ShieldAlert, Image, Save, Loader2, CheckCircle2, AlertTriangle, Award, Star, TrendingUp } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [rhFactor, setRhFactor] = useState('Positive');
  const [healthConditions, setHealthConditions] = useState('');
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [city, setCity] = useState('New Delhi');
  const [profileUrl, setProfileUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [adult, setAdult] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing profile values when component mounts or user updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.profile) {
        setPhone(user.profile.phone || '');
        setDob(user.profile.dob || '');
        setGender(user.profile.gender || 'Male');
        setBloodGroup(user.profile.bloodGroup || 'O+');
        setRhFactor(user.profile.rhFactor || 'Positive');
        setHealthConditions(user.profile.healthConditions || '');
        setLat(user.profile.lat || 28.6139);
        setLon(user.profile.lon || 77.2090);
        setCity(user.profile.city || 'New Delhi');
        setProfileUrl(user.profile.profileUrl || '');
        setAvailable(user.profile.available ?? true);
        setAdult(user.profile.adult ?? true);
      }
    }
  }, [user]);

  const handleCoordinatesChange = (newLat: number, newLon: number, newCity?: string) => {
    setLat(newLat);
    setLon(newLon);
    if (newCity) {
      setCity(newCity);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters long', 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showToast('Phone must be a valid 10-digit number', 'error');
      return;
    }

    if (!dob) {
      showToast('Please enter your Date of Birth', 'error');
      return;
    }

    if (!city.trim()) {
      showToast('Please specify your city', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        dob,
        gender,
        bloodGroup,
        rhFactor,
        healthConditions,
        lat,
        lon,
        city,
        profileUrl: profileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', // Default avatar
        available,
        adult
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-6 text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-100">Donor Profile Setup</h2>
          <p className="text-sm text-neutral-400">Complete your profile to register in the network and make yourself visible to matches</p>
        </div>

        {(!user?.profile || !user.profile.phone) && (
          <div className="p-4 rounded-xl bg-blood-950/20 border border-blood-500/25 flex gap-3 text-sm text-blood-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold">Profile Pending:</span> Please complete the form below to activate your account. You will not show up on the local donor recommendation list or be able to request blood until coordinates are set.
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Form */}
          <div className="lg:col-span-7 space-y-6 glass-panel rounded-3xl p-6 md:p-8 border border-neutral-850">
            <h3 className="text-lg font-bold text-neutral-100 border-b border-neutral-800 pb-3">Personal & Medical Details</h3>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4 ml-1" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="block w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Phone Number (10 Digits)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Phone className="w-4 h-4 ml-1" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className="block w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Calendar className="w-4 h-4 ml-1" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-blood-500 fill-blood-500" /> Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Rh Factor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Rh Factor</label>
                <select
                  value={rhFactor}
                  onChange={(e) => setRhFactor(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                >
                  <option value="Positive">Positive (+)</option>
                  <option value="Negative">Negative (-)</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar Url */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Profile Picture URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Image className="w-4 h-4 ml-1" />
                </div>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="block w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>
            </div>

            {/* Health Conditions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" /> Health Conditions / Allergies
              </label>
              <textarea
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                placeholder="Mention any existing chronic illnesses, surgeries, or medications. Write 'None' if completely fit."
                maxLength={500}
                rows={3}
                className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 resize-none"
              />
            </div>

            {/* Availability Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-900 mt-2">
              <div>
                <h4 className="text-sm font-bold text-neutral-200">Available to Donate</h4>
                <p className="text-xs text-neutral-400">Toggle this ON to appear in search results for urgent blood matches</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blood-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
              </label>
            </div>

            {/* Adult Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-900">
              <div>
                <h4 className="text-sm font-bold text-neutral-200">Age Eligibility (18+)</h4>
                <p className="text-xs text-neutral-400">Confirm that you are an adult (18 years or older)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adult}
                  onChange={(e) => setAdult(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blood-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 text-white font-bold rounded-xl shadow-lg hover:shadow-blood-600/30 transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Location & Map Picker Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-neutral-850 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-neutral-100 border-b border-neutral-800 pb-3">Location Setup</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">City Name</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>

              {/* Embedding the interactive coordinate picker */}
              <MapPicker
                lat={lat}
                lon={lon}
                city={city}
                onChange={handleCoordinatesChange}
              />

              {user?.profile && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex gap-2.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>Profile active on the network. Compatibility matching services are operational.</span>
                  </div>

                  {/* Donor Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/20 text-center space-y-1">
                      <Award className="w-5 h-5 text-amber-400 mx-auto" />
                      <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">Donor Rank</p>
                      <p className="text-sm font-extrabold text-amber-400">{user.profile.donorRank || 'Unranked'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-600/20 text-center space-y-1">
                      <Star className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">Reward Points</p>
                      <p className="text-sm font-extrabold text-emerald-400">{user.profile.rewardPoints ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-600/20 text-center space-y-1">
                      <TrendingUp className="w-5 h-5 text-sky-400 mx-auto" />
                      <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">Last Donation</p>
                      <p className="text-[11px] font-bold text-sky-400">
                        {user.profile.lastDonationDate
                          ? new Date(user.profile.lastDonationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Profile;
