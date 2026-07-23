import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SERVICE_STAGES,
  canAccessCertifiedRoutes,
  getServiceDestination,
  getServiceStage,
} from './serviceFlow.js';

const cases = [
  {
    name: 'missing user requires login',
    user: undefined,
    stage: 'LOGIN',
    destination: '/login',
    certified: false,
  },
  {
    name: 'active admin enters admin first and can access certified routes',
    user: { role: 'ADMIN', status: 'ACTIVE' },
    stage: 'ADMIN',
    destination: '/admin',
    certified: true,
  },
  {
    name: 'guest without survey consent enters consent',
    user: { role: 'GUEST', status: 'PENDING', surveyCompleted: false },
    stage: 'CONSENT',
    destination: '/entry',
    certified: false,
  },
  {
    name: 'pending user without a completed survey enters the survey',
    user: { role: 'USER', status: 'PENDING', surveyCompleted: false },
    stage: 'SURVEY',
    destination: '/surveys/sleep',
    certified: false,
  },
  {
    name: 'pending user with an approved certification still enters the survey until it is complete',
    user: {
      role: 'USER',
      status: 'PENDING',
      surveyCompleted: false,
      certificationStatus: 'APPROVED',
    },
    stage: 'SURVEY',
    destination: '/surveys/sleep',
    certified: false,
  },
  {
    name: 'survey-complete user without certification enters certification',
    user: { role: 'USER', status: 'PENDING', surveyCompleted: true },
    stage: 'CERTIFICATION',
    destination: '/certification',
    certified: false,
  },
  {
    name: 'requested certification remains in certification',
    user: {
      role: 'USER',
      status: 'PENDING',
      surveyCompleted: true,
      certificationStatus: 'REQUESTED',
    },
    stage: 'CERTIFICATION',
    destination: '/certification',
    certified: false,
  },
  {
    name: 'rejected certification remains in certification',
    user: {
      role: 'USER',
      status: 'PENDING',
      surveyCompleted: true,
      certificationStatus: 'REJECTED',
    },
    stage: 'CERTIFICATION',
    destination: '/certification',
    certified: false,
  },
  {
    name: 'approved certification enters matching',
    user: {
      role: 'USER',
      status: 'PENDING',
      surveyCompleted: true,
      certificationStatus: 'APPROVED',
    },
    stage: 'CERTIFIED',
    destination: '/matching',
    certified: true,
  },
  {
    name: 'active user enters matching regardless of survey completion',
    user: { role: 'USER', status: 'ACTIVE', surveyCompleted: false },
    stage: 'CERTIFIED',
    destination: '/matching',
    certified: true,
  },
  {
    name: 'unknown role requires login',
    user: { role: 'MODERATOR', status: 'ACTIVE', surveyCompleted: true },
    stage: 'LOGIN',
    destination: '/login',
    certified: false,
  },
];

test('service flow maps users to the correct stages, destinations, and certified access', () => {
  for (const { certified, destination, name, stage, user } of cases) {
    assert.equal(getServiceStage(user), SERVICE_STAGES[stage], name);
    assert.equal(getServiceDestination(user), destination, name);
    assert.equal(canAccessCertifiedRoutes(user), certified, name);
  }
});
