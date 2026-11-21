export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
  linkText: string;
  url?: string;
}

export interface UpdateEntry {
  version: string;
  date: string;
  status: 'current' | 'previous';
  highlights: string[];
  fixes: string[];
  features: string[];
}

export type Appearance = 'ink' | 'oled';
export type InterfaceDensity = 'compact' | 'comfortable';

export interface InterfacePreferences {
  appearance: Appearance;
  accentKey: string;
  customAccent: string;
  useCustomAccent: boolean;
  animations: boolean;
  effectsIntensity: number;
  density: InterfaceDensity;
}
