/**
 * Animation DevTools v4.0
 * Entity-context aware animation debugging system
 */

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ============= TYPES =============

export interface AnimationMetadata {
  elementId: string;
  entityId: string;
  [key: string]: any;
}

export interface EntityContext {
  [key: string]: any;
}

export interface AnimationEngineData {
  elementRegistry: Map<
    HTMLElement,
    {
      animations: Record<string, any>;
      metadata: AnimationMetadata;
    }
  >;
  activeAnimations: Map<HTMLElement, Animation>;
  entityContexts: Map<string, EntityContext>;
  // Add getter functions for DevTools compatibility
  getElementRegistry?: () => Map<
    HTMLElement,
    {
      animations: Record<string, any>;
      metadata: AnimationMetadata;
    }
  >;
  getActiveAnimations?: () => Map<HTMLElement, Animation>;
  getEntityContexts?: () => Map<string, EntityContext>;
}

export interface AnimationTracker {
  entityId: string;
  elementId: string;
  status: "pending" | "running" | "finished";
  progress: number;
  trigger: string;
  startTime: number;
  duration: number;
}

interface DevToolsSnapshot {
  engines: Map<string, AnimationEngineData>;
  animationTrackers: Map<string, AnimationTracker>;
  entityContexts: Map<string, EntityContext>; // Aggregated entity contexts
}

interface DevToolsContextValue {
  registerEngine: (id: string, engine: AnimationEngineData) => void;
  unregisterEngine: (id: string) => void;
  updateAnimationTracker: (key: string, tracker: AnimationTracker) => void;
  setEntityContext: (entityId: string, context: EntityContext) => void;
  getSnapshot: () => DevToolsSnapshot;
  subscribe: (callback: () => void) => () => void;
}

// ============= CONTEXT =============

const DevToolsContext = createContext<DevToolsContextValue | null>(null);

export const useAnimationDevTools = () => {
  return useContext(DevToolsContext);
};

// ============= PROVIDER WITH UI =============

interface AnimationDevToolsProps {
  children: React.ReactNode;
  enabled?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  defaultOpen?: boolean;
  theme?: "dark" | "light";
}

export const AnimationDevTools: React.FC<AnimationDevToolsProps> = ({
  children,
  enabled = true,
  position = "bottom-right",
  defaultOpen = false,
  theme = "dark",
}) => {
  const engines = useRef(new Map<string, AnimationEngineData>());
  const animationTrackers = useRef(new Map<string, AnimationTracker>());
  const entityContexts = useRef(new Map<string, EntityContext>());
  const subscribers = useRef(new Set<() => void>());

  const notify = useCallback(() => {
    subscribers.current.forEach((callback) => callback());
  }, []);

  const value = useMemo<DevToolsContextValue>(
    () => ({
      registerEngine: (id, engine) => {
        engines.current.set(id, engine);
        notify();
      },

      unregisterEngine: (id) => {
        engines.current.delete(id);
        notify();
      },

      updateAnimationTracker: (key, tracker) => {
        animationTrackers.current.set(key, tracker);
        notify();
      },

      setEntityContext: (entityId, context) => {
        entityContexts.current.set(entityId, context);
        notify();
      },

      getSnapshot: () => {
        // Aggregate entity contexts from all engines
        const aggregatedContexts = new Map(entityContexts.current);
        engines.current.forEach((engine) => {
          engine.entityContexts.forEach((context, entityId) => {
            // Merge with any existing context
            const existing = aggregatedContexts.get(entityId) || {};
            aggregatedContexts.set(entityId, { ...existing, ...context });
          });
        });

        return {
          engines: new Map(engines.current),
          animationTrackers: new Map(animationTrackers.current),
          entityContexts: aggregatedContexts,
        };
      },

      subscribe: (callback) => {
        subscribers.current.add(callback);
        return () => subscribers.current.delete(callback);
      },
    }),
    [notify],
  );

  return (
    <DevToolsContext.Provider value={value}>
      {children}
      {enabled && <DevToolsPanel position={position} defaultOpen={defaultOpen} theme={theme} />}
    </DevToolsContext.Provider>
  );
};

// ============= DEVTOOLS PANEL =============

