import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatRooms } from '../../api/chat/chat.js';
import { getMatchingStatus } from '../../api/matching/matching.js';
import { getUserProfile, updateUserProfile } from '../../api/users/users.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const OPEN_CHAT_URL = 'https://open.kakao.com/o/sqxsQsFi';

const PROFILE_PLACEHOLDER = '프로필 이미지 없음';
const PREPARING_MESSAGE = '이번 버전에서는 준비 중인 기능이에요.';

function getDisplayName(profile) {
  return profile?.detail?.realName || profile?.nickname || '이름매';
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
  const imageUrl = profile?.profileImageUrl;

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
      <div className="absolute bottom-6 right-0 h-24 w-[46%] opacity-20" aria-hidden="true">
        <div className="flex h-full items-end gap-1">
          {[52, 59, 66, 73, 80, 87, 94].map((height) => (
            <span
              key={height}
              className="block w-5 rounded-t-sm bg-white"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

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
        className="w-full max-w-[420px] rounded-[22px] bg-white p-5 shadow-[0_24px_60px_rgba(23,34,56,0.24)]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            nickname: nickname.trim(),
            profileImageUrl: profileImageUrl.trim() || null,
          });
        }}
      >
        <div className="flex items-center gap-3">
          <ProfileAvatar profile={{ ...profile, nickname, profileImageUrl }} size="small" />
          <div>
            <h2 className="text-lg font-extrabold text-fg-primary">프로필 편집</h2>
            <p className="mt-1 text-xs font-semibold text-fg-basic-muted">닉네임과 프로필 이미지만 수정할 수 있어요.</p>
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

        <label className="mt-4 block text-sm font-extrabold text-fg-primary">
          프로필 이미지 URL
          <input
            value={profileImageUrl}
            onChange={(event) => setProfileImageUrl(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-[#dbe5f2] bg-[#f7faff] px-4 text-sm font-bold outline-none focus:border-brand-primary"
            placeholder="https://..."
          />
        </label>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-[#fff1f3] px-3 py-2 text-xs font-bold text-[#a83f57]" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
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
      </form>
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

    window.open(OPEN_CHAT_URL, '_blank', 'noopener,noreferrer');
  }

  async function handleProfileSubmit(requestBody) {
    if (isSavingProfile) return;

    try {
      setIsSavingProfile(true);
      setProfileErrorMessage('');

      const updatedProfile = await updateUserProfile(requestBody);
      setProfile((currentProfile) => ({
        ...currentProfile,
        ...updatedProfile,
        nickname: updatedProfile?.nickname ?? requestBody.nickname ?? currentProfile?.nickname,
        profileImageUrl: updatedProfile?.profileImageUrl ?? requestBody.profileImageUrl ?? currentProfile?.profileImageUrl,
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

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-96px)] w-full max-w-[430px] flex-col px-5 pb-6 pt-7">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-fg-primary">마이 페이지</h1>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-extrabold text-fg-basic-muted"
          aria-label="마이페이지 메뉴"
          onClick={() => setNoticeMessage(PREPARING_MESSAGE)}
        >
          ...
        </button>
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
        <MenuRow label="알림 설정" value="준비 중" onClick={() => setNoticeMessage(PREPARING_MESSAGE)} />
        <MenuRow label="차단 / 신고 관리" value="문의하기" onClick={openExternalSupport} />
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-sm">
        <MenuRow label="이용약관" onClick={() => setNoticeMessage(PREPARING_MESSAGE)} />
        <MenuRow label="개인정보 처리방침" onClick={() => setNoticeMessage(PREPARING_MESSAGE)} />
        <MenuRow label="문의하기" onClick={openExternalSupport} />
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
    </section>
  );
}

export default MyPage;
