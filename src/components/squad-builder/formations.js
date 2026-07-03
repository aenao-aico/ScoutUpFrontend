export const formations = {
    '4-3-3': [
        { key: 'LW', label: 'LW', position: 'LW', x: 22, y: 14 },
        { key: 'ST', label: 'ST', position: 'ST', x: 50, y: 10 },
        { key: 'RW', label: 'RW', position: 'RW', x: 78, y: 14 },

        { key: 'CM1', label: 'CM', position: 'CM', x: 27, y: 40 },
        { key: 'CM2', label: 'CM', position: 'CM', x: 50, y: 47 },
        { key: 'CM3', label: 'CM', position: 'CM', x: 73, y: 40 },

        { key: 'LB', label: 'LB', position: 'LB', x: 14, y: 69 },
        { key: 'CB1', label: 'CB', position: 'CB', x: 37, y: 75 },
        { key: 'CB2', label: 'CB', position: 'CB', x: 63, y: 75 },
        { key: 'RB', label: 'RB', position: 'RB', x: 86, y: 69 },

        { key: 'GK', label: 'GK', position: 'GK', x: 50, y: 91 },

        { key: 'MANAGER', label: 'Manager', position: 'MANAGER', x: 90, y: 88 },
    ],
}

export const getFormationSlots = (formation = '4-3-3') => {
    return formations[formation] ?? formations['4-3-3']
}

export const createEmptyLineup = (formation = '4-3-3') => {
    const slots = getFormationSlots(formation)

    return slots.reduce((lineup, slot) => {
        lineup[slot.key] = null
        return lineup
    }, {})
}