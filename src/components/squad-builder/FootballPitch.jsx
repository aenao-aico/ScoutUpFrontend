import { Box, Paper } from '@mui/material'
import FormationSlot from './FormationSlot'
import { getFormationSlots } from './formations'

const FootballPitch = ({ formation, lineup, onRemove }) => {
    const slots = getFormationSlots(formation)

    return (
        <Paper variant="outlined" className="football-pitch-wrapper">
            <Box className="football-pitch">
                <Box className="pitch-line pitch-center-line" />
                <Box className="pitch-circle" />
                <Box className="pitch-box pitch-box-top" />
                <Box className="pitch-box pitch-box-bottom" />

                {slots.map((slot) => (
                    <FormationSlot
                        key={slot.key}
                        slot={slot}
                        player={lineup[slot.key]}
                        onRemove={onRemove}
                    />
                ))}
            </Box>
        </Paper>
    )
}

export default FootballPitch