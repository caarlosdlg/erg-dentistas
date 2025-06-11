/**
 * Keyboard Shortcuts Manager
 * Global keyboard shortcuts and accessibility features
 */
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { clsx } from 'clsx';
import { 
  CommandLineIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Modal, ButtonTW } from '../ui';
import { useAccessibility, useFeedback, useNavigation } from '../ux';
import { useNavigate } from 'react-router-dom';

/**
 * Keyboard Shortcuts Context
 */
const KeyboardShortcutsContext = createContext({});

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

/**
 * Default shortcuts configuration
 */
const DEFAULT_SHORTCUTS = {
  // Global shortcuts
  'ctrl+k': {
    id: 'search',
    description: 'Abrir búsqueda global',
    category: 'Navegación',
    icon: MagnifyingGlassIcon,
    action: 'openSearch'
  },
  'ctrl+h': {
    id: 'home',
    description: 'Ir al dashboard',
    category: 'Navegación',
    icon: HomeIcon,
    action: 'navigateTo',
    params: '/'
  },
  'ctrl+shift+p': {
    id: 'patients',
    description: 'Ir a pacientes',
    category: 'Navegación',
    icon: UserGroupIcon,
    action: 'navigateTo',
    params: '/pacientes'
  },
  'ctrl+shift+a': {
    id: 'appointments',
    description: 'Ir a citas',
    category: 'Navegación',
    icon: CalendarIcon,
    action: 'navigateTo',
    params: '/citas'
  },
  'ctrl+shift+?': {
    id: 'help',
    description: 'Mostrar ayuda de atajos',
    category: 'Ayuda',
    icon: QuestionMarkCircleIcon,
    action: 'showHelp'
  },
  'escape': {
    id: 'escape',
    description: 'Cerrar modal/diálogo',
    category: 'General',
    action: 'escape'
  },
  'ctrl+s': {
    id: 'save',
    description: 'Guardar (cuando aplique)',
    category: 'Acciones',
    action: 'save'
  },
  'ctrl+z': {
    id: 'undo',
    description: 'Deshacer (cuando aplique)',
    category: 'Acciones',
    action: 'undo'
  },
  'ctrl+y': {
    id: 'redo',
    description: 'Rehacer (cuando aplique)',
    category: 'Acciones',
    action: 'redo'
  },
  // Accessibility shortcuts
  'alt+1': {
    id: 'skip-to-content',
    description: 'Saltar al contenido principal',
    category: 'Accesibilidad',
    action: 'skipToContent'
  },
  'alt+2': {
    id: 'skip-to-navigation',
    description: 'Saltar a navegación',
    category: 'Accesibilidad',
    action: 'skipToNavigation'
  }
};

/**
 * Shortcut Help Modal
 */
