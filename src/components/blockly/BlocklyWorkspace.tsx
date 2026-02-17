import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { IonButton, IonFab, IonFabButton, IonFabList, IonIcon, IonModal } from '@ionic/react';
import {
  calculatorOutline,
  chevronUpCircle,
  closeCircleOutline,
  codeSlashOutline,
  gitBranchOutline,
  listOutline,
  pricetagOutline,
  refreshOutline,
  textOutline,
} from 'ionicons/icons';
import { useBlockly } from '../../hooks/useBlockly';
import { useExercises, type Exercise, type TestResult } from '../../hooks/useExercises';
import ExercisePanel from './ExercisePanel';
import ConsoleOutput from './ConsoleOutput';
import './BlocklyWorkspace.css';

export interface BlocklyWorkspaceHandle {
  addBlock: (blockType: string) => void;
  addProcedureCallBlock: (procedureName: string, hasReturn: boolean) => void;
  getBlockSvg: (blockType: string) => string;
  verifyExercise: () => void;
  nextExercise: () => void;
  clearConsole: () => void;
  getDefinedProcedures: () => import('../../hooks/useBlockly').ProcedureInfo[];
}

export interface VerificationResult {
  consoleOutput: string[];
  testResults: TestResult[] | null;
  functionName?: string;
  isCorrect: boolean;
  isLastExercise: boolean;
  points: number;
}

export interface ExerciseIndicator {
  exercise: Exercise | null;
  currentIndex: number;
  total: number;
  score: number;
  isCorrect: boolean | null;
}

interface CategoryBlock {
  type: string;
  name: string;
  description: string;
  procedureName?: string;
  hasReturn?: boolean;
  isDynamic?: boolean;
}

