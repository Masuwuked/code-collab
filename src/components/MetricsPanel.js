import React from 'react';

const MetricsPanel = ({ metrics, onOpenAssistant }) => {
  if (!metrics) return null;

  const {
    loc,
    cyclomaticComplexity,
    maintainabilityIndex,
    defectProbability,
    defectRisk,
    riskColor,
    bigO,
    halstead,
    codeSmells,
    maxNesting
  } = metrics;

  return (
    <div className="metricsHud">
      <div className="hudHeader">
        <div className="hudTitle">
          <span className="aiBadge">ML ENGINE</span>
          <h4>Code Intelligence & Defect Predictor</h4>
        </div>
        <div className="hudStatsRow">
          <span className="statChip">LOC: <strong>{loc}</strong></span>
          <span className="statChip">Nesting: <strong>{maxNesting}</strong></span>
          <span className="statChip">Big-O: <strong className="bigOHighlight">{bigO.notation}</strong></span>
        </div>
      </div>

      <div className="gaugesGrid">
        <div className="gaugeCard">
          <div className="gaugeLabel">Defect Probability</div>
          <div className="gaugeValue" style={{ color: riskColor }}>
            {defectProbability}%
          </div>
          <div className="gaugeSub" style={{ color: riskColor }}>
            {defectRisk}
          </div>
          <div className="progressBarTrack">
            <div 
              className="progressBarFill" 
              style={{ width: `${defectProbability}%`, backgroundColor: riskColor }}
            />
          </div>
        </div>

        <div className="gaugeCard">
          <div className="gaugeLabel">Cyclomatic (M)</div>
          <div className="gaugeValue" style={{ color: cyclomaticComplexity > 10 ? '#ff4d4d' : cyclomaticComplexity > 5 ? '#ffa500' : '#4aed88' }}>
            {cyclomaticComplexity}
          </div>
          <div className="gaugeSub">
            M = E - N + 2P
          </div>
          <div className="progressBarTrack">
            <div 
              className="progressBarFill" 
              style={{ 
                width: `${Math.min(100, (cyclomaticComplexity / 15) * 100)}%`,
                backgroundColor: cyclomaticComplexity > 10 ? '#ff4d4d' : cyclomaticComplexity > 5 ? '#ffa500' : '#4aed88'
              }}
            />
          </div>
        </div>

        <div className="gaugeCard">
          <div className="gaugeLabel">Maintainability</div>
          <div className="gaugeValue" style={{ color: maintainabilityIndex >= 70 ? '#4aed88' : maintainabilityIndex >= 50 ? '#ffa500' : '#ff4d4d' }}>
            {maintainabilityIndex}<span className="gaugeUnit">/100</span>
          </div>
          <div className="gaugeSub">
            {maintainabilityIndex >= 70 ? 'Excellent' : maintainabilityIndex >= 50 ? 'Moderate' : 'Poor'}
          </div>
          <div className="progressBarTrack">
            <div 
              className="progressBarFill" 
              style={{ 
                width: `${maintainabilityIndex}%`,
                backgroundColor: maintainabilityIndex >= 70 ? '#4aed88' : maintainabilityIndex >= 50 ? '#ffa500' : '#ff4d4d'
              }}
            />
          </div>
        </div>

        <div className="gaugeCard">
          <div className="gaugeLabel">Halstead Volume</div>
          <div className="gaugeValue" style={{ color: '#61dafb' }}>
            {halstead.volume}
          </div>
          <div className="gaugeSub">
            Est. Bugs: ~{halstead.estimatedBugs}
          </div>
          <div className="progressBarTrack">
            <div 
              className="progressBarFill" 
              style={{ 
                width: `${Math.min(100, (halstead.volume / 800) * 100)}%`,
                backgroundColor: '#61dafb'
              }}
            />
          </div>
        </div>
      </div>

      <div className="smellSection">
        <div className="smellHeader">
          <span>Detected Structural Smells ({codeSmells.length})</span>
          <button className="askAiQuickBtn" onClick={() => onOpenAssistant('SECURITY')}>
            🛡️ AI Security Audit
          </button>
        </div>
        {codeSmells.length === 0 ? (
          <div className="noSmellsNotice">
            ✅ No structural anti-patterns detected. Code adheres to clean architecture standards.
          </div>
        ) : (
          <div className="smellList">
            {codeSmells.slice(0, 3).map((smell, idx) => (
              <div key={idx} className={`smellItem ${smell.severity}`}>
                <span className="smellLine">L{smell.line}</span>
                <span className="smellType">{smell.type}</span>
                <span className="smellMsg">{smell.message}</span>
              </div>
            ))}
            {codeSmells.length > 3 && (
              <div className="smellMore">
                +{codeSmells.length - 3} more issues identified. View full report in AI Copilot.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel;
