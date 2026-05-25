import React, { useState } from 'react';
import { MapPin, Navigation, Locate, Search, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

interface MapPickerProps {
  lat: number;
  lon: number;
  city: string;
  onChange: (lat: number, lon: number, city?: string, fullAddress?: string) => void;
}

const CITY_PRESETS = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
];

const LOCAL_CITY_DB: { [key: string]: { lat: number; lon: number; name: string } } = {
  'delhi': { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
  'new delhi': { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
  'patel nagar': { lat: 28.6450, lon: 77.1693, name: 'Patel Nagar, Delhi' },
  'connaught place': { lat: 28.6304, lon: 77.2177, name: 'Connaught Place, Delhi' },
  'dwarka': { lat: 28.5823, lon: 77.0500, name: 'Dwarka, Delhi' },
  'rohini': { lat: 28.7041, lon: 77.1025, name: 'Rohini, Delhi' },
  'karol bagh': { lat: 28.6514, lon: 77.1907, name: 'Karol Bagh, Delhi' },
  'lajpat nagar': { lat: 28.5685, lon: 77.2407, name: 'Lajpat Nagar, Delhi' },
  'noida': { lat: 28.5355, lon: 77.3910, name: 'Noida, Uttar Pradesh' },
  'gurgaon': { lat: 28.4595, lon: 77.0266, name: 'Gurugram, Haryana' },
  'gurugram': { lat: 28.4595, lon: 77.0266, name: 'Gurugram, Haryana' },
  'ghaziabad': { lat: 28.6692, lon: 77.4538, name: 'Ghaziabad, Uttar Pradesh' },
  'faridabad': { lat: 28.4089, lon: 77.3178, name: 'Faridabad, Haryana' },
  'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai, Maharashtra' },
  'thane': { lat: 19.2183, lon: 72.9781, name: 'Thane, Maharashtra' },
  'navi mumbai': { lat: 19.0330, lon: 73.0297, name: 'Navi Mumbai, Maharashtra' },
  'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' },
  'bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
  'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai, Tamil Nadu' },
  'kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata, West Bengal' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, Telangana' },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad, Gujarat' },
  'surat': { lat: 21.1702, lon: 72.8311, name: 'Surat, Gujarat' },
  'jaipur': { lat: 26.9124, lon: 75.7873, name: 'Jaipur, Rajasthan' },
  'lucknow': { lat: 26.8467, lon: 80.9462, name: 'Lucknow, Uttar Pradesh' },
  'kanpur': { lat: 26.4499, lon: 80.3319, name: 'Kanpur, Uttar Pradesh' },
  'nagpur': { lat: 21.1458, lon: 79.0882, name: 'Nagpur, Maharashtra' },
  'indore': { lat: 22.7196, lon: 75.8577, name: 'Indore, Madhya Pradesh' },
  'bhopal': { lat: 23.2599, lon: 77.4126, name: 'Bhopal, Madhya Pradesh' },
  'patna': { lat: 25.5941, lon: 85.1376, name: 'Patna, Bihar' },
  'ranchi': { lat: 23.3441, lon: 85.3096, name: 'Ranchi, Jharkhand' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, name: 'Chandigarh' },
  'dehradun': { lat: 30.3165, lon: 78.0322, name: 'Dehradun, Uttarakhand' },
  'shimla': { lat: 31.1048, lon: 77.1734, name: 'Shimla, Himachal Pradesh' },
  'srinagar': { lat: 34.0837, lon: 74.7973, name: 'Srinagar, Jammu & Kashmir' },
  'jammu': { lat: 32.7266, lon: 74.8570, name: 'Jammu, Jammu & Kashmir' },
  'raipur': { lat: 21.2514, lon: 81.6296, name: 'Raipur, Chhattisgarh' },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245, name: 'Bhubaneswar, Odisha' },
  'guwahati': { lat: 26.1445, lon: 91.7362, name: 'Guwahati, Assam' },
  'coimbatore': { lat: 11.0168, lon: 76.9558, name: 'Coimbatore, Tamil Nadu' },
  'kochi': { lat: 9.9312, lon: 76.2673, name: 'Kochi, Kerala' },
  'trivandrum': { lat: 8.5241, lon: 76.9366, name: 'Thiruvananthapuram, Kerala' },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366, name: 'Thiruvananthapuram, Kerala' },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185, name: 'Visakhapatnam, Andhra Pradesh' },
  'vijayawada': { lat: 16.5062, lon: 80.6480, name: 'Vijayawada, Andhra Pradesh' },
};

