import { NavLink } from 'react-router-dom';
import { useChatSocket } from '../pages/Chat/ChatSocketContext.jsx';
import { ChatIcon, HeartIcon, UserIcon } from './NavigationIcons.jsx';

const menus = [
  { label: '매칭', path: '/matching', icon: HeartIcon },
  { label: '채팅', path: '/chat', icon: ChatIcon, showChatBadge: true },
  { label: '마이', path: '/my', icon: UserIcon },
];

function formatBadgeCount(count) {
  if (count > 99) return '99+';
  return String(count);
}

function NavigationBar() {
  const { totalUnreadCount } = useChatSocket();

  return (
    <nav
      aria-label="주요 메뉴"
      className="grid grid-cols-3 rounded-[28px] bg-white p-1 shadow-sm"
    >
      {menus.map(({ label, path, icon: Icon, showChatBadge }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[22px] text-xs no-underline transition-colors ${
              isActive
                ? 'bg-brand-primary text-white'
                : 'text-fg-basic-muted'
            }`
          }
        >
          <span className="relative">
            <Icon aria-hidden="true" />
            {showChatBadge && totalUnreadCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#d94b6b] px-1 text-[9px] font-extrabold leading-none text-white">
                {formatBadgeCount(totalUnreadCount)}
              </span>
            )}
          </span>
          <span className="font-sans">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default NavigationBar;
