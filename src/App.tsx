import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Pages
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Campaigns from '@/pages/Campaigns'
import CreateCampaign from '@/pages/CreateCampaign'
import Leads from '@/pages/Leads'
import Agents from '@/pages/Agents'
import Settings from '@/pages/Settings'
import WebsiteGenerator from '@/pages/WebsiteGenerator'
import PRDGenerator from '@/pages/PRDGenerator'
import ProposalGenerator from '@/pages/ProposalGenerator'
import Proposals from '@/pages/Proposals'
import ProposalPublic from '@/pages/ProposalPublic'
import ROICalculator from '@/pages/ROICalculator'
import CRM from '@/pages/CRM'
import AdminDashboard from '@/pages/AdminDashboard'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/proposal/:token" element={<ProposalPublic />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="campaigns" element={<Campaigns />} />
                            <Route path="campaigns/new" element={<CreateCampaign />} />
                            <Route path="leads" element={<Leads />} />
                            <Route path="agents" element={<Agents />} />
                            <Route path="generator" element={<WebsiteGenerator />} />
                            <Route path="prd" element={<PRDGenerator />} />
                            <Route path="proposals" element={<Proposals />} />
                            <Route path="proposals/new" element={<ProposalGenerator />} />
                            <Route path="roi-calculator" element={<ROICalculator />} />
                            <Route path="crm" element={<CRM />} />
                            <Route path="admin" element={<AdminDashboard />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
