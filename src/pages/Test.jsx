import { useState } from 'react';
import { Modal } from '../components/Modal/index.js';

const modalExamples = [
  {
    id: 'help',
    eyebrow: '콘텐츠 확인',
    title: '도움말 모달',
    description: '긴 안내문, 내부 스크롤, 단일 버튼을 확인합니다.',
  },
  {
    id: 'image',
    eyebrow: '이미지 확인',
    title: '합격 캡처 예시',
    description: 'large 크기와 반응형 이미지 영역을 확인합니다.',
  },
  {
    id: 'confirm',
    eyebrow: '액션 확인',
    title: '확인 모달',
    description: '취소·확인 버튼과 액션 결과를 확인합니다.',
  },
];

const optionItems = [
  {
    key: 'closeOnOverlayClick',
    label: '배경 클릭으로 닫기',
  },
  {
    key: 'closeOnEscape',
    label: 'Esc 키로 닫기',
  },
  {
    key: 'showCloseButton',
    label: '우측 상단 X 버튼 표시',
  },
];

const closeReasonLabels = {
  overlay: '배경 클릭으로 닫았습니다.',
  escape: 'Esc 키로 닫았습니다.',
  'close-button': 'X 버튼으로 닫았습니다.',
};

function DormitoryAcceptanceExample() {
  return (
    <div
      role="img"
      aria-label="기숙사 합격 결과 화면 예시. 합격 상태와 배정 기숙사, 입사 기간이 표시되어 있습니다."
      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner"
    >
      <div className="flex items-center justify-between bg-[#173665] px-4 py-3 text-white">
        <span className="text-sm font-bold">생활관 통합정보시스템</span>
        <span className="text-xs text-white/70">학생 서비스</span>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">2026학년도 1학기 선발 결과</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">선발 상태</p>
              <p className="mt-1 text-xl font-extrabold text-blue-700">합격</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              최종 선발
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-3 rounded-xl bg-white p-4 text-sm shadow-sm">
          <dt className="text-slate-500">배정 생활관</dt>
          <dd className="m-0 font-bold text-slate-800">율곡관 A동</dd>
          <dt className="text-slate-500">입사 기간</dt>
          <dd className="m-0 font-bold text-slate-800">2026. 03. 01. ~ 06. 21.</dd>
          <dt className="text-slate-500">학생 정보</dt>
          <dd className="m-0 font-bold text-slate-800">이름과 학번이 보이게 캡처</dd>
        </dl>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          실제 인증에서는 합격 여부와 본인 정보가 한 화면에 보이도록 캡처해 주세요.
        </p>
      </div>
    </div>
  );
}

function HelpContent() {
  return (
    <div className="space-y-5 text-sm leading-7 text-fg-basic-muted">
      <section>
        <h3 className="m-0 text-base font-bold text-fg-basic">어떤 화면을 캡처하나요?</h3>
        <p className="mt-2">
          학교 생활관 사이트에서 본인의 이름 또는 학번과 최종 합격 여부가 함께 보이는
          결과 화면을 준비해 주세요.
        </p>
      </section>

      <section>
        <h3 className="m-0 text-base font-bold text-fg-basic">캡처 전 확인 사항</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>선발 상태가 합격으로 표시되어 있는지 확인합니다.</li>
          <li>본인 식별 정보가 일부라도 화면에 표시되어야 합니다.</li>
          <li>브라우저 주소창이나 다른 앱의 개인정보는 잘라내도 됩니다.</li>
          <li>글자가 흐리지 않고 확대했을 때 읽을 수 있어야 합니다.</li>
        </ol>
      </section>

      <section>
        <h3 className="m-0 text-base font-bold text-fg-basic">업로드가 되지 않는 경우</h3>
        <p className="mt-2">
          이미지 형식과 파일 크기를 확인한 뒤 다시 시도해 주세요. 네트워크 연결이
          불안정하면 잠시 후 재시도하는 것이 좋습니다.
        </p>
      </section>

      <section>
        <h3 className="m-0 text-base font-bold text-fg-basic">개인정보 안내</h3>
        <p className="mt-2">
          인증에 필요하지 않은 주민등록번호, 연락처, 주소 등의 정보는 가린 상태로
          제출해도 됩니다. 필요한 정보만 포함된 화면을 사용하는 것을 권장합니다.
        </p>
      </section>
    </div>
  );
}

