import { useEffect, useState } from 'react';
import { intentClassifier } from '../utils/intentClassifier';

function IntentDemo() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ intent: string; confidence: number; allScores: { [key: string]: number } } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initModel = async () => {
      try {
        await intentClassifier.initialize();
        if (!cancelled) {
          setModelReady(true);
          console.log('ONNX model loaded successfully');
        }
      } catch (err) {
        console.error('Failed to initialize model:', err);
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to load model: ${errorMessage}`);
        }
      }
    };

    initModel();

    return () => {
      cancelled = true;
      intentClassifier.dispose();
    };
  }, []);

  const handleClassify = async () => {
    if (!input.trim() || !modelReady) return;
    setProcessing(true);
    setResult(null);
    setError(null);

    try {
      const inferenceResult = await intentClassifier.classify(input);
      setResult(inferenceResult);
    } catch (err) {
      console.error('Classification error:', err);
      setError('Classification failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="intent-demo">
      <h3 className="demo-title">Intent Classification Demo</h3>
      <p className="demo-subtitle">
        Real-time ONNX inference with tiktoken tokenization
      </p>

      {!modelReady && !error && (
        <div className="model-loading">
          <div className="loading-spinner"></div>
          <span>Loading ONNX model...</span>
        </div>
      )}

      {error && (
        <div className="model-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="demo-input-group">
        <input
          type="text"
          className="demo-input"
          placeholder="Enter a command or query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleClassify()}
          disabled={!modelReady}
        />
        <button
          className="demo-button"
          onClick={handleClassify}
          disabled={processing || !input.trim() || !modelReady}
        >
          {processing ? 'Processing...' : 'Classify'}
        </button>
      </div>

      {result && (
        <div className="demo-result">
          <div className="result-item">
            <span className="result-label">Intent:</span>
            <span className="result-value intent">{result.intent}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Confidence:</span>
            <span className="result-value confidence">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          {result.allScores && (
            <div className="result-item">
              <span className="result-label">Top Predictions:</span>
              <div className="result-entities">
                {Object.entries(result.allScores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([label, score]) => (
                    <span key={label} className="entity-tag">
                      {label}: {(score * 100).toFixed(1)}%
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="demo-examples">
        <p className="examples-title">Try these examples:</p>
        <div className="example-buttons">
          <button onClick={() => setInput("What's the weather like?")}>Weather</button>
          <button onClick={() => setInput('Turn on the lights')}>Lights</button>
          <button onClick={() => setInput('Play some music')}>Music</button>
          <button onClick={() => setInput('Set a timer for 5 minutes')}>Timer</button>
          <button onClick={() => setInput('Lock all doors')}>Security</button>
          <button onClick={() => setInput('Start the vacuum cleaner')}>Vacuum</button>
        </div>
      </div>
    </div>
  );
}

export default IntentDemo;
