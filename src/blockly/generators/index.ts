import { registerMathGenerators } from './mathGenerators';
import { registerOutputGenerators } from './outputGenerators';

// Importar generadores JavaScript estándar de Blockly
import 'blockly/javascript';

let generatorsRegistered = false;

export function registerAllGenerators(): void {
  if (generatorsRegistered) return;

  registerMathGenerators();
  registerOutputGenerators();

  generatorsRegistered = true;
}
