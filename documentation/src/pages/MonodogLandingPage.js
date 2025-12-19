import React, { useState, useMemo } from "react";
import {
  Layers,
  GitBranch,
  Terminal,
  ShieldCheck,
  Zap,
  Code,
  Package,
  CheckCircle,
  TrendingUp,
  Heart,
  XCircle,
  FileText,
  Lock,
  Info,
  AlertTriangle,
  Link,
  Activity,
} from "lucide-react";
import "../css/monodog.css";

// --- Configuration Data ---
const features = [
  {
    icon: Link,
    title: "Dependency Analysis",
    description:
      "Instantly map the entire codebase graph to understand deep dependencies and change impact before deployment",
    status: "PASS",
    statusIcon: Layers,
  },
  {
    icon: Activity,
    title: "Health Monitoring",
    description:
      "Offers up-to-date information on the linting, security, and build status of your monorepo's packages.",
    status: "PASS",
    statusIcon: Info,
  },
  {
    icon: Terminal,
    title: "Git Integration",
    description:
      "Track git history and contributor information for each package to enhance accountability and traceability.",
    status: "WARNING",
    statusIcon: Zap,
  },
  {
    icon: ShieldCheck,
    title: "CI/CD Gatekeeping",
    description:
      "Enforce build quality, security, and linting policies across all packages before they reach production.",
    status: "FAIL",
    statusIcon: Lock,
  },
];

const technologies = [
  { name: "React", logo: "M100 85L80 50L100 15L50 0L0 15L20 50L0 85L50 100Z" },
  {
    name: "Node.js",
    logo: "M50 0 C22.4 0, 0 22.4, 0 50 C0 77.6, 22.4 100, 50 100 C77.6 100, 100 77.6, 100 50 C100 22.4, 77.6 0, 50 0 Z M65 57 L65 77 L55 77 L55 57 L45 57 L45 77 L35 77 L35 57 L25 57 L25 43 L35 43 L35 23 L45 23 L45 43 L55 43 L55 57 L65 57 L65 77 L75 77 L75 57 Z",
  },
  {
    name: "PNPM/Yarn",
    logo: "M50 0 C22.4 0, 0 22.4, 0 50 C0 77.6, 22.4 100, 50 100 C77.6 100, 100 77.6, 100 50 C100 22.4, 77.6 0, 50 0 Z M50 20 L20 80 L80 80 Z",
  },
];

// --- Helper Components ---

/** Static Red Glow */
const StaticGlow = () => {
  return <div className="static-glow" style={{ zIndex: -1 }}></div>;
};

/** Icon for the package manager logos */
const TechIcon = ({ name, logoPath }) => (
  <div className="tech-icon-card">
    <svg viewBox="0 0 100 100" className="tech-icon-svg">
      <path d={logoPath} />
    </svg>
    <p className="tech-icon-text">{name}</p>
  </div>
);

/** Feature Card */
const FeatureCard = ({ icon: Icon, title, description, status }) => {
  // Determine the status badge icon and color
  const getStatusProps = (s) => {
    switch (s) {
      case "PASS":
        return {
          Icon: CheckCircle,
          colorClass: "text-green-400",
          ringClass: "ring-green-600",
          icoTitle: "Working Feature",
        };
      case "FAIL":
        return {
          Icon: XCircle,
          colorClass: "text-red-600",
          ringClass: "ring-red-600",
          icoTitle: "Upcoming Feature",
        };
      case "WARNING":
        return {
          Icon: AlertTriangle,
          colorClass: "text-yellow-400",
          ringClass: "ring-yellow-600",
          icoTitle: "Feature in Development",
        };
      default:
        return {
          Icon: CheckCircle,
          colorClass: "text-gray-400",
          ringClass: "ring-gray-600",
          icoTitle: "Working Feature",
        };
    }
  };

  const {
    Icon: StatusBadgeIcon,
    colorClass: badgeColor,
    ringClass: badgeRing,
    icoTitle: icoTitle,
  } = getStatusProps(status);

  return (
    <div className="feature-card">
      <div
        className={`feature-status-badge ${badgeColor} ${badgeRing}`}
        title={`${icoTitle}`}
        style={{ border: "2px solid" }}
      >
        <StatusBadgeIcon
          style={{ width: "1rem", height: "1rem" }}
          fill="currentColor"
        />
      </div>

      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}
      >
        <div className="feature-icon-wrapper">
          <Icon
            style={{ width: "1.5rem", height: "1.5rem" }}
            className="text-yellow-400"
          />
        </div>
        <h3 className="feature-title" style={{ marginLeft: "1rem" }}>
          {title}
        </h3>
      </div>

      <p className="feature-description">{description}</p>
    </div>
  );
};