export function Test() {
  const [activeModal, setActiveModal] = useState(null);
  const [lastResult, setLastResult] = useState('아직 실행한 액션이 없습니다.');
  const [options, setOptions] = useState({
    closeOnOverlayClick: true,
    closeOnEscape: true,
    showCloseButton: true,
  });

  const closeModal = (result) => {
    setLastResult(result);
    setActiveModal(null);
  };

  const handleModalClose = ({ reason }) => {
    closeModal(closeReasonLabels[reason] ?? `${reason} 동작으로 닫았습니다.`);
  };

  const toggleOption = (key) => {
    setOptions((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const sharedModalProps = {
    closeOnOverlayClick: options.closeOnOverlayClick,
    closeOnEscape: options.closeOnEscape,
    showCloseButton: options.showCloseButton,
    onClose: handleModalClose,
  };

  return (
    <main className="min-h-dvh bg-brand-background px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header>
          <p className="text-sm font-bold text-fg-secondary">COMMON COMPONENT LAB</p>
          <h1 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-fg-basic sm:text-4xl">
            공통 모달 테스트
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-fg-basic-muted sm:text-base">
            아래 예시와 옵션을 조합해 콘텐츠, 닫기 동작, 버튼, 스크롤과 반응형
            레이아웃을 확인할 수 있습니다.
          </p>
        </header>

        <section aria-labelledby="modal-examples-title" className="mt-9">
          <h2 id="modal-examples-title" className="text-lg font-bold text-fg-basic">
            모달 예시
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {modalExamples.map((example) => (
              <article
                key={example.id}
                className="flex min-h-56 flex-col rounded-3xl border border-white/70 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold text-fg-secondary">{example.eyebrow}</p>
                <h3 className="mb-0 mt-3 text-xl font-extrabold text-fg-basic">
                  {example.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-fg-basic-muted">
                  {example.description}
                </p>
                <button
                  type="button"
                  className="mt-5 min-h-12 rounded-2xl bg-brand-primary px-4 py-3 font-bold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  onClick={() => setActiveModal(example.id)}
                >
                  열어보기
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <section
            aria-labelledby="modal-options-title"
            className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 id="modal-options-title" className="text-lg font-bold text-fg-basic">
              공통 닫기 옵션
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {optionItems.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-fg-basic"
                >
                  <input
                    type="checkbox"
                    checked={options[key]}
                    className="size-5 accent-[var(--brand-primary)]"
                    onChange={() => toggleOption(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="last-result-title"
            aria-live="polite"
            className="rounded-3xl bg-brand-primary p-5 text-white shadow-sm sm:p-6"
          >
            <h2 id="last-result-title" className="text-lg font-bold">
              마지막 실행 결과
            </h2>
            <p className="mt-4 rounded-2xl bg-white/10 px-4 py-4 text-sm leading-6">
              {lastResult}
            </p>
          </section>
        </div>
      </div>

      <Modal
        {...sharedModalProps}
        open={activeModal === 'help'}
        title="기숙사 인증 도움말"
        description="캡처 준비부터 업로드 전 확인 사항까지 안내합니다."
      >
        <HelpContent />
        <Modal.Footer>
          <Modal.Button
            variant="secondary"
            onClick={() => closeModal('도움말의 닫기 버튼을 눌렀습니다.')}
          >
            닫기
          </Modal.Button>
        </Modal.Footer>
      </Modal>

      <Modal
        {...sharedModalProps}
        open={activeModal === 'image'}
        title="기숙사 합격 캡처 예시"
        description="합격 여부와 본인 정보가 함께 보이는 화면을 준비해 주세요."
        size="large"
      >
        <DormitoryAcceptanceExample />
        <Modal.Footer>
          <Modal.Button
            variant="secondary"
            onClick={() => closeModal('이미지 예시 모달에서 닫기를 눌렀습니다.')}
          >
            닫기
          </Modal.Button>
          <Modal.Button onClick={() => closeModal('이미지 예시를 확인했습니다.')}>
            확인
          </Modal.Button>
        </Modal.Footer>
      </Modal>

      <Modal
        {...sharedModalProps}
        open={activeModal === 'confirm'}
        title="제출을 계속할까요?"
        description="확인 모달의 버튼 variant와 액션 결과를 테스트합니다."
        size="small"
      >
        <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-fg-basic-muted">
          확인을 누르면 실행 결과가 기록됩니다. 실제 네트워크 요청이나 데이터 변경은
          발생하지 않습니다.
        </div>
        <Modal.Footer>
          <Modal.Button
            variant="secondary"
            onClick={() => closeModal('확인 모달에서 취소를 선택했습니다.')}
          >
            취소
          </Modal.Button>
          <Modal.Button onClick={() => closeModal('확인 모달에서 확인을 선택했습니다.')}>
            확인
          </Modal.Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default Test;
