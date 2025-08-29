export interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Component[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  components: Component[];
  settings: PageSettings;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  analytics: PageAnalytics;
}

export interface PageSettings {
  title: string;
  description: string;
  keywords: string[];
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontFamily: string;
  customCSS?: string;
  metaTags: Record<string, string>;
}

export interface PageAnalytics {
  views: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  averageTimeOnPage: number;
  bounceRate: number;
  lastUpdated: Date;
}

export interface PaymentConfig {
  enabled: boolean;
  provider: 'zenopay' | 'stripe' | 'paypal';
  amount: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  component: Component;
  preview: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  pages: Page[];
  createdAt: Date;
}

export interface DragItem {
  type: 'component' | 'template';
  id: string;
  component?: Component;
  template?: ComponentTemplate;
}

export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export interface BuilderState {
  currentPage: Page | null;
  selectedComponent: Component | null;
  isPreviewMode: boolean;
  isPublishing: boolean;
  undoStack: Page[];
  redoStack: Page[];
  history: Page[];
  historyIndex: number;
}
