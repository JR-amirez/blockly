export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Lógica',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if'
        },
        {
          kind: 'block',
          type: 'logic_compare'
        },
        {
          kind: 'block',
          type: 'logic_operation'
        },
        {
          kind: 'block',
          type: 'logic_negate'
        },
        {
          kind: 'block',
          type: 'logic_boolean'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Bucles',
      categorystyle: 'loop_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat',
        },
        {
          kind: 'block',
          type: 'controls_whileUntil'
        },
        {
          kind: 'block',
          type: 'controls_for'
        },
        {
          kind: 'block',
          type: 'controls_forEach'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Matemáticas',
      categorystyle: 'math_category',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: {
            NUM: 0
          }
        },
        {
          kind: 'block',
          type: 'math_arithmetic'
        },
        {
          kind: 'block',
          type: 'math_single'
        },
        {
          kind: 'block',
          type: 'math_trig'
        },
        {
          kind: 'block',
          type: 'math_constant'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Texto',
      categorystyle: 'text_category',
      contents: [
        {
          kind: 'block',
          type: 'text'
        },
        {
          kind: 'block',
          type: 'text_join'
        },
        {
          kind: 'block',
          type: 'text_length'
        },
        {
          kind: 'block',
          type: 'text_print'
        },
        {
          kind: 'block',
          type: 'text_prompt_ext'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Listas',
      categorystyle: 'list_category',
      contents: [
        {
          kind: 'block',
          type: 'lists_create_with'
        },
        {
          kind: 'block',
          type: 'lists_repeat'
        },
        {
          kind: 'block',
          type: 'lists_length'
        },
        {
          kind: 'block',
          type: 'lists_isEmpty'
        },
        {
          kind: 'block',
          type: 'lists_indexOf'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Funciones',
      categorystyle: 'procedure_category',
      contents: [
        {
          kind: 'block',
          type: 'procedures_defnoreturn'
        },
        {
          kind: 'block',
          type: 'procedures_defreturn'
        },
        {
          kind: 'block',
          type: 'procedures_ifreturn'
        }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      custom: 'VARIABLE'
    }
  ]
};
