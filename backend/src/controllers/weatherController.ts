/**
 * Weather & Agroclimatic Risk Assessment Controller
 * 
 * Provides hyperlocal meteorological data and disease outbreak forecasting
 * based on real-time temperature, relative humidity, wind speed, and rain probability.
 */

import { Request, Response } from 'express';
import { weatherService } from '../services/weatherService';

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const query = req.query as {
      lat?: string;
      lon?: string;
      village?: string;
      district?: string;
      state?: string;
    };

    const weatherData = await weatherService.getLiveWeatherForUser(user, query);
    res.json(weatherData);
  } catch (error: any) {
    console.error('[Weather] Error retrieving forecast:', error.message);
    res.status(500).json({ error: 'Failed to retrieve real weather data' });
  }
};

export const getRiskAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropId } = req.params;
    const user = req.user;

    // Retrieve real weather to base risk calculations on actual atmospheric conditions
    const liveWeather = await weatherService.getLiveWeatherForUser(user);
    const humidity = liveWeather.current.humidity;
    const tempMax = liveWeather.sprayToday.tempMax;
    const tempMin = liveWeather.sprayToday.tempMin;
    const tempDiff = Math.max(0, tempMax - tempMin);
    const windSpeed = liveWeather.current.windSpeed;
    const rainProb = liveWeather.current.rainProb;

    // Humidity risk evaluation
    const humidityRiskLevel = humidity >= 75 ? 'high' : humidity >= 60 ? 'moderate' : 'low';
    const humidityImpact =
      humidity >= 75
        ? 'Elevated fungal spore germination and mildew risk'
        : humidity >= 60
        ? 'Moderate humidity favoring localized fungal development'
        : 'Low atmospheric moisture, fungal outbreak probability is low';

    // Temperature differential evaluation (Dew point / Canopy wetness)
    const tempDiffRiskLevel = tempDiff >= 10 ? 'high' : tempDiff >= 6 ? 'moderate' : 'low';
    const tempDiffImpact =
      tempDiff >= 10
        ? `High day/night gap (${tempDiff}°C) causes heavy dew condensation on leaves`
        : `Moderate day/night gap (${tempDiff}°C) with light canopy moisture`;

    // Wind dispersion evaluation
    const windRiskLevel = windSpeed >= 16 ? 'high' : windSpeed >= 10 ? 'moderate' : 'low';
    const windImpact =
      windSpeed >= 16
        ? `Strong wind (${windSpeed} km/h) accelerates airborne spore and pest dispersal`
        : `Gentle breeze (${windSpeed} km/h), limited airborne pest migration`;

    // Calculate dynamic overall risk score (0 - 100)
    let score = Math.round(humidity * 0.45 + (tempDiff / 15) * 25 + (rainProb * 0.3));
    score = Math.min(95, Math.max(25, score));
    const overallLevel = score >= 70 ? 'high' : score >= 45 ? 'moderate' : 'low';

    const riskData = {
      cropId: cropId || 'general',
      location: liveWeather.location,
      locationType: liveWeather.locationType,
      overallLevel,
      overallScore: score, // 0 - 100
      factors: [
        {
          name: 'Relative Humidity',
          value: `${humidity}%`,
          impact: humidityImpact,
          riskLevel: humidityRiskLevel,
        },
        {
          name: 'Day/Night Temp Differential',
          value: `${tempDiff}°C (${tempMax}°C / ${tempMin}°C)`,
          impact: tempDiffImpact,
          riskLevel: tempDiffRiskLevel,
        },
        {
          name: 'Wind Dispersion Speed',
          value: `${windSpeed} km/h (${liveWeather.current.windDirection})`,
          impact: windImpact,
          riskLevel: windRiskLevel,
        },
      ],
      diseaseForecasts: [
        {
          crop: 'Tomato',
          threat: 'Early Blight (अल्टरनेरिया करपा)',
          probability: Math.min(95, Math.round(score * 1.1)),
          riskBadge: score >= 65 ? 'High Alert' : 'Moderate',
          preventativeAction:
            rainProb >= 40
              ? 'Apply protective spray of Mancozeb 75% WP @ 2.5g/L before rain event.'
              : 'Inspect lower leaves for concentric rings. Maintain proper canopy aeration.',
        },
        {
          crop: 'Cotton',
          threat: 'Bacterial Blight & Aphids (मावा)',
          probability: Math.min(90, Math.round(score * 0.75)),
          riskBadge: score >= 65 ? 'Moderate' : 'Low',
          preventativeAction:
            'Inspect leaf undersides for aphid colonies. Spray NSKE 5% if > 5 aphids per leaf.',
        },
        {
          crop: 'Chilli',
          threat: 'Powdery Mildew & Thrips',
          probability: Math.min(92, Math.round(score * 0.85)),
          riskBadge: score >= 60 ? 'Moderate' : 'Low',
          preventativeAction: 'Install blue sticky traps in field @ 15 traps per acre.',
        },
      ],
    };

    res.json(riskData);
  } catch (error: any) {
    console.error('[Risk] Error generating risk assessment:', error.message);
    res.status(500).json({ error: 'Failed to calculate risk assessment' });
  }
};

