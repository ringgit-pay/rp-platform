export interface RpCountry {
  iso: string;
  name: string;
  dial: string;
}

/** SE-Asia first, then common others. Extend as needed. */
export const RP_COUNTRIES: RpCountry[] = [
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'VN', name: 'Vietnam', dial: '+84' },
  { iso: 'BN', name: 'Brunei', dial: '+673' },
  { iso: 'KH', name: 'Cambodia', dial: '+855' },
  { iso: 'MM', name: 'Myanmar', dial: '+95' },
  { iso: 'LA', name: 'Laos', dial: '+856' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'US', name: 'United States', dial: '+1' },
];

export const RP_DEFAULT_COUNTRY = 'MY';
