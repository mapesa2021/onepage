import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Undo, 
  Redo, 
  Settings, 
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { Component, ComponentTemplate } from '../types';
import ComponentPalette from '../components/ComponentPalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import toast from 'react-hot-toast';

const Builder: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showProperties, setShowProperties] = useState(true);
  
  const {
    currentPage,
    selectedComponent,
    isPreviewMode,
    isPublishing,
    undoStack,
    redoStack,
    setCurrentPage,
    selectComponent,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    togglePreviewMode,
    publishPage,
    undo,
    redo,
  } = useBuilderStore();

  useEffect(() => {
    // Load page data - replace with API call
    const mockPage = {
      id: pageId || '1',
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
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        views: 0,
        uniqueVisitors: 0,
        conversions: 0,
        conversionRate: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        lastUpdated: new Date(),
      },
    };
    
    setCurrentPage(mockPage);
  }, [pageId, setCurrentPage]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Handle component reordering
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      moveComponent(draggableId, destination.index);
      return;
    }

    // Handle adding new component from palette
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const template = getComponentTemplate(draggableId);
      if (template) {
        const newComponent: Component = {
          ...template.component,
          id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          position: { x: 0, y: destination.index * 100 },
        };
        addComponent(newComponent);
        toast.success(`${template.name} added to page`);
      }
    }
  };

  const getComponentTemplate = (id: string): ComponentTemplate | null => {
    // Mock component templates - replace with real data
    const templates: ComponentTemplate[] = [
      {
        id: 'hero',
        name: 'Hero Section',
        category: 'layout',
        icon: '🎯',
        component: {
          id: '',
          type: 'hero',
          props: {
            title: 'Your Amazing Headline',
            subtitle: 'Compelling subtitle that drives action',
            ctaText: 'Get Started',
            ctaLink: '#',
            backgroundImage: '',
          },
          position: { x: 0, y: 0 },
          size: { width: 100, height: 400 },
        },
        preview: 'Hero section with headline and CTA',
        description: 'Eye-catching hero section for your landing page',
      },
      {
        id: 'text',
        name: 'Text Block',
        category: 'content',
        icon: '📝',
        component: {
          id: '',
          type: 'text',
          props: {
            content: 'Your compelling content goes here...',
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#000000',
          },
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
        },
        preview: 'Text content block',
        description: 'Add text content to your page',
      },
      {
        id: 'image',
        name: 'Image',
        category: 'media',
        icon: '🖼️',
        component: {
          id: '',
          type: 'image',
          props: {
            src: 'https://via.placeholder.com/400x300',
            alt: 'Image description',
            width: 400,
            height: 300,
            borderRadius: '8px',
          },
          position: { x: 0, y: 0 },
          size: { width: 400, height: 300 },
        },
        preview: 'Image component',
        description: 'Add images to your landing page',
      },
      {
        id: 'button',
        name: 'Button',
        category: 'interactive',
        icon: '🔘',
        component: {
          id: '',
          type: 'button',
          props: {
            text: 'Click Me',
            link: '#',
            variant: 'primary',
            size: 'medium',
            borderRadius: '8px',
          },
          position: { x: 0, y: 0 },
          size: { width: 120, height: 40 },
        },
        preview: 'Interactive button',
        description: 'Add call-to-action buttons',
      },
      {
        id: 'payment',
        name: 'Payment Form',
        category: 'ecommerce',
        icon: '💳',
        component: {
          id: '',
          type: 'payment',
          props: {
            amount: 15000,
            currency: 'TZS',
            description: 'Wealth Creation Video Course',
            provider: 'zenopay',
            successMessage: 'Payment successful!',
          },
          position: { x: 0, y: 0 },
          size: { width: 100, height: 300 },
        },
        preview: 'Payment integration form',
        description: 'Integrated payment form with ZenoPay',
      },
    ];

    return templates.find(t => t.id === id) || null;
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      toast.success('Page saved successfully');
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const handlePublish = async () => {
    try {
      await publishPage();
      toast.success('Page published successfully');
    } catch (error) {
      toast.error('Failed to publish page');
    }
  };

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">{currentPage.name}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="btn-secondary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={togglePreviewMode}
                className="btn-secondary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="btn-primary flex items-center space-x-2"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <ComponentPalette />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Canvas
            viewMode={viewMode}
            onComponentSelect={selectComponent}
            selectedComponent={selectedComponent}
          />
        </div>

        {/* Properties Panel */}
        {showProperties && selectedComponent && (
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Builder;
