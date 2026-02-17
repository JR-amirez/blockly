import { registerMathBlocks } from './mathBlocks';
import { registerOutputBlocks } from './outputBlocks';

// Importar bloques estándar de Blockly
import 'blockly/blocks';

let blocksRegistered = false;

export function registerAllBlocks(): void {
  if (blocksRegistered) return;

  registerMathBlocks();
  registerOutputBlocks();

  blocksRegistered = true;
}
