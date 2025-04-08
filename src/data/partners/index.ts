
import { agenceMrPartner } from './agence-mr';
import { anhembiPartner } from './anhembi';
import { bldnDigitalPartner } from './bldn-digital';
import { datavoxxPartner } from './datavoxx';
import { enicsPartner } from './enics';
import { fmuVirtualPartner } from './fmu-virtual';
import { heinekenPartner } from './heineken';
import { placluxPartner } from './placlux';
import { securityFirstPartner } from './security-first';
import { toeflPartner } from './toefl';
import { funnelsPartner } from './funnels';
import { Partner } from './types';

export const partners: Record<string, Partner> = {
  'agence-mr': agenceMrPartner,
  'anhembi': anhembiPartner,
  'bldn-digital': bldnDigitalPartner,
  'datavoxx': datavoxxPartner,
  'enics': enicsPartner,
  'fmu-virtual': fmuVirtualPartner,
  'heineken': heinekenPartner,
  'placlux': placluxPartner,
  'security-first': securityFirstPartner,
  'toefl': toeflPartner,
  'funnels': funnelsPartner,
};

export type PartnerKey = keyof typeof partners;
