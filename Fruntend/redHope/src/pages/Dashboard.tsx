import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { MapPicker } from '../components/MapPicker';
import { receiverAPI, donorAPI } from '../services/api';
import type { BloodRequestDTO, DonorHistoryItemDTO } from '../types';
import {
  Heart, PlusCircle, History, ShieldAlert, CheckCircle,
  MapPin, Clock, Phone, Send, Loader2, Award, UserCheck,
  X, ThumbsDown, Activity, Droplets, RefreshCw, Edit3, Trash2,
  Calendar, TrendingUp, Star, ChevronRight, Zap, PhoneCall,
  Hourglass, CheckCircle2, XCircle, AlertCircle, User2
} from 'lucide-react';

/* ─────────────────── helpers ─────────────────── */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Donation lifecycle steps in order
const DONATION_STEPS = [
  { key: 'INITIATED',       label: 'Accepted',        short: 'Initiated' },
  { key: 'CONTACT_SHARED',  label: 'Contact Shared',  short: 'Contact'   },
  { key: 'IN_PROGRESS',     label: 'In Progress',     short: 'Active'    },
  { key: 'COMPLETED',       label: 'Completed',       short: 'Done'      },
];

// Is this donation still ongoing (not ended)?
function isDonationActive(status: string) {
  const s = (status || '').toUpperCase();
  return s === 'INITIATED' || s === 'CONTACT_SHARED' || s === 'IN_PROGRESS';
}

// What's the next logical status?
function nextDonationStatus(current: string): string | null {
  const s = (current || '').toUpperCase();
  if (s === 'INITIATED')      return 'CONTACT_SHARED';
  if (s === 'CONTACT_SHARED') return 'IN_PROGRESS';
  if (s === 'IN_PROGRESS')    return 'COMPLETED';
  return null;
}

function nextDonationLabel(current: string): string {
  const s = (current || '').toUpperCase();
  if (s === 'INITIATED')      return '📞 Share Contact';
  if (s === 'CONTACT_SHARED') return '🩸 Start Process';
  if (s === 'IN_PROGRESS')    return '✅ Mark Complete';
  return '';
}

function donationStepIndex(status: string): number {
  const s = (status || '').toUpperCase();
  const idx = DONATION_STEPS.findIndex(st => st.key === s);
  return idx === -1 ? 0 : idx;
}

function donationStatusTheme(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED')      return { border: 'border-emerald-600/40', glow: '', badge: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-400' };
  if (s === 'CANCELLED')      return { border: 'border-neutral-800',    glow: '', badge: 'bg-neutral-900 border-neutral-700 text-neutral-500' };
  if (s === 'INITIATED')      return { border: 'border-blood-500/60',   glow: 'shadow-[0_0_20px_rgba(220,38,38,0.15)]', badge: 'bg-blood-950/60 border-blood-500/50 text-blood-400' };
  if (s === 'CONTACT_SHARED') return { border: 'border-sky-500/60',     glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]', badge: 'bg-sky-950/60 border-sky-500/50 text-sky-400' };
  if (s === 'IN_PROGRESS')    return { border: 'border-amber-500/60',   glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', badge: 'bg-amber-950/60 border-amber-500/50 text-amber-400' };
  return { border: 'border-neutral-800', glow: '', badge: 'bg-neutral-900 border-neutral-700 text-neutral-400' };
}

function statusColor(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'FULFILLED' || s === 'COMPLETED' || s === 'COMPLETE') return 'text-emerald-400 bg-emerald-950/50 border-emerald-700/40';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'text-neutral-500 bg-neutral-900/60 border-neutral-800';
  if (s === 'OPEN') return 'text-sky-400 bg-sky-950/50 border-sky-700/40';
  return 'text-amber-400 bg-amber-950/50 border-amber-700/40';
}

function respondStatusColor(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'accepted') return 'text-emerald-400 bg-emerald-950/50 border-emerald-700/40';
  if (s === 'rejected') return 'text-blood-400 bg-blood-950/50 border-blood-700/40';
  return 'text-amber-400 bg-amber-950/50 border-amber-700/40';
}

