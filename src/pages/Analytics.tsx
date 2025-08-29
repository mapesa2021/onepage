import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Analytics: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [pageId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${pageId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Page Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Views</h3>
          <p className="text-3xl font-bold">{analytics?.totalViews || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Unique Visitors</h3>
          <p className="text-3xl font-bold">{analytics?.uniqueVisitors || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Conversion Rate</h3>
          <p className="text-3xl font-bold">{analytics?.conversionRate || 0}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg. Session</h3>
          <p className="text-3xl font-bold">{analytics?.avgSession || 0}s</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {analytics?.recentActivity?.map((activity: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>{activity.event}</span>
              <span className="text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
