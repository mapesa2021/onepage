import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Preview: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      // Fetch page data from API
      const response = await fetch(`/api/pages/${pageId}`);
      const data = await response.json();
      setPageData(data);
    } catch (error) {
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600">
            ← Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/builder/${pageId}`)}
              className="px-4 py-2 border rounded"
            >
              Edit
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Publish
            </button>
          </div>
        </div>
      </div>
      
      <div className="preview-content">
        {/* Page content will be rendered here */}
        <h1>Preview: {pageData?.title}</h1>
      </div>
    </div>
  );
};

export default Preview;
