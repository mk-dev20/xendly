import { Country } from '@/types';

export const COUNTRIES: Country[] = [
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    flag: '🇰🇪'
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    flag: '🇺🇬'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    flag: '🇹🇿'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    flag: '🇷🇼'
  },
  {
    code: 'BI',
    name: 'Burundi',
    currency: 'BIF',
    flag: '🇧🇮'
  }
];

export const SUPPORTED_CURRENCIES = ['KES', 'UGX', 'TZS', 'RWF', 'BIF', 'USDC', 'XLM'];

export const EXCHANGE_RATES: Record<string, number> = {
  KES: 1,
  UGX: 37.5,
  TZS: 23.5,
  RWF: 13.2,
  BIF: 29.8,
  USDC: 0.0076,
  XLM: 0.062
};