/**
 * Alert Controller — District Outbreak Radars & Agro-Advisory Notifications
 * 
 * Delivers urgent agricultural advisories, pest outbreak forecasts,
 * and government scheme alerts directly to farmers.
 */

import { Request, Response } from 'express';

interface FarmAlert {
  _id: string;
  title: string;
  titleLocal: {
    mr: string;
    te: string;
    hi: string;
  };
  type: 'pest_outbreak' | 'weather_risk' | 'govt_scheme' | 'advisory';
  severity: 'high' | 'moderate' | 'info';
  crop: string;
  district: string;
  date: string;
  description: string;
  descriptionLocal: {
    mr: string;
    te: string;
    hi: string;
  };
  actionRequired: string;
  actionRequiredLocal: {
    mr: string;
    te: string;
    hi: string;
  };
  isRead: boolean;
}

const DISTRICT_ALERTS: FarmAlert[] = [
  {
    _id: 'alert-001',
    title: 'Emergency Pest Outbreak: Fall Armyworm',
    titleLocal: {
      mr: 'तातडीचा इशारा: मका व ज्वारीवरील लष्करी अळीचा प्रादुर्भाव',
      te: 'అత్యవసర హెచ్చరిక: మొక్కజొన్నలో ఫాల్ ఆర్మీవార్మ్ తెగులు',
      hi: 'आपातकालीन चेतावनी: मक्का पर फॉल आर्मीवर्म का प्रकोप',
    },
    type: 'pest_outbreak',
    severity: 'high',
    crop: 'Maize / Sorghum (मका / ज्वारी)',
    district: 'Pune & Ahmednagar (Maharashtra)',
    date: 'Today, 08:30 AM',
    description: 'Pheromone trap monitoring in Baramati taluka indicates high adult moth catches (>12 moths/trap/night). Larvae feeding on young whorls.',
    descriptionLocal: {
      mr: 'बारामती व इंदापूर तालुक्यात कामगंध सापळ्यात पतंगांची संख्या वाढली आहे. मक्याच्या पोंग्यात अळ्यांचा प्रादुर्भाव दिसून येत आहे.',
      te: 'బారామతి పరిసర ప్రాంతాలలో ఫాల్ ఆర్మీవార్మ్ పురుగుల తీవ్రత పెరిగింది. సుడులలో పురుగులు గమనించబడ్డాయి.',
      hi: 'बारामती क्षेत्र में फेरोमोन ट्रैप में कीटों की संख्या बढ़ी है। मक्के के पोंगों में सुंडी का प्रकोप देखा जा रहा है।',
    },
    actionRequired: 'Spray Emamectin Benzoate 5% SG @ 0.4g/L water directly into plant whorls during morning hours.',
    actionRequiredLocal: {
      mr: 'इमामेक्टिन बेन्झोएट ५% एस.जी. ०.४ ग्रॅम प्रति लिटर पाण्यात मिसळून मक्याच्या पोंग्यात फवारावे.',
      te: 'ఇమామెక్టిన్ బెంజోయేట్ 5% ఎస్.జి 0.4 గ్రాములు లీటరు నీటిలో కలిపి సుడులలో పిచिकారీ చేయండి.',
      hi: 'इमामेक्टिन बेंजोएट 5% एस.जी. 0.4 ग्राम प्रति लीटर पानी में मिलाकर पोंगों में छिड़कें।',
    },
    isRead: false,
  },
  {
    _id: 'alert-002',
    title: 'Weather Outbreak Radar: Early Blight Risk on Tomato',
    titleLocal: {
      mr: 'हवामान इशारा: टोमॅटो पिकावर करपा रोगाचा वाढता धोका',
      te: 'వాతావరణ హెచ్చరిక: టమోటాలో ముందస్తు తెగులు ముప్పు',
      hi: 'मौसम चेतावनी: टमाटर पर अगेती झुलसा का खतरा',
    },
    type: 'weather_risk',
    severity: 'moderate',
    crop: 'Tomato (टोमॅटो)',
    district: 'Pune / Nashik / Warangal',
    date: 'Yesterday',
    description: 'Relative humidity (>75%) coupled with moderate temperatures (26-28°C) provides optimal environment for Alternaria spore multiplication.',
    descriptionLocal: {
      mr: 'हवेतील आर्द्रता वाढल्यामुळे टोमॅटोच्या पानांवर काळे डाग व करपा पसरण्याची शक्यता आहे.',
      te: 'గాలిలో తేమ ఎక్కువగా ఉండడం వలన ఆకులపై నల్లటి మచ్చలు వ్యాపించే అవకాశం ఉంది.',
      hi: 'हवा में नमी अधिक होने के कारण टमाटर के पत्तों पर झुलसा रोग तेजी से फैल सकता है।',
    },
    actionRequired: 'Apply preventative spray of Mancozeb 75% WP @ 2.5g/L before upcoming rain event.',
    actionRequiredLocal: {
      mr: 'पावसापूर्वी प्रतिबंधात्मक उपाय म्हणून मॅन्कोझेब २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे.',
      te: 'వర్షానికి ముందు మాంకోజెబ్ 2.5 గ్రాములు కలిపి నివారణ మందు పిచికారీ చేయండి.',
      hi: 'बारिश से पहले मैंकोजेब 2.5 ग्राम प्रति लीटर पानी में मिलाकर सुरक्षात्मक छिड़काव करें।',
    },
    isRead: false,
  },
  {
    _id: 'alert-003',
    title: 'PM Fasal Bima Yojana (PMFBY) Notice',
    titleLocal: {
      mr: 'पंतप्रधान पीक विमा योजना (PMFBY) मुदतवाढ',
      te: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన గడువు పొడిగింపు',
      hi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY) सूचना',
    },
    type: 'govt_scheme',
    severity: 'info',
    crop: 'All Kharif Crops (सर्व खरीप पिके)',
    district: 'Statewide (Maharashtra & Telangana)',
    date: '2 days ago',
    description: 'Last date for enrolment under Weather Based Crop Insurance Scheme has been extended. Farmers can apply with 1-Rupee token premium via CSC/Aaple Sarkar.',
    descriptionLocal: {
      mr: '१ रुपयात पीक विमा योजनेची नोंदणी मुदत वाढवण्यात आली आहे. जवळच्या सीएससी केंद्रावर अर्ज करावा.',
      te: 'వాతావరణ ఆధారిత పంట బీమా దరఖాస్తు గడువు పొడిగించబడింది. సమీప సీఎస్సీ కేంద్రాన్ని సంప్రదించండి.',
      hi: 'फसल बीमा योजना की अंतिम तिथि बढ़ा दी गई है। नजदीकी सीएससी केंद्र पर जाकर लाभ उठाएं।',
    },
    actionRequired: 'Verify land 7/12 record & bank Aadhaar link for insurance subsidy disbursement.',
    actionRequiredLocal: {
      mr: 'आपला ७/१२ उतारा आणि बँक खात्याला आधार लिंक असल्याची खात्री करा.',
      te: 'మీ భూమి రికార్డులు మరియు ఆధార్ బ్యాంక్ లింక్ ధృవీకరించుకోండి.',
      hi: 'अपनी खतौनी एवं बैंक खाते से आधार लिंक की पुष्टि करें।',
    },
    isRead: true,
  },
];

export const getAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const unreadCount = DISTRICT_ALERTS.filter((a) => !a.isRead).length;
    res.json({
      alerts: DISTRICT_ALERTS,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[Alerts] Error fetching alerts:', error.message);
    res.status(500).json({ error: 'Failed to retrieve alerts' });
  }
};

export const markAlertRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = DISTRICT_ALERTS.find((a) => a._id === id);
    if (alert) {
      alert.isRead = true;
      res.json({ success: true, alert });
      return;
    }
    res.status(404).json({ error: 'Alert not found' });
  } catch (error: any) {
    console.error('[Alerts] Error marking alert as read:', error.message);
    res.status(500).json({ error: 'Failed to update alert' });
  }
};
