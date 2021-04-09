const storeSchema = {
  project: {
    type: 'object',
    properties: {
      open_last_project_on_startup: {
        type: 'boolean',
        default: false
      },
      last_project_path: {
        type: 'string',
        default: ''
      },
      run_when_opening_project: {
        type: 'boolean',
        default: true
      }
    },
    default: {}
  },
  player: {
    type: 'object',
    properties: {
      server_port_start: {
        type: 'number',
        default: 7674,
        maximum: 9999,
        minimum: 1000
      },
      server_port_end: {
        type: 'number',
        default: 7684,
        maximum: 9999,
        minimum: 1000
      }
    },
    required: ['server_port_start', 'server_port_end'],
    default: {}
  }
}

module.exports = {
  storeSchema
}
