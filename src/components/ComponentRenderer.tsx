import React from 'react';
import { Component } from '../types';

interface ComponentRendererProps {
  component: Component;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'hero':
        return <HeroComponent props={component.props} />;
      case 'text':
        return <TextComponent props={component.props} />;
      case 'image':
        return <ImageComponent props={component.props} />;
      case 'button':
        return <ButtonComponent props={component.props} />;
      case 'payment':
        return <PaymentComponent props={component.props} />;
      case 'testimonial':
        return <TestimonialComponent props={component.props} />;
      case 'features':
        return <FeaturesComponent props={component.props} />;
      case 'contact':
        return <ContactComponent props={component.props} />;
      default:
        return <div className="p-4 bg-gray-100 text-gray-500">Unknown component type: {component.type}</div>;
    }
  };

  return (
    <div className="w-full">
      {renderComponent()}
    </div>
  );
};

// Hero Component
const HeroComponent: React.FC<{ props: any }> = ({ props }) => (
  <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        {props.title || 'Your Amazing Headline'}
      </h1>
      <p className="text-xl md:text-2xl mb-8 opacity-90">
        {props.subtitle || 'Compelling subtitle that drives action'}
      </p>
      <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
        {props.ctaText || 'Get Started'}
      </button>
    </div>
  </section>
);

// Text Component
const TextComponent: React.FC<{ props: any }> = ({ props }) => (
  <div 
    className="p-6"
    style={{
      fontSize: props.fontSize || '16px',
      fontWeight: props.fontWeight || 'normal',
      textAlign: props.textAlign || 'left',
      color: props.color || '#000000',
    }}
  >
    {props.content || 'Your compelling content goes here...'}
  </div>
);

// Image Component
const ImageComponent: React.FC<{ props: any }> = ({ props }) => (
  <div className="p-6 text-center">
    <img
      src={props.src || 'https://via.placeholder.com/400x300'}
      alt={props.alt || 'Image description'}
      style={{
        width: props.width || 400,
        height: props.height || 300,
        borderRadius: props.borderRadius || '8px',
      }}
      className="max-w-full h-auto"
    />
  </div>
);

// Button Component
const ButtonComponent: React.FC<{ props: any }> = ({ props }) => {
  const getButtonClasses = () => {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-colors';
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      success: 'bg-green-600 text-white hover:bg-green-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return `${baseClasses} ${variantClasses[props.variant as keyof typeof variantClasses] || variantClasses.primary}`;
  };

  return (
    <div className="p-6 text-center">
      <button className={getButtonClasses()}>
        {props.text || 'Click Me'}
      </button>
    </div>
  );
};

// Payment Component
const PaymentComponent: React.FC<{ props: any }> = ({ props }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {props.description || 'Wealth Creation Video Course'}
      </h3>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {props.amount?.toLocaleString() || '15,000'} {props.currency || 'TZS'}
          </div>
          <p className="text-gray-600">
            {props.description || 'Complete video course'}
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Pay with Mobile Money
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Secure payment powered by ZenoPay
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Testimonial Component
const TestimonialComponent: React.FC<{ props: any }> = ({ props }) => (
  <div className="p-6 bg-white">
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <img
          src={props.avatar || 'https://via.placeholder.com/60x60'}
          alt={props.author || 'Customer'}
          className="w-16 h-16 rounded-full mx-auto mb-4"
        />
      </div>
      <blockquote className="text-xl text-gray-700 mb-4 italic">
        "{props.quote || 'This product changed my life!'}"
      </blockquote>
      <div>
        <p className="font-semibold text-gray-900">
          {props.author || 'John Doe'}
        </p>
        <p className="text-gray-600 text-sm">
          {props.role || 'Entrepreneur'}
        </p>
      </div>
    </div>
  </div>
);

// Features Component
const FeaturesComponent: React.FC<{ props: any }> = ({ props }) => (
  <section className="py-16 px-6 bg-gray-50">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        {props.title || 'Key Features'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(props.features || [
          { title: 'Feature 1', description: 'Description 1', icon: '🚀' },
          { title: 'Feature 2', description: 'Description 2', icon: '⚡' },
          { title: 'Feature 3', description: 'Description 3', icon: '🎯' },
        ]).map((feature: any, index: number) => (
          <div key={index} className="text-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Contact Component
const ContactComponent: React.FC<{ props: any }> = ({ props }) => (
  <div className="p-6 bg-white">
    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {props.title || 'Get in Touch'}
      </h3>
      <form className="space-y-4">
        {(props.fields || ['name', 'email', 'message']).map((field: string) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {field === 'message' ? (
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder={`Enter your ${field}...`}
              />
            ) : (
              <input
                type={field === 'email' ? 'email' : 'text'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter your ${field}...`}
              />
            )}
          </div>
        ))}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          {props.submitText || 'Send Message'}
        </button>
      </form>
    </div>
  </div>
);

export default ComponentRenderer;
