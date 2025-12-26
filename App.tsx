import React, { useState } from 'react';
import Terminal from './components/Terminal';
import LoadingSequence from './components/LoadingSequence';
import Dashboard from './components/Dashboard';
import { AssetStaging } from './components/AssetStaging';
import { AppState, CommandArgs } from './types';
import { parseCommandString, DEFAULT_COMMAND } from './utils/commandParser';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentArgs, setCurrentArgs] = useState<CommandArgs | null>(null);
  const [terminalInput, setTerminalInput] = useState(DEFAULT_COMMAND);
  const [showAssetStaging, setShowAssetStaging] = useState(false);

  const handleExecute = (command: string) => {
    // Basic validation to ensure it's a distribute command
    if (!command.includes('distribute') && !command.includes('AURA-DDEX-CLI')) {
      alert("Invalid Command. Please use the AURA-DDEX-CLI syntax.");
      return;
    }

    const args = parseCommandString(command);
    setCurrentArgs(args);
    setAppState(AppState.PROCESSING);
  };

  const handleProcessingComplete = () => {
    setAppState(AppState.DASHBOARD);
  };

  const handleStagingCommit = (generatedPath: string) => {
    // Replace the default asset source with the new uploaded path
    const newCommand = terminalInput.replace(
      /--asset-source\s+"[^"]+"/, 
      `--asset-source "${generatedPath}"`
    );
    setTerminalInput(newCommand);
  };

  return (
    <div className="min-h-screen bg-black text-white scanline">
      {appState === AppState.IDLE && (
        <div className="flex flex-col items-center justify-center min-h-screen relative">
          <div className="mb-8 text-center">
             <h1 className="text-4xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-600 mb-2">
               GRESHAM PROTOCOL CLI
             </h1>
             <p className="text-slate-500 text-sm font-mono">LinkZ Generative UI Engine // Active</p>
          </div>
          <Terminal 
            value={terminalInput}
            onChange={setTerminalInput}
            onExecute={handleExecute}
            onStageAssets={() => setShowAssetStaging(true)}
          />
        </div>
      )}

      {/* Asset Staging Overlay */}
      <AssetStaging 
        isOpen={showAssetStaging}
        onClose={() => setShowAssetStaging(false)}
        onCommit={handleStagingCommit}
      />

      {appState === AppState.PROCESSING && currentArgs && (
        <LoadingSequence 
          args={currentArgs} 
          onComplete={handleProcessingComplete} 
        />
      )}

      {appState === AppState.DASHBOARD && currentArgs && (
        <Dashboard args={currentArgs} />
      )}
    </div>
  );
};

export default App;