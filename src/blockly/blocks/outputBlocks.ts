import * as Blockly from 'blockly';

// Bloque de imprimir resultado
const printBlock = {
  type: 'output_print',
  message0: 'mostrar %1',
  args0: [
    {
      type: 'input_value',
      name: 'VALUE'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 160,
  tooltip: 'Muestra el resultado en la consola',
  helpUrl: ''
};

// Bloque de respuesta final (para validación)
const answerBlock = {
  type: 'output_answer',
  message0: 'la respuesta es %1',
  args0: [
    {
      type: 'input_value',
      name: 'ANSWER',
      check: 'Number'
    }
  ],
  previousStatement: null,
  colour: 65,
  tooltip: 'Define la respuesta final del ejercicio',
  helpUrl: ''
};

export function registerOutputBlocks(): void {
  Blockly.Blocks['output_print'] = {
    init: function (this: Blockly.Block) {
      this.jsonInit(printBlock);
    }
  };

  Blockly.Blocks['output_answer'] = {
    init: function (this: Blockly.Block) {
      this.jsonInit(answerBlock);
    }
  };
}
