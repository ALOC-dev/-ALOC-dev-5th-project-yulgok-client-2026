export const SERVICE_STAGES = Object.freeze({
  LOGIN: 'LOGIN',
  ADMIN: 'ADMIN',
  CONSENT: 'CONSENT',
  SURVEY: 'SURVEY',
  CERTIFICATION: 'CERTIFICATION',
  CERTIFIED: 'CERTIFIED',
});

const STAGE_DESTINATIONS = Object.freeze({
  [SERVICE_STAGES.LOGIN]: '/login',
  [SERVICE_STAGES.ADMIN]: '/admin',
  [SERVICE_STAGES.CONSENT]: '/entry',
  [SERVICE_STAGES.SURVEY]: '/surveys/sleep',
  [SERVICE_STAGES.CERTIFICATION]: '/certification',
  [SERVICE_STAGES.CERTIFIED]: '/matching',
});

export function getServiceStage(user) {
  if (!user) return SERVICE_STAGES.LOGIN;
  if (user.role === 'ADMIN') return SERVICE_STAGES.ADMIN;
  if (user.role === 'USER' && user.status === 'ACTIVE') {
    return SERVICE_STAGES.CERTIFIED;
  }
  if (user.role === 'GUEST') return SERVICE_STAGES.CONSENT;
  if (user.role !== 'USER') return SERVICE_STAGES.LOGIN;
  if (user.surveyCompleted !== true) return SERVICE_STAGES.SURVEY;
  if (user.certificationStatus === 'APPROVED') {
    return SERVICE_STAGES.CERTIFIED;
  }
  return SERVICE_STAGES.CERTIFICATION;
}

export function getServiceDestination(user) {
  return STAGE_DESTINATIONS[getServiceStage(user)];
}

export function canAccessCertifiedRoutes(user) {
  const isKnownUserRole = user?.role === 'USER' || user?.role === 'ADMIN';

  if (isKnownUserRole && user.status === 'ACTIVE') return true;

  return (
    user?.role === 'USER'
    && user.surveyCompleted === true
    && user.certificationStatus === 'APPROVED'
  );
}
