import Layout from "@/react-app/components/Layout";
import { usePatients } from "@/react-app/hooks/useApi";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { 
  Search, 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  Filter
} from "lucide-react";

export default function Patients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const { data: patients, loading, error, refetch } = usePatients(searchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Patients</h1>
            <p className="text-secondary mt-1">Manage your patient records</p>
          </div>
          <Link to="/patients/add" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button className="btn-secondary inline-flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-secondary mt-4">Loading patients...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-600 mb-4">Failed to load patients</p>
              <button onClick={refetch} className="btn-secondary">
                Try Again
              </button>
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {searchQuery ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-secondary mb-6">
                {searchQuery 
                  ? `No patients match "${searchQuery}". Try a different search term.`
                  : 'Start building your patient database by adding your first patient.'
                }
              </p>
              {!searchQuery && (
                <Link to="/patients/add" className="btn-primary inline-flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Patient</span>
                </Link>
              )}
              {searchQuery && (
                <button 
                  onClick={() => handleSearch('')}
                  className="btn-secondary"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-secondary">
                  {patients.length} patient{patients.length !== 1 ? 's' : ''} found
                  {searchQuery && (
                    <span className="ml-2">
                      for "<span className="font-medium">{searchQuery}</span>"
                    </span>
                  )}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => handleSearch('')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* Patient grid */}
              <div className="grid gap-4">
                {patients.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/patients/${patient.id}`}
                    className="block p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-secondary">
                            {patient.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{patient.email}</span>
                              </div>
                            )}
                            {patient.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                            {patient.date_of_birth && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years old
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted">
                          Added {patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Recently'}
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">
                          View Details →
                        </p>
                      </div>
                    </div>
                    
                    {/* Patient metadata */}
                    <div className="mt-4 flex items-center space-x-4 text-xs text-muted">
                      {patient.medical_record_number && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          MRN: {patient.medical_record_number}
                        </span>
                      )}
                      {patient.blood_type && (
                        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                          {patient.blood_type}
                        </span>
                      )}
                      {patient.gender && (
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                          {patient.gender}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
