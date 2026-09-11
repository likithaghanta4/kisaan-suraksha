/**
 * AgriRaksha / Kisaan Suraksha AI — Diagnosis Result Screen
 * 
 * Clean, Visual, Farmer-Friendly Disease Diagnosis Report:
 * - Brand Header with Prominent Back Button (← Back) + Share Report
 * - Prominent Diagnosis Summary Card: Scanned image with badge, crop name, disease title,
 *   scientific name in brackets, pathogen details, risk badge, and AI confidence meter
 * - 3 Compact Diagnosis Info Cards: Crop, Disease Type, Risk Level
 * - 🌱 AI Crop Assistant (Kisaan AI Sahayak): Interactive Q&A input, chat bubbles, quick chips,
 *   and audio readout grounded strictly in verified scan diagnosis data.
 * - Visual Key Symptoms Section: High-fidelity symptom cards with image previews & captions
 * - Treatment Prescription: Segmented tabs for Organic Bio-Solutions, Chemical, and Prevention
 * - Responsive Bottom Action Bar: Go Back, Listen Guidance, Download Report, and Scan Another
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Share,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';

interface DiagnosisResultScreenProps {
  navigation: any;
  route?: {
    params?: {
      scan?: any;
      advisory?: any;
      imageUri?: string;
    };
  };
}

const SYMPTOM_PREVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&q=80',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&q=80',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&q=80',
];

interface QuickQuestion {
  id: string;
  icon: string;
  labels: Record<string, string>;
}

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'what_is_disease',
    icon: '🔍',
    labels: {
      en: 'What is this disease?',
      mr: 'हा कोणता रोग आहे?',
      te: 'ఈ తెగులు ఏమిటి?',
      hi: 'यह कौन सी बीमारी है?',
    },
  },
  {
    id: 'what_to_do_now',
    icon: '🌱',
    labels: {
      en: 'What should I do now?',
      mr: 'मी आता काय करावे?',
      te: 'నేను ఇప్పుడు ఏమి చేయాలి?',
      hi: 'मुझे अब क्या करना चाहिए?',
    },
  },
  {
    id: 'dosage_guide',
    icon: '💧',
    labels: {
      en: 'Dosage & spray ratio?',
      mr: 'औषधाचे प्रमाण / डोस किती?',
      te: 'మందు మోతాదు ఎంత?',
      hi: 'दवा की मात्रा / डोज क्या है?',
    },
  },
  {
    id: 'why_happened',
    icon: '❓',
    labels: {
      en: 'Why did this happen?',
      mr: 'हा रोग कशामुळे झाला?',
      te: 'ఇది ఎందుకు వచ్చింది?',
      hi: 'यह क्यों हुआ?',
    },
  },
  {
    id: 'how_to_prevent',
    icon: '🛡️',
    labels: {
      en: 'How can I prevent it?',
      mr: 'हा रोग कसा रोखावा?',
      te: 'దీనిని ఎలా నివారించాలి?',
      hi: 'इसकी रोकथाम कैसे करें?',
    },
  },
  {
    id: 'rain_safety',
    icon: '🌧️',
    labels: {
      en: 'Can I spray in rain?',
      mr: 'पावसात फवारणी करावी का?',
      te: 'వర్షంలో మందు చల్లవచ్చా?',
      hi: 'क्या बारिश में छिड़काव करें?',
    },
  },
  {
    id: 'is_serious',
    icon: '⚠️',
    labels: {
      en: 'Is this serious?',
      mr: 'हा रोग गंभीर आहे का?',
      te: 'ఇది తీవ్రమైనదా?',
      hi: 'क्या यह गंभीर है?',
    },
  },
  {
    id: 'when_scan_again',
    icon: '🔄',
    labels: {
      en: 'When to scan again?',
      mr: 'पुन्हा कधी स्कॅन करावे?',
      te: 'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?',
      hi: 'दोबारा कब स्कैन करें?',
    },
  },
  {
    id: 'contact_expert',
    icon: '👨‍🌾',
    labels: {
      en: 'Should I contact an expert?',
      mr: 'तज्ज्ञांचा सल्ला घ्यावा का?',
      te: 'निపుణుడిని సంప్రదించాలా?',
      hi: 'क्या विशेषज्ञ से सलाह लें?',
    },
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const DiagnosisResultScreen: React.FC<DiagnosisResultScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { language } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  const scan = route?.params?.scan || {
    cropName: 'Tomato',
    diseaseName: 'Tomato Early Blight (अल्टरनेरिया करपा)',
    confidence: 0.94,
    severity: 'moderate',
    isHealthy: false,
    symptoms: [
      'Concentric dark brown circular rings (target pattern) on lower foliage',
      'Yellow chlorotic halo surrounding lesions',
      'Premature defoliation starting from the bottom canopy upwards',
    ],
    organicTreatment: [
      'Neem Seed Kernel Extract (NSKE 5%) @ 50ml per 10L water',
      'Trichoderma viride bio-fungicide @ 5g/L water in root zone and foliage',
      'Cow urine + Hing (Asafoetida) fermented bio-spray @ 10% concentration',
      'Prune and safely destroy lower infected leaves during dry daylight hours',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5g per litre of water',
      'Or Chlorothalonil 75% WP @ 2g per litre of water',
      'Maintain 7-day minimum harvest interval after spraying',
    ],
    preventionTips: [
      'Avoid overhead sprinkler irrigation to keep foliage dry',
      'Maintain 60cm row spacing for adequate air circulation',
      'Crop rotation with non-solanaceous crops for 2 seasons',
    ],
  };

  const advisory = route?.params?.advisory;
  const imageUri = route?.params?.imageUri || scan.imageUrl;

  const [activeTab, setActiveTab] = useState<'organic' | 'chemical' | 'preventive'>('organic');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('what_is_disease');
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const currentLang = (language || 'mr') as 'mr' | 'te' | 'hi' | 'en';

  const localizedName =
    advisory?.localNames?.[currentLang] ||
    scan.diseaseName;

  // Extract pure disease title and scientific name
  const diseaseTitle =
    advisory?.diseaseName ||
    scan.diseaseName?.split('(')[0]?.replace(/Tomato|Cotton|Soybean|Onion|Chilli|Rice|Wheat/gi, '').trim() ||
    scan.diseaseName;

  const scientificName =
    advisory?.pathogen ||
    (scan.diseaseName?.includes('(') ? scan.diseaseName.match(/\(([^)]+)\)/)?.[1] : 'Alternaria solani') ||
    '';

  const diseaseType = scan.isHealthy
    ? 'Healthy'
    : scan.isPest
    ? 'Pest / Insect'
    : advisory?.pathogen?.toLowerCase().includes('fung') || scan.diseaseName?.toLowerCase().includes('blight') || scan.diseaseName?.toLowerCase().includes('rust')
    ? 'Fungal'
    : advisory?.pathogen?.toLowerCase().includes('bact')
    ? 'Bacterial'
    : 'Fungal';

  const confidencePercent = Math.round((scan.confidence || 0.94) * 100);

  const riskLabel = scan.isHealthy
    ? 'Healthy'
    : scan.severity === 'severe'
    ? 'Severe'
    : scan.severity === 'low'
    ? 'Low'
    : 'Moderate';

  const voiceText =
    advisory?.voiceSummary?.[currentLang] ||
    `${scan.cropName} diagnosis: ${localizedName}. Diagnostic confidence ${confidencePercent} percent. ${
      scan.isHealthy
        ? 'Crop is in healthy condition.'
        : `Identified ${diseaseType} infection at ${riskLabel} risk level. Please follow organic and chemical remedies.`
    }`;

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Scan');
    }
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const voiceLangMap: { [key: string]: string } = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        en: 'en-IN',
      };

      Speech.speak(voiceText, {
        language: voiceLangMap[currentLang] || 'en-IN',
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  /**
   * Helper function to generate contextual crop assistant response
   * based exclusively on the verified scan result and advisory data.
   */
  const getAssistantAnswer = (qId: string): string => {
    const crop = scan.cropName || 'Crop';
    const primarySymptom = (scan.symptoms || advisory?.symptoms)?.[0] || 'visible leaf lesions';
    const organicSpray = (scan.organicTreatment || advisory?.organicTreatment)?.[0] || 'Neem oil @ 2ml/L';
    const chemicalSpray = (scan.chemicalTreatment || advisory?.chemicalTreatment)?.[0] || 'Mancozeb 75% WP @ 2.5g/L';
    const preventiveTip = (scan.preventionTips || advisory?.preventionTips)?.[0] || 'Maintain proper plant spacing';

    switch (qId) {
      case 'what_is_disease':
        if (scan.isHealthy) {
          if (currentLang === 'mr') return `तुमच्या ${crop} चे पान निरोगी आणि ताजेतवाने आहे. कोणत्याही रोगाचे किंवा कीटकांचे लक्षण आढळले नाही.`;
          if (currentLang === 'te') return `మీ ${crop} ఆకు ఆరోగ్యంగా ఉంది. ఎటువంటి తెగులు లేదా పురుగు లక్షణాలు కనిపించలేదు.`;
          if (currentLang === 'hi') return `आपकी ${crop} की पत्ती स्वस्थ है। किसी भी बीमारी या कीट के लक्षण नहीं पाए गए हैं।`;
          return `Your ${crop} leaf is healthy. No disease or pest symptoms were detected in this scan.`;
        }
        if (currentLang === 'mr') {
          return `तुमच्या ${crop} च्या पानावर '${localizedName}' ची लक्षणे आढळली आहेत. हा एक ${diseaseType} रोग (${scientificName}) असून यामुळे पानांवर ${primarySymptom} तयार होतात.`;
        }
        if (currentLang === 'te') {
          return `మీ ${crop} ఆకుపై '${localizedName}' లక్షణాలు గుర్తించబడ్డాయి. ఇది ${diseaseType} సమస్య (${scientificName}), దీనివల్ల ${primarySymptom} ఏర్పడుతుంది.`;
        }
        if (currentLang === 'hi') {
          return `आपकी ${crop} की पत्ती पर '${localizedName}' के लक्षण पाए गए हैं। यह एक ${diseaseType} रोग (${scientificName}) है, जिसके कारण ${primarySymptom} बनते हैं।`;
        }
        return `Your ${crop} leaf shows symptoms of ${diseaseTitle} (${scientificName}). It is a ${diseaseType} infection characterized by ${primarySymptom}.`;

      case 'what_to_do_now':
        if (scan.isHealthy) {
          if (currentLang === 'mr') return `सध्या कोणत्याही उपचारांची आवश्यकता नाही. नियमित पाणी व खत व्यवस्थापन सुरू ठेवा.`;
          if (currentLang === 'te') return `ప్రస్తుతం ఎటువంటి మందులు అవసరం లేదు. సాధారణ నీటి మరియు ఎరువుల నిర్వహణ కొనసాగించండి.`;
          if (currentLang === 'hi') return `फिलहाल किसी उपचार की आवश्यकता नहीं है। नियमित देखभाल और पोषण जारी रखें।`;
          return `No treatment needed right now. Continue routine irrigation and nutrient management.`;
        }
        if (currentLang === 'mr') {
          return `१. जास्त बाधित झालेली पाने तोडून शेताबाहेर नष्ट करा.\n२. सेंद्रिय उपाय: ${organicSpray}\n३. प्रादुर्भाव जास्त असल्यास: ${chemicalSpray}\n४. पानांवर पाणी साचू देऊ नका.`;
        }
        if (currentLang === 'te') {
          return `1. తెగులు సోకిన ఆకులను తీసి నాశనం చేయండి.\n2. సేంద్రీయ నివారణ: ${organicSpray}\n3. తీవ్రత ఎక్కువగా ఉంటే: ${chemicalSpray}\n4. ఆకులపై ఎక్కువసేపు నీరు నిలవకుండా చూసుకోండి.`;
        }
        if (currentLang === 'hi') {
          return `1. अत्यधिक प्रभावित पत्तियों को हटाकर नष्ट करें।\n2. जैविक उपचार: ${organicSpray}\n3. आवश्यकतानुसार रासायनिक छिड़काव: ${chemicalSpray}\n4. पत्तियों को अधिक गीला रखने से बचें।`;
        }
        return `1. Prune and safely destroy heavily affected lower leaves.\n2. Apply recommended organic bio-solution: ${organicSpray}.\n3. If infection is spreading, consider: ${chemicalSpray}.\n4. Avoid overhead sprinkling.`;

      case 'dosage_guide':
        if (currentLang === 'mr') {
          return `💧 शिफारस केलेले प्रमाण (डोस):\n• सेंद्रिय: ${organicSpray}\n• रासायनिक: ${chemicalSpray}\n• फवारणीसाठी प्रति एकर साधारण १५०-२०० लिटर पाण्याचा वापर करावा.`;
        }
        if (currentLang === 'te') {
          return `💧 సిఫార్సు చేసిన మోతాదు:\n• సేంద్రీయ: ${organicSpray}\n• రసాయన: ${chemicalSpray}\n• ఎకరాకు దాదాపు 150-200 లీటర్ల నీటిని వాడండి.`;
        }
        if (currentLang === 'hi') {
          return `💧 अनुशंसित मात्रा (डोज):\n• जैविक: ${organicSpray}\n• रासायनिक: ${chemicalSpray}\n• प्रति एकड़ 150-200 लीटर पानी का उपयोग करें।`;
        }
        return `💧 Recommended Dosage:\n• Organic: ${organicSpray}\n• Chemical: ${chemicalSpray}\n• Use 150-200 Litres of water per acre for thorough canopy coverage.`;

      case 'why_happened':
        if (currentLang === 'mr') {
          return `हा रोग सामान्यतः शेतातील अति आर्द्रता, पानावरील ओलावा, रोपांमधील अपुरे अंतर किंवा जमिनीत आधीच्या पिकाचे बुरशीचे अवशेष असल्यामुळे पसरतो.`;
        }
        if (currentLang === 'te') {
          return `పొలంలో అధిక తేమ, ఆకులపై నీరు నిలవడం, మొక్కల మధ్య తగినంత గాలి లేకపోవడం వల్ల ఈ తెగులు వ్యాపిస్తుంది.`;
        }
        if (currentLang === 'hi') {
          return `खेत में अधिक नमी, पत्तियों पर पानी रुकने, पौधों के बीच हवा का संचार न होने या मिट्टी में पुराने अवशेषों से यह रोग फैलता है।`;
        }
        return `This disease commonly develops due to high field humidity, prolonged leaf surface wetness, dense canopy spacing, or pathogen spores surviving in soil residue.`;

      case 'how_to_prevent':
        if (currentLang === 'mr') {
          return `• ${preventiveTip}\n• पिकांची फेरपालट करा.\n• संतुलित नत्र आणि पोटॅश खतांचा वापर करा.\n• दर ३-४ दिवसांनी शेताची पाहणी करा.`;
        }
        if (currentLang === 'te') {
          return `• ${preventiveTip}\n• పంట మార్పిడి పద్ధతిని పాటించండి.\n• సమతుల్య ఎరువులను వాడండి.\n• ప్రతి 3-4 రోజులకు పంటను తనిఖీ చేయండి.`;
        }
        if (currentLang === 'hi') {
          return `• ${preventiveTip}\n• फसल चक्र अपनाएं।\n• संतुलित उर्वरक का प्रयोग करें।\n• हर 3-4 दिनों में पत्तियों की निगरानी करें।`;
        }
        return `• ${preventiveTip}\n• Practice crop rotation with non-host crops.\n• Ensure balanced nitrogen and potash fertilization.\n• Monitor crop canopy regularly every 3-4 days.`;

      case 'rain_safety':
        if (currentLang === 'mr') {
          return `🌧️ पाऊस पडत असताना फवारणी करू नका. फवारणीनंतर किमान २ ते ३ तास कोरडे हवामान असणे आवश्यक आहे. औषध वाहून जाऊ नये म्हणून स्टिकर (Spreader/Sticker) वापरा.`;
        }
        if (currentLang === 'te') {
          return `🌧️ వర్షం పడుతున్నప్పుడు మందు చల్లవద్దు. మందు చల్లిన తర్వాత కనీసం 2-3 గంటల పాటు వర్షం పడకుండా ఉండాలి. స్టిక్కర్ (Spreader) వాడటం మంచిది.`;
        }
        if (currentLang === 'hi') {
          return `🌧️ बारिश के दौरान छिड़काव न करें। छिड़काव के बाद कम से कम 2-3 घंटे मौसम सूखा होना चाहिए। दवा को धुलने से बचाने के लिए स्टिकर (Spreader) मिलाएं।`;
        }
        return `🌧️ Do not spray during active rain. Ensure at least 2-3 rain-free hours after spraying. Add an agricultural spreader/sticker adjuvant to prevent wash-off.`;

      case 'is_serious':
        if (scan.isHealthy) {
          if (currentLang === 'mr') return `नाही, तुमचे पीक पूर्णपणे निरोगी आहे. कोणतीही जोखीम नाही.`;
          if (currentLang === 'te') return `లేదు, మీ పంట ఆరోగ్యంగా ఉంది. ఎటువంటి ప్రమాదం లేదు.`;
          if (currentLang === 'hi') return `नहीं, आपकी फसल पूरी तरह स्वस्थ है। कोई जोखिम नहीं है।`;
          return `No, your crop is healthy with zero risk detected.`;
        }
        if (scan.severity === 'severe') {
          if (currentLang === 'mr') return `⚠️ होय, हा 'गंभीर' (Severe) स्वरूपाचा प्रादुर्भाव आहे. उत्पादन घट टाळण्यासाठी पुढील २४-४८ तासांत उपाययोजना करणे गरजेचे आहे.`;
          if (currentLang === 'te') return `⚠️ అవును, ఇది 'తీవ్రమైన' (Severe) సమస్య. దిగుబడి నష్టం జరగకుండా తక్షణమే నివారణ చర్యలు చేపట్టాలి.`;
          if (currentLang === 'hi') return `⚠️ हाँ, यह 'गंभीर' (Severe) स्तर पर है। उपज में नुकसान से बचने के लिए अगले 24-48 घंटों में उपचार करें।`;
          return `⚠️ Yes, this is diagnosed at a Severe risk level. Prompt intervention within 24-48 hours is required to prevent yield loss.`;
        }
        if (currentLang === 'mr') return `⚠️ हा 'मध्यम' (Moderate) स्वरूपाचा प्रादुर्भाव आहे. वेळेवर सेंद्रिय किंवा रासायनिक उपाय केल्यास हा सहज नियंत्रणात येतो.`;
        if (currentLang === 'te') return `⚠️ ఇది 'మధ్యస్థ' (Moderate) స్థాయిలో ఉంది. సకాలంలో సరైన మందులు వాడితే సులభంగా అదుపు చేయవచ్చు.`;
        if (currentLang === 'hi') return `⚠️ यह 'मध्यम' (Moderate) स्तर पर है। समय पर उपचार करने से इसे आसानी से नियंत्रित किया जा सकता है।`;
        return `⚠️ This is diagnosed at a Moderate risk level. Applying the recommended remedies will control the spread.`;

      case 'when_scan_again':
        if (currentLang === 'mr') return `फवारणी किंवा उपाययोजना केल्यानंतर ३ ते ५ दिवसांनी पुन्हा नवीन पानांचा स्कॅन करा.`;
        if (currentLang === 'te') return `మందులు వాడిన 3 నుండి 5 రోజుల తర్వాత కొత్త ఆకులను మళ్లీ స్కాన్ చేయండి.`;
        if (currentLang === 'hi') return `उपचार करने के 3 से 5 दिन बाद नई पत्तियों को दोबारा स्कैन करें।`;
        return `Rescan your crop in 3 to 5 days after applying treatment to check if new emerging leaves are clean and healthy.`;

      case 'contact_expert':
        if (confidencePercent < 85 || scan.severity === 'severe') {
          if (currentLang === 'mr') return `👨‍🌾 होय, तुमच्या स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी अधिकाऱ्यांचा सल्ला घेणे फायदेशीर ठरेल.`;
          if (currentLang === 'te') return `👨‍🌾 అవును, మీ స్థానిక కృషి విజ్ఞాన కేంద్రం (KVK) నిపుణుడిని సంప్రదించడం మంచిది.`;
          if (currentLang === 'hi') return `👨‍🌾 हाँ, अपने नजदीकी कृषि विज्ञान केंद्र (KVK) विशेषज्ञ से सलाह लेना उचित रहेगा।`;
          return `👨‍🌾 Yes, connecting with a local Krishi Vigyan Kendra (KVK) agronomist is recommended for field verification.`;
        }
        if (currentLang === 'mr') return `सध्या दिलेल्या अहवालातील उपाय पुरेसे आहेत. रोग वाढल्यासच तज्ज्ञांशी संपर्क साधा.`;
        if (currentLang === 'te') return `ప్రస్తుతం నివేదికలోని చర్యలు సరిపోతాయి. సమస్య ఎక్కువైతేనే నిపుణుడిని కలవండి.`;
        if (currentLang === 'hi') return `फिलहाल रिपोर्ट में दिए गए उपाय पर्याप्त हैं। समस्या बढ़ने पर ही विशेषज्ञ से संपर्क करें।`;
        return `The current prescription is sufficient for this stage. Contact a KVK expert if symptoms persist after 5 days.`;

      default:
        return `I don't have enough information from this scan to answer that.`;
    }
  };

  /**
   * Generates answers for custom free-text queries entered by the farmer
   */
  const handleAskCustomQuestion = () => {
    if (!customQuestion.trim()) return;

    const query = customQuestion.trim().toLowerCase();
    let responseText = '';
    const crop = scan.cropName || 'Crop';
    const primarySymptom = (scan.symptoms || advisory?.symptoms)?.[0] || 'leaf lesions';
    const organicSpray = (scan.organicTreatment || advisory?.organicTreatment)?.[0] || 'Neem oil @ 2ml/L';
    const chemicalSpray = (scan.chemicalTreatment || advisory?.chemicalTreatment)?.[0] || 'Mancozeb 75% WP @ 2.5g/L';

    if (
      query.includes('dose') ||
      query.includes('dosage') ||
      query.includes('quantity') ||
      query.includes('how much') ||
      query.includes('प्रमाण') ||
      query.includes('डोस') ||
      query.includes('మోతాదు') ||
      query.includes('मात्रा')
    ) {
      if (currentLang === 'mr') {
        responseText = `💧 ${crop} साठी औषधाचे प्रमाण:\n• सेंद्रिय: ${organicSpray}\n• रासायनिक: ${chemicalSpray}\n• एकरी १५०-२०० लिटर पाण्यातून व्यवस्थित फवारणी करावी.`;
      } else if (currentLang === 'te') {
        responseText = `💧 ${crop} కోసం సిఫార్సు చేసిన మోతాదు:\n• సేంద్రీయ: ${organicSpray}\n• రసాయన: ${chemicalSpray}\n• ఎకరానికి 150-200 లీటర్ల నీటిలో కలపండి.`;
      } else if (currentLang === 'hi') {
        responseText = `💧 ${crop} के लिए दवा की मात्रा:\n• जैविक: ${organicSpray}\n• रासायनिक: ${chemicalSpray}\n• प्रति एकड़ 150-200 लीटर पानी में मिलाकर छिड़काव करें।`;
      } else {
        responseText = `💧 Recommended dosage for ${crop}:\n• Organic: ${organicSpray}\n• Chemical: ${chemicalSpray}\n• Spray with 150-200 Litres of water per acre.`;
      }
    } else if (
      query.includes('rain') ||
      query.includes('weather') ||
      query.includes('पाऊस') ||
      query.includes('वर्షం') ||
      query.includes('बारिश')
    ) {
      if (currentLang === 'mr') {
        responseText = `🌧️ पाऊस चालू असताना फवारणी करू नका. फवारणीनंतर किमान २-३ तास पाऊस नसावा. औषध टिकण्यासाठी स्टिकर नक्की वापरा.`;
      } else if (currentLang === 'te') {
        responseText = `🌧️ వర్షం సమయంలో మందు చల్లవద్దు. చల్లిన తర్వాత 2-3 గంటలు ఎండ లేదా పొడి వాతావరణం ఉండాలి.`;
      } else if (currentLang === 'hi') {
        responseText = `🌧️ बारिश में छिड़काव न करें। छिड़काव के बाद कम से कम 2-3 घंटे मौसम साफ रहना चाहिए। स्टिकर का प्रयोग करें।`;
      } else {
        responseText = `🌧️ Avoid spraying in rainy conditions. Ensure 2-3 rain-free hours and use a sticker adjuvant.`;
      }
    } else if (
      query.includes('organic') ||
      query.includes('bio') ||
      query.includes('natural') ||
      query.includes('सेंद्रिय') ||
      query.includes('సేంద్రీయ') ||
      query.includes('जैविक') ||
      query.includes('neem')
    ) {
      if (currentLang === 'mr') {
        responseText = `🌱 सेंद्रिय उपाय:\n• ${organicSpray}\n• ट्रायकोडर्मा व्हिरिडी ५ ग्रॅम/लिटर\n• गोमूत्र + हिंग अर्क फवारणी`;
      } else if (currentLang === 'te') {
        responseText = `🌱 సేంద్రీయ నివారణ:\n• ${organicSpray}\n• ట్రైకోడెర్మా విరిడే 5 గ్రా/లీటర్\n• ఆవు మూత్రం మిశ్రమం స్ప్రే చేయండి`;
      } else if (currentLang === 'hi') {
        responseText = `🌱 जैविक उपचार:\n• ${organicSpray}\n• ट्राइकोडर्मा विरिडी 5 ग्राम/लीटर\n• गोमूत्र और हींग का अर्क`;
      } else {
        responseText = `🌱 Organic Solution:\n• ${organicSpray}\n• Trichoderma viride @ 5g/L\n• Fermented Cow Urine + Asafoetida spray`;
      }
    } else if (
      query.includes('chemical') ||
      query.includes('pesticide') ||
      query.includes('fungicide') ||
      query.includes('medicine') ||
      query.includes('औषध') ||
      query.includes('रासायनिक') ||
      query.includes('మందు') ||
      query.includes('रसायन')
    ) {
      if (currentLang === 'mr') {
        responseText = `🧪 रासायनिक उपचार:\n• ${chemicalSpray}\n• फवारणी करताना मास्क व हातमोजे वापरा. फवारणीनंतर ७ दिवस तोडणी करू नका.`;
      } else if (currentLang === 'te') {
        responseText = `🧪 రసాయన మందు:\n• ${chemicalSpray}\n• రక్షణ దుస్తులు ధరించండి. మందు చల్లిన తర్వాత 7 రోజులు కోత చేయవద్దు.`;
      } else if (currentLang === 'hi') {
        responseText = `🧪 रासायनिक उपचार:\n• ${chemicalSpray}\n• सुरक्षा किट का उपयोग करें। छिड़काव के 7 दिन बाद ही तुड़ाई करें।`;
      } else {
        responseText = `🧪 Chemical Treatment:\n• ${chemicalSpray}\n• Wear protective gear. Observe a minimum 7-day harvest waiting interval.`;
      }
    } else if (
      query.includes('expert') ||
      query.includes('doctor') ||
      query.includes('kvk') ||
      query.includes('call') ||
      query.includes('contact') ||
      query.includes('तज्ज्ञ') ||
      query.includes('अधिकारी') ||
      query.includes('నిపుణుడు') ||
      query.includes('डॉक्टर')
    ) {
      if (currentLang === 'mr') {
        responseText = `👨‍🌾 तुम्ही जवळच्या कृषी विज्ञान केंद्र (KVK) किंवा कृषी सहाय्यकांशी संपर्क साधू शकता. अधिक माहितीसाठी 'More' विभागात KVK डिरेक्टरी पहा.`;
      } else if (currentLang === 'te') {
        responseText = `👨‍🌾 మీ సమీప కృషి విజ్ఞాన కేంద్రం (KVK) లేదా వ్యవసాయ అధికారితో మాట్లాడండి. యాప్‌లోని 'More' ట్యాబ్‌లో నంబర్లు ఉన్నాయి.`;
      } else if (currentLang === 'hi') {
        responseText = `👨‍🌾 आप नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से संपर्क कर सकते हैं। ऐप के 'More' सेक्शन में संपर्क विवरण देखें।`;
      } else {
        responseText = `👨‍🌾 You can connect with your local Krishi Vigyan Kendra (KVK) agronomist. Check the KVK directory under the More tab.`;
      }
    } else {
      // General contextual response
      if (currentLang === 'mr') {
        responseText = `तुमच्या ${crop} च्या स्कॅनवरून '${localizedName}' (${scientificName}) चे निदान झाले आहे. मुख्य लक्षण: ${primarySymptom}. उपाय: ${organicSpray}.`;
      } else if (currentLang === 'te') {
        responseText = `మీ ${crop} స్కాన్ ప్రకారం '${localizedName}' (${scientificName}) నిర్ధారించబడింది. లక్షణం: ${primarySymptom}. నివారణ: ${organicSpray}.`;
      } else if (currentLang === 'hi') {
        responseText = `आपकी ${crop} की जांच से '${localizedName}' (${scientificName}) की पुष्टि हुई है। मुख्य लक्षण: ${primarySymptom}। उपाय: ${organicSpray}।`;
      } else {
        responseText = `Based on your ${crop} scan, this is diagnosed as ${diseaseTitle} (${scientificName}). Primary symptom: ${primarySymptom}. Recommended remedy: ${organicSpray}.`;
      }
    }

    const newMessages: ChatMessage[] = [
      ...chatHistory,
      { id: Date.now().toString(), sender: 'user', text: customQuestion.trim() },
      { id: (Date.now() + 1).toString(), sender: 'assistant', text: responseText },
    ];

    setChatHistory(newMessages);
    setCustomQuestion('');

    // Speak response
    const voiceLangMap: { [key: string]: string } = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      en: 'en-IN',
    };
    Speech.stop();
    Speech.speak(responseText, {
      language: voiceLangMap[currentLang] || 'en-IN',
      rate: 0.9,
    });
  };

  const handleAssistantAudio = () => {
    if (isAssistantSpeaking) {
      Speech.stop();
      setIsAssistantSpeaking(false);
    } else {
      setIsAssistantSpeaking(true);
      const voiceLangMap: { [key: string]: string } = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        en: 'en-IN',
      };

      const answer = getAssistantAnswer(selectedQuestionId);
      Speech.speak(answer, {
        language: voiceLangMap[currentLang] || 'en-IN',
        rate: 0.9,
        onDone: () => setIsAssistantSpeaking(false),
        onError: () => setIsAssistantSpeaking(false),
      });
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const shareMsg = `🌾 AgriRaksha AI Diagnostic Report\n\n🌱 Crop: ${scan.cropName}\n🔬 Diagnosis: ${diseaseTitle} (${scientificName})\n🎯 AI Confidence: ${confidencePercent}%\n🛡️ Risk Level: ${riskLabel}\n🦠 Disease Type: ${diseaseType}\n\n🌿 Recommended Organic Treatment:\n• ${
        (scan.organicTreatment || advisory?.organicTreatment)?.[0] || 'Neem oil @ 2ml/L water'
      }\n\n🧪 Chemical Treatment:\n• ${
        (scan.chemicalTreatment || advisory?.chemicalTreatment)?.[0] || 'Mancozeb 75% WP @ 2.5g/L'
      }\n\nGenerated via AgriRaksha AI • Healthy Crops • Safer Farmers`;

      await Share.share({ message: shareMsg });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleDownloadReport = () => {
    Alert.alert(
      'Diagnostic Report',
      `Official Diagnostic Report for ${scan.cropName} (${diseaseTitle}) has been prepared.\n\nAI Diagnostic Confidence: ${confidencePercent}%\nPathology Level: ${riskLabel} Risk\n\nYou can now share or save the treatment prescription.`,
      [
        { text: 'Share Report', onPress: handleShareWhatsApp },
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  const languageLabels: Record<string, string> = {
    mr: 'मराठीत',
    te: 'తెలుగులో',
    hi: 'हिन्दी में',
    en: 'English',
  };

  const currentLanguageLabel = languageLabels[currentLang] || 'English';

  const symptomsList =
    scan.symptoms && scan.symptoms.length > 0
      ? scan.symptoms
      : advisory?.symptoms && advisory.symptoms.length > 0
      ? advisory.symptoms
      : [
          'Concentric dark brown circular rings (target pattern) on lower foliage',
          'Yellow chlorotic halo surrounding lesions',
          'Premature defoliation starting from the bottom canopy upwards',
        ];

  const organicList =
    scan.organicTreatment && scan.organicTreatment.length > 0
      ? scan.organicTreatment
      : advisory?.organicTreatment || [];

  const chemicalList =
    scan.chemicalTreatment && scan.chemicalTreatment.length > 0
      ? scan.chemicalTreatment
      : advisory?.chemicalTreatment || [];

  const preventionList =
    scan.preventionTips && scan.preventionTips.length > 0
      ? scan.preventionTips
      : advisory?.preventionTips || [];

  const activeAnswer = getAssistantAnswer(selectedQuestionId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D532B" />

      {/* Top Header Bar with Prominent Back Button */}
      <View style={styles.header}>
        <View style={styles.headerContentWrapper}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={handleBack}
              activeOpacity={0.7}
              accessibilityLabel="Go Back"
            >
              <Text style={styles.headerBackIcon}>←</Text>
              <Text style={styles.headerBackText}>
                {currentLang === 'mr' ? 'मागे' : currentLang === 'te' ? 'వెనుకకు' : currentLang === 'hi' ? 'वापस' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <View style={styles.logoIconCircle}>
                <Text style={styles.logoEmoji}>🌱</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>AgriRaksha AI</Text>
                <Text style={styles.brandSubtitle}>Healthy Crops • Safer Farmers</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareWhatsApp}
            activeOpacity={0.8}
          >
            <Text style={styles.shareIcon}>🔗</Text>
            <Text style={styles.shareBtnText}>Share Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Main Diagnosis Summary Card */}
          <View style={styles.summaryCard}>
            <View style={isDesktop ? styles.summaryRowDesktop : styles.summaryRowMobile}>
              {/* Left Column: Scanned Image Preview */}
              <View style={isDesktop ? styles.imageColDesktop : styles.imageColMobile}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require('../../assets/viewfinder_leaf.jpg')
                    }
                    style={styles.scannedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.scannedImageBadge}>
                    <Text style={styles.cameraIcon}>📷</Text>
                    <Text style={styles.scannedImageText}>Scanned Image</Text>
                  </View>
                </View>
              </View>

              {/* Right Column: Disease, Crop, Pathogen, Risk & Confidence */}
              <View style={isDesktop ? styles.detailsColDesktop : styles.detailsColMobile}>
                <View style={styles.titleAndRiskRow}>
                  <Text style={styles.cropLabelText}>{scan.cropName}</Text>
                  <View
                    style={[
                      styles.riskBadge,
                      scan.isHealthy
                        ? styles.riskBadgeHealthy
                        : scan.severity === 'severe'
                        ? styles.riskBadgeSevere
                        : styles.riskBadgeModerate,
                    ]}
                  >
                    <Text style={styles.riskIcon}>
                      {scan.isHealthy ? '🌱' : '⚠️'}
                    </Text>
                    <Text
                      style={[
                        styles.riskBadgeText,
                        scan.isHealthy
                          ? styles.riskTextHealthy
                          : scan.severity === 'severe'
                          ? styles.riskTextSevere
                          : styles.riskTextModerate,
                      ]}
                    >
                      {riskLabel} Risk
                    </Text>
                  </View>
                </View>

                {/* Primary Disease Title */}
                <Text style={styles.diseaseMainTitle}>{diseaseTitle}</Text>
                {scientificName ? (
                  <Text style={styles.scientificNameText}>({scientificName})</Text>
                ) : null}

                {/* Pathogen Detail Block */}
                <View style={styles.pathogenBlock}>
                  <View style={styles.pathogenIconCircle}>
                    <Text style={styles.pathogenEmoji}>🦠</Text>
                  </View>
                  <View style={styles.pathogenTextCol}>
                    <Text style={styles.pathogenLabel}>Pathogen</Text>
                    <Text style={styles.pathogenValue}>
                      {diseaseType} {scientificName ? `(${scientificName})` : ''}
                    </Text>
                  </View>
                </View>

                {/* AI Diagnostic Confidence Meter */}
                <View style={styles.confidenceBlock}>
                  <View style={styles.confidenceHeaderRow}>
                    <View style={styles.confidenceLabelGroup}>
                      <View style={styles.confidenceIconCircle}>
                        <Text style={styles.confidenceEmoji}>📊</Text>
                      </View>
                      <Text style={styles.confidenceLabel}>AI Confidence</Text>
                    </View>
                    <Text style={styles.confidencePercentText}>{confidencePercent}%</Text>
                  </View>

                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${confidencePercent}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 3 Compact Diagnosis Information Cards */}
          <View style={styles.infoCardsRow}>
            {/* Card 1: Crop */}
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.infoCardEmoji}>🍅</Text>
              </View>
              <View style={styles.infoCardTextGroup}>
                <Text style={styles.infoCardLabel}>Crop</Text>
                <Text style={[styles.infoCardValue, { color: '#DC2626' }]}>
                  {scan.cropName}
                </Text>
              </View>
            </View>

            {/* Card 2: Disease Type */}
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.infoCardEmoji}>🦠</Text>
              </View>
              <View style={styles.infoCardTextGroup}>
                <Text style={styles.infoCardLabel}>Disease Type</Text>
                <Text style={[styles.infoCardValue, { color: '#1E40AF' }]}>
                  {diseaseType}
                </Text>
              </View>
            </View>

            {/* Card 3: Risk Level */}
            <View style={styles.infoCard}>
              <View style={[styles.infoCardIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.infoCardEmoji}>🛡️</Text>
              </View>
              <View style={styles.infoCardTextGroup}>
                <Text style={styles.infoCardLabel}>Risk Level</Text>
                <Text style={[styles.infoCardValue, { color: '#D97706' }]}>
                  {riskLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* ======================================================== */}
          {/* 🌱 AI CROP ASSISTANT (Post-Diagnosis Contextual Guide)  */}
          {/* ======================================================== */}
          <View style={styles.assistantCard}>
            <View style={styles.assistantHeaderRow}>
              <View style={styles.assistantLogoCircle}>
                <Text style={styles.assistantLogoEmoji}>🌱</Text>
              </View>
              <View style={styles.assistantHeaderCol}>
                <View style={styles.assistantTitleTagRow}>
                  <Text style={styles.assistantTitleText}>AI Crop Assistant</Text>
                  <View style={styles.assistantActiveTag}>
                    <Text style={styles.assistantActiveTagText}>● Online & Ready</Text>
                  </View>
                </View>
                <Text style={styles.assistantSubText}>
                  Ask any question about {scan.cropName} ({diseaseTitle})
                </Text>
              </View>
            </View>

            {/* Interactive Ask Input Box */}
            <View style={styles.askInputContainer}>
              <TextInput
                style={styles.askTextInput}
                placeholder={
                  currentLang === 'mr'
                    ? 'या रोगाबद्दल कोणताही प्रश्न विचारा (उदा. डोस किती, पाऊस)...'
                    : currentLang === 'te'
                    ? 'ఈ తెగులు గురించి ఏదైనా ప్రశ్న అడగండి...'
                    : currentLang === 'hi'
                    ? 'इस बीमारी के बारे में कोई भी प्रश्न पूछें...'
                    : 'Ask any question about this crop disease...'
                }
                placeholderTextColor="#94A3B8"
                value={customQuestion}
                onChangeText={setCustomQuestion}
                onSubmitEditing={handleAskCustomQuestion}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.askSendButton,
                  !customQuestion.trim() && styles.askSendButtonDisabled,
                ]}
                onPress={handleAskCustomQuestion}
                disabled={!customQuestion.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.askSendButtonText}>Ask ➔</Text>
              </TouchableOpacity>
            </View>

            {/* Chat History if farmer asked custom questions */}
            {chatHistory.length > 0 && (
              <View style={styles.chatHistoryWrapper}>
                {chatHistory.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatBubbleText,
                        msg.sender === 'user' ? styles.chatBubbleTextUser : styles.chatBubbleTextBot,
                      ]}
                    >
                      {msg.sender === 'assistant' ? '🌱 ' : '🧑‍🌾 '}
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Questions Prompt */}
            <Text style={styles.assistantPromptText}>
              {currentLang === 'mr'
                ? 'किंवा खालीलपैकी एक झटपट प्रश्न निवडा:'
                : currentLang === 'te'
                ? 'లేదా క్రింది శీఘ్ర ప్రశ్నను ఎంచుకోండి:'
                : currentLang === 'hi'
                ? 'या नीचे दिए गए त्वरित प्रश्नों में से चुनें:'
                : 'Or tap a quick question below:'}
            </Text>

            {/* Predefined Quick Questions Horizontal Scroll Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.questionsScrollRow}
            >
              {QUICK_QUESTIONS.map((q) => {
                const isSelected = selectedQuestionId === q.id;
                const label = q.labels[currentLang] || q.labels.en;
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.questionChip,
                      isSelected && styles.questionChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedQuestionId(q.id);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.questionChipIcon}>{q.icon}</Text>
                    <Text
                      style={[
                        styles.questionChipText,
                        isSelected && styles.questionChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Assistant Dynamic Answer Speech Bubble */}
            <View style={styles.answerContainer}>
              <View style={styles.answerHeaderRow}>
                <View style={styles.answerBotBadge}>
                  <Text style={styles.answerBotEmoji}>🌱</Text>
                  <Text style={styles.answerBotLabel}>AgriRaksha Guide</Text>
                </View>

                {/* Speak Answer Button */}
                <TouchableOpacity
                  style={[
                    styles.listenAnswerBtn,
                    isAssistantSpeaking && styles.listenAnswerBtnActive,
                  ]}
                  onPress={handleAssistantAudio}
                  activeOpacity={0.8}
                >
                  <Text style={styles.listenAnswerIcon}>
                    {isAssistantSpeaking ? '⏹️' : '🔊'}
                  </Text>
                  <Text style={styles.listenAnswerText}>
                    {isAssistantSpeaking ? 'Stop' : 'Listen'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.answerBodyText}>{activeAnswer}</Text>

              {/* KVK Expert Escalation Callout if Severe or Expert Question */}
              {(selectedQuestionId === 'contact_expert' || scan.severity === 'severe') && (
                <TouchableOpacity
                  style={styles.kvkConnectBtn}
                  onPress={() => navigation.navigate('MoreTab')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.kvkConnectEmoji}>👨‍🌾</Text>
                  <Text style={styles.kvkConnectText}>
                    {currentLang === 'mr'
                      ? 'कृषी विज्ञान केंद्र (KVK) तज्ज्ञांशी संपर्क साधा'
                      : currentLang === 'te'
                      ? 'కృషి విజ్ఞాన కేంద్రం (KVK) నిపుణుడిని సంప్రదించండి'
                      : currentLang === 'hi'
                      ? 'कृषि विज्ञान केंद्र (KVK) विशेषज्ञ से संपर्क करें'
                      : 'Connect with KVK Agronomist'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Key Symptoms Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderEmoji}>🌱</Text>
              <Text style={styles.sectionHeaderTitle}>Key Symptoms</Text>
            </View>

            <View style={isDesktop ? styles.symptomsGridDesktop : styles.symptomsGridMobile}>
              {symptomsList.map((symptom: string, idx: number) => {
                const imgUri = SYMPTOM_PREVIEW_IMAGES[idx % SYMPTOM_PREVIEW_IMAGES.length];
                return (
                  <View key={idx} style={styles.symptomCard}>
                    <Image
                      source={{ uri: imgUri }}
                      style={styles.symptomImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.symptomCaptionText}>{symptom}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Treatment Prescription Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderEmoji}>💊</Text>
              <Text style={styles.sectionHeaderTitle}>Treatment Prescription</Text>
            </View>

            {/* Segmented Prescription Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'organic' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('organic')}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>🌱</Text>
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'organic' && styles.tabButtonTextActive,
                  ]}
                >
                  Organic Bio-Solutions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'chemical' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('chemical')}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>🧪</Text>
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'chemical' && styles.tabButtonTextActive,
                  ]}
                >
                  Chemical Treatment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'preventive' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('preventive')}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>🛡️</Text>
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'preventive' && styles.tabButtonTextActive,
                  ]}
                >
                  Prevention
                </Text>
              </TouchableOpacity>
            </View>

            {/* Treatment Content Box */}
            <View style={styles.treatmentContentBox}>
              {activeTab === 'organic' && (
                <View>
                  <View style={styles.organicBanner}>
                    <Text style={styles.organicBannerText}>
                      ✓ Safe for Soil & Natural Predators
                    </Text>
                  </View>

                  {organicList.map((item: string, idx: number) => (
                    <View key={idx} style={styles.remedyItemRow}>
                      <Text style={styles.remedyBulletEmoji}>🌱</Text>
                      <Text style={styles.remedyDescriptionText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'chemical' && (
                <View>
                  <View style={styles.chemicalBanner}>
                    <Text style={styles.chemicalBannerText}>
                      ⚠️ Follow safety gear instructions. Maintain 7-day harvest interval.
                    </Text>
                  </View>

                  {chemicalList.map((item: string, idx: number) => (
                    <View key={idx} style={styles.remedyItemRow}>
                      <Text style={styles.remedyBulletEmoji}>🧪</Text>
                      <Text style={styles.remedyDescriptionText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'preventive' && (
                <View>
                  <View style={styles.preventiveBanner}>
                    <Text style={styles.preventiveBannerText}>
                      🛡️ Field Sanitation & Good Agricultural Practices (GAP)
                    </Text>
                  </View>

                  {preventionList.map((item: string, idx: number) => (
                    <View key={idx} style={styles.remedyItemRow}>
                      <Text style={styles.remedyBulletEmoji}>🛡️</Text>
                      <Text style={styles.remedyDescriptionText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Button 0: Go Back */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.backActionBtn]}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnEmoji}>⬅️</Text>
              <Text style={styles.backActionTitle}>
                {currentLang === 'mr' ? 'मागे जा' : currentLang === 'te' ? 'వెనుకకు వెళ్లండి' : currentLang === 'hi' ? 'वापस जाएं' : 'Go Back'}
              </Text>
            </TouchableOpacity>

            {/* Button 1: Listen Guidance */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.audioActionBtn,
                isSpeaking && styles.audioActionBtnActive,
              ]}
              onPress={handleToggleVoice}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnEmoji}>{isSpeaking ? '⏹️' : '🎧'}</Text>
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.audioActionTitle}>
                  {isSpeaking ? 'Stop Audio' : 'Listen Guidance'}
                </Text>
                <Text style={styles.audioActionSub}>({currentLanguageLabel})</Text>
              </View>
            </TouchableOpacity>

            {/* Button 2: Download Report */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadActionBtn]}
              onPress={handleDownloadReport}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnEmoji}>📄</Text>
              <Text style={styles.downloadActionTitle}>Download Report</Text>
            </TouchableOpacity>

            {/* Button 3: Scan Another */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.scanAnotherActionBtn]}
              onPress={() => navigation.navigate('Scan')}
              activeOpacity={0.85}
            >
              <Text style={styles.scanAnotherEmoji}>⛶</Text>
              <Text style={styles.scanAnotherTitle}>Scan Another</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Watermark */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              🌱 Together for a Disease-Free Tomorrow
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D532B',
  },
  header: {
    backgroundColor: '#0D532B',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 14 : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerContentWrapper: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  headerBackIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 4,
  },
  headerBackText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A7F3D0',
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  scrollContent: {
    backgroundColor: '#F1F5F9',
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryRowDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  summaryRowMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  imageColDesktop: {
    flex: 4,
  },
  imageColMobile: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  scannedImage: {
    width: '100%',
    height: '100%',
  },
  scannedImageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cameraIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  scannedImageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsColDesktop: {
    flex: 6,
    justifyContent: 'center',
  },
  detailsColMobile: {
    width: '100%',
  },
  titleAndRiskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.2,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskBadgeModerate: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  riskBadgeSevere: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  riskBadgeHealthy: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  riskIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  riskBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  riskTextModerate: {
    color: '#DC2626',
  },
  riskTextSevere: {
    color: '#B91C1C',
  },
  riskTextHealthy: {
    color: '#16A34A',
  },
  diseaseMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  scientificNameText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#64748B',
    marginBottom: 12,
  },
  pathogenBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pathogenIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pathogenEmoji: {
    fontSize: 16,
  },
  pathogenTextCol: {
    flex: 1,
  },
  pathogenLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  pathogenValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  confidenceBlock: {
    marginTop: 2,
  },
  confidenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  confidenceEmoji: {
    fontSize: 13,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  confidencePercentText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoCardEmoji: {
    fontSize: 18,
  },
  infoCardTextGroup: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },

  /* AI Crop Assistant Card Styles */
  assistantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#22C55E',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  assistantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  assistantLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assistantLogoEmoji: {
    fontSize: 24,
  },
  assistantHeaderCol: {
    flex: 1,
  },
  assistantTitleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assistantTitleText: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  assistantActiveTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  assistantActiveTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  assistantSubText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },

  /* Ask Input Area */
  askInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  askTextInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 8,
    fontWeight: '600',
  },
  askSendButton: {
    backgroundColor: '#166534',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 6,
  },
  askSendButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  askSendButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* Chat history bubbles */
  chatHistoryWrapper: {
    gap: 8,
    marginBottom: 14,
  },
  chatBubble: {
    borderRadius: 12,
    padding: 10,
    maxWidth: '92%',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#0D532B',
  },
  chatBubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chatBubbleTextBot: {
    color: '#0F172A',
    fontWeight: '600',
  },

  assistantPromptText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
  },
  questionsScrollRow: {
    gap: 8,
    paddingBottom: 8,
  },
  questionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  questionChipSelected: {
    backgroundColor: '#0D532B',
    borderColor: '#0D532B',
  },
  questionChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  questionChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  questionChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  answerContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1.2,
    borderColor: '#BBF7D0',
  },
  answerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerBotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerBotEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  answerBotLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  listenAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  listenAnswerBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  listenAnswerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  listenAnswerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  answerBodyText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 21,
  },
  kvkConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  kvkConnectEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  kvkConnectText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  symptomsGridDesktop: {
    flexDirection: 'row',
    gap: 14,
  },
  symptomsGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  symptomCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  symptomImage: {
    width: '100%',
    height: 110,
  },
  symptomCaptionText: {
    padding: 10,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#0D532B',
    borderColor: '#0D532B',
  },
  tabIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  treatmentContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  organicBanner: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  organicBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  chemicalBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  chemicalBannerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
  },
  preventiveBanner: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  preventiveBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#075985',
  },
  remedyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  remedyBulletEmoji: {
    fontSize: 15,
    marginRight: 8,
    marginTop: 1,
  },
  remedyDescriptionText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  actionBtnTextCol: {
    alignItems: 'flex-start',
  },
  backActionBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  backActionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  audioActionBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
  },
  audioActionBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  audioActionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  audioActionSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3B82F6',
  },
  downloadActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  downloadActionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  scanAnotherActionBtn: {
    backgroundColor: '#0D532B',
    borderWidth: 1.2,
    borderColor: '#0D532B',
  },
  scanAnotherEmoji: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 6,
  },
  scanAnotherTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.2,
  },
});

export default DiagnosisResultScreen;
