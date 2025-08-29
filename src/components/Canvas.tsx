import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2, Copy, Settings } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { Component } from '../types';
import ComponentRenderer from './ComponentRenderer';

interface CanvasProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onComponentSelect: (component: Component | null) => void;
  selectedComponent: Component | null;
}

const Canvas: React.FC<CanvasProps> = ({
  viewMode,
  onComponentSelect,
  selectedComponent,
}) => {
  const { currentPage, removeComponent, duplicateComponent } = useBuilderStore();

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Settings className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No page loaded</h3>
          <p className="text-gray-600">Select a page to start building</p>
        </div>
      </div>
    );
  }

  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      default:
        return 'max-w-4xl';
    }
  };

  const handleComponentClick = (component: Component) => {
    onComponentSelect(component);
  };

  const handleComponentDelete = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(componentId);
    onComponentSelect(null);
  };

  const handleComponentDuplicate = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(componentId);
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-auto">
      <div className="min-h-full flex items-start justify-center p-8">
        <div className={`${getCanvasWidth()} w-full bg-white shadow-lg rounded-lg overflow-hidden`}>
          {/* Canvas Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {currentPage.name}
                </h2>
                <p className="text-xs text-gray-600">
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {currentPage.components.length} components
              </div>
            </div>
          </div>

          {/* Canvas Content */}
          <Droppable droppableId="canvas">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-screen p-4 ${
                  snapshot.isDraggingOver ? 'bg-primary-50' : 'bg-white'
                }`}
              >
                {currentPage.components.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <Settings className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start building your page
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag components from the left panel to start creating your landing page
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <p className="text-sm text-gray-500">
                          Drop components here
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentPage.components.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative group mb-4 ${
                            snapshot.isDragging ? 'opacity-50' : ''
                          } ${
                            selectedComponent?.id === component.id
                              ? 'ring-2 ring-primary-500 ring-offset-2'
                              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                          }`}
                          onClick={() => handleComponentClick(component)}
                        >
                          {/* Component Actions */}
                          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                              <button
                                onClick={(e) => handleComponentDuplicate(component.id, e)}
                                className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded transition-colors"
                                title="Duplicate component"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleComponentDelete(component.id, e)}
                                className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors"
                                title="Delete component"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Component Renderer */}
                          <ComponentRenderer component={component} />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
