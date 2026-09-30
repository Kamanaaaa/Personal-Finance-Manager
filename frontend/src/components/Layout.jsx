import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout