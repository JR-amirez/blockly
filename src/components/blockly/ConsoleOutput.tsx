import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { terminalOutline, checkmarkCircleOutline, closeCircleOutline, arrowForwardOutline, refreshOutline } from 'ionicons/icons';
import type { TestResult } from '../../hooks/useExercises';
import './ConsoleOutput.css';

interface ConsoleOutputProps {
  output: string[];
  testResults?: TestResult[] | null;
  functionName?: string;
  isLastExercise?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, testResults, functionName, isLastExercise, onClose, onNext }) => {
  const passedCount = testResults?.filter(r => r.passed).length ?? 0;
  const totalCount = testResults?.length ?? 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="console-container">
      <div className="console-header">
        <div className="console-title">
          <IonIcon icon={terminalOutline} />
          <span>Resultados</span>
        </div>
      </div>
      <div className="console-output">
        {output.length === 0 && !testResults ? (
          <span className="console-placeholder">Los resultados aparecerán aquí...</span>
        ) : (
          <>
            {output.map((line, index) => (
              <div key={index} className="console-line">
                <span className="line-number">{index + 1}</span>
                <span className="line-content">{line}</span>
              </div>
            ))}
            {testResults && testResults.length > 0 && (
              <div className="console-test-results">
                <div className="test-results-header">Pruebas de función:</div>
                {testResults.map((result, index) => (
                  <div key={index} className={`test-result-line ${result.passed ? 'test-passed' : 'test-failed'}`}>
                    <IonIcon icon={result.passed ? checkmarkCircleOutline : closeCircleOutline} />
                    <span className="test-call">
                      {functionName || 'fn'}({result.args.join(', ')})
                    </span>
                    <span className="test-arrow">&rarr;</span>
                    <span className="test-actual">
                      {result.actual !== undefined ? result.actual : 'error'}
                    </span>
                    {!result.passed && (
                      <span className="test-expected">(esperado: {result.expected})</span>
                    )}
                  </div>
                ))}
                <div className={`test-summary ${allPassed ? 'test-summary-passed' : 'test-summary-failed'}`}>
                  {allPassed
                    ? `Todas las pruebas pasaron (${passedCount}/${totalCount})`
                    : `${passedCount}/${totalCount} pruebas correctas`
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="console-modal-actions">
        {allPassed ? (
          <IonButton expand="block" shape="round" className="console-next-btn" onClick={onNext}>
            <IonIcon icon={arrowForwardOutline} slot="start" />
            {isLastExercise ? 'Finalizar' : 'Siguiente ejercicio'}
          </IonButton>
        ) : (
          <IonButton expand="block" shape="round" color="medium" className="console-close-btn" onClick={onClose}>
            <IonIcon icon={refreshOutline} slot="start" />
            Intentar de nuevo
          </IonButton>
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
