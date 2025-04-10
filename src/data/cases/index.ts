
import { enicsCase } from './enics';
import { heinekenCase } from './heineken';
import { agenceMrCase } from './agence-mr';
import { toeflCase } from './toefl';
import { datavoxxCase } from './datavoxx';
import { emagrecentroCase } from './emagrecentro';
import { placluxCase } from './placlux';
import { fmuVirtualCase } from './fmu-virtual';
import { firstSecurityCase } from './security-first';
import { funnelsCase } from './funnels';

// Type definition for a case study
export interface CaseStudy {
  title: string;
  category: string;
  logo: string;
  coverImage: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    value: string;
    label: string;
  }[];
  quote: string;
  author: string;
  role: string;
  authorImage?: string;
  description?: string;
  tags?: string[];
}

// Combine all cases into a single object
export const casesData: Record<string, CaseStudy> = {
  "enics": enicsCase,
  "heineken": heinekenCase,
  "agence-mr": agenceMrCase,
  "toefl": toeflCase,
  "datavoxx": datavoxxCase,
  "emagrecentro": emagrecentroCase,
  "placlux": placluxCase,
  "fmu-virtual": fmuVirtualCase,
  "first-security": firstSecurityCase,
  "funnels": funnelsCase
};

export type CaseStudyKey = keyof typeof casesData;
