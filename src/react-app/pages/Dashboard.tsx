import Layout from "@/react-app/components/Layout";
import { useDashboardStats, usePatients } from "@/react-app/hooks/useApi";
import { 
  Users, 
  Activity, 
  Plus,
  Search,
  TrendingUp,
  Heart,
  Stethoscope
} from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export default function Dashboard() {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: recentPatients, loading: patientsLoading } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  const recentPatientsDisplay = recentPatients?.slice(0, 5) || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-secondary mt-1">Welcome back to your medical practice</p>
          </div>
          <Link to="/patients/add" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {statsLoading ? "..." : stats?.total_patients || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+12% this month</span>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm font-medium">Total Visits</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {statsLoading ? "..." : stats?.recent_visits || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Heart className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Recent activity</span>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm font-medium">Doctors Online</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {statsLoading ? "..." : stats?.doctors_online || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">Available for consultation</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Search */}
          <div className="card">
            <h3 className="text-lg font-semibold text-primary mb-4">Quick Patient Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {searchQuery && (
              <div className="mt-4">
                <Link 
                  to={`/patients?search=${encodeURIComponent(searchQuery)}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View all search results →
                </Link>
              </div>
            )}
          </div>

          {/* Doctor Availability */}
          <div className="card bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-100/50 dark:border-purple-800/40">
            <h3 className="text-lg font-semibold text-primary mb-4">Doctor Availability</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-primary">Online Now</p>
                  <p className="text-xs text-secondary">{stats?.doctors_online || 0} doctors available for consultation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-primary">Response Time</p>
                  <p className="text-xs text-secondary">Average: 5-10 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-primary">Consultation Status</p>
                  <p className="text-xs text-secondary">Ready to help patients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">Recent Patients</h3>
            <Link to="/patients" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View all patients →
            </Link>
          </div>

          {patientsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-secondary mt-2">Loading patients...</p>
            </div>
          ) : recentPatientsDisplay.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-secondary mb-4">No patients yet</p>
              <Link to="/patients/add" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Your First Patient</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatientsDisplay.map((patient) => (
                <Link
                  key={patient.id}
                  to={`/patients/${patient.id}`}
                  className="block p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm text-secondary">{patient.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recent'}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">View Details</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
