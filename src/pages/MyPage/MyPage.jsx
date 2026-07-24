import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatRooms } from '../../api/chat/chat.js';
import { getMatchingStatus } from '../../api/matching/matching.js';
import { deleteMyAccount, getUserProfile, updateUserProfile } from '../../api/users/users.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getProfileImageUrl, PROFILE_IMAGE_BASE_PATH } from '../../utils/profileImage';

const OPEN_CHAT_URL = 'https://open.kakao.com/o/sqxsQsFi';

const PROFILE_PLACEHOLDER = '프로필 이미지 없음';
const PROFILE_IMAGE_OPTIONS = Array.from({ length: 53 }, (_, index) => ({
  label: `프로필 이미지 ${index + 1}`,
  value: `profile-avatar-${index + 1}.png`,
}));
const LEGAL_CONTENT = {
  terms: {
    title: '이용약관',
    description: '이룸매 서비스 이용을 위한 기본 안내입니다.',
    sections: [
      {
        heading: '서비스 목적',
        body: '이룸매는 기숙사 룸메이트 탐색과 매칭을 돕기 위한 서비스입니다.',
      },
      {
        heading: '회원 정보',
        body: '회원은 정확한 기본 정보와 설문 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 문제는 본인에게 책임이 있습니다.',
      },
      {
        heading: '매칭 및 채팅',
        body: '매칭 결과와 채팅은 룸메이트 선택을 돕기 위한 참고 정보이며, 최종 기숙사 룸메이트 신청은 학교 안내에 따라 별도로 진행해야 합니다.',
      },
      {
        heading: '문의 및 신고',
        body: '서비스 이용 중 문의 또는 신고가 필요한 경우 마이페이지의 문의하기를 통해 운영팀에 연락할 수 있습니다.',
      },
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    description: '회원 가입과 룸메이트 매칭에 필요한 정보만 수집하고 이용합니다.',
    sections: [
      {
        heading: '수집·이용 목적',
        body: '회원 가입 및 본인 확인, 기숙사 입주생 확인, 룸메이트 성향 분석과 추천, 매칭 관련 알림, 부정 이용 방지 및 서비스 개선',
      },
      {
        heading: '수집 항목',
        body: '이름, 학번, 학과, 이메일 주소, 성별, 수면·흡연·청결·생활 소음·성격 및 생활 방식에 관한 설문 응답, IP 주소, 방문 일시, 서비스 이용 기록 및 부정 이용 기록',
      },
      {
        heading: '프로필 공개 항목',
        body: '룸메이트 탐색과 매칭을 위해 이름 또는 닉네임, 프로필 사진, 한 줄 소개, 취향 및 성향 설문 결과가 추천 또는 매칭 대상 회원에게 공개될 수 있습니다. 학번과 이메일 주소는 공개하지 않습니다.',
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
};

function getDisplayName(profile) {
  return profile?.nickname || profile?.detail?.realName || '이름매';
}

function getProfileInitial(profile) {
  return getDisplayName(profile).trim().slice(0, 1) || '이';
}

function formatDepartmentAge(profile) {
  const department = profile?.detail?.department || '학과 정보 없음';
  const age = profile?.detail?.age ? `${profile.detail.age}살` : '';
  return [department, age].filter(Boolean).join(' · ');
}

function countMatchingStatus(people, status) {
  return people.filter((person) => person?.matchStatus === status).length;
}

function getProfileImageSrc(profileImageUrl) {
  return getProfileImageUrl(profileImageUrl, '');
}

function MenuRow({ label, value, danger = false, onClick }) {
  return (
    <button
      type="button"
      className={`flex min-h-[52px] w-full items-center justify-between gap-4 border-b border-[#e1e8f2] px-4 text-left text-sm font-bold last:border-b-0 ${
        danger ? 'text-[#d85b70]' : 'text-fg-primary'
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs font-bold text-fg-basic-muted">
        {value && <span>{value}</span>}
        {!danger && <span aria-hidden="true">›</span>}
      </span>
    </button>
  );
}

function ProfileAvatar({ profile, size = 'large' }) {
  const sizeClass = size === 'large' ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg';
  const imageUrl = getProfileImageSrc(profile?.profileImageUrl);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${getDisplayName(profile)} 프로필`}
        className={`${sizeClass} rounded-[22px] border border-white/50 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-[22px] border border-white/50 bg-white/20 font-extrabold text-white`}
      aria-label={PROFILE_PLACEHOLDER}
    >
      {getProfileInitial(profile)}
    </div>
  );
}

function ProfileCard({ profile, stats }) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#3f74cf] to-[#234889] px-5 py-5 text-white shadow-[0_18px_42px_rgba(35,72,137,0.18)]">
      <div className="relative flex items-center gap-4">
        <ProfileAvatar profile={profile} />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold">{getDisplayName(profile)}</h2>
          <p className="mt-1 truncate text-xs font-bold text-white/80">{formatDepartmentAge(profile)}</p>
        </div>
      </div>

      <div className="relative mt-5 border-t border-white/18 pt-4">
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-extrabold leading-none">{stats.openChatCount}</p>
            <p className="mt-1 text-[11px] font-bold text-white/78">대화중</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{stats.sentLikeCount}</p>
            <p className="mt-1 text-[11px] font-bold text-white/78">내가 좋아요</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{stats.receivedLikeCount}</p>
            <p className="mt-1 text-[11px] font-bold text-white/78">나를 좋아요</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileEditModal({ profile, isSaving, errorMessage, onClose, onSubmit }) {
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [profileImageUrl, setProfileImageUrl] = useState(profile?.profileImageUrl || '');

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#172238]/40 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0">
      <form
        className="flex max-h-[86dvh] w-full max-w-[420px] flex-col rounded-[22px] bg-white shadow-[0_24px_60px_rgba(23,34,56,0.24)]"
        onSubmit={(event) => {
          event.preventDefault();
          const nextNickname = nickname.trim();
          const nextProfileImageUrl = profileImageUrl.trim();
          const requestBody = {};

          if (nextNickname) requestBody.nickname = nextNickname;
          if (nextProfileImageUrl !== (profile?.profileImageUrl || '')) {
            requestBody.profileImageUrl = nextProfileImageUrl;
          }

          onSubmit(requestBody);
        }}
      >
        <div className="shrink-0 p-5 pb-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar profile={{ ...profile, nickname, profileImageUrl }} size="small" />
            <div>
              <h2 className="text-lg font-extrabold text-fg-primary">프로필 편집</h2>
              <p className="mt-1 text-xs font-semibold text-fg-basic-muted">닉네임과 프로필 사진을 수정할 수 있어요.</p>
            </div>
          </div>

          <label className="mt-5 block text-sm font-extrabold text-fg-primary">
            닉네임
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[#dbe5f2] bg-[#f7faff] px-4 text-sm font-bold outline-none focus:border-brand-primary"
              placeholder="닉네임을 입력하세요"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 border-y border-[#e8eef6] px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-fg-primary">프로필 사진</p>
              <p className="mt-1 text-xs font-semibold text-fg-basic-muted">
                정해진 기본 이미지 중 하나를 선택할 수 있어요.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-fg-basic-muted">
              {PROFILE_IMAGE_OPTIONS.length}개
            </span>
          </div>

          <div className="mt-3 max-h-[34dvh] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-2">
            {PROFILE_IMAGE_OPTIONS.map((option) => {
              const isSelected = profileImageUrl === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex aspect-square items-center justify-center rounded-2xl border-2 bg-[#f7faff] p-1 transition ${
                    isSelected ? 'border-brand-primary shadow-[0_8px_20px_rgba(33,69,149,0.18)]' : 'border-[#dbe5f2]'
                  }`}
                  aria-label={`${option.label} 선택`}
                  aria-pressed={isSelected}
                  onClick={() => setProfileImageUrl(option.value)}
                >
                  <img
                    src={`${PROFILE_IMAGE_BASE_PATH}${option.value}`}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                </button>
              );
            })}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-5 pt-4">
          {errorMessage && (
            <p className="mb-4 rounded-xl bg-[#fff1f3] px-3 py-2 text-xs font-bold text-[#a83f57]" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="min-h-12 rounded-full bg-[#edf2f8] text-sm font-extrabold text-fg-primary"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-12 rounded-full bg-brand-primary text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? '저장 중' : '저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SupportModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#172238]/40 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0">
      <div className="w-full max-w-[420px] rounded-[22px] bg-white p-5 shadow-[0_24px_60px_rgba(23,34,56,0.24)]">
        <h2 className="text-lg font-extrabold text-fg-primary">문의하기</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-fg-basic-muted">
          서비스 문의나 신고는 운영팀 1:1 오픈채팅으로 남겨주세요. 아래 링크를 누르면 카카오톡 오픈채팅으로 이동합니다.
        </p>
        <div className="mt-4 rounded-2xl bg-[#f5f8fc] px-4 py-3 text-sm font-extrabold text-fg-primary">
          {OPEN_CHAT_URL}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-12 rounded-full bg-[#edf2f8] text-sm font-extrabold text-fg-primary"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            type="button"
            className="min-h-12 rounded-full bg-brand-primary text-sm font-extrabold text-white"
            onClick={() => window.open(OPEN_CHAT_URL, '_blank', 'noopener,noreferrer')}
          >
            오픈채팅 열기
          </button>
        </div>
      </div>
    </div>
  );
}

function LegalModal({ content, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#172238]/40 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0">
      <div className="max-h-[82dvh] w-full max-w-[420px] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(23,34,56,0.24)]">
        <div className="border-b border-[#e1e8f2] px-5 py-4">
          <h2 className="text-lg font-extrabold text-fg-primary">{content.title}</h2>
          <p className="mt-1 text-xs font-semibold text-fg-basic-muted">{content.description}</p>
        </div>
        <div className="max-h-[58dvh] overflow-y-auto px-5 py-4">
          {content.sections.map(({ heading, body }) => (
            <section key={heading} className="mt-4 first:mt-0">
              <h3 className="text-sm font-extrabold text-fg-primary">{heading}</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-fg-basic-muted">{body}</p>
            </section>
          ))}
        </div>
        <div className="px-5 pb-5">
          <button
            type="button"
            className="min-h-12 w-full rounded-full bg-brand-primary text-sm font-extrabold text-white"
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ isDeleting, errorMessage, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#172238]/40 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0">
      <div className="w-full max-w-[420px] rounded-[22px] bg-white p-5 shadow-[0_24px_60px_rgba(23,34,56,0.24)]">
        <h2 className="text-lg font-extrabold text-fg-primary">정말 탈퇴하시겠습니까?</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-fg-basic-muted">
          탈퇴하면 계정 정보와 서비스 이용 기록이 삭제되며, 이후 복구가 어려울 수 있어요.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-[#fff1f3] px-3 py-2 text-xs font-bold text-[#a83f57]" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-12 rounded-full bg-[#edf2f8] text-sm font-extrabold text-fg-primary disabled:opacity-60"
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            type="button"
            className="min-h-12 rounded-full bg-[#c21f48] text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    openChatCount: 0,
    sentLikeCount: 0,
    receivedLikeCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMyPage() {
      try {
        const [userProfile, chatRooms, matchingPeople] = await Promise.all([
          getUserProfile(),
          getChatRooms(),
          getMatchingStatus(),
        ]);

        if (!isMounted) return;

        setProfile(userProfile);
        setStats({
          openChatCount: chatRooms.filter((room) => room?.status === 'OPEN').length,
          sentLikeCount: countMatchingStatus(matchingPeople, 'HEART_SENT'),
          receivedLikeCount: countMatchingStatus(matchingPeople, 'HEART_RECEIVED'),
        });
      } catch (error) {
        console.error('마이페이지 정보를 불러오지 못했습니다.', error);
        if (isMounted) setNoticeMessage('마이페이지 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMyPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const surveyValue = useMemo(() => {
    if (!profile) return '';
    return profile?.status === 'ACTIVE' ? '수정 가능' : '확인 필요';
  }, [profile]);

  function openExternalSupport() {
    if (!OPEN_CHAT_URL) {
      setNoticeMessage('문의/신고 오픈채팅 링크가 아직 설정되지 않았어요.');
      return;
    }

    setIsSupportModalOpen(true);
  }

  async function handleProfileSubmit(requestBody) {
    if (isSavingProfile) return;

    try {
      setIsSavingProfile(true);
      setProfileErrorMessage('');

      if (!requestBody.nickname && !requestBody.profileImageUrl) {
        setProfileErrorMessage('수정할 닉네임이나 프로필 사진을 입력해 주세요.');
        setIsSavingProfile(false);
        return;
      }

      const updatedProfile = await updateUserProfile(requestBody);
      setProfile((currentProfile) => ({
        ...currentProfile,
        ...updatedProfile,
        nickname: updatedProfile?.nickname ?? requestBody.nickname ?? currentProfile?.nickname,
        profileImageUrl:
          updatedProfile?.profileImageUrl ?? requestBody.profileImageUrl ?? currentProfile?.profileImageUrl,
      }));
      setIsEditOpen(false);
      setNoticeMessage('프로필이 저장됐어요.');
    } catch (error) {
      console.error('프로필 수정 실패', error);
      setProfileErrorMessage(error?.response?.data?.message || '프로필을 저장하지 못했어요.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 요청 실패', error);
      setNoticeMessage('로그아웃을 처리하지 못했어요.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleWithdraw() {
    if (isDeletingAccount) return;

    try {
      setIsDeletingAccount(true);
      setWithdrawErrorMessage('');
      await deleteMyAccount();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('회원 탈퇴 실패', error);
      setWithdrawErrorMessage(error?.response?.data?.message || '회원 탈퇴를 처리하지 못했어요.');
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-96px)] w-full max-w-[430px] flex-col px-5 pb-6 pt-7">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-fg-primary">마이 페이지</h1>
      </header>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-[178px] items-center justify-center rounded-[26px] bg-white text-sm font-bold text-fg-basic-muted shadow-sm">
            마이페이지 정보를 불러오는 중이에요...
          </div>
        ) : (
          <ProfileCard profile={profile} stats={stats} />
        )}
      </div>

      {noticeMessage && (
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-fg-primary shadow-sm" role="status">
          <div className="flex items-start justify-between gap-3">
            <span>{noticeMessage}</span>
            <button
              type="button"
              className="shrink-0 text-fg-basic-muted"
              aria-label="알림 닫기"
              onClick={() => setNoticeMessage('')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-[22px] bg-white shadow-sm">
        <MenuRow label="프로필 편집" onClick={() => setIsEditOpen(true)} />
        <MenuRow label="설문 다시하기" value={surveyValue} onClick={() => navigate('/surveys/sleep')} />
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-sm">
        <MenuRow label="이용약관" onClick={() => setLegalModalType('terms')} />
        <MenuRow label="개인정보 처리방침" onClick={() => setLegalModalType('privacy')} />
        <MenuRow label="문의하기" onClick={openExternalSupport} />
        <MenuRow
          label={isDeletingAccount ? '탈퇴 처리 중...' : '탈퇴하기'}
          danger
          onClick={() => setIsWithdrawModalOpen(true)}
        />
        <MenuRow
          label={isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          danger
          onClick={handleLogout}
        />
      </div>

      {isEditOpen && (
        <ProfileEditModal
          profile={profile}
          isSaving={isSavingProfile}
          errorMessage={profileErrorMessage}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleProfileSubmit}
        />
      )}

      {isSupportModalOpen && (
        <SupportModal onClose={() => setIsSupportModalOpen(false)} />
      )}

      {legalModalType && (
        <LegalModal
          content={LEGAL_CONTENT[legalModalType]}
          onClose={() => setLegalModalType(null)}
        />
      )}

      {isWithdrawModalOpen && (
        <WithdrawModal
          isDeleting={isDeletingAccount}
          errorMessage={withdrawErrorMessage}
          onClose={() => {
            if (isDeletingAccount) return;
            setWithdrawErrorMessage('');
            setIsWithdrawModalOpen(false);
          }}
          onConfirm={handleWithdraw}
        />
      )}
    </section>
  );
}

export default MyPage;