/** Single Node Component for the Dependency Graph with detail box */
const Node = ({ id, label, subtitle, position, status, showStatus = true }) => {
  // If showStatus is false (e.g., initial page load), render only the package name and neutral border
  const visible = !!showStatus;

  const statusColor = visible
    ? {
        WARNING: "text-status-warning",
        PASS: "text-status-pass",
        FAIL: "text-status-fail",
      }[status] || "text-status-default"
    : "text-status-default";

  const borderColor = visible
    ? {
        WARNING: "border-status-warning",
        PASS: "border-status-pass",
        FAIL: "border-status-fail",
      }[status] || "border-status-default"
    : "border-status-default";

  const StatusIcon = visible
    ? {
        WARNING: AlertTriangle,
        PASS: CheckCircle,
        FAIL: XCircle,
      }[status] || Layers
    : null;

  const glowClass =
    visible && (status === "WARNING" || status === "FAIL")
      ? "node-glow-pulse"
      : "";

  return (
    <div
      id={`node-${id}`}
      className={`graph-node ${glowClass}`}
      style={position}
    >
      <div className={`node-content ${borderColor}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: "0.5rem",
          }}
        >
          {StatusIcon && (
            <StatusIcon
              style={{ width: "1.25rem", height: "1.25rem" }}
              className={`${statusColor}`}
            />
          )}
          <span className="node-label">{label}</span>
        </div>

        {/* Only show explicit status text when visible */}
        {visible && (
          <div className="node-status-text">
            Status:{" "}
            <span className={statusColor.replace("text-status-", "text-")}>
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Fixed dimensions for the node in the 100x100 SVG coordinate system
const NODE_WIDTH_SVG = 15;
const NODE_HEIGHT_SVG = 8;

/** Dependency Graph Component (responsive) */
const DependencyGraph = ({ nodes, edges, state }) => {
  const isScanning = state === "SCANNING";

  const containerRef = React.useRef(null);
  const [nodeBox, setNodeBox] = React.useState({
    wPercent: NODE_WIDTH_SVG,
    hPercent: NODE_HEIGHT_SVG,
  });

  // Measure one rendered node to infer node size as percentage of the container
  const measureNodeSize = () => {
    const container = containerRef.current;
    if (!container) return;
    const sampleNode = container.querySelector(".graph-node");
    if (!sampleNode) return;
    const cRect = container.getBoundingClientRect();
    const nRect = sampleNode.getBoundingClientRect();
    const wPercent = (nRect.width / cRect.width) * 100 || NODE_WIDTH_SVG;
    const hPercent = (nRect.height / cRect.height) * 100 || NODE_HEIGHT_SVG;
    setNodeBox({ wPercent, hPercent });
  };

  React.useEffect(() => {
    // Measure on mount and whenever nodes change
    const t = setTimeout(measureNodeSize, 50);
    window.addEventListener("resize", measureNodeSize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measureNodeSize);
    };
  }, [nodes]);

  const getCoords = (id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0, w: nodeBox.wPercent, h: nodeBox.hPercent };
    const pos = node.pos;
    const x = parseFloat(pos.left.replace("%", ""));
    const y = parseFloat(pos.top.replace("%", ""));
    return { x: x, y: y, w: nodeBox.wPercent, h: nodeBox.hPercent };
  };

  const getRectIntersection = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const slope = dy / dx;

    // widths/heights are percentages in the SVG 0..100 coordinate system
    const hw = target.w / 2;
    const hh = target.h / 2;

    let x_intersect, y_intersect;

    const abs_dx = Math.abs(dx);
    const abs_dy = Math.abs(dy);

    if (abs_dx > abs_dy * (hw / hh)) {
      x_intersect = target.x + (dx > 0 ? -hw : hw);
      y_intersect = target.y + slope * (x_intersect - target.x);
    } else {
      y_intersect = target.y + (dy > 0 ? -hh : hh);
      x_intersect = target.x + (1 / slope) * (y_intersect - target.y);
    }

    x_intersect = Math.max(target.x - hw, Math.min(target.x + hw, x_intersect));
    y_intersect = Math.max(target.y - hh, Math.min(target.y + hh, y_intersect));

    return { x: x_intersect, y: y_intersect };
  };

  const strokeClass = isScanning
    ? "flow-edge stroke-red-600"
    : "stroke-red-900";
  const markerColor = isScanning ? "#dc2626" : "#7f1d1d";

  return (
    <div className="dependency-graph" ref={containerRef}>
      {/* SVG Layer for Edges (Dependencies) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="line-glow">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1.5"
              result="blur"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="redden"
            />
            <feMerge>
              <feMergeNode in="redden" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <marker
            id="arrowhead-red"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={markerColor} />
          </marker>
        </defs>

        {edges.map(([sourceId, targetId]) => {
          const source = getCoords(sourceId);
          const target = getCoords(targetId);

          const endPoint = getRectIntersection(source, target);
          const startPoint = getRectIntersection(target, source);

          return (
            <line
              key={`${sourceId}-${targetId}`}
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              strokeWidth={"1"}
              className={strokeClass}
              // filter="url(#line-glow)"
              markerEnd="url(#arrowhead-red)"
            />
          );
        })}
      </svg>

      {/* Node Layer (Packages) */}
      {nodes.map((node) => (
        <Node
          key={node.id}
          id={node.id}
          label={node.label}
          subtitle={node.subtitle}
          position={node.pos}
          status={node.status}
          showStatus={state === "COMPLETE"}
        />
      ))}
    </div>
  );
};

// Component to display the simulation log/timeline
const SimLog = ({ logs }) => {
  return (
    <div className="sim-log">
      <h3 className="log-header">
        <Info
          style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.5rem" }}
        />{" "}
        Package Scan Log
      </h3>
      <ul className="log-list">
        {logs.map((log, index) => (
          <li key={index} className="log-item">
            <span className={`log-step ${log.color}`}>{log.step}</span>
            <span className={`log-text `}>{log.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** New component: Monorepo Health Dashboard Visualization */
const MonorepoHealthDashboard = () => {
  const [state, setState] = useState("IDLE");
  const [statusText, setStatusText] = useState(
    "Monodog is ready. Initiate scan to check monorepo health."
  );
  const [logs, setLogs] = useState([
    {
      step: "INIT",
      text: "System ready. Waiting for user scan command...",
      color: "text-green-400",
    },
  ]);

  const [healthScore, setHealthScore] = useState(0);
  const [vulnerablePackages, setVulnerablePackages] = useState({
    critical: 0,
    medium: 0,
  });
  const [buildStatus, setBuildStatus] = useState("N/A");
  const [lintStatus, setLintStatus] = useState("N/A");

  const initialNodes = useMemo(
    () => [
      {
        id: "p1",
        status: "WARNING",
        label: "App-Web",
        subtitle: "Client Entrypoint",
        pos: { top: "15%", left: "30%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "p6",
        status: "PASS",
        label: "App-Docs",
        subtitle: "Documentation Site",
        pos: { top: "15%", left: "70%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "p3",
        status: "WARNING",
        label: "Lib-UI",
        subtitle: "Shared Components",
        pos: { top: "45%", left: "20%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "p2",
        status: "PASS",
        label: "Service-API",
        subtitle: "Backend Gateway",
        pos: { top: "45%", left: "80%", transform: "translate(-50%, -50%)" },
      },
      {
        id: "p4",
        status: "WARNING",
        label: "Utils-Logger",
        subtitle: "Logging Utility",
        pos: { top: "75%", left: "50%", transform: "translate(-50%, -50%)" },
      },
    ],
    []
  );

  const [currentNodes, setCurrentNodes] = useState(initialNodes);

  const edges = useMemo(
    () => [
      ["p1", "p3"],
      ["p1", "p2"],
      ["p6", "p3"],
      ["p2", "p4"],
      ["p3", "p4"],
    ],
    []
  );

  const graphNodes = useMemo(
    () => currentNodes.map((n) => ({ ...n, isScanning: state === "SCANNING" })),
    [currentNodes, state]
  );

  // Simulation logic (Simplified 3-Step Scan)
  const handleSimulate = async () => {
    if (state !== "IDLE" && state !== "COMPLETE") return;

    // --- RESET STATES ---
    setCurrentNodes(initialNodes);
    setHealthScore(0);
    setVulnerablePackages({ critical: 0, medium: 0 });
    setBuildStatus("N/A");
    setLintStatus("N/A");
    setLogs([]);

    // --- STEP 1: Dependency Mapping & Initialization ---
    setStatusText("1. Monorepo Scan initiated. Mapping dependencies...");
    setLogs((prev) => [
      ...prev,
      {
        step: "1:",
        text: `DEPENDENCY GRAPH mapped: ${initialNodes.length} packages and ${edges.length} relationships identified.`,
        color: "text-green-400",
      },
    ]);
    setState("SCANNING");
    await new Promise((r) => setTimeout(r, 1000));

    // --- STEP 2: Policy and Vulnerability Check ---
    setStatusText("2. Running security policy checks...");

    setCurrentNodes((prev) =>
      prev.map((n) =>
        n.id === "p3"
          ? { ...n, status: "WARNING", subtitle: "Vulnerability Check" }
          : n.id === "p4"
          ? { ...n, status: "WARNING", subtitle: "Outdated Dependency" }
          : n
      )
    );

    setLogs((prev) => [
      ...prev,
      {
        step: "2:",
        text: "WARNING: Lib-UI has 1 Medium vulnerability from a transitive dependency.",
        color: "text-yellow-400",
      },
    ]);
    setLogs((prev) => [
      ...prev,
      {
        step: "3:",
        text: "WARNING: Utils-Logger using deprecated functions.",
        color: "text-yellow-400",
      },
    ]);
    await new Promise((r) => setTimeout(r, 1000));

    // --- STEP 3: Final Metrics and Summary (Critical Failure Detected) ---
    const newHealthScore = 58;
    const newVulnerabilities = { critical: 1, medium: 1 };

    setBuildStatus("FAILURE");
    setLintStatus("SUCCESS");
    setVulnerablePackages(newVulnerabilities);
    setHealthScore(newHealthScore);

    setLogs((prev) => [
      ...prev,
      {
        step: "4:",
        text: "ERROR: Service-API Build failed.",
        color: "text-red-500",
      },
    ]);
    setLogs((prev) => [
      ...prev,
      {
        step: "SCAN COMPLETE:",
        text: `SUMMARY - Overall Health: ${newHealthScore}%. Issues detected in 3 packages.`,
        color: "text-red-400",
      },
    ]);

    // Final status update for nodes
    setCurrentNodes((prev) =>
      prev.map((n) => {
        if (n.id === "p2") {
          return { ...n, status: "FAIL", subtitle: "Critical Policy Failure" };
        }
        if (n.id === "p3" || n.id === "p4") {
          return { ...n, status: "WARNING", subtitle: n.subtitle };
        }
        return { ...n, status: "PASS", subtitle: n.subtitle };
      })
    );

    setState("COMPLETE");
    setStatusText(
      `3. Scan Complete! Health Score: ${newHealthScore}% | Critical Build Failed.`
    );
  };

  const isRunning = state !== "IDLE" && state !== "COMPLETE";

  // Helper function for icon/color based on status string
  const getStatusProps = (status) => {
    if (status === "SUCCESS")
      return { icon: CheckCircle, colorClass: "text-green-400", value: "PASS" };
    if (status === "FAILURE")
      return { icon: XCircle, colorClass: "text-red-500", value: "FAIL" };
    return { icon: FileText, colorClass: "text-gray-500", value: "N/A" };
  };

  const buildProps = getStatusProps(buildStatus);
  const lintProps = getStatusProps(lintStatus);

  return (
    <div className="dashboard-container">
      <div className="dashboard-status-bar">
        <ShieldCheck
          style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
          className="text-yellow-400"
        />
        <span
          style={{ fontSize: "0.875rem", fontFamily: "monospace" }}
          className="status-text"
        >
          {statusText}
        </span>
      </div>

      <div className="dashboard-grid">
        {/* COLUMN 1 & 2: Graph and Control */}
        <div
          className="graph-column"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <h3>Dependency Mapping (5 Packages)</h3>
          <DependencyGraph nodes={graphNodes} edges={edges} state={state} />

          {/* Control Panel */}
          <div className="graph-control" style={{ textAlign: "center" }}>
            <button onClick={handleSimulate} disabled={isRunning}>
              {isRunning ? (
                <span style={{ display: "flex", alignItems: "center" }}>
                  <Zap
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      marginRight: "0.5rem",
                    }}
                    className="animate-spin"
                  />{" "}
                  Scanning Monorepo...
                </span>
              ) : (
                "Start Monorepo Scan"
              )}
            </button>
          </div>
        </div>

        {/* COLUMN 3: Process Log / Detailed Summary */}
        <div style={{ padding: "0" }}>
          <SimLog logs={logs} />
        </div>
      </div>

      {/* Detailed Results (Below the Graph/Log) - Static Health Focus */}
      {state === "COMPLETE" && (
        <div className="metric-section">
          <div className="metric-grid-container">
            <h4 className="metric-header">Metrics</h4>
            <div className="metric-grid">
              {/* Metric 1: Health Score (Overall Monitoring) */}
              <div className="metric-card" style={{ borderColor: "#4b5563" }}>
                <Heart
                  style={{ width: "1.5rem", height: "1.5rem" }}
                  className="text-yellow-400"
                />
                <p className="metric-card-value text-yellow-400">
                  {healthScore}%
                </p>
                <p className="metric-card-title">Overall Health Score</p>
              </div>

              {/* Metric 2: Critical Violations */}
              <div className="metric-card" style={{ borderColor: "#4b5563" }}>
                <XCircle
                  style={{ width: "1.5rem", height: "1.5rem" }}
                  className="text-red-400"
                />
                <p className="metric-card-value text-red-400">
                  {vulnerablePackages.critical}
                </p>
                <p className="metric-card-title">Vulnerability</p>
              </div>

              {/* Metric 3: Build Status (CI/CD) */}
              <div className="metric-card" style={{ borderColor: "#4b5563" }}>
                <buildProps.icon
                  style={{ width: "1.5rem", height: "1.5rem" }}
                  className={buildProps.colorClass}
                />
                <p className={`metric-card-value ${buildProps.colorClass}`}>
                  {buildProps.value}
                </p>
                <p className="metric-card-title">Build Status</p>
              </div>

              {/* Metric 4: Lint Status (CI/CD) */}
              <div className="metric-card" style={{ borderColor: "#4b5563" }}>
                <lintProps.icon
                  style={{ width: "1.5rem", height: "1.5rem" }}
                  className={lintProps.colorClass}
                />
                <p className={`metric-card-value ${lintProps.colorClass}`}>
                  {lintProps.value}
                </p>
                <p className="metric-card-title">Linting Status</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component Export
const MonodogLandingPage = () => {
  // Styles are loaded from src/css/monodog.css (theme-aware)

  return (
    <div className="monodog-app">
      {/* Full-Screen Dynamic Background Layer */}
      <div className="dynamic-bg-texture"></div>

      {/* All Foreground Content */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh" }}>
        {/* 1. Hero Section */}
        <main className="hero-main monodog-max-width">
          <div style={{ maxWidth: "896px", margin: "auto" }}>
            <h1 className="hero-title">
              <span className="hero-gradient-text">
                Ship Faster. Break Less. Stay in Sync.
              </span>
            </h1>
            <p className="hero-subtitle">
              Monodog is the intelligent task orchestrator for your monorepo,
              providing real-time health monitoring and dependency-aware CI/CD.
            </p>
            <div className="hero-actions">
              <a href="getting-started/quick-start" className="btn-primary">
                Get Started &nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-arrow-right ml-2 h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="https://github.com/mindfiredigital/monodog" className="btn-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-github mr-2 h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                &nbsp;GitHub
              </a>
            </div>
          </div>

          {/* Static Glow Element */}
          <StaticGlow />

          {/* DYNAMIC MONOREPO HEALTH DASHBOARD */}
          <div id="demo">
            <MonorepoHealthDashboard />
          </div>
        </main>

        {/* 2. Features Section (Combined) */}
        <section id="features" className="feature-section">
          <div className="monodog-max-width">
            <h2 className="feature-header">Features of Monodog</h2>
            <div className="feature-grid">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  status={feature.status}
                />
              ))}
            </div>

            {/* MERGED: Technology Section Content */}
            <div className="tech-container">
              <h2
                className="feature-header"
                style={{ fontSize: "2.25rem", marginBottom: "2.5rem" }}
              >
                Built for Modern Repos
              </h2>
              <p
                className="hero-subtitle"
                style={{ maxWidth: "48rem", marginBottom: "3rem" }}
              >
                Monodog works with your PNPM package manager and integrates smoothly
                with your existing Node.js monorepo setup. It improves your
                developer experience without requiring you to migrate.
              </p>
              {/* <div className="tech-logos">
                {technologies.map((tech, index) => (
                  <TechIcon key={index} name={tech.name} logoPath={tech.logo} />
                ))}
              </div> */}
            </div>
          </div>
        </section>

        {/* Footer Placeholder */}
        <footer className="monodog-footer">
          &copy; {new Date().getFullYear()} Mindfire FOSS.
        </footer>
      </div>
    </div>
  );
};

export default MonodogLandingPage;
