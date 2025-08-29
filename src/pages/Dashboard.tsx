import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, BarChart3, Settings, Search, Filter } from 'lucide-react';
import { Page } from '../types';

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Mock data - replace with real data from API
  const pages: Page[] = [
    {
      id: '1',
      name: 'Wealth Creation Landing Page',
      slug: 'wealth-creation',
      components: [],
      settings: {
        title: 'Wealth Creation with Digital Assets',
        description: 'Learn how to create wealth through digital products',
        keywords: ['wealth', 'digital', 'assets'],
        theme: 'light',
        primaryColor: '#3b82f6',
        fontFamily: 'Inter',
        metaTags: {},
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      publishedAt: new Date('2024-01-18'),
      analytics: {
        views: 1250,
        uniqueVisitors: 890,
        conversions: 45,
        conversionRate: 5.1,
        averageTimeOnPage: 180,
        bounceRate: 35,
        lastUpdated: new Date(),
      },
    },
    {
      id: '2',
      name: 'Digital Marketing Course',
      slug: 'digital-marketing',
      components: [],
      settings: {
        title: 'Digital Marketing Mastery',
        description: 'Master digital marketing strategies',
        keywords: ['marketing', 'digital', 'course'],
        theme: 'light',
        primaryColor: '#10b981',
        fontFamily: 'Inter',
        metaTags: {},
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-19'),
      analytics: {
        views: 890,
        uniqueVisitors: 650,
        conversions: 32,
        conversionRate: 4.9,
        averageTimeOnPage: 210,
        bounceRate: 28,
        lastUpdated: new Date(),
      },
    },
  ];

  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.settings.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && page.publishedAt) ||
                         (filterStatus === 'draft' && !page.publishedAt);
    
    return matchesSearch && matchesFilter;
  });

  const createNewPage = () => {
    // TODO: Implement new page creation
    console.log('Create new page');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Landing Pages</h1>
              <p className="text-gray-600 mt-1">Create and manage your landing pages</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={createNewPage}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Page</span>
              </button>
              <Link
                to="/settings"
                className="btn-secondary flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="all">All Pages</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <div key={page.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{page.settings.title}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  page.publishedAt 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-warning-100 text-warning-700'
                }`}>
                  {page.publishedAt ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Analytics Preview */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {page.analytics.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {page.analytics.conversions}
                  </div>
                  <div className="text-xs text-gray-600">Conversions</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {page.analytics.conversionRate}%
                  </div>
                  <div className="text-xs text-gray-600">Rate</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/builder/${page.id}`}
                    className="btn-secondary flex items-center space-x-1 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <Link
                    to={`/preview/${page.id}`}
                    className="btn-secondary flex items-center space-x-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </Link>
                </div>
                <Link
                  to={`/analytics/${page.id}`}
                  className="btn-primary flex items-center space-x-1 text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
              </div>

              <div className="text-xs text-gray-500 mt-3">
                Last updated: {page.updatedAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first landing page to get started'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
