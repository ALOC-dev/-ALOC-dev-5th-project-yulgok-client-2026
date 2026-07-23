import { useState } from 'react';
import { getProfileImageUrl, PROFILE_IMAGE_FALLBACK_URL } from '../../../utils/profileImage';
import { ChevronDownIcon, FilledHeartIcon } from './MatchingIcons.jsx';

const PREFERENCE_LABELS = {
  BEDTIME: {
    1: '10시 이전 취침',
    2: '11시쯤 취침',
    3: '자정쯤 취침',
    4: '새벽 1시쯤 취침',
    5: '새벽 1시 이후 취침',
  },
  SNORING: {
    1: '코골이 없음',
    2: '코골이 거의 없음',
    3: '코골이 보통',
    4: '코골이 있음',
    5: '코골이 심함',
  },
  SLEEPTALKING: {
    1: '잠꼬대 없음',
    2: '잠꼬대 거의 없음',
    3: '잠꼬대 보통',
    4: '잠꼬대 있음',
    5: '잠꼬대 심함',
  },
  ORGANIZINGSTYLE: {
    1: '매우 깔끔',
    2: '깔끔한 편',
    3: '정리 습관 보통',
    4: '정리에 여유로움',
    5: '정리에 자유로움',
  },
  CALLINGINROOM: { 1: '방에서 자유롭게 통화', 2: '이어폰으로 통화', 3: '나가서 통화' },
  TEMPERATUREPREFERENCE: { 1: '시원한 실내', 2: '적당한 실내 온도', 3: '따뜻한 실내' },
  SPEAKERSTYLE: { 1: '이어폰 사용', 2: '스피커 사용', 3: '이어폰·스피커 모두' },
  EATINGINROOM: { 1: '방에서 자주 취식', 2: '방에서 가끔 취식', 3: '방에서 취식 안 함' },
  SHOWERFREQUENCY: { 1: '하루 2회 이상 샤워', 2: '하루 1회 샤워', 3: '이틀에 1회 샤워', 4: '주 몇 회 샤워' },
  SMOKINGSTATUS: { 0: '비흡연자', 1: '흡연자' },
};

const MATCH_STATUS_INFO = {
  RECOMMENDED: {
    label: '나에게 추천된 룸매예요',
    badgeClass: 'text-[#315f9f]',
    dotClass: 'bg-[#5d8fd2]',
  },
  HEART_SENT: {
    label: '내가 좋아요를 보냈어요',
    badgeClass: 'text-[#6c4ab6]',
    dotClass: 'bg-[#8b6bd1]',
  },
  HEART_RECEIVED: {
    label: '상대가 나에게 좋아요를 보냈어요',
    badgeClass: 'text-[#d64f78]',
    dotClass: 'bg-[#ff668b]',
  },
  HEART_MATCHED: {
    label: '서로 좋아요를 보냈어요',
    badgeClass: 'text-[#d64f78]',
    dotClass: 'bg-[#ff668b]',
  },
  REJECTED_BY_OTHER: {
    label: '상대가 이번 추천을 넘겼어요',
    badgeClass: 'text-[#718096]',
    dotClass: 'bg-[#9aa7b8]',
  },
  CONFIRM_PENDING: {
    label: '최종 확정을 기다리고 있어요',
    badgeClass: 'text-[#ad6b16]',
    dotClass: 'bg-[#e7a83e]',
  },
  FINAL_CONFIRMED: {
    label: '최종 룸매로 확정됐어요',
    badgeClass: 'text-[#23805c]',
    dotClass: 'bg-[#39a978]',
  },
  CLOSED: {
    label: '종료된 매칭이에요',
    badgeClass: 'text-[#718096]',
    dotClass: 'bg-[#9aa7b8]',
  },
};

const DATE_VISIBLE_STATUSES = new Set([
  'RECOMMENDED',
  'HEART_RECEIVED',
  'HEART_MATCHED',
  'CONFIRM_PENDING',
  'FINAL_CONFIRMED',
]);

