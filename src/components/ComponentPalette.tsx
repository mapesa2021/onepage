import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Search, Grid, List } from 'lucide-react';
import { ComponentTemplate } from '../types';

const ComponentPalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    {
      id: 'testimonial',
      name: 'Testimonial',
      category: 'social',
      icon: '💬',
      component: {
        id: '',
        type: 'testimonial',
        props: {
          quote: 'This product changed my life!',
          author: 'John Doe',
          role: 'Entrepreneur',
          avatar: 'https://via.placeholder.com/60x60',
        },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 150 },
      },
      preview: 'Customer testimonial',
      description: 'Show customer testimonials and reviews',
    },
    {
      id: 'features',
      name: 'Features',
      category: 'layout',
      icon: '✨',
      component: {
        id: '',
        type: 'features',
        props: {
          title: 'Key Features',
          features: [
            { title: 'Feature 1', description: 'Description 1', icon: '🚀' },
            { title: 'Feature 2', description: 'Description 2', icon: '⚡' },
            { title: 'Feature 3', description: 'Description 3', icon: '🎯' },
          ],
        },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 300 },
      },
      preview: 'Features section',
      description: 'Highlight key features and benefits',
    },
    {
      id: 'contact',
      name: 'Contact Form',
      category: 'forms',
      icon: '📧',
      component: {
        id: '',
        type: 'contact',
        props: {
          title: 'Get in Touch',
          fields: ['name', 'email', 'message'],
          submitText: 'Send Message',
        },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 400 },
      },
      preview: 'Contact form',
      description: 'Collect visitor information and inquiries',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Components', icon: '📦' },
    { id: 'layout', name: 'Layout', icon: '📐' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'media', name: 'Media', icon: '🖼️' },
    { id: 'interactive', name: 'Interactive', icon: '🔘' },
    { id: 'ecommerce', name: 'E-commerce', icon: '💳' },
    { id: 'social', name: 'Social', icon: '💬' },
    { id: 'forms', name: 'Forms', icon: '📧' },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sidebar bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        <Droppable droppableId="palette" isDropDisabled={true}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 gap-3' 
                  : 'space-y-3'
              }`}
            >
              {filteredTemplates.map((template, index) => (
                <Draggable
                  key={template.id}
                  draggableId={template.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`draggable-component ${
                        snapshot.isDragging ? 'opacity-50' : ''
                      } ${viewMode === 'list' ? 'flex items-center space-x-3' : 'text-center'}`}
                    >
                      <div className={`text-2xl ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-2'}`}>
                        {template.icon}
                      </div>
                      <div className={`flex-1 ${viewMode === 'list' ? 'text-left' : ''}`}>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {template.name}
                        </h3>
                        {viewMode === 'list' && (
                          <p className="text-xs text-gray-600 mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No components found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPalette;
