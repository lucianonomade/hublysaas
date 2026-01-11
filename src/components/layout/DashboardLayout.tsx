import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
                <Sidebar />
            </aside>

            {/* Sidebar - Mobile */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
                        <Sidebar />
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
