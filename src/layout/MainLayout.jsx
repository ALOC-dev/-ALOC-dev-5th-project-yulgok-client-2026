import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar.jsx';

function MainLayout() {
  return (
    <div className="min-h-dvh bg-brand-background">
      <main className="pb-[calc(96px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[1126px] bg-brand-background px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        <NavigationBar />
      </div>
    </div>
  );
}

export default MainLayout;
