import { useEffect, useId, useState } from 'react';

const agreements = [
  {
    id: 'privacy',
    required: true,
    label: '개인정보 수집 및 이용 동의',
    sections: [
      {
        heading: '수집·이용 목적',
        body: '회원 가입 및 본인 확인, 기숙사 입주생 확인, 룸메이트 성향 분석과 추천, 매칭 관련 알림, 부정 이용 방지 및 서비스 개선',
      },
      {
        heading: '수집 항목',
        body: '이름, 학번, 학과, 이메일 주소, 성별, 기숙사 동·호실 정보, 수면·흡연·청결·생활 소음·성격 및 생활 방식에 관한 설문 응답, IP 주소, 방문 일시, 서비스 이용 기록 및 부정 이용 기록',
      },
      {
        heading: '보유·이용 기간',
        body: '회원 탈퇴 또는 수집 목적 달성 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존할 의무가 있는 정보는 해당 법령에서 정한 기간 동안 보관합니다.',
      },
      {
        heading: '동의 거부 권리 및 불이익',
        body: '동의를 거부할 권리가 있습니다. 다만 필수 개인정보의 수집 및 이용에 동의하지 않으면 회원 가입과 룸메이트 매칭 서비스를 이용할 수 없습니다.',
      },
    ],
  },
  {
    id: 'profile',
    required: true,
    label: '매칭 프로필 공개 동의',
    sections: [
      {
        heading: '공개 대상 및 목적',
        body: '룸메이트 탐색과 매칭을 위해 서비스 내 추천 또는 매칭 대상 회원에게 공개합니다.',
      },
      {
        heading: '공개 항목',
        body: '이름 또는 닉네임, 프로필 사진, 한 줄 소개, 취미·관심사 및 성향 설문 결과가 공개될 수 있습니다. 학번, 이메일 주소와 기숙사 호실 정보는 공개하지 않습니다.',
      },
      {
        heading: '공개 기간',
        body: '회원 탈퇴, 매칭 서비스 이용 종료 또는 동의 철회 시까지 공개됩니다.',
      },
      {
        heading: '동의 거부 권리 및 불이익',
        body: '동의를 거부할 권리가 있습니다. 다만 동의하지 않으면 프로필 추천과 룸메이트 매칭 서비스를 이용할 수 없습니다.',
      },
    ],
  },
  {
    id: 'marketing',
    required: false,
    label: '마케팅 정보 및 알림 수신 동의',
    sections: [
      {
        heading: '이용 목적',
        body: '신규 기능, 이벤트 및 프로모션 정보를 이메일 또는 앱 푸시 알림으로 안내합니다.',
      },
      {
        heading: '이용 항목',
        body: '이메일 주소, 앱 푸시 알림 수신 여부',
      },
      {
        heading: '보유·이용 기간',
        body: '회원 탈퇴 또는 마케팅 수신 동의 철회 시까지 보관합니다.',
      },
      {
        heading: '동의 거부 안내',
        body: '동의하지 않아도 회원 가입과 룸메이트 매칭 등 기본 서비스를 이용할 수 있습니다.',
      },
    ],
  },
];

const initialChecks = Object.fromEntries(agreements.map(({ id }) => [id, false]));