const CATEGORY_BLOCKS: Record<string, CategoryBlock[]> = {
  'Lógica': [
    { type: 'controls_if', name: 'Si / Entonces', description: 'Ejecutar bloques si se cumple una condición' },
    { type: 'logic_compare', name: 'Comparación', description: 'Comparar dos valores (=, ≠, <, >, ≤, ≥)' },
    { type: 'logic_operation', name: 'Operación lógica', description: 'Operaciones Y / O entre condiciones' },
    { type: 'logic_negate', name: 'Negación', description: 'Negar una condición (NO)' },
    { type: 'logic_boolean', name: 'Booleano', description: 'Valor verdadero o falso' },
  ],
  'Bucles': [
    { type: 'controls_repeat', name: 'Repetir', description: 'Repetir bloques un número de veces' },
    { type: 'controls_whileUntil', name: 'Mientras / Hasta', description: 'Repetir mientras o hasta que se cumpla una condición' },
    { type: 'controls_for', name: 'Contar con', description: 'Contar desde un número hasta otro' },
    { type: 'controls_forEach', name: 'Para cada', description: 'Ejecutar para cada elemento de una lista' },
  ],
  'Matemáticas': [
    { type: 'math_number', name: 'Número', description: 'Un valor numérico' },
    { type: 'math_arithmetic', name: 'Aritmética', description: 'Suma, resta, multiplicación, división, potencia' },
    { type: 'math_single', name: 'Función matemática', description: 'Raíz cuadrada, valor absoluto, negación, etc.' },
    { type: 'math_trig', name: 'Trigonometría', description: 'Seno, coseno, tangente y sus inversas' },
    { type: 'math_constant', name: 'Constante', description: 'Constantes como π, e, √2, etc.' },
  ],
  'Texto': [
    { type: 'text', name: 'Texto', description: 'Una cadena de texto' },
    { type: 'text_join', name: 'Unir texto', description: 'Concatenar múltiples textos' },
    { type: 'text_length', name: 'Longitud', description: 'Obtener la longitud de un texto' },
    { type: 'text_print', name: 'Imprimir', description: 'Mostrar un valor en la consola' },
    { type: 'text_prompt_ext', name: 'Solicitar texto', description: 'Pedir entrada al usuario' },
  ],
  'Listas': [
    { type: 'lists_create_with', name: 'Crear lista', description: 'Crear una lista con elementos' },
    { type: 'lists_repeat', name: 'Repetir elemento', description: 'Crear lista repitiendo un elemento' },
    { type: 'lists_length', name: 'Longitud', description: 'Obtener la cantidad de elementos' },
    { type: 'lists_isEmpty', name: '¿Está vacía?', description: 'Verificar si la lista está vacía' },
    { type: 'lists_indexOf', name: 'Buscar en lista', description: 'Encontrar la posición de un elemento' },
  ],
  'Funciones': [
    { type: 'procedures_defnoreturn', name: 'Función sin retorno', description: 'Definir una función que no devuelve valor' },
    { type: 'procedures_defreturn', name: 'Función con retorno', description: 'Definir una función que devuelve un valor' },
    { type: 'procedures_ifreturn', name: 'Retorno condicional', description: 'Retornar un valor si se cumple una condición' },
  ],
  'Variables': [
    { type: 'variables_set', name: 'Establecer variable', description: 'Asignar un valor a una variable' },
    { type: 'variables_get', name: 'Obtener variable', description: 'Leer el valor de una variable' },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  'Lógica': '#f39c12',
  'Bucles': '#27ae60',
  'Matemáticas': '#0077b6',
  'Texto': '#e74c3c',
  'Listas': '#2980b9',
  'Funciones': '#9b59b6',
  'Variables': '#8e44ad',
};

interface BlocklyWorkspaceProps {
  difficulty: 'basic' | 'intermediate' | 'advanced';
  onComplete: (score: number, total: number) => void;
  isPaused: boolean;
  onExerciseChange?: (indicator: ExerciseIndicator) => void;
  onVerificationResult?: (result: VerificationResult) => void;
  onVerifying?: (isVerifying: boolean) => void;
}

const BlocklyWorkspace = forwardRef<BlocklyWorkspaceHandle, BlocklyWorkspaceProps>(({
  difficulty,
  onComplete,
  isPaused,
  onExerciseChange,
  onVerifying
}, ref) => {

  const {
    setWorkspaceRef, consoleOutput, userAnswer, testResults, definedProcedures,
    runCode, runFunctionTests, resetWorkspace, clearConsole,
    addBlock, addProcedureCallBlock, getBlockSvg
  } = useBlockly();

  const {
    currentExercise,
    exerciseIndex,
    totalExercises,
    score,
    isCorrect,
    checkAnswer,
    checkFunctionAnswer,
    nextExercise,
    resetExercises,
    resetCorrect,
    loading
  } = useExercises(difficulty);

  const lastUserAnswer = useRef<number | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blockPreviews, setBlockPreviews] = useState<Record<string, string>>({});

  // Obtener bloques de una categoría, agregando dinámicamente los call blocks de funciones
  const getCategoryBlocks = useCallback((category: string): CategoryBlock[] => {
    const staticBlocks = CATEGORY_BLOCKS[category] || [];
    if (category !== 'Funciones') return staticBlocks;

    const procs = definedProcedures || [];
    if (procs.length === 0) return staticBlocks;

    const dynamicBlocks: CategoryBlock[] = procs.map(proc => ({
      type: proc.hasReturn ? 'procedures_callreturn' : 'procedures_callnoreturn',
      name: `Llamar "${proc.name}"`,
      description: proc.hasReturn
        ? `Ejecutar "${proc.name}" y obtener su resultado`
        : `Ejecutar "${proc.name}"`,
      procedureName: proc.name,
      hasReturn: proc.hasReturn,
      isDynamic: true,
    }));

    return [...staticBlocks, ...dynamicBlocks];
  }, [definedProcedures]);

  // Generar previsualizaciones SVG cuando se selecciona una categoría
  useEffect(() => {
    if (!selectedCategory) {
      setBlockPreviews({});
      return;
    }

    const blocks = getCategoryBlocks(selectedCategory);
    const previews: Record<string, string> = {};
    for (const block of blocks) {
      if (block.isDynamic) continue;
      try {
        previews[block.type] = getBlockSvg(block.type);
      } catch (e) {
        console.error(`Error generando preview de ${block.type}:`, e);
      }
    }
    setBlockPreviews(previews);
  }, [selectedCategory, getCategoryBlocks, getBlockSvg]);

  useEffect(() => {
    if (!onExerciseChange) return;

    onExerciseChange({
      exercise: currentExercise,
      currentIndex: exerciseIndex,
      total: totalExercises,
      score,
      isCorrect
    });
  }, [onExerciseChange, currentExercise, exerciseIndex, totalExercises, score, isCorrect]);

  // Actualizar referencia cuando cambia userAnswer
  useEffect(() => {
    lastUserAnswer.current = userAnswer;
  }, [userAnswer]);

  const isLastExercise = exerciseIndex >= totalExercises - 1;

  // Verificar respuesta y mostrar modal
  const handleVerify = () => {
    if (isPaused || loading || !currentExercise) return;

    if (currentExercise.functionTest) {
      const results = runFunctionTests(currentExercise.functionTest);
      const correct = checkFunctionAnswer(results);
      setShowResultsModal(true);
      onVerifying?.(true);
      if (correct && isLastExercise) {
        onComplete(score + (currentExercise?.points || 0), totalExercises);
      }
    } else {
      runCode();
      setTimeout(() => {
        const answer = lastUserAnswer.current;
        const correct = checkAnswer(answer);
        setShowResultsModal(true);
        onVerifying?.(true);
        if (correct && isLastExercise) {
          onComplete(score + (currentExercise?.points || 0), totalExercises);
        }
      }, 150);
    }
  };

  // Cerrar modal y avanzar al siguiente ejercicio
  const handleNextFromModal = () => {
    setShowResultsModal(false);
    onVerifying?.(false);
    if (isLastExercise) {
      onComplete(score, totalExercises);
    } else {
      nextExercise();
      resetWorkspace();
      clearConsole();
    }
  };

  const handleCloseModal = () => {
    setShowResultsModal(false);
    onVerifying?.(false);
    resetCorrect();
    clearConsole();
  };

  const handleNext = () => {
    nextExercise();
    resetWorkspace();
    clearConsole();
  };

  const handleReset = () => {
    resetExercises();
    resetWorkspace();
    clearConsole();
  };

  useImperativeHandle(ref, () => ({
    addBlock,
    addProcedureCallBlock,
    getBlockSvg,
    verifyExercise: handleVerify,
    nextExercise: handleNext,
    clearConsole,
    getDefinedProcedures: () => definedProcedures
  }), [addBlock, addProcedureCallBlock, getBlockSvg, handleVerify, handleNext, clearConsole, definedProcedures]);

  if (loading) {
    return <div className="blockly-loading">Cargando ejercicios...</div>;
  }

  if (!currentExercise) {
    return (
      <div className="blockly-no-exercises">
        <p>No hay ejercicios disponibles para este nivel.</p>
        <IonButton onClick={handleReset}>Reiniciar</IonButton>
      </div>
    );
  }

  return (
    <div className={`blockly-game-container ${isPaused ? 'paused' : ''}`}>
      <ExercisePanel
        exercise={currentExercise}
        currentIndex={exerciseIndex}
        total={totalExercises}
        score={score}
        isCorrect={isCorrect}
        onIncorrectDismissed={resetCorrect}
      />

      <div className="blockly-main-area">
        <div className="blockly-workspace-wrapper">
          <div ref={setWorkspaceRef} className="blockly-workspace" />
        </div>
      </div>

      <IonFab vertical="bottom" horizontal="start" className="blockly-fab">
        <IonFabButton size='small'>
          <IonIcon icon={chevronUpCircle}></IonIcon>
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton className="fab-cat fab-logica" data-desc="Lógica" onClick={() => setSelectedCategory('Lógica')}>
            <IonIcon icon={gitBranchOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-bucles" data-desc="Bucles" onClick={() => setSelectedCategory('Bucles')}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-matematicas" data-desc="Matemáticas" onClick={() => setSelectedCategory('Matemáticas')}>
            <IonIcon icon={calculatorOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-texto" data-desc="Texto" onClick={() => setSelectedCategory('Texto')}>
            <IonIcon icon={textOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-listas" data-desc="Listas" onClick={() => setSelectedCategory('Listas')}>
            <IonIcon icon={listOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-funciones" data-desc="Funciones" onClick={() => setSelectedCategory('Funciones')}>
            <IonIcon icon={codeSlashOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton className="fab-cat fab-variables" data-desc="Variables" onClick={() => setSelectedCategory('Variables')}>
            <IonIcon icon={pricetagOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>

      {selectedCategory && (
        <div className="block-modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="block-modal" onClick={(e) => e.stopPropagation()}>
            <div className="block-modal-header" style={{ borderBottomColor: CATEGORY_COLORS[selectedCategory] }}>
              <h3 style={{ color: CATEGORY_COLORS[selectedCategory] }}>{selectedCategory}</h3>
              <IonIcon
                icon={closeCircleOutline}
                className="block-modal-close"
                onClick={() => setSelectedCategory(null)}
              />
            </div>
            <div className="block-modal-list">
              {getCategoryBlocks(selectedCategory).map((block) => (
                <div
                  key={block.isDynamic ? `call-${block.procedureName}` : block.type}
                  className={`block-modal-item ${block.isDynamic ? 'block-modal-item-dynamic' : ''}`}
                  style={{ borderLeftColor: CATEGORY_COLORS[selectedCategory] }}
                  onClick={() => {
                    if (block.isDynamic && block.procedureName != null && block.hasReturn != null) {
                      addProcedureCallBlock(block.procedureName, block.hasReturn);
                    } else {
                      addBlock(block.type);
                    }
                    setSelectedCategory(null);
                  }}
                >
                  {block.isDynamic ? (
                    <div className="block-preview-dynamic">
                      <IonIcon icon={codeSlashOutline} />
                    </div>
                  ) : blockPreviews[block.type] ? (
                    <div
                      className="block-preview-svg"
                      dangerouslySetInnerHTML={{ __html: blockPreviews[block.type] }}
                    />
                  ) : null}
                  <div className="block-info">
                    <span className="block-name">{block.name}</span>
                    <span className="block-desc">{block.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <IonModal
        isOpen={showResultsModal}
        onDidDismiss={handleCloseModal}
        className="results-modal"
      >
        <ConsoleOutput
          output={consoleOutput}
          testResults={testResults}
          functionName={currentExercise?.functionTest?.functionName}
          isLastExercise={isLastExercise}
          onClose={handleCloseModal}
          onNext={handleNextFromModal}
        />
      </IonModal>
    </div>
  );
});

export default BlocklyWorkspace;
