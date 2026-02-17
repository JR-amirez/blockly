import * as Blockly from 'blockly';
import * as Es from 'blockly/msg/es';

export function setSpanishLocale(): void {
  Blockly.setLocale(Es as unknown as { [key: string]: string });

  // Traducciones personalizadas adicionales
  Blockly.Msg['VARIABLES_SET'] = 'asignar a %1 el valor %2';
  Blockly.Msg['VARIABLES_GET'] = '%1';
  Blockly.Msg['CONTROLS_REPEAT_TITLE'] = 'repetir %1 veces';
  Blockly.Msg['CONTROLS_REPEAT_INPUT_DO'] = 'hacer';
  Blockly.Msg['CONTROLS_IF_MSG_IF'] = 'si';
  Blockly.Msg['CONTROLS_IF_MSG_THEN'] = 'entonces';
  Blockly.Msg['CONTROLS_IF_MSG_ELSE'] = 'si no';
  Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'] = 'si no, si';
  Blockly.Msg['MATH_NUMBER_TOOLTIP'] = 'Un número';
  Blockly.Msg['NEW_VARIABLE'] = 'Crear variable...';
  Blockly.Msg['NEW_VARIABLE_TITLE'] = 'Nombre de la nueva variable:';
  Blockly.Msg['RENAME_VARIABLE'] = 'Renombrar variable...';
  Blockly.Msg['RENAME_VARIABLE_TITLE'] = 'Renombrar todas las variables "%1" a:';
  Blockly.Msg['DELETE_VARIABLE'] = 'Eliminar la variable "%1"';
}
