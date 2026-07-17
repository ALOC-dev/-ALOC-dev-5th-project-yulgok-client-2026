import { useState } from 'react';
import { ChevronDownIcon } from './MatchingIcons.jsx';

function ProfilePlaceholder({ name }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#dce7f7] to-[#b8cae4] text-fg-primary">
      {/* API에 이미지 URL이 추가되기 전까지 사용할 기본 프로필 표시 */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-4xl font-extrabold shadow-sm">
        {name?.trim()?.slice(0, 1) || '?'}
      </div>
      <span className="mt-3 text-xs font-semibold text-fg-basic-muted">PROFILE</span>
    </div>
  );
}

function MatchingCard({ person, isFront = false }) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const percentage = Number(person.matchPercentage);

  return (
    <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_18px_45px_rgba(38,73,126,0.16)]">
      {/* 상단 이미지 영역: 현재 응답에는 이미지 필드가 없어 기본 프로필을 표시 */}
      <div className="h-[218px] overflow-hidden sm:h-[250px]">
        <ProfilePlaceholder name={person.name} />
      </div>

      <div className="px-5 pb-4 pt-4">
        {/* 추천 사용자의 핵심 정보와 매칭률을 한 줄에 배치 */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <h2 className="truncate text-xl font-extrabold text-fg-primary">{person.name}</h2>
              <span className="shrink-0 text-sm font-semibold text-fg-basic-muted">{person.age}살</span>
            </div>
            <p className="mt-1 truncate text-sm text-fg-basic-muted">{person.department}</p>
          </div>
          <p className="shrink-0 text-xs text-fg-basic-muted">
            매칭률{' '}
            <strong className="text-base font-extrabold text-[#7c3fe4]">
              {Number.isFinite(percentage) ? `${percentage}%` : '-'}
            </strong>
          </p>
        </div>

        {/* preferredAnswers는 임시 요구사항에 따라 field 값만 태그로 표시 */}
        <ul className="mt-3 flex min-h-7 flex-wrap gap-2" aria-label="선호 답변">
          {(person.preferredAnswers ?? []).map((answer, index) => (
            <li
              key={`${answer.field}-${index}`}
              className="rounded-full bg-ui-sub px-3 py-1 text-xs font-semibold text-fg-primary"
            >
              {answer.field}
            </li>
          ))}
        </ul>

        {/* 앞에 있는 카드만 조작할 수 있어 뒤쪽 카드의 포커스 진입을 막음. */}
        <button
          type="button"
          className="mx-auto mt-4 flex min-h-11 items-center justify-center gap-1 rounded-full border border-[#dbe4f1] bg-white px-5 text-xs font-bold text-fg-primary shadow-sm transition-colors hover:bg-[#f7f9fc] disabled:pointer-events-none"
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
            isIntroductionOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <p className="rounded-2xl bg-[#f5f8fc] p-4 text-sm leading-6 text-fg-basic">
              {person.introduce || '등록된 자기소개가 없습니다.'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default MatchingCard;