const getCoordinatesByPincode = (pincode: string): { lat: number; lon: number; name: string } | null => {
  const prefix = pincode.trim().slice(0, 2);
  const codeMap: { [key: string]: { lat: number; lon: number; name: string } } = {
    '11': { lat: 28.6139, lon: 77.2090, name: 'Delhi NCR' },
    '12': { lat: 28.4595, lon: 77.0266, name: 'Haryana (Gurgaon Region)' },
    '13': { lat: 30.3752, lon: 76.7821, name: 'Haryana (Ambala Region)' },
    '14': { lat: 30.9010, lon: 75.8573, name: 'Punjab (Ludhiana Region)' },
    '15': { lat: 30.2100, lon: 74.9400, name: 'Punjab (Bathinda Region)' },
    '16': { lat: 30.7333, lon: 76.7794, name: 'Chandigarh Region' },
    '17': { lat: 31.1048, lon: 77.1734, name: 'Himachal Pradesh' },
    '18': { lat: 32.7266, lon: 74.8570, name: 'Jammu & Kashmir' },
    '19': { lat: 34.0837, lon: 74.7973, name: 'Kashmir (Srinagar Region)' },
    '20': { lat: 28.6692, lon: 77.4538, name: 'Uttar Pradesh (Ghaziabad Region)' },
    '21': { lat: 25.4358, lon: 81.8463, name: 'Uttar Pradesh (Allahabad Region)' },
    '22': { lat: 26.8467, lon: 80.9462, name: 'Uttar Pradesh (Lucknow Region)' },
    '23': { lat: 26.2183, lon: 78.1828, name: 'Madhya Pradesh (Gwalior Region)' },
    '24': { lat: 28.3649, lon: 79.4124, name: 'Uttar Pradesh (Bareilly Region)' },
    '25': { lat: 28.9845, lon: 77.7064, name: 'Uttar Pradesh (Meerut Region)' },
    '26': { lat: 30.3165, lon: 78.0322, name: 'Uttarakhand (Dehradun Region)' },
    '27': { lat: 26.7606, lon: 83.3731, name: 'Uttar Pradesh (Gorakhpur Region)' },
    '28': { lat: 27.1767, lon: 78.0081, name: 'Uttar Pradesh (Agra Region)' },
    '30': { lat: 26.9124, lon: 75.7873, name: 'Rajasthan (Jaipur Region)' },
    '31': { lat: 24.5854, lon: 73.7125, name: 'Rajasthan (Udaipur Region)' },
    '32': { lat: 25.2138, lon: 75.8648, name: 'Rajasthan (Kota Region)' },
    '33': { lat: 27.8974, lon: 78.0880, name: 'Rajasthan (Bikaner/Aligarh Region)' },
    '34': { lat: 26.2389, lon: 73.0243, name: 'Rajasthan (Jodhpur Region)' },
    '36': { lat: 22.3039, lon: 70.8022, name: 'Gujarat (Rajkot Region)' },
    '37': { lat: 22.2587, lon: 71.1924, name: 'Gujarat (Kutch/Saurashtra Region)' },
    '38': { lat: 23.0225, lon: 72.5714, name: 'Gujarat (Ahmedabad Region)' },
    '39': { lat: 21.1702, lon: 72.8311, name: 'Gujarat (Surat Region)' },
    '40': { lat: 19.0760, lon: 72.8777, name: 'Maharashtra (Mumbai Region)' },
    '41': { lat: 18.5204, lon: 73.8567, name: 'Maharashtra (Pune Region)' },
    '42': { lat: 19.9975, lon: 73.7898, name: 'Maharashtra (Nashik Region)' },
    '43': { lat: 19.8762, lon: 75.3433, name: 'Maharashtra (Aurangabad Region)' },
    '44': { lat: 21.1458, lon: 79.0882, name: 'Maharashtra (Nagpur Region)' },
    '45': { lat: 22.7196, lon: 75.8577, name: 'Madhya Pradesh (Indore Region)' },
    '46': { lat: 22.9734, lon: 78.6569, name: 'Madhya Pradesh (Central)' },
    '47': { lat: 23.2599, lon: 77.4126, name: 'Madhya Pradesh (Bhopal Region)' },
    '48': { lat: 23.1815, lon: 79.9864, name: 'Madhya Pradesh (Jabalpur Region)' },
    '49': { lat: 21.2514, lon: 81.6296, name: 'Chhattisgarh (Raipur Region)' },
    '50': { lat: 17.3850, lon: 78.4867, name: 'Telangana (Hyderabad Region)' },
    '51': { lat: 16.3067, lon: 80.4365, name: 'Andhra Pradesh (Guntur Region)' },
    '52': { lat: 16.5062, lon: 80.6480, name: 'Andhra Pradesh (Vijayawada Region)' },
    '53': { lat: 17.6868, lon: 83.2185, name: 'Andhra Pradesh (Visakhapatnam)' },
    '56': { lat: 12.9716, lon: 77.5946, name: 'Karnataka (Bengaluru Region)' },
    '57': { lat: 12.2958, lon: 76.6394, name: 'Karnataka (Mysore Region)' },
    '58': { lat: 15.3647, lon: 75.1240, name: 'Karnataka (Hubli Region)' },
    '59': { lat: 15.8497, lon: 74.4977, name: 'Karnataka (Belgaum Region)' },
    '60': { lat: 13.0827, lon: 80.2707, name: 'Tamil Nadu (Chennai Region)' },
    '61': { lat: 11.9416, lon: 79.8083, name: 'Pondicherry/Cuddalore Region' },
    '62': { lat: 9.9252, lon: 78.1198, name: 'Tamil Nadu (Madurai Region)' },
    '63': { lat: 11.0168, lon: 76.9558, name: 'Tamil Nadu (Coimbatore Region)' },
    '64': { lat: 11.6643, lon: 78.1460, name: 'Tamil Nadu (Salem Region)' },
    '67': { lat: 9.9312, lon: 76.2673, name: 'Kerala (Kochi Region)' },
    '68': { lat: 11.2588, lon: 75.7804, name: 'Kerala (Kozhikode Region)' },
    '69': { lat: 8.5241, lon: 76.9366, name: 'Kerala (Trivandrum Region)' },
    '70': { lat: 22.5726, lon: 88.3639, name: 'West Bengal (Kolkata Region)' },
    '71': { lat: 22.5769, lon: 88.3186, name: 'West Bengal (Howrah Region)' },
    '72': { lat: 22.9786, lon: 88.4323, name: 'West Bengal (Kalyani Region)' },
    '73': { lat: 26.7271, lon: 88.3953, name: 'West Bengal (Siliguri Region)' },
    '74': { lat: 23.3441, lon: 85.3096, name: 'Jharkhand (Ranchi Region)' },
    '75': { lat: 20.2961, lon: 85.8245, name: 'Odisha (Bhubaneswar Region)' },
    '76': { lat: 21.4984, lon: 83.9877, name: 'Odisha (Sambalpur Region)' },
    '77': { lat: 22.0100, lon: 85.0000, name: 'Odisha (Rourkela Region)' },
    '78': { lat: 26.1445, lon: 91.7362, name: 'Assam & North East (Guwahati)' },
    '79': { lat: 23.8315, lon: 91.2868, name: 'Tripura (Agartala Region)' },
    '80': { lat: 25.5941, lon: 85.1376, name: 'Bihar (Patna Region)' },
    '81': { lat: 26.1800, lon: 85.9000, name: 'Bihar (Darbhanga Region)' },
    '82': { lat: 25.0961, lon: 85.3131, name: 'Bihar (Nalanda Region)' },
    '83': { lat: 23.7957, lon: 86.4304, name: 'Jharkhand (Dhanbad Region)' },
    '84': { lat: 24.3000, lon: 86.7000, name: 'Jharkhand (Deoghar Region)' },
    '85': { lat: 25.2425, lon: 86.9842, name: 'Bihar (Bhagalpur Region)' },
  };
  return codeMap[prefix] || null;
};