const DevToolsPanel: React.FC<{
  position: string;
  defaultOpen: boolean;
  theme: string;
}> = ({ position, defaultOpen, theme }) => {
  const devtools = useAnimationDevTools();
  const [snapshot, setSnapshot] = useState<DevToolsSnapshot | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  if (!devtools) return null;

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    return devtools.subscribe(() => {
      if (isOpen) {
        setSnapshot(devtools.getSnapshot());
      }
    });
  }, [devtools, isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSnapshot(devtools.getSnapshot());
    }
  };

  const toggleEntity = (entityId: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  };

  // Process snapshot to group by entity with context
  const getEntityGroups = () => {
    if (!snapshot) return new Map();

    const entities = new Map<
      string,
      {
        context: EntityContext;
        elements: Array<{
          elementId: string;
          metadata: AnimationMetadata;
          animations: string[];
          tracker?: AnimationTracker;
          isAnimating: boolean;
          engineId: string;
        }>;
      }
    >();

    // Process each engine
    snapshot.engines.forEach((engine, engineId) => {
      engine.elementRegistry.forEach((data, element) => {
        const { entityId, elementId } = data.metadata;

        if (!entities.has(entityId)) {
          // Get entity context from snapshot (merged from all sources)
          const context = snapshot.entityContexts.get(entityId) || {};
          entities.set(entityId, {
            context,
            elements: [],
          });
        }

        const tracker = snapshot.animationTrackers.get(entityId);

        entities.get(entityId)!.elements.push({
          elementId,
          metadata: data.metadata,
          animations: Object.keys(data.animations),
          tracker,
          isAnimating: engine.activeAnimations.has(element),
          engineId,
        });
      });
    });

    return entities;
  };

  const entities = getEntityGroups();

  const isDark = theme === "dark";
  const styles = {
    panel: {
      position: "fixed" as const,
      right: 0,
      top: 0,
      bottom: 0,
      width: "480px",
      background: isDark
        ? "linear-gradient(to left, #0a0a0f 0%, #1a1a1f 100%)"
        : "linear-gradient(to left, #f5f5f5 0%, #fff 100%)",
      borderLeft: "2px solid #00ff88",
      overflowY: "auto" as const,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column" as const,
      boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.3)",
      color: isDark ? "#fff" : "#000",
      fontFamily: '"JetBrains Mono", monospace',
    },
    button: {
      position: "fixed" as const,
      ...(position === "bottom-right" && { bottom: "2rem", right: "2rem" }),
      ...(position === "bottom-left" && { bottom: "2rem", left: "2rem" }),
      ...(position === "top-right" && { top: "2rem", right: "2rem" }),
      ...(position === "top-left" && { top: "2rem", left: "2rem" }),
      background: isDark ? "#0a0a0f" : "#fff",
      color: "#00ff88",
      border: "2px solid #00ff88",
      borderRadius: "8px",
      padding: "0.75rem 1rem",
      fontWeight: "bold" as const,
      cursor: "pointer",
      zIndex: 9998,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      fontFamily: '"JetBrains Mono", monospace',
      transition: "all 0.2s",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      borderBottom: "1px solid #00ff8833",
      background: "rgba(0, 255, 136, 0.05)",
      position: "sticky" as const,
      top: 0,
      zIndex: 1,
      backdropFilter: "blur(10px)",
    },
    stats: {
      display: "flex",
      gap: "1rem",
      padding: "0.75rem 1rem",
      background: "rgba(0, 255, 136, 0.08)",
      borderBottom: "1px solid #00ff8822",
      fontSize: "0.85rem",
      color: isDark ? "#88ffcc" : "#006644",
    },
    content: {
      flex: 1,
      padding: "1rem",
      overflowY: "auto" as const,
    },
  };

  // Count animation states across all entities
  const getAnimationStats = () => {
    let pending = 0,
      running = 0,
      finished = 0;
    snapshot?.animationTrackers.forEach((tracker) => {
      if (tracker.status === "pending") pending++;
      else if (tracker.status === "running") running++;
      else if (tracker.status === "finished") finished++;
    });
    return { pending, running, finished };
  };

  const stats = getAnimationStats();

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        style={styles.button}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#00ff88";
          e.currentTarget.style.color = "#0a0a0f";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? "#0a0a0f" : "#fff";
          e.currentTarget.style.color = "#00ff88";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        🎬 DevTools
      </button>

      {/* Panel */}
      {isOpen && snapshot && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.header}>
            <h3 style={{ margin: 0, color: "#00ff88", fontSize: "1.2rem" }}>
              Animation DevTools v4
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#00ff8866",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: 0,
                width: "2rem",
                height: "2rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff88")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#00ff8866")}
            >
              ×
            </button>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <span>📦 Entities: {entities.size}</span>
            <span>⚙️ Engines: {snapshot.engines.size}</span>
            <span style={{ color: "#ffaa00" }}>⏸ {stats.pending}</span>
            <span style={{ color: "#00aaff" }}>▶ {stats.running}</span>
            <span style={{ color: "#00ff88" }}>✓ {stats.finished}</span>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {Array.from(entities.entries()).map(([entityId, entity]) => (
              <EntityView
                key={entityId}
                entityId={entityId}
                entity={entity}
                isExpanded={expandedEntities.has(entityId)}
                onToggle={() => toggleEntity(entityId)}
                currentTime={currentTime}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ============= ENTITY VIEW COMPONENT =============

const EntityView: React.FC<{
  entityId: string;
  entity: any;
  isExpanded: boolean;
  onToggle: () => void;
  currentTime: number;
  theme: string;
}> = ({ entityId, entity, isExpanded, onToggle, currentTime, theme }) => {
  const isDark = theme === "dark";
  const context = entity.context;

  // Count animation states
  const animationCounts = entity.elements.reduce((acc: any, el: any) => {
    if (el.tracker) {
      acc[el.tracker.status] = (acc[el.tracker.status] || 0) + 1;
    }
    return acc;
  }, {});

  const styles = {
    container: {
      background: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.5)",
      border: "1px solid #00ff8833",
      borderRadius: "8px",
      marginBottom: "1rem",
      overflow: "hidden",
      transition: "all 0.2s",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem",
      cursor: "pointer",
      background: isExpanded ? "rgba(0, 255, 136, 0.08)" : "transparent",
      transition: "background 0.2s",
    },
    title: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      flex: 1,
    },
    entityName: {
      fontWeight: "bold" as const,
      color: "#00ff88",
      fontSize: "1rem",
    },
    badges: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      flexWrap: "wrap" as const,
    },
    badge: {
      padding: "0.2rem 0.5rem",
      borderRadius: "4px",
      fontSize: "0.7rem",
      fontWeight: "bold" as const,
    },
    content: {
      padding: "0.75rem",
      borderTop: "1px solid #00ff8822",
      display: isExpanded ? "block" : "none",
    },
    contextSection: {
      background: "rgba(0, 255, 136, 0.03)",
      border: "1px solid #00ff8822",
      borderRadius: "6px",
      padding: "0.75rem",
      marginBottom: "1rem",
    },
    contextGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "0.5rem",
      fontSize: "0.75rem",
    },
    elements: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "0.5rem",
    },
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "hidden":
        return "#666";
      case "visible":
        return "#0099ff";
      case "visible-colored":
        return "#ff9900";
      case "visible-covered":
        return "#00ff88";
      default:
        return "#888";
    }
  };

  const getTeamColor = (team: string) => {
    switch (team) {
      case "red":
        return "#ff4444";
      case "blue":
        return "#4444ff";
      case "assassin":
        return "#ffff00";
      case "neutral":
        return "#888";
      default:
        return "#666";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={onToggle}>
        <div style={styles.title}>
          <span style={styles.entityName}>{context.word || entityId}</span>
          <div style={styles.badges}>
            {context.displayState && (
              <span
                style={{
                  ...styles.badge,
                  background: getStateColor(context.displayState),
                  color: "#fff",
                }}
              >
                {context.displayState}
              </span>
            )}
            {context.teamName && (
              <span
                style={{
                  ...styles.badge,
                  background: getTeamColor(context.teamName),
                  color: context.teamName === "assassin" ? "#000" : "#fff",
                }}
              >
                {context.teamName}
              </span>
            )}
            {context.selected && (
              <span
                style={{
                  ...styles.badge,
                  background: "#00ff88",
                  color: "#000",
                }}
              >
                selected
              </span>
            )}
            {context.transition?.trigger && (
              <span
                style={{
                  ...styles.badge,
                  background: "#ff00ff",
                  color: "#fff",
                }}
              >
                {context.transition.trigger}
              </span>
            )}
            {context.viewMode && (
              <span
                style={{
                  ...styles.badge,
                  background: "#0099ff",
                  color: "#fff",
                }}
              >
                {context.viewMode}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {animationCounts.running > 0 && (
            <span style={{ color: "#00aaff", fontSize: "0.8rem" }}>
              ● {animationCounts.running}
            </span>
          )}
          {animationCounts.finished > 0 && (
            <span style={{ color: "#00ff88", fontSize: "0.8rem" }}>
              ✓ {animationCounts.finished}
            </span>
          )}
          <span
            style={{
              color: "#00ff8866",
              fontSize: "1.2rem",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.content}>
          {/* Entity Context */}
          <div style={styles.contextSection}>
            <h5 style={{ margin: "0 0 0.5rem 0", color: "#00ff88", fontSize: "0.8rem" }}>
              Entity Context
            </h5>
            <div style={styles.contextGrid}>
              {Object.entries(context).map(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                  return (
                    <div key={key}>
                      <span style={{ color: "#00ff8866" }}>{key}: </span>
                      <span style={{ color: isDark ? "#fff" : "#000", fontSize: "0.65rem" }}>
                        {JSON.stringify(value, null, 2)}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <span style={{ color: "#00ff8866" }}>{key}: </span>
                    <span style={{ color: isDark ? "#fff" : "#000" }}>{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Elements */}
          <h5 style={{ margin: "0 0 0.5rem 0", color: "#00ff88", fontSize: "0.8rem" }}>
            Elements ({entity.elements.length})
          </h5>
          <div style={styles.elements}>
            {entity.elements.map((element: any, i: number) => (
              <ElementView
                key={`${element.elementId}-${i}`}
                element={element}
                currentTime={currentTime}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============= ELEMENT VIEW COMPONENT =============

const ElementView: React.FC<{
  element: any;
  currentTime: number;
  theme: string;
}> = ({ element, currentTime, theme }) => {
  const isDark = theme === "dark";
  const tracker = element.tracker;

  let progress = 0;
  if (tracker) {
    if (tracker.status === "running") {
      progress = Math.min((currentTime - tracker.startTime) / tracker.duration, 1);
    } else if (tracker.status === "finished") {
      progress = 1;
    }
  }

  const getStatusColor = () => {
    if (!tracker) return "#444";
    switch (tracker.status) {
      case "pending":
        return "#ffaa00";
      case "running":
        return "#00aaff";
      case "finished":
        return "#00ff88";
      default:
        return "#444";
    }
  };

  const styles = {
    container: {
      background: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.8)",
      border: `2px solid ${getStatusColor()}`,
      borderRadius: "6px",
      padding: "0.75rem",
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
      transition: "all 0.2s",
      position: "relative" as const,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      fontWeight: "bold" as const,
      color: isDark ? "#fff" : "#000",
      fontSize: "0.85rem",
    },
    engineBadge: {
      fontSize: "0.6rem",
      color: "#00ff8866",
      background: "rgba(0, 255, 136, 0.1)",
      padding: "0.1rem 0.3rem",
      borderRadius: "3px",
    },
    status: {
      fontSize: "0.7rem",
      color: getStatusColor(),
      textTransform: "uppercase" as const,
    },
    progressBar: {
      height: "3px",
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "2px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: getStatusColor(),
      transition: "width 0.1s linear",
      borderRadius: "2px",
    },
    metadata: {
      fontSize: "0.6rem",
      color: "#888",
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "0.25rem",
    },
    animations: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "0.25rem",
      marginTop: "0.25rem",
    },
    animationTag: {
      background: "rgba(0, 255, 136, 0.1)",
      color: "#00ff88",
      padding: "0.1rem 0.3rem",
      borderRadius: "3px",
      fontSize: "0.6rem",
    },
    indicator: {
      position: "absolute" as const,
      top: "0.5rem",
      right: "0.5rem",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: getStatusColor(),
      animation: tracker?.status === "running" ? "pulse 1s infinite" : "none",
    },
  };

  return (
    <div style={styles.container}>
      {tracker?.status === "running" && <div style={styles.indicator} />}

      <div style={styles.header}>
        <div style={styles.name}>{element.elementId}</div>
        <div style={styles.engineBadge}>eng:{element.engineId.slice(-4)}</div>
      </div>

      {tracker && (
        <>
          <div style={styles.status}>
            {tracker.trigger} → {tracker.status}
          </div>

          {tracker.status !== "pending" && (
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress * 100}%`,
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Element metadata */}
      <div style={styles.metadata}>
        {element.metadata.className && <span>class: {element.metadata.className}</span>}
        {element.metadata.tagName && <span>tag: {element.metadata.tagName}</span>}
      </div>

      <div style={styles.animations}>
        {element.animations.slice(0, 3).map((anim: string) => (
          <span key={anim} style={styles.animationTag}>
            {anim}
          </span>
        ))}
        {element.animations.length > 3 && (
          <span style={styles.animationTag}>+{element.animations.length - 3}</span>
        )}
      </div>

      {/* Inline animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// ============= EXPORT =============
export const DEVTOOLS_VERSION = "4.0.0";
