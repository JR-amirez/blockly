import { useRef, useState, useCallback, useEffect } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { steamGTheme } from '../blockly/theme';
import { setSpanishLocale } from '../blockly/locale';
import { registerAllBlocks } from '../blockly/blocks';
import { registerAllGenerators } from '../blockly/generators';
import type { FunctionExercise } from './useExercises';
import type { TestResult } from './useExercises';

export type { TestResult };

export interface ProcedureInfo {
  name: string;
  parameters: string[];
  hasReturn: boolean;
}

interface UseBlocklyReturn {
  setWorkspaceRef: (node: HTMLDivElement | null) => void;
  workspace: Blockly.WorkspaceSvg | null;
  consoleOutput: string[];
  userAnswer: number | null;
  testResults: TestResult[] | null;
  definedProcedures: ProcedureInfo[];
  runCode: () => { outputs: string[]; answer: number | null };
  runFunctionTests: (functionTest: FunctionExercise) => TestResult[];
  resetWorkspace: () => void;
  clearConsole: () => void;
  addBlock: (blockType: string) => void;
  addProcedureCallBlock: (procedureName: string, hasReturn: boolean) => void;
  getBlockSvg: (blockType: string) => string;
}

export function useBlockly(): UseBlocklyReturn {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const workspaceInstance = useRef<Blockly.WorkspaceSvg | null>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [definedProcedures, setDefinedProcedures] = useState<ProcedureInfo[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Workspace oculto para generar previsualizaciones SVG
  const previewWsRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Callback ref para detectar cuando el div está montado
  const setWorkspaceRef = useCallback((node: HTMLDivElement | null) => {
    workspaceRef.current = node;
    if (node) {
      setIsReady(true);
    }
  }, []);

  // Crear workspace de previsualización de forma lazy
  const getPreviewWorkspace = useCallback(() => {
    if (previewWsRef.current) return previewWsRef.current;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
    previewContainerRef.current = container;

    const ws = Blockly.inject(container, {
      theme: steamGTheme,
      renderer: 'zelos'
    });
    previewWsRef.current = ws;
    return ws;
  }, []);

  // Inicializar workspace cuando el div esté listo
  useEffect(() => {

    if (!isReady || !workspaceRef.current || workspaceInstance.current) {
      return;
    }

    // Registrar bloques, generadores e idioma
    setSpanishLocale();

    registerAllBlocks();

    registerAllGenerators();

    const ws = Blockly.inject(workspaceRef.current, {
      // Sin toolbox: los bloques se agregan unicamente desde los modales del FAB.
      toolbox: undefined,
      theme: steamGTheme,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.4,
        scaleSpeed: 1.2
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      },
      renderer: 'zelos'
    });

    workspaceInstance.current = ws;
    setWorkspace(ws);

    // Listener para detectar funciones definidas en el workspace
    ws.addChangeListener((event: Blockly.Events.Abstract) => {
      if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CHANGE
      ) {
        const [noReturn, withReturn] = Blockly.Procedures.allProcedures(ws);
        const procs: ProcedureInfo[] = [];
        for (const tuple of noReturn) {
          procs.push({ name: tuple[0], parameters: tuple[1], hasReturn: false });
        }
        for (const tuple of withReturn) {
          procs.push({ name: tuple[0], parameters: tuple[1], hasReturn: true });
        }
        setDefinedProcedures(procs);
      }
    });

    // Redimensionar después de que el DOM esté listo
    const resizeTimeout = setTimeout(() => {
      Blockly.svgResize(ws);
    }, 100);

    const resizeTimeout2 = setTimeout(() => {
      Blockly.svgResize(ws);
      ws.scrollCenter();
    }, 500);

    // Redimensionar al cambiar tamaño de ventana
    const handleResize = () => {
      Blockly.svgResize(ws);
    };
    window.addEventListener('resize', handleResize);

    // Observer para detectar cambios en el tamaño del contenedor
    const resizeObserver = new ResizeObserver(() => {
      Blockly.svgResize(ws);
    });
    if (workspaceRef.current) {
      resizeObserver.observe(workspaceRef.current);
    }

    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(resizeTimeout2);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      ws.dispose();
      workspaceInstance.current = null;
    };
  }, [isReady]);

  // Limpieza del workspace de previsualización al desmontar
  useEffect(() => {
    return () => {
      if (previewWsRef.current) {
        previewWsRef.current.dispose();
        previewWsRef.current = null;
      }
      if (previewContainerRef.current) {
        previewContainerRef.current.remove();
        previewContainerRef.current = null;
      }
    };
  }, []);

  // Ejecutar código generado
  const runCode = useCallback((): { outputs: string[]; answer: number | null } => {
    if (!workspaceInstance.current) return { outputs: [], answer: null };

    setConsoleOutput([]);
    setUserAnswer(null);

    const code = javascriptGenerator.workspaceToCode(workspaceInstance.current);

    // Crear contexto de ejecución seguro
    const outputs: string[] = [];
    let answer: number | null = null;

    const __print = (value: unknown) => {
      outputs.push(String(value));
    };

    const __setAnswer = (value: number) => {
      answer = value;
    };

    // Suprimir prompt/alert nativos durante la ejecución
    const originalPrompt = window.prompt;
    const originalAlert = window.alert;
    window.prompt = () => '0';
    window.alert = () => {};

    try {
      // Ejecutar en contexto controlado
      const runnable = new Function('__print', '__setAnswer', code);
      runnable(__print, __setAnswer);

      setConsoleOutput(outputs);
      setUserAnswer(answer);
    } catch (error) {
      outputs.push(`Error: ${(error as Error).message}`);
      setConsoleOutput(outputs);
    } finally {
      window.prompt = originalPrompt;
      window.alert = originalAlert;
    }

    return { outputs, answer };
  }, []);

  // Ejecutar tests de función: genera el código, llama la función con cada test case
  const runFunctionTests = useCallback((functionTest: FunctionExercise): TestResult[] => {
    if (!workspaceInstance.current) return [];

    setConsoleOutput([]);
    setUserAnswer(null);
    setTestResults(null);

    const code = javascriptGenerator.workspaceToCode(workspaceInstance.current);
    const outputs: string[] = [];
    const results: TestResult[] = [];

    const __print = (value: unknown) => {
      outputs.push(String(value));
    };
    const __setAnswer = () => {};

    // Verificar que la función está definida en el código generado
    if (!code.includes(`function ${functionTest.functionName}`)) {
      outputs.push(`Error: No se encontró la función '${functionTest.functionName}'.`);
      outputs.push(`Asegúrate de crear una función con ese nombre exacto.`);
      setConsoleOutput(outputs);
      setTestResults([]);
      return [];
    }

    // Suprimir prompt() durante pruebas automatizadas: los argumentos
    // vienen de los test cases, no del usuario.
    const originalPrompt = window.prompt;
    const originalAlert = window.alert;
    window.prompt = () => '0';
    window.alert = () => {};

    try {
      outputs.push('Ejecutando pruebas...');

      // Ejecutar cada test case
      for (const testCase of functionTest.testCases) {
        const argsStr = testCase.args.map(a => JSON.stringify(a)).join(', ');
        const testCode = `${code}\nreturn ${functionTest.functionName}(${argsStr});`;

        try {
          const testRunnable = new Function('__print', '__setAnswer', testCode);
          const actual = testRunnable(() => {}, __setAnswer);
          const passed = typeof actual === 'number' && Math.abs(actual - testCase.expected) < 0.001;
          results.push({ args: testCase.args, expected: testCase.expected, actual, passed });
        } catch (err) {
          results.push({ args: testCase.args, expected: testCase.expected, actual: undefined, passed: false });
          outputs.push(`Error en ${functionTest.functionName}(${argsStr}): ${(err as Error).message}`);
        }
      }

      // Resumen
      const passedCount = results.filter(r => r.passed).length;
      outputs.push(`--- ${passedCount}/${results.length} pruebas correctas ---`);
    } finally {
      // Restaurar funciones originales
      window.prompt = originalPrompt;
      window.alert = originalAlert;
    }

    setConsoleOutput(outputs);
    setTestResults(results);
    return results;
  }, []);

  // Limpiar workspace
  const resetWorkspace = useCallback(() => {
    if (workspaceInstance.current) {
      workspaceInstance.current.clear();
      setConsoleOutput([]);
      setUserAnswer(null);
    }
  }, []);

  // Limpiar consola
  const clearConsole = useCallback(() => {
    setConsoleOutput([]);
  }, []);

  // Agregar un bloque al workspace programáticamente
  const addBlock = useCallback((blockType: string) => {
    const ws = workspaceInstance.current;
    if (!ws) return;

    // Para bloques de variables, asegurar que exista al menos una variable
    if (
      (blockType === 'variables_get' || blockType === 'variables_set') &&
      ws.getAllVariables().length === 0
    ) {
      ws.createVariable('mi_variable');
    }

    const block = ws.newBlock(blockType);
    block.initSvg();
    block.render();

    // Posicionar debajo del último bloque existente
    const topBlocks = ws.getTopBlocks(false);
    let y = 30;
    for (const existing of topBlocks) {
      if (existing.id === block.id) continue;
      const pos = existing.getRelativeToSurfaceXY();
      const bottom = pos.y + existing.height;
      if (bottom + 20 > y) {
        y = bottom + 20;
      }
    }
    block.moveBy(30, y);
    ws.centerOnBlock(block.id);
  }, []);

  // Agregar bloque de llamada a función definida por el usuario
  const addProcedureCallBlock = useCallback((procedureName: string, hasReturn: boolean) => {
    const ws = workspaceInstance.current;
    if (!ws) return;

    const blockType = hasReturn ? 'procedures_callreturn' : 'procedures_callnoreturn';
    const block = ws.newBlock(blockType);

    // Configurar la mutación para asociar con la función definida
    const mutation = Blockly.utils.xml.createElement('mutation');
    mutation.setAttribute('name', procedureName);

    const defBlock = Blockly.Procedures.getDefinition(procedureName, ws);
    if (defBlock && (defBlock as any).getProcedureDef) {
      const [, params] = (defBlock as any).getProcedureDef();
      for (const param of params) {
        const arg = Blockly.utils.xml.createElement('arg');
        arg.setAttribute('name', param);
        mutation.appendChild(arg);
      }
    }

    (block as any).domToMutation(mutation);
    block.initSvg();
    block.render();

    // Posicionar debajo del último bloque existente
    const topBlocks = ws.getTopBlocks(false);
    let y = 30;
    for (const existing of topBlocks) {
      if (existing.id === block.id) continue;
      const pos = existing.getRelativeToSurfaceXY();
      const bottom = pos.y + existing.height;
      if (bottom + 20 > y) y = bottom + 20;
    }
    block.moveBy(30, y);
    ws.centerOnBlock(block.id);
  }, []);

  // Generar SVG de previsualización de un bloque
  const getBlockSvg = useCallback((blockType: string): string => {
    const ws = getPreviewWorkspace();

    if (
      (blockType === 'variables_get' || blockType === 'variables_set') &&
      ws.getAllVariables().length === 0
    ) {
      ws.createVariable('mi_variable');
    }

    const block = ws.newBlock(blockType);
    block.initSvg();
    block.render();

    const svgRoot = block.getSvgRoot();
    const bbox = svgRoot.getBBox();

    const serializer = new XMLSerializer();
    const gString = serializer.serializeToString(svgRoot);

    const pad = 8;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bbox.width + pad * 2}" height="${bbox.height + pad * 2}" viewBox="${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}">${gString}</svg>`;

    block.dispose();

    return svg;
  }, [getPreviewWorkspace]);

  return {
    setWorkspaceRef,
    workspace,
    consoleOutput,
    userAnswer,
    testResults,
    definedProcedures,
    runCode,
    runFunctionTests,
    resetWorkspace,
    clearConsole,
    addBlock,
    addProcedureCallBlock,
    getBlockSvg
  };
}
