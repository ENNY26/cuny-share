import express from 'express';
import {
  getPrivacyPolicy,
  getTermsOfService,
  getCommunityGuidelines,
  getDataPolicy
} from '../controllers/policyController.js';

const router = express.Router();

// Policy routes (public, no authentication required)
router.get('/privacy', getPrivacyPolicy);
router.get('/terms', getTermsOfService);
router.get('/guidelines', getCommunityGuidelines);
router.get('/data', getDataPolicy);

export default router;