function isSameDate(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isMatchDateToday(matchDate) {
  if (!matchDate) return false;

  const date = new Date(matchDate);
  if (Number.isNaN(date.getTime())) return false;

  return isSameDate(date, new Date());
}

function getMatchDateLabel(matchDate, matchStatus) {
  if (!DATE_VISIBLE_STATUSES.has(matchStatus) || !matchDate) return '';

  const date = new Date(matchDate);
  if (Number.isNaN(date.getTime())) return '';

  const eventLabel = matchStatus === 'RECOMMENDED' ? '추천' : '매칭';
  if (isSameDate(date, new Date())) return `오늘 ${eventLabel}`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${eventLabel}`;
}

function getPreferenceLabel({ field, value }) {
  const normalizedField = String(field ?? '')
    .replaceAll('_', '')
    .toUpperCase();

  return PREFERENCE_LABELS[normalizedField]?.[value] ?? '생활 습관 정보';
}

function ProfilePlaceholder({ name }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#dce7f7] via-[#c9d8ed] to-[#aebfda] text-fg-primary">
      <div className="flex h-[clamp(4.5rem,15vw,8rem)] w-[clamp(4.5rem,15vw,8rem)] items-center justify-center rounded-full bg-white/75 text-[clamp(1.75rem,6vw,3rem)] font-extrabold shadow-[0_8px_24px_rgba(41,75,124,0.12)]">
        {name?.trim()?.slice(0, 1) || '?'}
      </div>
      <span className="mt-3 text-[10px] font-bold text-fg-basic-muted">프로필 이미지 없음</span>
    </div>
  );
}

function MatchingCard({ person, isFront = false }) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const percentage = Number(person.matchPercentage);
  const rawProfileImageUrl =
    person.profileImageUrl ??
    person.profileImageURL ??
    person.partnerProfileImageUrl ??
    person.imageUrl ??
    person.imageURL;
  const profileImageUrl = getProfileImageUrl(rawProfileImageUrl, '');
  const matchDateLabel = getMatchDateLabel(person.matchDate, person.matchStatus);
  const isRecommendedToday = person.matchStatus === 'RECOMMENDED' && isMatchDateToday(person.matchDate);
  const statusInfo = isRecommendedToday
    ? {
        label: '오늘 새로 추천된 룸매예요',
        badgeClass: 'text-[#0b43a7]',
        dotClass: 'bg-[#0b43a7]',
      }
    : MATCH_STATUS_INFO[person.matchStatus] ?? {
        label: '매칭 상태를 확인하고 있어요',
        badgeClass: 'text-fg-primary',
        dotClass: 'bg-[#8fa2bc]',
      };

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-[clamp(1.375rem,4vw,2rem)] bg-white shadow-[0_20px_45px_rgba(36,69,119,0.16)]">
      <div className="relative h-[clamp(9.5rem,calc(28vh+6vw),22rem)] overflow-hidden">
        {profileImageUrl ? (
          <img
            className="h-full w-full bg-[#dce7f7] object-cover"
            src={profileImageUrl}
            alt={`${person.name || '사용자'} 프로필`}
            onError={(event) => {
              event.currentTarget.src = PROFILE_IMAGE_FALLBACK_URL;
            }}
          />
        ) : (
          <ProfilePlaceholder name={person.name} />
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
        <div
          className={`absolute left-[clamp(0.75rem,4vw,1rem)] top-[clamp(0.75rem,4vw,1rem)] flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-white/95 px-[clamp(0.625rem,3vw,0.75rem)] py-[clamp(0.25rem,1.5vw,0.375rem)] text-[clamp(0.625rem,2.8vw,0.6875rem)] font-extrabold leading-none shadow-[0_5px_16px_rgba(30,57,98,0.14)] backdrop-blur-sm ${statusInfo.badgeClass}`}
        >
          {person.matchStatus?.startsWith('HEART_') ? (
            <FilledHeartIcon className="h-3.5 w-3.5 shrink-0 text-[#ff668b]" aria-hidden="true" />
          ) : (
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusInfo.dotClass}`} aria-hidden="true" />
          )}
          <span className="truncate">{statusInfo.label}</span>
        </div>
      </div>

      <div className="px-[clamp(1rem,4.5vw,1.75rem)] pb-[clamp(1rem,3.5vw,1.5rem)] pt-[clamp(1rem,3.5vw,1.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-[clamp(0.5rem,3vw,0.75rem)] gap-y-2">
          <div className="min-w-0 flex-1 basis-[9.5rem]">
            <div className="flex items-baseline gap-1.5">
              <h2 className="truncate text-[clamp(1.125rem,3.2vw,1.625rem)] font-extrabold tracking-[-0.02em] text-fg-primary">
                {person.name || '이름 미등록'}
              </h2>
              {person.age != null && (
                <span className="shrink-0 text-xs font-bold text-fg-basic-muted">{person.age}살</span>
              )}
            </div>
            <p className="mt-1 truncate text-xs font-medium text-fg-basic-muted">
              {[person.department, person.studentId && `${person.studentId}번`].filter(Boolean).join(' · ') ||
                '상세 정보 미등록'}
            </p>
          </div>
          <div className="shrink-0 pb-0.5 text-right">
            <p className="text-[11px] font-medium text-fg-basic-muted">
              매칭률{' '}
              <strong className="text-base font-extrabold text-[#7c3fe4]">
                {Number.isFinite(percentage) ? `${percentage}%` : '-'}
              </strong>
            </p>
            {matchDateLabel && (
              <p className="mt-1 text-[10px] font-bold text-[#6680a6]">{matchDateLabel}</p>
            )}
          </div>
        </div>

        <ul className="mt-3 flex min-h-7 flex-wrap gap-1.5" aria-label="생활 습관">
          {(person.preferredAnswers ?? []).slice(0, 3).map((answer, index) => (
            <li
              key={`${answer.field}-${index}`}
              className="rounded-full bg-[#e8f0fb] px-2.5 py-1 text-[11px] font-bold text-fg-primary"
            >
              {getPreferenceLabel(answer)}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mx-auto mt-3 flex min-h-11 items-center justify-center gap-1 rounded-full border border-[#d9e3f1] bg-white px-[clamp(1rem,5vw,1.25rem)] text-xs font-extrabold text-fg-primary shadow-[0_4px_12px_rgba(38,73,126,0.08)] transition-colors hover:bg-[#f7f9fc] disabled:pointer-events-none"
          aria-expanded={isIntroductionOpen}
          disabled={!isFront}
          tabIndex={isFront ? 0 : -1}
          onClick={() => setIsIntroductionOpen((open) => !open)}
        >
          자기소개 {isIntroductionOpen ? '접기' : '읽어보기'}
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-300 ${isIntroductionOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
            isIntroductionOpen ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl bg-[#f3f7fc] p-3.5">
              <p className="text-[11px] font-extrabold text-fg-primary">자기소개</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-fg-basic">
                {person.introduce || '등록된 자기소개가 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default MatchingCard;
