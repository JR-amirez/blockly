import * as Blockly from 'blockly';

export const steamGTheme = Blockly.Theme.defineTheme('steamg', {
  name: 'steamg',
  blockStyles: {
    math_blocks: {
      colourPrimary: '#0077b6',
      colourSecondary: '#005f8f',
      colourTertiary: '#004a70'
    },
    variable_blocks: {
      colourPrimary: '#8e44ad',
      colourSecondary: '#7d3c98',
      colourTertiary: '#6c3483'
    },
    loop_blocks: {
      colourPrimary: '#27ae60',
      colourSecondary: '#229954',
      colourTertiary: '#1e8449'
    },
    logic_blocks: {
      colourPrimary: '#f39c12',
      colourSecondary: '#d68910',
      colourTertiary: '#b9770e'
    },
    text_blocks: {
      colourPrimary: '#e74c3c',
      colourSecondary: '#cb4335',
      colourTertiary: '#b03a2e'
    },
    list_blocks: {
      colourPrimary: '#2980b9',
      colourSecondary: '#2471a3',
      colourTertiary: '#1f618d'
    },
    procedure_blocks: {
      colourPrimary: '#9b59b6',
      colourSecondary: '#884ea0',
      colourTertiary: '#76448a'
    }
  },
  categoryStyles: {
    math_category: { colour: '#0077b6' },
    variable_category: { colour: '#8e44ad' },
    loop_category: { colour: '#27ae60' },
    logic_category: { colour: '#f39c12' },
    text_category: { colour: '#e74c3c' },
    list_category: { colour: '#2980b9' },
    procedure_category: { colour: '#9b59b6' }
  },
  componentStyles: {
    workspaceBackgroundColour: '#fafafa',
    toolboxBackgroundColour: '#ffffff',
    flyoutBackgroundColour: '#f0f0f0',
    flyoutOpacity: 0.9,
    scrollbarColour: '#ccc',
    insertionMarkerColour: '#0077b6'
  },
  fontStyle: {
    family: 'system-ui, -apple-system, sans-serif',
    weight: 'normal',
    size: 12
  }
});
