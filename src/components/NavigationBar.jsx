import { NavLink } from 'react-router-dom';
import { ChatIcon, HeartIcon, UserIcon } from './NavigationIcons.jsx';

const menus = [
    { label: '매칭', path: '/matching', icon: HeartIcon },
    { label: '채팅', path: '/chat', icon: ChatIcon },
    { label: '마이', path: '/my', icon: UserIcon },
]

function NavigationBar() {
    return (
        <nav
            aria-label="주요 메뉴"
            className="grid grid-cols-3 rounded-[28px] bg-white p-1 shadow-sm"
        >
            {menus.map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[22px] text-xs no-underline transition-colors ${
                            isActive
                                ? 'bg-brand-primary text-white'
                                : 'text-fg-basic-muted'
                        }`
                    }
                >
                    <Icon aria-hidden="true" />
                    <span className="font-sans">{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default NavigationBar;
