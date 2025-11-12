import type { ReactNode } from 'react';

export enum ServiceType {
  GENERAL = 'GENERAL',
  POEM = 'POEM',
  STORY = 'STORY',
  HOROSCOPE = 'HOROSCOPE',
  PERSONALITY_ANALYSIS = 'PERSONALITY_ANALYSIS',
  SUMMARY = 'SUMMARY',
  WRITING_IMPROVER = 'WRITING_IMPROVER',
  IDEA_GENERATOR = 'IDEA_GENERATOR',
  EMAIL_WRITER = 'EMAIL_WRITER',
  CV_WRITER = 'CV_WRITER',
  SOCIAL_MEDIA_POST = 'SOCIAL_MEDIA_POST',
  RELATIONSHIP_ANALYSIS = 'RELATIONSHIP_ANALYSIS',
  QUIZ = 'QUIZ',
  NAME_GENERATOR = 'NAME_GENERATOR',
  QUOTE_OF_THE_DAY = 'QUOTE_OF_THE_DAY',
  DREAM_ANALYSIS = 'DREAM_ANALYSIS',
  VIDEO_IDEA_GENERATOR = 'VIDEO_IDEA_GENERATOR',
  LYRIC_GENERATOR = 'LYRIC_GENERATOR',
  QUOTE_GENERATOR = 'QUOTE_GENERATOR',
  DIALOGUE_GENERATOR = 'DIALOGUE_GENERATOR',
  EXAM_GENERATOR = 'EXAM_GENERATOR',
  CONCEPT_EXPLAINER = 'CONCEPT_EXPLAINER',
  PROJECT_ANALYSIS = 'PROJECT_ANALYSIS',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
}

export interface ServiceConfig {
  type: ServiceType;
  title: string;
  icon: ReactNode;
  placeholder: string;
  inputType: 'textarea' | 'text' | 'select';
  options?: string[];
  promptPrefix: string;
}

export interface AppConfig {
  login: {
    enabled: boolean;
    username: string;
    password: string;
  };
  subscriptionUrl: string;
  adSettings: {
    videoUrls: string[];
    duration: number; // in seconds
  };
  developerInfo: {
    name: string;
    url: string;
    contact?: {
      email?: string;
      whatsapp?: string;
      telegram?: string;
    }
  };
  siteLogoUrl: string;
}

// ==========================================
// User Content Types
// ==========================================

export interface CustomAd {
  id: string;
  name: string;
  description: string;
  link: string;
  image: string; // Base64 encoded image
}

export interface SavedResult {
  id: string;
  serviceType: ServiceType;
  prompt: string;
  result: string;
  timestamp: string;
}

export interface AppData {
  results: Record<ServiceType, string | null>;
  customAds: CustomAd[];
  savedResults: SavedResult[];
}