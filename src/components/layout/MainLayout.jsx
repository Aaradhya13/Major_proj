import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../../context/useAuth.js'

function MainLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#eef4f7_100%)] text-slate-800">
      <div className="sticky top-0 z-40">
        <Sidebar doctorName={user.name} doctorRole={user.role} onLogout={logout} />
      </div>
      <div className="min-w-0">
        <main className="p-4 pt-5 sm:px-6 sm:py-6 lg:px-8 lg:pb-10 lg:pt-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
