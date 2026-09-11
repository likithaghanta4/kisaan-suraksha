/**
 * AgriRaksha AI — Weather & Geocoding Service
 * 
 * Hyperlocal meteorological service using Open-Meteo APIs:
 * 1. Open-Meteo Geocoding API: Converts Village + District + State + India -> Exact Latitude & Longitude (with District Fallback)
 * 2. Open-Meteo Forecast API: Real-time current weather & 5-day agro-meteorological forecast
 * 3. Dynamic Agricultural Spraying Suitability advisory engine based on real wind, rain probability & humidity.
 */

import axios from 'axios';

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
  locationType: 'village' | 'district_fallback' | 'state_fallback' | 'default';
  village?: string;
  district?: string;
  state?: string;
  admin1?: string;
  admin2?: string;
}

export interface DayForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  precipitationSum: number;
  condition: string;
  conditionLocal: string;
  icon: string;
  spraySuitability: 'optimal' | 'moderate' | 'unfavorable';
  sprayBadge: string;
  sprayWindow: string;
  sprayNote: string;
  isSafe: boolean;
}

export interface LiveWeatherData {
  location: string;
  locationType: 'village' | 'district_fallback' | 'state_fallback' | 'default';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    windDegrees: number;
    precipitation: number;
    rainProb: number;
    uvIndex: number;
    condition: string;
    conditionLocal: string;
    icon: string;
  };
  sprayToday: DayForecast;
  forecast: DayForecast[];
  sprayAdvisory: {
    isSafe: boolean;
    status: 'suitable' | 'caution' | 'avoid';
    badge: string;
    message: string;
    bestWindow: string;
  };
}

