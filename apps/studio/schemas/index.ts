// =============================================================================
// Sanity schema barrel
// =============================================================================

import { siteCopy } from './singletons/siteCopy';
import { pdfReportConfig } from './singletons/pdfReportConfig';
import { nisabFallback } from './singletons/nisabFallback';
import { announcement } from './singletons/announcement';

import { viewDescription } from './methodology/viewDescription';
import { assetCategory } from './methodology/assetCategory';
import { tooltip } from './methodology/tooltip';

import { charity } from './directory/charity';

import { featureFlag } from './ops/featureFlag';
import { shareTemplate } from './ops/shareTemplate';
import { currencyConfig } from './ops/currencyConfig';

import { localizedString } from './objects/localizedString';
import { localizedText } from './objects/localizedText';

export const schemaTypes = [
  // Objects (reusable)
  localizedString,
  localizedText,

  // Singletons
  siteCopy,
  pdfReportConfig,
  nisabFallback,
  announcement,

  // Methodology
  viewDescription,
  assetCategory,
  tooltip,

  // Directory
  charity,

  // Operational
  featureFlag,
  shareTemplate,
  currencyConfig,
];