const ShortcutHelpModal = ({ isOpen, onClose, shortcuts }) => {
  const categories = [...new Set(Object.values(shortcuts).map(s => s.category))];

  const formatShortcut = (key) => {
    return key
      .split('+')
      .map(k => k.charAt(0).toUpperCase() + k.slice(1))
      .join(' + ');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Atajos de Teclado">
      <div className="max-h-96 overflow-y-auto">
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {category}
            </h3>
            
            <div className="space-y-2">
              {Object.entries(shortcuts)
                .filter(([, shortcut]) => shortcut.category === category)
                .map(([key, shortcut]) => {
                  const Icon = shortcut.icon;
                  return (
                    <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                      </div>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                        {formatShortcut(key)}
                      </kbd>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Presiona <kbd className="px-1 py-0.5 text-xs bg-gray-100 border rounded">Ctrl + Shift + ?</kbd> para abrir esta ayuda
          </p>
          <ButtonTW onClick={onClose} variant="primary">
            Cerrar
          </ButtonTW>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Command Palette Component
 */
const CommandPalette = ({ isOpen, onClose, shortcuts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { announce } = useAccessibility();

  const filteredShortcuts = Object.entries(shortcuts).filter(([key, shortcut]) =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const executeCommand = useCallback((key, shortcut) => {
    onClose();
    
    switch (shortcut.action) {
      case 'navigateTo':
        navigate(shortcut.params);
        announce(`Navegando a ${shortcut.description.toLowerCase()}`);
        break;
      case 'openSearch':
        // Trigger global search
        document.dispatchEvent(new CustomEvent('open-global-search'));
        break;
      default:
        // Dispatch custom event for other actions
        document.dispatchEvent(new CustomEvent(`shortcut-${shortcut.action}`, {
          detail: { shortcut, key }
        }));
    }
  }, [navigate, onClose, announce]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredShortcuts.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredShortcuts[selectedIndex]) {
            const [key, shortcut] = filteredShortcuts[selectedIndex];
            executeCommand(key, shortcut);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredShortcuts, selectedIndex, executeCommand, onClose]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md"
      showCloseButton={false}
      className="top-20"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar comandos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredShortcuts.length > 0 ? (
            <div className="space-y-1">
              {filteredShortcuts.map(([key, shortcut], index) => {
                const Icon = shortcut.icon;
                return (
                  <button
                    key={key}
                    onClick={() => executeCommand(key, shortcut)}
                    className={clsx(
                      'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon className="h-5 w-5 text-gray-500" />}
                      <div>
                        <div className="font-medium text-gray-900">{shortcut.description}</div>
                        <div className="text-xs text-gray-500">{shortcut.category}</div>
                      </div>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                      {key.split('+').map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' + ')}
                    </kbd>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CommandLineIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No se encontraron comandos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>↑↓ para navegar</span>
          <span>↵ para ejecutar</span>
          <span>⎋ para cancelar</span>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Keyboard Shortcuts Provider
 */
export const KeyboardShortcutsProvider = ({ 
  children, 
  customShortcuts = {},
  enableCommandPalette = true,
  enableHelpModal = true 
}) => {
  const [shortcuts, setShortcuts] = useState({ ...DEFAULT_SHORTCUTS, ...customShortcuts });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  const navigate = useNavigate();
  const { announce, skipToContent } = useAccessibility();
  const { showInfo } = useFeedback();

  // Handle shortcut execution
  const executeShortcut = useCallback((shortcut, key) => {
    switch (shortcut.action) {
      case 'navigateTo':
        navigate(shortcut.params);
        announce(`Navegando a ${shortcut.description.toLowerCase()}`);
        break;
      
      case 'openSearch':
        if (enableCommandPalette) {
          setShowCommandPalette(true);
        } else {
          document.dispatchEvent(new CustomEvent('open-global-search'));
        }
        break;
      
      case 'showHelp':
        if (enableHelpModal) {
          setShowHelpModal(true);
        }
        break;
      
      case 'escape':
        // Close any open modals/dialogs
        document.dispatchEvent(new CustomEvent('global-escape'));
        break;
      
      case 'skipToContent':
        skipToContent();
        break;
      
      case 'skipToNavigation':
        const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
        if (nav) {
          nav.focus();
          nav.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      
      default:
        // Dispatch custom event for other actions
        document.dispatchEvent(new CustomEvent(`shortcut-${shortcut.action}`, {
          detail: { shortcut, key }
        }));
    }
  }, [navigate, announce, skipToContent, enableCommandPalette, enableHelpModal]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts when user is typing in form fields
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.contentEditable === 'true') {
        // Allow escape in form fields
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Build shortcut key
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      
      // Add main key
      const mainKey = e.key.toLowerCase();
      if (mainKey !== 'control' && mainKey !== 'shift' && mainKey !== 'alt' && mainKey !== 'meta') {
        keys.push(mainKey === ' ' ? 'space' : mainKey);
      }

      const shortcutKey = keys.join('+');
      const shortcut = shortcuts[shortcutKey];

      if (shortcut) {
        e.preventDefault();
        executeShortcut(shortcut, shortcutKey);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, executeShortcut]);

  // Register custom shortcut
  const registerShortcut = useCallback((key, shortcutConfig) => {
    setShortcuts(prev => ({
      ...prev,
      [key]: shortcutConfig
    }));
  }, []);

  // Unregister shortcut
  const unregisterShortcut = useCallback((key) => {
    setShortcuts(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    executeShortcut,
    showHelpModal: () => setShowHelpModal(true),
    showCommandPalette: () => setShowCommandPalette(true)
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      
      {/* Help Modal */}
      {enableHelpModal && (
        <ShortcutHelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          shortcuts={shortcuts}
        />
      )}
      
      {/* Command Palette */}
      {enableCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          shortcuts={shortcuts}
        />
      )}
    </KeyboardShortcutsContext.Provider>
  );
};

/**
 * Keyboard shortcut hook for components
 */
export const useShortcut = (key, callback, deps = []) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const shortcutConfig = {
      id: `custom-${key}`,
      description: `Custom shortcut: ${key}`,
      category: 'Custom',
      action: 'custom',
      callback
    };

    registerShortcut(key, shortcutConfig);

    // Listen for custom shortcut execution
    const handleCustomShortcut = (e) => {
      if (e.detail.shortcut.action === 'custom' && e.detail.key === key) {
        callback(e);
      }
    };

    document.addEventListener('shortcut-custom', handleCustomShortcut);

    return () => {
      unregisterShortcut(key);
      document.removeEventListener('shortcut-custom', handleCustomShortcut);
    };
  }, [key, callback, registerShortcut, unregisterShortcut, ...deps]);
};

/**
 * Shortcut Display Component
 */
export const ShortcutDisplay = ({ shortcut, className = '' }) => {
  const keys = shortcut.split('+').map(k => k.charAt(0).toUpperCase() + k.slice(1));
  
  return (
    <span className={clsx('inline-flex items-center space-x-1', className)}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-gray-400">+</span>}
        </React.Fragment>
      ))}
    </span>
  );
};

export default KeyboardShortcutsProvider;
