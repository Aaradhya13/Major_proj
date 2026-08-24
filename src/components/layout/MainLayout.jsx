import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <Sidebar />
      </div>
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 pt-6 sm:px-6 sm:py-6 lg:px-8 lg:pb-8 lg:pt-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
