interface AdjustmentPosition {
  range: string[]
  alias: string
  required: boolean
}

interface MachineAdjustmentTemplate {
  seat?: AdjustmentPosition
  start?: AdjustmentPosition
  stop?: AdjustmentPosition
  leftPosition?: AdjustmentPosition
  rightPosition?: AdjustmentPosition
}

export class MachineAdjustmentsRecord {
  private _machineAdjustmentTemplate: MachineAdjustmentTemplate

  constructor (machineAdjustmentTemplate: MachineAdjustmentTemplate) {
    this._machineAdjustmentTemplate = machineAdjustmentTemplate
  }

  protected setMachineAdjustmentTemplate (machineAdjustmentTemplate: MachineAdjustmentTemplate) {
    this._machineAdjustmentTemplate = machineAdjustmentTemplate
  }

  get seat () {
    return this._machineAdjustmentTemplate.seat
  }

  get start () {
    return this._machineAdjustmentTemplate.start
  }

  get stop () {
    return this._machineAdjustmentTemplate.stop
  }

  get leftPosition () {
    return this._machineAdjustmentTemplate.leftPosition
  }

  get rightPosition () {
    return this._machineAdjustmentTemplate.rightPosition
  }
}

export const machineAdjustments = {
  '001399': { // Chest Press
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Seat',
      required: false
    }
  },
  '001599': { // Belt Squat
    leftPosition: {
      range: ['1', '2', '3'],
      alias: 'Belt',
      required: true
    }
  },
  '002099': { // Biaxial Upper Back
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Seat',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      alias: 'Chest',
      required: false
    }
  },
  '002599': { // Leg Press
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: null,
      required: false
    },
    leftPosition: {
      range: ['1', '2'],
      alias: null,
      required: false
    }
  },
  '003097': { // Functional Trainer
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: 'Left Arm',
      required: false
    },
    rightPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: 'Right Arm',
      required: false
    }
  },
  '003099': { // Performance Trainer
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E', 'F', 'H', 'J', 'L', 'P'],
      alias: 'Arm',
      required: false
    }
  },
  '003199': { /* Rack */ },
  '003299': { // Runner Tall
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: 'Chest',
      required: false
    }
  },
  '001198': { // Leg Extension Range Limiter
    start: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A'],
      alias: 'Start',
      required: true
    },
    stop: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: 'Stop',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7'],
      alias: 'Legs',
      required: false
    },
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E', 'F', 'H', 'J'],
      alias: 'Back',
      required: false
    }
  },
  '001199': { /* Leg Extension Pro */ },
  '001289': { // Leg Curl Range Limiter
    start: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A'],
      alias: 'Start',
      required: true
    },
    stop: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E'],
      alias: 'Stop',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Leg',
      required: false
    },
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E', 'F', 'H', 'J'],
      alias: 'Back',
      required: false
    }
  },
  '001298': { // Leg Curl Range Limiter
    start: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A'],
      alias: 'Start',
      required: true
    },
    stop: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E'],
      alias: 'Stop',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Leg',
      required: false
    },
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C', 'E', 'F', 'H', 'J'],
      alias: 'Back',
      required: false
    }
  },
  '001299': { /* Leg Curl Pro */ },
  '001598': { // Squat Pro
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7'],
      alias: 'Shoulder Pads',
      required: false
    }
  },
  '001699': { // Military Press
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Seat',
      required: false
    }
  },
  '001799': { // Arm Curl
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      alias: 'Seat',
      required: false
    }
  },
  '001999': { // Triceps
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      alias: 'Seat',
      required: false
    }
  },
  '002199': { // Lat Pulldown
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8'],
      alias: 'Seat',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4'],
      alias: 'Arms',
      required: false
    }
  },
  '002399': { // Abductor
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7'],
      alias: 'Back',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6'],
      alias: 'Left Leg',
      required: false
    },
    rightPosition: {
      range: ['1', '2', '3', '4', '5', '6'],
      alias: 'Right Leg',
      required: false
    }
  },
  '002499': { // Adductor
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7'],
      alias: 'Back',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6'],
      alias: 'Left Leg',
      required: false
    },
    rightPosition: {
      range: ['1', '2', '3', '4', '5', '6'],
      alias: 'Right Leg',
      required: false
    }
  },
  '002699': { // Standing Hip
    seat: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A'],
      alias: 'Platform',
      required: false
    },
    start: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      alias: 'Start',
      required: false
    },
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7'],
      alias: 'Leg',
      required: false
    }
  },
  '002899': { /* Lower Back */ },
  '002999': { /* Seated Calf */ },
  '003298': { // Runner
    leftPosition: {
      range: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'C'],
      alias: 'Chest',
      required: false
    }
  },
  '003197': { /* Half Rack */ }
}

export const getAvailableMachineAdjustments = (model: string) => {
  return new MachineAdjustmentsRecord(machineAdjustments[model])
}
