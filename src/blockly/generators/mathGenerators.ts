import { javascriptGenerator, Order } from 'blockly/javascript';

export function registerMathGenerators(): void {
  // Generador para número de entrada
  javascriptGenerator.forBlock['math_number_input'] = function (block) {
    const number = block.getFieldValue('NUM');
    return [String(number), Order.ATOMIC];
  };

  // Generador para operaciones aritméticas
  javascriptGenerator.forBlock['math_arithmetic_es'] = function (block) {
    const operator = block.getFieldValue('OP');
    const operatorMap: Record<string, [string, Order]> = {
      'ADD': ['+', Order.ADDITION],
      'MINUS': ['-', Order.SUBTRACTION],
      'MULTIPLY': ['*', Order.MULTIPLICATION],
      'DIVIDE': ['/', Order.DIVISION]
    };

    const [op, order] = operatorMap[operator] || ['+', Order.ADDITION];
    const valueA = javascriptGenerator.valueToCode(block, 'A', order) || '0';
    const valueB = javascriptGenerator.valueToCode(block, 'B', order) || '0';

    return [`(${valueA} ${op} ${valueB})`, order];
  };

  // Generador para comparaciones
  javascriptGenerator.forBlock['math_compare_es'] = function (block) {
    const operator = block.getFieldValue('OP');
    const operatorMap: Record<string, string> = {
      'EQ': '===',
      'NEQ': '!==',
      'GT': '>',
      'LT': '<',
      'GTE': '>=',
      'LTE': '<='
    };

    const op = operatorMap[operator] || '===';
    const valueA = javascriptGenerator.valueToCode(block, 'A', Order.RELATIONAL) || '0';
    const valueB = javascriptGenerator.valueToCode(block, 'B', Order.RELATIONAL) || '0';

    return [`(${valueA} ${op} ${valueB})`, Order.RELATIONAL];
  };
}
