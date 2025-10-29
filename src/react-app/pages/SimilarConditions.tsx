import Layout from "@/react-app/components/Layout";
import { Users, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function SimilarConditions() {

  

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Similar Case Analysis</h1>
          <p className="text-secondary mt-1">Compare patient cases and find similar medical patterns</p>
        </div>

        {/* Feature Moved Notice */}
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-primary mb-4">Similar Case Search Has Moved</h3>
          <p className="text-secondary mb-6 max-w-2xl mx-auto">
            The similar case search functionality is now integrated directly into individual patient records for more contextual and relevant results.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h4 className="text-lg font-medium text-primary">How to Find Similar Cases</h4>
              </div>
              <p className="text-sm text-secondary mb-4">
                Visit any patient's detailed view to access the "Find Similar Cases" button, which will show relevant medical cases based on that specific patient's conditions and symptoms.
              </p>
              <Link 
                to="/patients" 
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Browse Patients</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="text-sm text-muted">
              <p>This provides more accurate and contextual similar case results based on specific patient medical history.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
