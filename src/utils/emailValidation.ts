export const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  'live.com',
  'bol.com.br',
  'uol.com.br',
  'icloud.com',
  'gmx.com',
  'protonmail.com',
  'ymail.com',
  'terra.com.br',
  'ig.com.br',
  'aol.com',
  'msn.com',
  'yahoo.com.br',
  'hotmail.com.br',
  'outlook.com.br'
];

export const isCorporateEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
};