function AgreementCheck({ checked }) {
  return (
    <div
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
        checked
          ? 'border-[#3498DB] bg-[#3498DB] text-white shadow-sm'
          : 'border-[#E0E0E0] bg-white text-transparent'
      }`}
    >
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function AgreementItem({ agreement, checked, expanded, onCheck, onExpand }) {
  const detailId = `agreement-${agreement.id}`;

  return (
    <div className="border-b border-[#F0F0F0] last:border-b-0">
      <div className="flex min-h-[60px] items-center gap-3 py-1">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none transition-opacity hover:opacity-80"
          onClick={onCheck}
        >
          <AgreementCheck checked={checked} />
          <span className="text-[15px] font-medium leading-tight text-[#333333]">
            <span className={`mr-1.5 ${agreement.required ? 'text-[#3498DB]' : 'text-[#999999]'}`}>
              [{agreement.required ? '필수' : '선택'}]
            </span>
            {agreement.label}
          </span>
        </button>
        <button
          type="button"
          className={`flex h-10 w-10 shrink-0 items-center justify-center text-[#BBBBBB] outline-none transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          aria-label={`${agreement.label} 상세 내용`}
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={onExpand}
        >
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div id={detailId} className="mb-4 animate-fadeIn rounded-xl bg-[#F9FAFB] p-5 text-left text-[13px] leading-relaxed text-[#666666] shadow-inner">
          {agreement.sections.map(({ heading, body }) => (
            <section key={heading} className="mt-4 first:mt-0">
              <h3 className="m-0 text-[13px] font-bold text-[#444444]">{heading}</h3>
              <p className="m-0 mt-1.5 whitespace-pre-wrap">{body}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PrivacyConsentModal({ open, onAgree, onDecline }) {
  const titleId = useId();
  const [checks, setChecks] = useState(initialChecks);
  const [expanded, setExpanded] = useState({ privacy: false, profile: false, marketing: false });

  const allChecked = agreements.every(({ id }) => checks[id]);
  const requiredChecked = agreements
    .filter(({ required }) => required)
    .every(({ id }) => checks[id]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  if (!open) return null;

  const toggleAll = () => {
    const next = !allChecked;
    setChecks(Object.fromEntries(agreements.map(({ id }) => [id, next])));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-slideUp"
      >
        <div className="flex flex-col overflow-hidden">
          <header className="bg-[#F8FAFC] px-6 pb-6 pt-8 text-center">
            <span className="inline-block px-3 py-1 mb-3 text-[12px] font-bold text-[#3498DB] bg-[#3498DB]/10 rounded-full">서비스 이용 동의</span>
            <h2 id={titleId} className="m-0 text-[22px] font-bold leading-tight text-[#1A202C]">
              이룸매이트 이용을 위해<br />동의가 필요해요
            </h2>
            <p className="mb-0 mt-3 text-[14px] leading-relaxed text-[#718096]">
              룸메이트 추천에 필요한 정보만 수집하며,<br />선택 동의는 거부해도 서비스를 이용할 수 있습니다.
            </p>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <button
              type="button"
              className="flex min-h-[70px] w-full items-center gap-3 border-b-2 border-[#F1F5F9] text-left text-[17px] font-bold text-[#1A202C] outline-none transition-colors hover:bg-slate-50"
              onClick={toggleAll}
            >
              <AgreementCheck checked={allChecked} />
              전체 동의
            </button>

            <p className="my-3 rounded-xl bg-[#F8FAFC] px-4 py-3 text-[13px] leading-relaxed text-[#64748B]">
              매칭 데이터는 추후 AI 모델 학습에 사용될 수 있습니다.
            </p>

            <div className="mt-1">
              {agreements.map((agreement) => (
                <AgreementItem
                  key={agreement.id}
                  agreement={agreement}
                  checked={checks[agreement.id]}
                  expanded={expanded[agreement.id]}
                  onCheck={() => setChecks((current) => ({
                    ...current,
                    [agreement.id]: !current[agreement.id],
                  }))}
                  onExpand={() => setExpanded((current) => ({
                    ...current,
                    [agreement.id]: !current[agreement.id],
                  }))}
                />
              ))}
            </div>
          </div>

          <footer className="grid grid-cols-2 gap-3 px-6 pb-8 pt-4">
            <button
              type="button"
              className="h-[56px] rounded-2xl bg-[#F1F5F9] text-[16px] font-bold text-[#64748B] transition-all hover:bg-[#E2E8F0] active:scale-95"
              onClick={onDecline}
            >
              동의 안 함
            </button>
            <button
              type="button"
              className={`h-[56px] rounded-2xl text-[16px] font-bold text-white shadow-lg shadow-[#3498DB]/20 transition-all active:scale-95 ${
                requiredChecked ? 'bg-[#3498DB] hover:bg-[#2980B9]' : 'bg-[#CBD5E1] cursor-not-allowed shadow-none'
              }`}
              disabled={!requiredChecked}
              onClick={() => onAgree(checks)}
            >
              동의하고 시작
            </button>
          </footer>
        </div>
      </section>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
      `}</style>
    </div>
  );
}

export default PrivacyConsentModal;
