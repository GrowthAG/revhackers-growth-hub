
import { PartnerData } from './types';
import { securityFirstData } from './security-first';
import { anhembiData } from './anhembi';
import { fmuVirtualData } from './fmu-virtual';
import { toeflData } from './toefl';
import { datavoxxData } from './datavoxx';
import { agenceMrData } from './agence-mr';
import { heinekenData } from './heineken';
import { bldnDigitalData } from './bldn-digital';
import { placluxData } from './placlux';
import { enicsData } from './enics';

export const partnersData: Record<string, PartnerData> = {
  "security-first": securityFirstData,
  "anhembi": anhembiData,
  "fmu-virtual": fmuVirtualData,
  "toefl": toeflData,
  "datavoxx": datavoxxData,
  "agence-mr": agenceMrData,
  "heineken": heinekenData,
  "bldn-digital": bldnDigitalData,
  "placlux": placluxData,
  "enics": enicsData
};

export type { PartnerData, PartnerKey } from './types';

// Re-export individual partner data for direct imports
export {
  securityFirstData,
  anhembiData,
  fmuVirtualData,
  toeflData,
  datavoxxData,
  agenceMrData,
  heinekenData,
  bldnDigitalData,
  placluxData,
  enicsData
};