const parseLocationInput = (input: string): { lat: number; lon: number } | null => {
  const clean = input.trim();
  
  // 1. Check if raw coordinates like "28.6450, 77.1692"
  const rawMatch = clean.match(/^[-+]?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?)\s*,\s*[-+]?(180(?:\.0+)?|(?:1[0-7]\d|[1-9]?\d)(?:\.\d+)?)$/);
  if (rawMatch) {
    return { lat: parseFloat(rawMatch[1]), lon: parseFloat(rawMatch[2]) };
  }

  // 2. Check if Google Maps URL with @lat,lon
  const atMatch = clean.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
  }

  // 3. Check if Google Maps URL with q=lat,lon or ll=lat,lon
  const qMatch = clean.match(/(?:q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) };
  }

  // 4. Check if direct coordinates in path like /maps/.../28.6441,77.1623
  const pathMatch = clean.match(/\/maps\/[^\/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (pathMatch) {
    return { lat: parseFloat(pathMatch[1]), lon: parseFloat(pathMatch[2]) };
  }

  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ lat, lon, city, onChange }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounce autocomplete search as user types
  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    // Skip autocomplete if it's a URL or raw coordinates
    if (
      searchQuery.includes('http') || 
      searchQuery.includes('maps.') || 
      /^-?\d+\./.test(searchQuery) || 
      /^\d{6}$/.test(searchQuery)
    ) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&addressdetails=1&limit=5&email=devloperindia03@gmail.com`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data);
          setErrorMsg('');
        }
      } catch (err) {
        console.warn("Autocomplete fetch failed:", err);
      }
    }, 600); // 600ms debounce to comply with Nominatim's strict usage limits

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // We mock a local region representing standard Indian mapping coordinates
  // Lat: 8 to 36, Lon: 68 to 98
  const latMin = 8;
  const latMax = 36;
  const lonMin = 68;
  const lonMax = 98;

  // Calculate percentages for SVG positioning
  const getPercentX = (longitude: number) => {
    const pct = ((longitude - lonMin) / (lonMax - lonMin)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const getPercentY = (latitude: number) => {
    // Latitude decreases as you go down on screen
    const pct = (1 - (latitude - latMin) / (latMax - latMin)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Helper to extract city name from Nominatim address object
  const getCityName = (address: any, displayName: string): string => {
    if (!address) return displayName.split(',')[0];
    return (
      address.neighbourhood ||
      address.suburb ||
      address.village ||
      address.town ||
      address.city_district ||
      address.city ||
      address.county ||
      address.state ||
      displayName.split(',')[0]
    );
  };

  // Convert click coordinates back to Lat/Lon
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pctX = x / rect.width;
    const pctY = 1 - y / rect.height; // invert Y

    const newLon = lonMin + pctX * (lonMax - lonMin);
    const newLat = latMin + pctY * (latMax - latMin);

    // Round to 4 decimal places
    const roundedLat = Math.round(newLat * 10000) / 10000;
    const roundedLon = Math.round(newLon * 10000) / 10000;

    // Detect closest city name (if within 1.5 degrees, suggest it immediately)
    let closestPreset = '';
    let minDist = 1.5;
    CITY_PRESETS.forEach(preset => {
      const dist = Math.sqrt(Math.pow(preset.lat - roundedLat, 2) + Math.pow(preset.lon - roundedLon, 2));
      if (dist < minDist) {
        minDist = dist;
        closestPreset = preset.name;
      }
    });

    onChange(roundedLat, roundedLon, closestPreset || undefined);

    // Also trigger online reverse geocoding in background to get precise city name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLon}&addressdetails=1&email=devloperindia03@gmail.com`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const preciseCity = getCityName(data.address, data.display_name);
          onChange(roundedLat, roundedLon, preciseCity, data.display_name);
        }
      })
      .catch(err => {
        console.warn("Background reverse geocode failed:", err);
      });
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setErrorMsg('');

    // Give device enough time (15s) to acquire a real GPS satellite lock
    // instead of falling back to network/IP location (which is district-level)
    const optionsHigh = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
    const optionsLow = { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 };

    const finishDetect = () => setIsDetecting(false);

    const successCallback = (position: GeolocationPosition) => {
      const curLat = Math.round(position.coords.latitude * 10000) / 10000;
      const curLon = Math.round(position.coords.longitude * 10000) / 10000;
      const accuracyM = Math.round(position.coords.accuracy);
      console.log(`GPS lock: lat=${curLat}, lon=${curLon}, accuracy=±${accuracyM}m`);

      // Set coords immediately so user sees something
      onChange(curLat, curLon);

      // Reverse geocode to get precise neighbourhood/area name
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${curLat}&lon=${curLon}&addressdetails=1&zoom=18&email=devloperindia03@gmail.com`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const preciseCity = getCityName(data.address, data.display_name);
            onChange(curLat, curLon, preciseCity, data.display_name);
          }
        })
        .catch(err => console.error('Reverse geocoding error:', err))
        .finally(finishDetect);
    };

    const errorCallbackHigh = (err: GeolocationPositionError) => {
      console.warn('High accuracy GPS failed, retrying with network location...', err.message);
      navigator.geolocation.getCurrentPosition(
        successCallback,
        (errLow) => {
          console.error('Network location also failed:', errLow.message);
          finishDetect();
          setErrorMsg(`Location failed (${errLow.message}). Try searching your city name above.`);
        },
        optionsLow
      );
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallbackHigh, optionsHigh);
  };

  // Address search lookup — called via button click or Enter key (NOT a form submit)
  // IMPORTANT: MapPicker must NOT use <form> internally because it is rendered
  // inside parent forms in Dashboard and Profile. Nested forms cause the outer
  // form to submit (page refresh) when Enter is pressed.
  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query is a coordinate string or Google Maps URL
    const parsedCoords = parseLocationInput(query);
    if (parsedCoords) {
      setIsSearching(true);
      setErrorMsg('');
      setSearchResults([]);
      const targetLat = Math.round(parsedCoords.lat * 10000) / 10000;
      const targetLon = Math.round(parsedCoords.lon * 10000) / 10000;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLon}&addressdetails=1&email=devloperindia03@gmail.com`
        );
        const data = await res.json();
        if (data && data.address) {
          const cityName = getCityName(data.address, data.display_name);
          onChange(targetLat, targetLon, cityName, data.display_name);
          showToast('Location coordinates parsed successfully!', 'success');
        } else {
          onChange(targetLat, targetLon, 'Selected Coordinate', 'Pasted Location Coordinates');
        }
        setSearchQuery('');
      } catch (err) {
        console.warn("Reverse geocode failed for coordinates query:", err);
        onChange(targetLat, targetLon, 'Selected Coordinate', 'Pasted Location Coordinates');
        setSearchQuery('');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // Check if query is a short URL from Google Maps (maps.app.goo.gl)
    if (query.includes('maps.app.goo.gl')) {
      showToast('For mobile Google Maps short links, please paste coordinates or full address instead.', 'info');
      setErrorMsg('Short maps URLs are blocked by browser security. Paste coordinates.');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');
    setSearchResults([]);

    const isPinCode = /^\d{6}$/.test(query);

    try {
      let data: any[] = [];

      if (isPinCode) {
        // 1. Try Nominatim by postalcode first
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&postalcode=${query}&countrycodes=in&addressdetails=1&limit=5&email=devloperindia03@gmail.com`
          );
          data = await res.json();
        } catch (err) {
          console.warn("OSM Postal code fetch failed, trying text query...", err);
        }

        // 2. If postalcode search yielded nothing, try standard text search on PIN
        if (!data || data.length === 0) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&addressdetails=1&limit=5&email=devloperindia03@gmail.com`
            );
            data = await res.json();
          } catch (err) {
            console.warn("OSM Text PIN fetch failed...", err);
          }
        }

        // 3. Fallback to Postal PIN Code API
        if (!data || data.length === 0) {
          try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${query}`);
            const pinInfo = await res.json();
            if (pinInfo && pinInfo[0] && pinInfo[0].Status === 'Success' && pinInfo[0].PostOffice) {
              const office = pinInfo[0].PostOffice[0];
              const resolvedText = `${office.Name}, ${office.District}, ${office.State}, India`;
              // Try geocoding the postal address returned by PIN code API
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(resolvedText)}&countrycodes=in&addressdetails=1&limit=3&email=devloperindia03@gmail.com`
              );
              data = await geoRes.json();
              
              if (!data || data.length === 0) {
                // If geocoder failed but PIN API succeeded, create a manual result using local coordinates mapping as fallback
                const fallbackCoords = getCoordinatesByPincode(query);
                if (fallbackCoords) {
                  data = [{
                    display_name: `${query} - ${resolvedText} (Approx Fallback)`,
                    lat: fallbackCoords.lat.toString(),
                    lon: fallbackCoords.lon.toString(),
                    address: {
                      city: office.District || office.State || 'India'
                    }
                  }];
                }
              }
            }
          } catch (err) {
            console.warn("Postal PIN Code API call failed...", err);
          }
        }

        // 4. Fallback to local coordinates mapping by PIN prefix directly
        if (!data || data.length === 0) {
          const fallbackCoords = getCoordinatesByPincode(query);
          if (fallbackCoords) {
            data = [{
              display_name: `${query} - ${fallbackCoords.name} (Offline Fallback)`,
              lat: fallbackCoords.lat.toString(),
              lon: fallbackCoords.lon.toString(),
              address: {
                city: fallbackCoords.name
              }
            }];
          }
        }

      } else {
        // Text search (e.g. "delhi patel nagar")
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5&email=devloperindia03@gmail.com`
          );
          data = await res.json();
        } catch (err) {
          console.warn("OSM Search query failed, trying local DB...", err);
        }

        // Fallback to local city database search
        if (!data || data.length === 0) {
          const queryLower = query.toLowerCase();
          const matches = Object.keys(LOCAL_CITY_DB)
            .filter(key => key.includes(queryLower) || queryLower.includes(key))
            .map(key => {
              const item = LOCAL_CITY_DB[key];
              return {
                display_name: `${item.name} (Offline Fallback)`,
                lat: item.lat.toString(),
                lon: item.lon.toString(),
                address: {
                  city: item.name
                }
              };
            });
          
          if (matches.length > 0) {
            data = matches.slice(0, 5);
          }
        }
      }

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setErrorMsg('No location matches found. Try searching with city/area name.');
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Geocoding lookup error:", err);
      setErrorMsg('Search failed. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: any) => {
    const itemLat = Math.round(parseFloat(item.lat) * 10000) / 10000;
    const itemLon = Math.round(parseFloat(item.lon) * 10000) / 10000;
    const cityName = getCityName(item.address, item.display_name);

    onChange(itemLat, itemLon, cityName, item.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const activeX = getPercentX(lon);
  const activeY = getPercentY(lat);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-neutral-200 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-blood-500" />
            Location Coordinates Selection
          </h4>
          <p className="text-xs text-neutral-400">Search city, auto-detect, or click the grid</p>
        </div>
      </div>

      {/* Realtime Search & Geolocation tools */}
      {/* NOTE: Using div (not form) to avoid nested-form page-refresh bug */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit();
                }
              }}
              placeholder="Search exact area, sector, city..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500"
            />
            {/* Search Results Dropdown List */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-neutral-900 shadow-2xl z-50">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-900 text-neutral-300 transition-colors line-clamp-2 block"
                  >
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-blood-500" />
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isSearching}
            className="px-4 py-2.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-850 text-neutral-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center min-w-[70px]"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
          
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="px-3.5 py-2.5 bg-blood-600/10 hover:bg-blood-600/25 border border-blood-500/20 text-blood-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 justify-center"
            title="Auto-detect current location"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Locate className="w-3.5 h-3.5" />
            )}
            <span>GPS</span>
          </button>
        </div>

        {/* Error message displays */}
        {errorMsg && (
          <div className="text-[10px] text-blood-400 font-semibold px-1">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Preset Cities */}
      <div className="flex flex-wrap gap-1.5">
        {CITY_PRESETS.map((preset) => {
          const isSelected = city.toLowerCase() === preset.name.toLowerCase();
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.lat, preset.lon, preset.name)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-blood-950/40 border-blood-600 text-blood-400 font-bold'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Coordinates readout HUD */}
      <div className="flex justify-between items-center gap-2 text-xs bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-850 font-mono">
        <div className="text-neutral-400">
          Detected City: <span className="text-neutral-200 font-bold font-sans">{city || 'None Selected'}</span>
        </div>
        <div className="flex gap-2">
          <div className="bg-neutral-950 px-2 py-1 rounded border border-neutral-850 text-neutral-300">
            Lat: {lat.toFixed(4)}
          </div>
          <div className="bg-neutral-950 px-2 py-1 rounded border border-neutral-850 text-neutral-300">
            Lon: {lon.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Interactive Map Grid */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-850 group">
        {/* Dynamic Glowing background representing city grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Highlight points for presets */}
        {CITY_PRESETS.map((preset) => {
          const px = getPercentX(preset.lon);
          const py = getPercentY(preset.lat);
          return (
            <div
              key={`preset-point-${preset.name}`}
              className="absolute w-2 h-2 rounded-full bg-neutral-700/80 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${px}%`, top: `${py}%` }}
              title={preset.name}
            >
              <span className="absolute left-3 -top-2 text-[9px] font-semibold text-neutral-500 group-hover:text-neutral-400 transition-colors whitespace-nowrap">
                {preset.name}
              </span>
            </div>
          );
        })}

        {/* Selected Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-10"
          style={{ left: `${activeX}%`, top: `${activeY}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-blood-500/30 animate-ping"></span>
            <MapPin className="w-6 h-6 text-blood-500 drop-shadow-[0_0_8px_rgba(229,28,28,0.7)]" />
          </div>
        </div>

        {/* Interactive SVG overlay */}
        <svg
          onClick={handleMapClick}
          className="absolute inset-0 w-full h-full cursor-crosshair animate-fade-in"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Subtle grid lines for high-tech aesthetic */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="#1f2937" strokeWidth="0.1" strokeDasharray="1,1" />
        </svg>

        {/* Visual outline signature */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-800/80 text-[9px] text-neutral-500 uppercase font-mono">
          Visual Coordinate Grid
        </div>
      </div>
    </div>
  );
};
export default MapPicker;
