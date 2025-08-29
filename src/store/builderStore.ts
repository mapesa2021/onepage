import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BuilderState, Page, Component } from '../types';

interface BuilderStore extends BuilderState {
  // Actions
  setCurrentPage: (page: Page | null) => void;
  selectComponent: (component: Component | null) => void;
  addComponent: (component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, newIndex: number) => void;
  duplicateComponent: (id: string) => void;
  togglePreviewMode: () => void;
  publishPage: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  saveToHistory: (page: Page) => void;
  clearHistory: () => void;
}

const initialState: BuilderState = {
  currentPage: null,
  selectedComponent: null,
  isPreviewMode: false,
  isPublishing: false,
  undoStack: [],
  redoStack: [],
  history: [],
  historyIndex: -1,
};

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentPage: (page) => {
        set({ currentPage: page, selectedComponent: null });
      },

      selectComponent: (component) => {
        set({ selectedComponent: component });
      },

      addComponent: (component) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const updatedPage = {
          ...currentPage,
          components: [...currentPage.components, component],
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        get().saveToHistory(updatedPage);
      },

      updateComponent: (id, updates) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const updatedComponents = currentPage.components.map((comp) =>
          comp.id === id ? { ...comp, ...updates } : comp
        );

        const updatedPage = {
          ...currentPage,
          components: updatedComponents,
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        get().saveToHistory(updatedPage);
      },

      removeComponent: (id) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const updatedComponents = currentPage.components.filter((comp) => comp.id !== id);
        const updatedPage = {
          ...currentPage,
          components: updatedComponents,
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage, selectedComponent: null });
        get().saveToHistory(updatedPage);
      },

      moveComponent: (id, newIndex) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const components = [...currentPage.components];
        const oldIndex = components.findIndex((comp) => comp.id === id);
        
        if (oldIndex === -1) return;

        const [movedComponent] = components.splice(oldIndex, 1);
        components.splice(newIndex, 0, movedComponent);

        const updatedPage = {
          ...currentPage,
          components,
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        get().saveToHistory(updatedPage);
      },

      duplicateComponent: (id) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const componentToDuplicate = currentPage.components.find((comp) => comp.id === id);
        if (!componentToDuplicate) return;

        const duplicatedComponent = {
          ...componentToDuplicate,
          id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: componentToDuplicate.position.x + 20,
            y: componentToDuplicate.position.y + 20,
          },
        };

        get().addComponent(duplicatedComponent);
      },

      togglePreviewMode: () => {
        set((state) => ({ isPreviewMode: !state.isPreviewMode }));
      },

      publishPage: async () => {
        set({ isPublishing: true });
        
        try {
          const { currentPage } = get();
          if (!currentPage) throw new Error('No page to publish');

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const updatedPage = {
            ...currentPage,
            publishedAt: new Date(),
            updatedAt: new Date(),
          };

          set({ currentPage: updatedPage, isPublishing: false });
          get().saveToHistory(updatedPage);
        } catch (error) {
          console.error('Failed to publish page:', error);
          set({ isPublishing: false });
        }
      },

      undo: () => {
        const { undoStack, redoStack, currentPage } = get();
        
        if (undoStack.length === 0 || !currentPage) return;

        const previousState = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [...redoStack, currentPage];

        set({
          currentPage: previousState,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        });
      },

      redo: () => {
        const { redoStack, currentPage } = get();
        
        if (redoStack.length === 0 || !currentPage) return;

        const nextState = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        const newUndoStack = [...get().undoStack, currentPage];

        set({
          currentPage: nextState,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        });
      },

      saveToHistory: (page) => {
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(page);

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          undoStack: [...get().undoStack, page],
          redoStack: [],
        });
      },

      clearHistory: () => {
        set({
          undoStack: [],
          redoStack: [],
          history: [],
          historyIndex: -1,
        });
      },
    }),
    {
      name: 'builder-store',
    }
  )
);
