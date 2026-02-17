import * as Blockly from 'blockly';

// Bloque de número con entrada
const numberInputBlock = {
  type: 'math_number_input',
  message0: 'número %1',
  args0: [
    {
      type: 'field_number',
      name: 'NUM',
      value: 0,
      precision: 1
    }
  ],
  output: 'Number',
  colour: 230,
  tooltip: 'Un valor numérico',
  helpUrl: ''
};

// Bloque de operación aritmética
const arithmeticBlock = {
  type: 'math_arithmetic_es',
  message0: '%1 %2 %3',
  args0: [
    {
      type: 'input_value',
      name: 'A',
      check: 'Number'
    },
    {
      type: 'field_dropdown',
      name: 'OP',
      options: [
        ['más (+)', 'ADD'],
        ['menos (-)', 'MINUS'],
        ['por (*)', 'MULTIPLY'],
        ['entre (/)', 'DIVIDE']
      ]
    },
    {
      type: 'input_value',
      name: 'B',
      check: 'Number'
    }
  ],
  inputsInline: true,
  output: 'Number',
  colour: 230,
  tooltip: 'Operación matemática básica',
  helpUrl: ''
};

// Bloque de comparación
const comparisonBlock = {
  type: 'math_compare_es',
  message0: '%1 %2 %3',
  args0: [
    {
      type: 'input_value',
      name: 'A',
      check: 'Number'
    },
    {
      type: 'field_dropdown',
      name: 'OP',
      options: [
        ['igual a (=)', 'EQ'],
        ['distinto de (≠)', 'NEQ'],
        ['mayor que (>)', 'GT'],
        ['menor que (<)', 'LT'],
        ['mayor o igual (≥)', 'GTE'],
        ['menor o igual (≤)', 'LTE']
      ]
    },
    {
      type: 'input_value',
      name: 'B',
      check: 'Number'
    }
  ],
  inputsInline: true,
  output: 'Boolean',
  colour: 210,
  tooltip: 'Comparar dos números',
  helpUrl: ''
};

export function registerMathBlocks(): void {
  Blockly.Blocks['math_number_input'] = {
    init: function (this: Blockly.Block) {
      this.jsonInit(numberInputBlock);
    }
  };

  Blockly.Blocks['math_arithmetic_es'] = {
    init: function (this: Blockly.Block) {
      this.jsonInit(arithmeticBlock);
    }
  };

  Blockly.Blocks['math_compare_es'] = {
    init: function (this: Blockly.Block) {
      this.jsonInit(comparisonBlock);
    }
  };
}
