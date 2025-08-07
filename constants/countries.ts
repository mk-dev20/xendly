import { Country } from '@/types';

export const COUNTRIES: Country[] = [
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    flag: 'ke.png'
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    flag: 'ug.png'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    flag: 'tz.png'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    flag: 'rw.png'
  },
  {
    code: 'BI',
    name: 'Burundi',
    currency: 'BIF',
    flag: 'br.png'
  }
];


export const SUPPORTED_CURRENCIES = ['XLM', 'USDC', 'KES', 'UGX', 'TZS', 'RWF', 'BIF'];

export const CURRENCY_FLAGS: Record<string, string> = {
  'KES': '🇰🇪',
  'UGX': '🇺🇬', 
  'TZS': '🇹🇿',
  'RWF': '🇷🇼',
  'BIF': '🇧🇮',
  'XLM': '🌟',
  'USDC': '🇺🇸',
};

export const EXCHANGE_RATES: Record<string, number> = {
  KES: 1,
  UGX: 37.5,
  TZS: 23.5,
  RWF: 13.2,
  BIF: 29.8,
  USDC: 0.0076,
  XLM: 0.062
};