function fmtDate(dt: string) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────── component ─────────────────── */
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  type Tab = 'matches' | 'request' | 'my-requests' | 'history';
  const [activeTab, setActiveTab] = useState<Tab>('matches');

  /* data states */
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [recommendedDonors, setRecommendedDonors] = useState<any[]>([]);
  const [recommendedDonations, setRecommendedDonations] = useState<any[]>([]);
  const [donorHistory, setDonorHistory] = useState<DonorHistoryItemDTO[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  /* create-request form */
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.209);
  const [urgency, setUrgency] = useState('Normal');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  /* edit-request modal */
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editUnitsRequired, setEditUnitsRequired] = useState(1);
  const [editHospitalName, setEditHospitalName] = useState('');
  const [editHospitalAddress, setEditHospitalAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLat, setEditLat] = useState(28.6139);
  const [editLon, setEditLon] = useState(77.209);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [isUpdatingReq, setIsUpdatingReq] = useState(false);

  /* ── load all data ── */
  const loadDashboardData = async () => {
    if (!user || !user.profile) return;
    setIsLoadingData(true);
    try {
      const [reqs, matches, donors, history] = await Promise.allSettled([
        receiverAPI.getMyRequests(),
        donorAPI.getRecommendedDonations(),
        receiverAPI.getRecomendedDoners(),
        donorAPI.getBloodRequestHistory(),
      ]);
      if (reqs.status === 'fulfilled') setMyRequests(reqs.value as any[]);
      if (matches.status === 'fulfilled') setRecommendedDonations(matches.value as any[]);
      if (donors.status === 'fulfilled') setRecommendedDonors(donors.value as any[]);
      if (history.status === 'fulfilled') setDonorHistory(history.value as DonorHistoryItemDTO[]);
    } catch (err: any) {
      console.warn('Dashboard data load error:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [user]);

  /* ── coordinate change handlers ── */
  const handleRequestCoordsChange = (newLat: number, newLon: number, newCity?: string, newFullAddress?: string) => {
    setLat(newLat);
    setLon(newLon);
    if (newCity) setCity(newCity);
    if (newFullAddress) setHospitalAddress(newFullAddress);
  };

  const handleEditCoordsChange = (newLat: number, newLon: number, newCity?: string, newFullAddress?: string) => {
    setEditLat(newLat);
    setEditLon(newLon);
    if (newCity) setEditCity(newCity);
    if (newFullAddress) setEditHospitalAddress(newFullAddress);
  };

  /* ── create request ── */
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !hospitalName.trim() || !hospitalAddress.trim() || !city.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setIsSubmittingReq(true);
    try {
      const data: BloodRequestDTO = {
        patientName,
        bloodGroup,
        unitsRequired,
        hospitalName,
        hospitalAddress,
        city,
        latitude: lat,
        longitude: lon,
        urgency,
        description: description.trim() || undefined,
      };
      await receiverAPI.createBloodRequest(data);
      showToast('Blood request posted!', 'success');
      setPatientName(''); setHospitalName(''); setHospitalAddress('');
      setCity(''); setDescription(''); setUnitsRequired(1);
      await loadDashboardData();
      setActiveTab('my-requests');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  /* ── actions on my-requests ── */
  const handleCompleteRequest = async (requestId: string) => {
    try {
      await receiverAPI.completeRequest(requestId);
      showToast('Request marked as completed!', 'success');
      loadDashboardData();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Cancel this blood request?')) return;
    try {
      await receiverAPI.cancelRequest(requestId);
      showToast('Request cancelled.', 'info');
      loadDashboardData();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const startEditingRequest = (req: any) => {
    setEditingRequest(req);
    setEditPatientName(req.patientName || '');
    setEditBloodGroup(req.bloodGroup || 'O+');
    setEditUnitsRequired(req.unitsRequired || 1);
    setEditHospitalName(req.hospitalName || '');
    setEditHospitalAddress(req.hospitalAddress || '');
    setEditCity(req.city || '');
    setEditNotes(req.notes || req.description || '');
    setEditLat(req.latitude || 28.6139);
    setEditLon(req.longitude || 77.209);
    setShowEditLocation(false);
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    if (!editPatientName.trim() || !editHospitalName.trim() || !editCity.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setIsUpdatingReq(true);
    try {
      await receiverAPI.updateBloodRequest({
        requestId: editingRequest.id,
        patientName: editPatientName,
        bloodGroup: editBloodGroup,
        unitsRequired: Math.min(10, Math.max(1, editUnitsRequired)),
        city: editCity,
        hospitalName: editHospitalName,
        hospitalAddress: editHospitalAddress || undefined,
        notes: editNotes.trim() || undefined,
      });
      showToast('Blood request updated!', 'success');
      setEditingRequest(null);
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setIsUpdatingReq(false);
    }
  };
  /* ── donation status update ── */
  const [updatingDonationId, setUpdatingDonationId] = useState<string | null>(null);

  const handleUpdateDonationStatus = async (donationId: string, newStatus: string) => {
    setUpdatingDonationId(donationId);
    try {
      await donorAPI.updateDonationStatus(donationId, newStatus);
      showToast(
        newStatus === 'COMPLETED' ? '🎉 Donation marked as completed! Thank you for saving a life.' :
        newStatus === 'CONTACT_SHARED' ? '📞 Contact shared with patient team.' :
        newStatus === 'IN_PROGRESS' ? '🩸 Donation process started!' :
        newStatus === 'CANCELLED' ? 'Donation cancelled.' : 'Status updated.',
        newStatus === 'CANCELLED' ? 'info' : 'success'
      );
      await loadDashboardData();
    } catch (err: any) {
      // If API isn't built yet, show a friendly note
      showToast(
        err.message?.includes('404') || err.message?.includes('not found')
          ? 'Status update API is not ready yet. Please ask your backend developer to implement POST /api/v1/donor/donation/{id}/status'
          : err.message || 'Failed to update status',
        'error'
      );
    } finally {
      setUpdatingDonationId(null);
    }
  };

  const handleRespondToRequest = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    try {
      await donorAPI.responseDonationById(requestId, status);
      showToast(
        status === 'Accepted'
          ? 'Response submitted — the patient team will be notified!'
          : 'You declined this request.',
        status === 'Accepted' ? 'success' : 'info'
      );
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit response', 'error');
    }
  };

  /* ── profile incomplete gate ── */
  if (!user?.profile || !user.profile.phone) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-panel rounded-3xl p-8 border border-neutral-850 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blood-950/60 border border-blood-500/20 flex items-center justify-center text-blood-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-neutral-100">Activate Your Account</h2>
            <p className="text-sm text-neutral-400">
              Complete your profile and set your location to start requesting blood or viewing donor matches.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            Complete Profile Setup
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'matches',     label: 'Match Recommendations', icon: Heart },
    { id: 'request',     label: 'New Blood Request',     icon: PlusCircle },
    { id: 'my-requests', label: 'My Requests',           icon: History },
    { id: 'history',     label: 'Donor History',         icon: Activity },
  ];

  // A request is still active (editable/cancellable) only when OPEN
  const isActive = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'OPEN';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-100">Welcome, {user.name}</h2>
            <p className="text-xs text-neutral-400 mt-1">
              <MapPin className="inline w-3.5 h-3.5 mr-0.5 text-neutral-500" />
              <span className="text-neutral-200 font-semibold">{user.profile.city}</span>
              &nbsp;·&nbsp; Blood Group:{' '}
              <span className="text-blood-500 font-bold">{user.profile.bloodGroup}</span>
              {user.profile.donorRank && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-400 text-[10px] font-extrabold">
                  ★ {user.profile.donorRank}
                </span>
              )}
              {user.profile.rewardPoints > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-600/30 text-emerald-400 text-[10px] font-extrabold">
                  🏆 {user.profile.rewardPoints} pts
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              title="Refresh data"
              className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-900">
              <span className={`w-2.5 h-2.5 rounded-full ${user.profile.available ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
              <span className="text-xs font-semibold text-neutral-300">
                {user.profile.available ? 'Available to Donate' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap border-b border-neutral-900 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all duration-200 ${
                  isSel
                    ? 'border-blood-600 text-blood-500 bg-blood-950/10'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'my-requests' && myRequests.filter(r => isActive(r.status)).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-blood-600 text-white">
                    {myRequests.filter(r => isActive(r.status)).length}
                  </span>
                )}
                {tab.id === 'matches' && recommendedDonations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-sky-600 text-white">
                    {recommendedDonations.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  TAB: MATCHES                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'matches' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Compatible Requests (For Donors) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blood-500 fill-blood-500/30" />
                    Compatible Requests Near You
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Blood requests matching your donation capability</p>
                </div>
                <span className="bg-blood-950 text-blood-400 text-[10px] font-extrabold px-2 py-1 rounded border border-blood-500/20 uppercase tracking-wider">
                  Donation Feed
                </span>
              </div>

              {isLoadingData ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blood-500" /></div>
              ) : recommendedDonations.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-850 text-center space-y-2">
                  <Heart className="w-8 h-8 text-neutral-700 mx-auto" />
                  <p className="text-sm text-neutral-500">No compatible requests in your area right now.</p>
                  <p className="text-xs text-neutral-600">We'll show them here when they appear.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedDonations.map((req) => (
                    <div
                      key={req.id}
                      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-neutral-850 flex flex-col gap-4 relative overflow-hidden"
                    >
                      {req.urgency === 'Critical' && (
                        <div className="absolute top-0 right-0 px-3 py-0.5 bg-blood-950 border-b border-l border-blood-500/30 rounded-bl-xl text-[9px] font-bold text-blood-400 tracking-wider uppercase">
                          🚨 Critical
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blood-950 border border-blood-500/20 text-base font-extrabold text-blood-500 flex items-center justify-center flex-shrink-0">
                          {req.bloodGroup}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-neutral-200">{req.patientName}</h4>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                            {req.hospitalName}, {req.city}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {req.unitsRequired} unit{req.unitsRequired > 1 ? 's' : ''} needed
                            </span>
                            <span className="flex items-center gap-1 text-blood-400 font-semibold">
                              <MapPin className="w-3 h-3" /> {(req.distanceKm ?? 0).toFixed(1)} km away
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-neutral-850 pt-3">
                        <button
                          onClick={() => handleRespondToRequest(req.id, 'Accepted')}
                          className="flex-1 px-3 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 justify-center"
                        >
                          <Send className="w-3.5 h-3.5" /> Accept & Donate
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(req.id, 'Rejected')}
                          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-neutral-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                          title="Decline this request"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby Donors (For Receivers) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    Available Donors Nearby
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Active compatible donors sorted by proximity</p>
                </div>
                <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-extrabold px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                  Donors List
                </span>
              </div>

              {isLoadingData ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>
              ) : recommendedDonors.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-850 text-center space-y-2">
                  <UserCheck className="w-8 h-8 text-neutral-700 mx-auto" />
                  <p className="text-sm text-neutral-500">No active donors found in your area yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedDonors.map((donor, idx) => (
                    <div
                      key={idx}
                      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-neutral-850 flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-3">
                        {donor.profileUrl ? (
                          <img src={donor.profileUrl} alt={donor.name} className="w-11 h-11 rounded-full object-cover border border-neutral-800 flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-neutral-500" />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-sm font-bold text-neutral-200">{donor.name}</h4>
                            <span className="px-1.5 py-0.5 rounded bg-blood-950 border border-blood-500/20 text-[10px] font-extrabold text-blood-400">
                              {donor.bloodGroup}
                            </span>
                            {donor.donorRank && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/20 text-[9px] font-extrabold text-amber-400">
                                ★ {donor.donorRank}
                              </span>
                            )}
                            {donor.rewardPoints > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-[9px] font-extrabold text-emerald-400">
                                🏆 {donor.rewardPoints} pts
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-neutral-500" />
                            {donor.city} · <span className="text-blood-400 font-semibold">{(donor.distanceKm ?? 0).toFixed(1)} km</span>
                          </p>
                          {donor.healthConditions && (
                            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                              <span className="text-neutral-400 font-semibold">Health: </span>{donor.healthConditions}
                            </p>
                          )}
                        </div>
                      </div>

                      {donor.phone ? (
                        <a
                          href={`tel:${donor.phone}`}
                          className="w-full px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 justify-center"
                        >
                          <Phone className="w-3.5 h-3.5 text-blood-500" /> Call {donor.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-600 italic text-center block py-1">No contact number provided</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  TAB: CREATE REQUEST                                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'request' && (
          <form onSubmit={handleCreateRequest} className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 md:p-8 border border-neutral-850 space-y-5">
              <h3 className="text-lg font-bold text-neutral-100 border-b border-neutral-800 pb-3 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blood-500" /> Patient & Hospital Details
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Patient Name *</label>
                  <input
                    type="text" required value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Units Required (1–20) *</label>
                  <input
                    type="number" required min={1} max={20} value={unitsRequired}
                    onChange={(e) => setUnitsRequired(Number(e.target.value))}
                    className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Required Blood Group *</label>
                  <select
                    value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 font-bold"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Urgency Level *</label>
                  <select
                    value={urgency} onChange={(e) => setUrgency(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Critical">🚨 Critical (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Hospital Name *</label>
                <input
                  type="text" required value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Apollo Hospital Main Branch"
                  className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Hospital Address *</label>
                <input
                  type="text" required value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  placeholder="e.g. Plot 12, Sector 5, Patel Nagar"
                  className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Additional Notes</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Patient condition, contact info, standby requirements..."
                  rows={3} maxLength={300}
                  className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 resize-none"
                />
              </div>

              <button
                type="submit" disabled={isSubmittingReq}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 text-white font-bold rounded-xl shadow-lg hover:shadow-blood-600/30 transition-all duration-200"
              >
                {isSubmittingReq ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : 'Submit Blood Request'}
              </button>
            </div>

            {/* Location Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel rounded-3xl p-6 border border-neutral-850 space-y-4">
                <h3 className="text-lg font-bold text-neutral-100 border-b border-neutral-800 pb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blood-500" /> Hospital Location
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">City *</label>
                  <input
                    type="text" required value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="block w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
                <MapPicker lat={lat} lon={lon} city={city} onChange={handleRequestCoordsChange} />
              </div>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  TAB: MY REQUESTS                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-blood-500" /> Your Blood Requests
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Track status, edit or close your posted requests</p>
              </div>
              <button
                onClick={() => setActiveTab('request')}
                className="px-3 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" /> New Request
              </button>
            </div>

            {isLoadingData ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blood-500" /></div>
            ) : myRequests.length === 0 ? (
              <div className="p-10 rounded-2xl bg-neutral-900/40 border border-neutral-850 text-center space-y-3">
                <PlusCircle className="w-9 h-9 text-neutral-700 mx-auto" />
                <p className="text-sm text-neutral-500">You haven't posted any blood requests yet.</p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="inline-flex px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Create your first request
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`bg-neutral-950 p-5 rounded-2xl border flex flex-col justify-between gap-4 relative overflow-hidden transition-all ${
                      isActive(req.status) ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-900 opacity-80'
                    }`}
                  >
                    {req.urgency === 'Critical' && isActive(req.status) && (
                      <div className="absolute top-0 right-0 px-3 py-0.5 bg-blood-950 border-b border-l border-blood-500/20 rounded-bl-xl text-[9px] font-bold text-blood-400 uppercase tracking-widest">
                        🚨 Critical
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl text-sm font-extrabold flex items-center justify-center ${
                          isActive(req.status) ? 'bg-blood-950 text-blood-500 border border-blood-500/10' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        }`}>
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-200 line-clamp-1">{req.patientName}</h4>
                          <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {req.hospitalName}
                          </p>
                          <p className="text-[10px] text-neutral-500">{req.city}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {req.unitsRequired} unit{req.unitsRequired > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-900 pt-3 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[9px] text-neutral-600 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> {fmtDate(req.requestDate)}
                      </span>

                      {isActive(req.status) && (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleCompleteRequest(req.id)}
                            className="text-[10px] font-bold px-2 py-1 bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-600 text-emerald-400 rounded-lg transition-colors flex items-center gap-0.5"
                          >
                            <CheckCircle className="w-3 h-3" /> Complete
                          </button>
                          <button
                            onClick={() => startEditingRequest(req)}
                            className="text-[10px] font-bold px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg transition-colors flex items-center gap-0.5"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="text-[10px] font-bold px-2 py-1 bg-blood-950/40 border border-blood-800/40 hover:border-blood-600 text-blood-400 rounded-lg transition-colors flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  TAB: DONOR HISTORY                                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" /> Your Donation Activity
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Track every blood donation from acceptance to completion</p>
              </div>
              {donorHistory.length > 0 && (
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-700/30 px-3 py-1.5 rounded-xl">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">
                      {donorHistory.filter(h => isDonationActive(h.status)).length} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-700/30 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      {donorHistory.filter(h => h.status?.toUpperCase() === 'COMPLETED').length} Completed
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Flow Legend */}
            {donorHistory.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-semibold overflow-x-auto pb-1 scrollbar-hide">
                <span className="px-2 py-1 rounded bg-blood-950/40 border border-blood-500/30 text-blood-400 whitespace-nowrap">INITIATED</span>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="px-2 py-1 rounded bg-sky-950/40 border border-sky-500/30 text-sky-400 whitespace-nowrap">CONTACT SHARED</span>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="px-2 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 whitespace-nowrap">IN PROGRESS</span>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 whitespace-nowrap">COMPLETED</span>
              </div>
            )}

            {isLoadingData ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
            ) : donorHistory.length === 0 ? (
              <div className="p-10 rounded-2xl bg-neutral-900/40 border border-neutral-850 text-center space-y-3">
                <Activity className="w-9 h-9 text-neutral-700 mx-auto" />
                <p className="text-sm text-neutral-500">No donation activity yet.</p>
                <p className="text-xs text-neutral-600">Accept a blood request from the Match tab to start your donation journey.</p>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="inline-flex px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  View Available Requests
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {/* Sort: active first, then completed, then cancelled */}
                {[...donorHistory].sort((a, b) => {
                  const rank = (s: string) => isDonationActive(s) ? 0 : s?.toUpperCase() === 'COMPLETED' ? 1 : 2;
                  return rank(a.status) - rank(b.status);
                }).map((item) => {
                  const theme = donationStatusTheme(item.status);
                  const active = isDonationActive(item.status);
                  const stepIdx = donationStepIndex(item.status);
                  const next = nextDonationStatus(item.status);
                  const isCancelled = item.status?.toUpperCase() === 'CANCELLED';
                  const isCompleted = item.status?.toUpperCase() === 'COMPLETED';
                  const isUpdating = updatingDonationId === item.donationId;

                  return (
                    <div
                      key={item.donationId}
                      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 ${
                        active
                          ? `bg-neutral-950 ${theme.border} ${theme.glow}`
                          : 'bg-neutral-950/60 border-neutral-900 opacity-70 hover:opacity-90'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl text-sm font-extrabold flex items-center justify-center flex-shrink-0 ${
                          active ? 'bg-blood-950 border border-blood-500/20 text-blood-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                        }`}>
                          {item.bloodGroup}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-bold line-clamp-1 ${active ? 'text-neutral-100' : 'text-neutral-400'}`}>
                              {item.patientName}
                            </h4>
                            {/* Active pulse dot */}
                            {active && (
                              <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {item.hospitalName || 'Hospital not specified'} · {item.city}
                          </p>
                          {/* People involved */}
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {item.donorName && (
                              <span className="text-[9px] flex items-center gap-0.5 text-neutral-500">
                                <User2 className="w-2.5 h-2.5" /> Donor: <span className="text-neutral-400 font-semibold">{item.donorName}</span>
                              </span>
                            )}
                            {item.requesterName && (
                              <span className="text-[9px] flex items-center gap-0.5 text-neutral-500">
                                <Heart className="w-2.5 h-2.5" /> Patient family: <span className="text-neutral-400 font-semibold">{item.requesterName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Stepper — only for non-cancelled */}
                      {!isCancelled && (
                        <div className="flex items-center gap-0 text-[9px] font-bold">
                          {DONATION_STEPS.map((step, idx) => {
                            const done = idx < stepIdx || isCompleted;
                            const current = idx === stepIdx && !isCompleted;
                            return (
                              <React.Fragment key={step.key}>
                                <div className={`flex flex-col items-center gap-0.5 flex-shrink-0 ${
                                  done || current
                                    ? current ? 'opacity-100' : 'opacity-80'
                                    : 'opacity-30'
                                }`}>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold border ${
                                    isCompleted && idx === 3
                                      ? 'bg-emerald-500 border-emerald-400 text-white'
                                      : done
                                      ? 'bg-neutral-700 border-neutral-600 text-neutral-300'
                                      : current
                                      ? 'bg-blood-600 border-blood-400 text-white animate-pulse'
                                      : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                                  }`}>
                                    {isCompleted && idx === 3 ? '✓' : idx + 1}
                                  </div>
                                  <span className={`whitespace-nowrap ${
                                    current ? 'text-neutral-200' : done ? 'text-neutral-500' : 'text-neutral-700'
                                  }`}>
                                    {step.short}
                                  </span>
                                </div>
                                {idx < DONATION_STEPS.length - 1 && (
                                  <div className={`flex-1 h-px mx-1 mt-[-8px] ${
                                    idx < stepIdx || isCompleted ? 'bg-neutral-600' : 'bg-neutral-800'
                                  }`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}

                      {/* Status Badge + Units */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${theme.badge}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                          <Droplets className="w-2.5 h-2.5" /> {item.unitsRequired} unit{item.unitsRequired > 1 ? 's' : ''}
                        </span>
                        {isCancelled && (
                          <span className="text-[10px] flex items-center gap-0.5 text-neutral-600">
                            <XCircle className="w-2.5 h-2.5" /> Cancelled
                          </span>
                        )}
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {item.acceptedAt && (
                          <span className="text-[9px] text-neutral-600 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-blood-600" /> Accepted: {fmtDate(item.acceptedAt)}
                          </span>
                        )}
                        {item.completedAt && (
                          <span className="text-[9px] text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Completed: {fmtDate(item.completedAt)}
                          </span>
                        )}
                        {item.donationDate && (
                          <span className="text-[9px] text-neutral-600 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> Donation date: {fmtDate(item.donationDate)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons — only for active donations */}
                      {active && (
                        <div className="flex gap-2 border-t border-neutral-900 pt-3">
                          {next && (
                            <button
                              onClick={() => handleUpdateDonationStatus(item.donationId, next)}
                              disabled={isUpdating}
                              className="flex-1 px-3 py-2 bg-blood-600 hover:bg-blood-700 disabled:opacity-60 text-white text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                              {nextDonationLabel(item.status)}
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateDonationStatus(item.donationId, 'CANCELLED')}
                            disabled={isUpdating}
                            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-[11px] font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                            title="Cancel this donation"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      )}

                      {/* Completed congratulation strip */}
                      {isCompleted && (
                        <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-700/30 rounded-xl px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <p className="text-[11px] text-emerald-400 font-semibold">Donation completed! You may have saved a life. 🙏</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  EDIT REQUEST MODAL                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center sticky top-0 bg-neutral-950 z-10 rounded-t-3xl">
              <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blood-500" /> Edit Blood Request
              </h3>
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                className="text-neutral-500 hover:text-neutral-300 p-1.5 hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRequest} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Patient Name *</label>
                  <input
                    type="text" required value={editPatientName}
                    onChange={(e) => setEditPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Units Required (1–10) *</label>
                  <input
                    type="number" required min={1} max={10} value={editUnitsRequired}
                    onChange={(e) => setEditUnitsRequired(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Blood Group *</label>
                  <select
                    value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 font-bold"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">City *</label>
                  <input
                    type="text" required value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Hospital Name *</label>
                <input
                  type="text" required value={editHospitalName}
                  onChange={(e) => setEditHospitalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Hospital Address</label>
                <input
                  type="text" value={editHospitalAddress}
                  onChange={(e) => setEditHospitalAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Notes</label>
                <textarea
                  value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-blood-500 resize-none"
                />
              </div>

              {/* Optional: Update Location */}
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEditLocation(!showEditLocation)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/60 hover:bg-neutral-900 text-sm font-semibold text-neutral-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blood-500" />
                    Update Location (Optional)
                  </span>
                  <span className="text-xs text-neutral-500">{showEditLocation ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showEditLocation && (
                  <div className="p-4 space-y-3 bg-neutral-950/60">
                    <p className="text-xs text-neutral-500">
                      Search for the hospital location or use GPS to update coordinates. City field above will auto-fill.
                    </p>
                    <MapPicker
                      lat={editLat}
                      lon={editLon}
                      city={editCity}
                      onChange={handleEditCoordsChange}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isUpdatingReq}
                  className="flex-1 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  {isUpdatingReq ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
