import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { DigitalTwinPage } from './components/DigitalTwinPage';
import { BottleneckIntelligence } from './components/BottleneckIntelligence';
import { RootCauseAnalysis } from './components/RootCauseAnalysis';
import { WhatIfLab } from './components/WhatIfLab';
import { OptimizationEngine } from './components/OptimizationEngine';
import { EnvironmentalImpact } from './components/EnvironmentalImpact';
import { CounterfactualImpact } from './components/CounterfactualImpact';
import { LandfillRunway } from './components/LandfillRunway';
import { ScenarioLibrary } from './components/ScenarioLibrary';
import { InterventionROI } from './components/InterventionROI';
import { ChaosMonkeyMode } from './components/ChaosMonkeyMode';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { AutomaticRecoveryModal } from './components/AutomaticRecoveryModal';
import { HackathonDemoOverlay } from './components/HackathonDemoOverlay';
import { FlowyNarrator } from './components/FlowyNarrator';
import { ProcessConfigurationPage } from './components/ProcessConfigurationPage';
import { INITIAL_NODES, type WasteNode } from './data/wasteData';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState<boolean>(false);
  const [demoOverlayOpen, setDemoOverlayOpen] = useState<boolean>(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('sort-kanjur');

  // Handle node selection from map/sankey
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab('bottlenecks');
  };

  return (
    <div className="min-h-screen bg-[#EDF2EE] text-[#1A261C] flex flex-col font-sans selection:bg-[#2E4D37] selection:text-white">
      {activeTab === 'landing' ? (
        <LandingPage
          onLaunchDigitalTwin={() => setActiveTab('command')}
          onExploreLiveNetwork={() => setActiveTab('digital-twin')}
          onStartDemo={() => {
            setActiveTab('command');
            setDemoOverlayOpen(true);
          }}
        />
      ) : (
        <div className="flex flex-1 relative">
          {/* Global Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            openRecoveryModal={() => setRecoveryModalOpen(true)}
          />

          {/* Global Top Bar */}
          <TopBar
            onOpenCopilot={() => setCopilotOpen(true)}
            onStartDemo={() => {
              setActiveTab('command');
              setDemoOverlayOpen(true);
            }}
            collapsed={sidebarCollapsed}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main App Content Viewport */}
          <main className={`flex-1 transition-all duration-300 pt-20 px-6 max-w-[1920px] mx-auto w-full ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            {activeTab === 'command' && (
              <CommandCenter
                onInvestigateBottleneck={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  setActiveTab('bottlenecks');
                }}
                onSimulateRecommendation={() => setActiveTab('what-if')}
                onOpenRecovery={() => setRecoveryModalOpen(true)}
              />
            )}

            {activeTab === 'process-config' && (
              <ProcessConfigurationPage />
            )}

            {(activeTab === 'digital-twin' || activeTab === 'live-network') && (
              <DigitalTwinPage onNodeSelect={handleNodeSelect} />
            )}

            {activeTab === 'bottlenecks' && (
              <BottleneckIntelligence
                onSimulateFix={() => setActiveTab('what-if')}
              />
            )}

            {activeTab === 'root-cause' && (
              <RootCauseAnalysis />
            )}

            {activeTab === 'what-if' && (
              <WhatIfLab
                onApplyOptimization={() => setActiveTab('optimization')}
              />
            )}

            {activeTab === 'optimization' && (
              <OptimizationEngine
                onApplyIntervention={() => setRecoveryModalOpen(true)}
              />
            )}

            {activeTab === 'environmental' && (
              <EnvironmentalImpact />
            )}

            {activeTab === 'counterfactual' && (
              <CounterfactualImpact />
            )}

            {activeTab === 'landfill-runway' && (
              <LandfillRunway />
            )}

            {activeTab === 'scenarios' && (
              <ScenarioLibrary
                onRunScenario={() => setActiveTab('what-if')}
              />
            )}

            {activeTab === 'intervention-roi' && (
              <InterventionROI />
            )}

            {activeTab === 'chaos-monkey' && (
              <ChaosMonkeyMode />
            )}
          </main>
        </div>
      )}

      {/* Global Modals & Overlays */}
      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onTriggerScenario={() => {
          setActiveTab('what-if');
        }}
      />

      <AutomaticRecoveryModal
        isOpen={recoveryModalOpen}
        onClose={() => setRecoveryModalOpen(false)}
        onSimulateFirst={() => setActiveTab('what-if')}
      />

      <HackathonDemoOverlay
        isOpen={demoOverlayOpen}
        onClose={() => setDemoOverlayOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {activeTab !== 'landing' && (
        <FlowyNarrator
          onSimulateFix={() => setActiveTab('what-if')}
          onInspectBottleneck={() => setActiveTab('bottlenecks')}
        />
      )}
    </div>
  );
}

export default App;
