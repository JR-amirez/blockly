import { javascriptGenerator, Order } from 'blockly/javascript';

export function registerOutputGenerators(): void {
  // Generador para imprimir (bloque custom)
  javascriptGenerator.forBlock['output_print'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
    return `__print(${value});\n`;
  };

  // Generador para respuesta final
  javascriptGenerator.forBlock['output_answer'] = function (block) {
    const answer = javascriptGenerator.valueToCode(block, 'ANSWER', Order.NONE) || '0';
    return `__setAnswer(${answer});\n`;
  };

  // Override del bloque estándar text_print para que use __print en vez de window.alert
  javascriptGenerator.forBlock['text_print'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `__print(${value});\n`;
  };
}