// WMO Weather interpretation codes
const WMO_MAP: Record<number, { label: string; icon: string; local: string }> = {
  0: { label: 'Clear Sky', icon: '☀️', local: 'निरभ्र आकाश / నిర్మలమైన ఆకాశం' },
  1: { label: 'Mainly Clear', icon: '🌤️', local: 'प्रामुख्याने निरभ्र / ఎక్కువగా నిర్మలం' },
  2: { label: 'Partly Cloudy', icon: '⛅', local: 'हळूहळू ढगाळ / పాక్షికంగా మేఘావృతం' },
  3: { label: 'Overcast & Cloudy', icon: '☁️', local: 'ढगाळ हवामान / మేఘావృతం' },
  45: { label: 'Foggy', icon: '🌫️', local: 'धुके / పొగమంచు' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️', local: 'दाट धुके / దట్టమైన పొగమంచు' },
  51: { label: 'Light Drizzle', icon: '🌦️', local: 'हलका पाऊस / చిరుజల్లులు' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', local: 'रिमझिम पाऊस / జల్లులు' },
  55: { label: 'Dense Drizzle', icon: '🌧️', local: 'सतत पाऊस / మోస్తరు జల్లులు' },
  61: { label: 'Slight Rain', icon: '🌦️', local: 'हलक्या सरी / తేలికపాటి వర్షం' },
  63: { label: 'Moderate Rain', icon: '🌧️', local: 'मध्यम पाऊस / వర్షం' },
  65: { label: 'Heavy Rain', icon: '🌧️', local: 'मुसळधार पाऊस / భారీ వర్షం' },
  71: { label: 'Slight Snow', icon: '🌨️', local: 'हलकी हिमवृष्टी / తేలికపాటి మంచు' },
  73: { label: 'Moderate Snow', icon: '🌨️', local: 'मध्यम हिमवृष्टी / మంచు కురవడం' },
  75: { label: 'Heavy Snow', icon: '🌨️', local: 'मुसळधार बर्फ / భారీ మంచు' },
  80: { label: 'Rain Showers', icon: '🌦️', local: 'पावसाच्या सरी / వర్షపు జల్లులు' },
  81: { label: 'Moderate Showers', icon: '🌧️', local: 'मध्यम सरी / మోస్తరు జల్లులు' },
  82: { label: 'Violent Showers', icon: '⛈️', local: 'वादळी पाऊस / తీవ్రమైన వర్షం' },
  95: { label: 'Thunderstorm', icon: '⛈️', local: 'विजांसह पाऊस / ఉరుములతో కూడిన వర్షం' },
  96: { label: 'Thunderstorm with Hail', icon: '⛈️', local: 'गारपिटीसह वादळ / వడగండ్ల వాన' },
  99: { label: 'Severe Thunderstorm', icon: '⛈️', local: 'तीव्र वादळ / భీకర ఉరుముల వాన' },
};

function getWmoDetails(code: number) {
  return WMO_MAP[code] || { label: 'Partly Cloudy', icon: '⛅', local: 'हळूहळू ढगाळ / పాక్షికంగా మేఘావృతం' };
}

function degreesToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

function normalize(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/district|dist|dt|mandal|taluka/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// In-memory caching
const geocodeCache = new Map<string, { data: GeocodedLocation; timestamp: number }>();
const weatherCache = new Map<string, { data: LiveWeatherData; timestamp: number }>();
const GEOCODE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const WEATHER_CACHE_TTL = 10 * 60 * 1000;      // 10 minutes

export class WeatherService {
  /**
   * Geocodes a farmer's village, district, state into latitude & longitude.
   * Prioritizes exact village-level coordinates in India.
   * If village is not resolvable, falls back to district-level coordinates.
   */
  async geocodeLocation(village?: string, district?: string, state?: string): Promise<GeocodedLocation> {
    const cleanVillage = village?.trim();
    const cleanDistrict = district?.trim();
    const cleanState = state?.trim();

    const cacheKey = `${normalize(cleanVillage)}_${normalize(cleanDistrict)}_${normalize(cleanState)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GEOCODE_CACHE_TTL) {
      return cached.data;
    }

    const normVillage = normalize(cleanVillage);
    const normDistrict = normalize(cleanDistrict);
    const normState = normalize(cleanState);

    // 1. Try exact village geocoding
    if (cleanVillage) {
      try {
        const vUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanVillage)}&count=15&language=en&format=json`;
        const res = await axios.get(vUrl, {
          timeout: 8000,
          headers: { 'User-Agent': 'AgriRaksha-AI/1.0' },
        });

        const results = (res.data?.results || []) as any[];
        const inResults = results.filter(
          (r) => r.country_code === 'IN' || (r.country && r.country.toLowerCase().includes('india'))
        );

        // Highest confidence: village name + state matches + district matches
        const exactMatch = inResults.find((r) => {
          const rState = normalize(r.admin1);
          const rDist = normalize(r.admin2) + normalize(r.admin3);
          const stateMatches = !normState || rState.includes(normState) || normState.includes(rState);
          const distMatches = !normDistrict || rDist.includes(normDistrict) || normDistrict.includes(normalize(r.admin2));
          return stateMatches && distMatches;
        });

        if (exactMatch) {
          const locationName = `${exactMatch.name}, ${exactMatch.admin2 || cleanDistrict || ''}, ${exactMatch.admin1 || cleanState || 'India'}`
            .replace(/,\s*,/g, ',')
            .replace(/^,\s*|,\s*$/g, '');

          const result: GeocodedLocation = {
            latitude: exactMatch.latitude,
            longitude: exactMatch.longitude,
            locationName,
            locationType: 'village',
            village: exactMatch.name,
            district: exactMatch.admin2 || cleanDistrict,
            state: exactMatch.admin1 || cleanState,
            admin1: exactMatch.admin1,
            admin2: exactMatch.admin2,
          };
          geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }

        // Secondary match: village name + state matches
        const stateMatch = inResults.find((r) => {
          const rState = normalize(r.admin1);
          return !normState || rState.includes(normState) || normState.includes(rState);
        });

        if (stateMatch) {
          const locationName = `${stateMatch.name}, ${cleanDistrict ? cleanDistrict + ', ' : ''}${stateMatch.admin1 || cleanState || 'India'}`;
          const result: GeocodedLocation = {
            latitude: stateMatch.latitude,
            longitude: stateMatch.longitude,
            locationName,
            locationType: 'village',
            village: stateMatch.name,
            district: stateMatch.admin2 || cleanDistrict,
            state: stateMatch.admin1 || cleanState,
            admin1: stateMatch.admin1,
            admin2: stateMatch.admin2,
          };
          geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch (err: any) {
        console.warn(`[WeatherService] Village geocoding failed for "${cleanVillage}":`, err.message);
      }
    }

    // 2. Fallback: District-level geocoding
    if (cleanDistrict) {
      try {
        const dUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanDistrict)}&count=10&language=en&format=json`;
        const res = await axios.get(dUrl, {
          timeout: 8000,
          headers: { 'User-Agent': 'AgriRaksha-AI/1.0' },
        });

        const results = (res.data?.results || []) as any[];
        const inResults = results.filter(
          (r) => r.country_code === 'IN' || (r.country && r.country.toLowerCase().includes('india'))
        );

        const districtMatch =
          inResults.find((r) => {
            const rState = normalize(r.admin1);
            return !normState || rState.includes(normState) || normState.includes(rState);
          }) || inResults[0];

        if (districtMatch) {
          const locationName = `${districtMatch.name} (District), ${districtMatch.admin1 || cleanState || 'India'}`;
          const result: GeocodedLocation = {
            latitude: districtMatch.latitude,
            longitude: districtMatch.longitude,
            locationName,
            locationType: 'district_fallback',
            district: districtMatch.name,
            state: districtMatch.admin1 || cleanState,
            admin1: districtMatch.admin1,
            admin2: districtMatch.admin2,
          };
          geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch (err: any) {
        console.warn(`[WeatherService] District geocoding failed for "${cleanDistrict}":`, err.message);
      }
    }

    // 3. Ultimate Fallback: State or default Indian agricultural hub coordinates
    const defaultCoords: Record<string, { lat: number; lon: number }> = {
      'andhra pradesh': { lat: 16.5408, lon: 81.5232 }, // Bhimavaram / West Godavari
      maharashtra: { lat: 18.5204, lon: 73.8567 },      // Pune / Baramati
      telangana: { lat: 17.9689, lon: 79.5941 },        // Warangal
      karnataka: { lat: 15.3647, lon: 75.1240 },        // Hubballi-Dharwad
    };

    const stateFallback = normState ? defaultCoords[normState] : null;
    const fallbackLat = stateFallback?.lat || 16.54078;
    const fallbackLon = stateFallback?.lon || 81.52322;
    const fallbackName = [cleanVillage, cleanDistrict, cleanState].filter(Boolean).join(', ') || 'West Godavari, Andhra Pradesh';

    const fallbackResult: GeocodedLocation = {
      latitude: fallbackLat,
      longitude: fallbackLon,
      locationName: fallbackName,
      locationType: cleanDistrict ? 'district_fallback' : 'state_fallback',
      village: cleanVillage,
      district: cleanDistrict,
      state: cleanState,
    };

    geocodeCache.set(cacheKey, { data: fallbackResult, timestamp: Date.now() });
    return fallbackResult;
  }

  /**
   * Computes dynamic spraying suitability advice based on real agro-meteorological metrics.
   */
  computeSprayAdvisory(rainProb: number, windSpeedKmH: number, humidityPct: number) {
    if (rainProb >= 50 || windSpeedKmH >= 18) {
      return {
        spraySuitability: 'unfavorable' as const,
        sprayBadge: 'Avoid Spraying / फवारणी टाळावी',
        sprayWindow: 'Not Recommended',
        sprayNote: `High rain probability (${rainProb}%) or high wind speed (${windSpeedKmH} km/h). Chemical wash-off or drift risk.`,
        isSafe: false,
        status: 'avoid' as const,
      };
    }
    if (rainProb >= 25 || windSpeedKmH >= 12 || humidityPct > 85) {
      return {
        spraySuitability: 'moderate' as const,
        sprayBadge: 'Spray with Caution / काळजीपूर्वक फवारणी',
        sprayWindow: '07:00 AM – 09:30 AM',
        sprayNote: `Moderate wind (${windSpeedKmH} km/h) or chance of rain (${rainProb}%). Perform foliar spraying during calm morning hours.`,
        isSafe: true,
        status: 'caution' as const,
      };
    }
    return {
      spraySuitability: 'optimal' as const,
      sprayBadge: 'Optimal to Spray / फवारणीसाठी अनुकूल',
      sprayWindow: '06:30 AM – 10:30 AM',
      sprayNote: `Low wind speed (${windSpeedKmH} km/h) and no heavy rain expected. Ideal for maximum leaf absorption and zero drift.`,
      isSafe: true,
      status: 'suitable' as const,
    };
  }

  /**
   * Fetches real-time current weather and 5-day agro-meteorological forecast from Open-Meteo.
   */
  async fetchLiveWeather(
    latitude: number,
    longitude: number,
    locationName: string,
    locationType: GeocodedLocation['locationType'] = 'village'
  ): Promise<LiveWeatherData> {
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
      return {
        ...cached.data,
        location: locationName,
        locationType,
      };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=5`;

    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'AgriRaksha-AI/1.0' },
    });

    const data = res.data;
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(current.temperature_2m ?? 28);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const windSpeed = Math.round(current.wind_speed_10m ?? 10);
    const windDegrees = Math.round(current.wind_direction_10m ?? 0);
    const windDirection = degreesToCompass(windDegrees);
    const precipitation = Number((current.precipitation ?? 0).toFixed(1));
    const weatherCode = Number(current.weather_code ?? 2);
    const wmo = getWmoDetails(weatherCode);

    const dailyTimes: string[] = daily.time || [];
    const dailyCodes: number[] = daily.weather_code || [];
    const dailyTempMax: number[] = daily.temperature_2m_max || [];
    const dailyTempMin: number[] = daily.temperature_2m_min || [];
    const dailyPrecipSum: number[] = daily.precipitation_sum || [];
    const dailyPrecipProb: number[] = daily.precipitation_probability_max || [];
    const dailyWindMax: number[] = daily.wind_speed_10m_max || [];

    const todayRainProb = dailyPrecipProb[0] ?? (precipitation > 0 ? 60 : 15);
    const todaySprayAdv = this.computeSprayAdvisory(todayRainProb, windSpeed, humidity);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const forecast: DayForecast[] = dailyTimes.map((tStr, idx) => {
      const d = new Date(tStr);
      let dayName = dayNames[d.getDay()];
      if (idx === 0) dayName = 'Today / आज';
      else if (idx === 1) dayName = 'Tomorrow / उद्या';

      const dateFormatted = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const dayWmo = getWmoDetails(dailyCodes[idx] ?? weatherCode);
      const dayRainProb = dailyPrecipProb[idx] ?? 10;
      const dayWindMax = Math.round(dailyWindMax[idx] ?? windSpeed);
      const daySpray = this.computeSprayAdvisory(dayRainProb, dayWindMax, humidity);

      return {
        day: dayName,
        date: dateFormatted,
        tempMax: Math.round(dailyTempMax[idx] ?? temp),
        tempMin: Math.round(dailyTempMin[idx] ?? temp - 8),
        humidity,
        windSpeed: dayWindMax,
        rainProb: dayRainProb,
        precipitationSum: Number((dailyPrecipSum[idx] ?? 0).toFixed(1)),
        condition: dayWmo.label,
        conditionLocal: dayWmo.local,
        icon: dayWmo.icon,
        spraySuitability: daySpray.spraySuitability,
        sprayBadge: daySpray.sprayBadge,
        sprayWindow: daySpray.sprayWindow,
        sprayNote: daySpray.sprayNote,
        isSafe: daySpray.isSafe,
      };
    });

    const sprayToday = forecast[0] || {
      day: 'Today / आज',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      tempMax: temp,
      tempMin: temp - 7,
      humidity,
      windSpeed,
      rainProb: todayRainProb,
      precipitationSum: precipitation,
      condition: wmo.label,
      conditionLocal: wmo.local,
      icon: wmo.icon,
      spraySuitability: todaySprayAdv.spraySuitability,
      sprayBadge: todaySprayAdv.sprayBadge,
      sprayWindow: todaySprayAdv.sprayWindow,
      sprayNote: todaySprayAdv.sprayNote,
      isSafe: todaySprayAdv.isSafe,
    };

    const liveData: LiveWeatherData = {
      location: locationName,
      locationType,
      coordinates: {
        latitude,
        longitude,
      },
      current: {
        temp,
        feelsLike,
        humidity,
        windSpeed,
        windDirection,
        windDegrees,
        precipitation,
        rainProb: todayRainProb,
        uvIndex: 6,
        condition: wmo.label,
        conditionLocal: wmo.local,
        icon: wmo.icon,
      },
      sprayToday,
      forecast,
      sprayAdvisory: {
        isSafe: todaySprayAdv.isSafe,
        status: todaySprayAdv.status,
        badge: todaySprayAdv.sprayBadge,
        message: todaySprayAdv.sprayNote,
        bestWindow: todaySprayAdv.sprayWindow,
      },
    };

    weatherCache.set(cacheKey, { data: liveData, timestamp: Date.now() });
    return liveData;
  }

  /**
   * High-level resolver: Given a user object and optional request query parameters,
   * determines accurate village coordinates and returns live weather.
   */
  async getLiveWeatherForUser(
    user: any,
    query?: { lat?: number | string; lon?: number | string; village?: string; district?: string; state?: string }
  ): Promise<LiveWeatherData> {
    const queryLat = query?.lat ? parseFloat(String(query.lat)) : undefined;
    const queryLon = query?.lon ? parseFloat(String(query.lon)) : undefined;

    const village = query?.village || user?.village;
    const district = query?.district || user?.district;
    const state = query?.state || user?.state;

    // 1. If explicit lat & lon were provided in query, use them directly
    if (queryLat && queryLon && !isNaN(queryLat) && !isNaN(queryLon)) {
      const locationName =
        [village, district, state].filter(Boolean).join(', ') ||
        user?.location?.address ||
        'Your Farm';
      return this.fetchLiveWeather(queryLat, queryLon, locationName, 'village');
    }

    // 2. Geocode the village, district, state
    const geo = await this.geocodeLocation(village, district, state);

    // 3. Fetch real weather for the resolved coordinates
    return this.fetchLiveWeather(geo.latitude, geo.longitude, geo.locationName, geo.locationType);
  }
}

export const weatherService = new WeatherService();
