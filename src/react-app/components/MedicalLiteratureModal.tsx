import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  BookOpen, 
  ExternalLink, 
  Search,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface MedicalArticle {
  id: string;
  title: string;
  authors: string;
  journal: string;
  publication_date: string;
  abstract: string;
  pubmed_url: string;
  relevance_score: number;
}

interface MedicalLiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function MedicalLiteratureModal({ isOpen, onClose, patientId }: MedicalLiteratureModalProps) {
  const [articles, setArticles] = useState<MedicalArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"auto" | "custom">("auto");

  const fetchLiterature = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = query 
        ? `/api/patients/${patientId}/literature?query=${encodeURIComponent(query)}`
        : `/api/patients/${patientId}/literature`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch literature');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch literature');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (isOpen && patientId && searchMode === "auto") {
      void fetchLiterature();
    }
  }, [fetchLiterature, isOpen, patientId, searchMode]);

  const handleCustomSearch = () => {
    if (customQuery.trim()) {
      void fetchLiterature(customQuery);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-700 bg-emerald-100";
    if (score >= 0.6) return "text-blue-700 bg-blue-100";
    return "text-gray-700 bg-gray-100";
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return "Highly Relevant";
    if (score >= 0.6) return "Relevant";
    return "Moderately Relevant";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Medical Literature</h2>
              <p className="text-sm text-gray-600">
                Research articles and case studies from PubMed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchMode("auto")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                searchMode === "auto"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Auto Search
            </button>
            <button
              onClick={() => setSearchMode("custom")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                searchMode === "custom"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Custom Search
            </button>
          </div>

          {searchMode === "custom" && (
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Enter medical terms or conditions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                />
              </div>
              <button
                onClick={handleCustomSearch}
                disabled={!customQuery.trim() || loading}
                className="btn-primary px-6"
              >
                Search
              </button>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Literature Integration</p>
                <p className="text-blue-600">
                  {searchMode === "auto" 
                    ? "Automatically searches for articles based on patient's medical conditions and diagnoses"
                    : "Search for specific medical terms, conditions, or treatment approaches in PubMed database"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-2xl border border-blue-100 mb-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <div className="text-left">
                <p className="font-medium text-blue-800">Searching Medical Literature</p>
                <p className="text-sm text-blue-600">Querying PubMed database for relevant articles...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-4 rounded-2xl border border-red-100 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-red-800">Search Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (searchMode === "auto") {
                  void fetchLiterature();
                } else {
                  handleCustomSearch();
                }
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No articles found</p>
            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {articles.length} relevant article{articles.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="card bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{article.authors}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{article.journal}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{article.publication_date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRelevanceColor(article.relevance_score)}`}>
                        {getRelevanceLabel(article.relevance_score)}
                      </span>
                      <a
                        href={article.pubmed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <span>View on PubMed</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {article.abstract && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-2">Abstract</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {article.abstract.length > 500 
                          ? `${article.abstract.substring(0, 500)}...` 
                          : article.abstract
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Research Reference Disclaimer</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    These articles are provided for educational and research purposes. Always verify information and 
                    apply clinical judgment when making patient care decisions. Consult current guidelines and institutional protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          {searchMode === "auto" && (
            <button
              onClick={() => void fetchLiterature()}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Refresh Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
