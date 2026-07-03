import { useDroppable } from '@dnd-kit/core'
import { Button, Paper, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayerCard from './PlayerCard'

const FormationSlot = ({ slot, player, onRemove }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${slot.key}`,
        data: {
            type: 'slot',
            slotKey: slot.key,
        },
    })

    const isCorrectPosition = player ? player.position === slot.position : false

    return (
        <Paper
            ref={setNodeRef}
            variant="outlined"
            className={[
                'formation-slot',
                isOver ? 'formation-slot-over' : '',
                player ? 'formation-slot-filled' : '',
                player && !isCorrectPosition ? 'formation-slot-warning' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
            }}
        >
            <Stack spacing={1} className="formation-slot-content">
                <Typography className="formation-slot-label">
                    {slot.label}
                </Typography>

                {player ? (
                    <>
                        <PlayerCard
                            player={player}
                            compact
                            dragId={`slot-player-${slot.key}`}
                            dragData={{
                                type: 'slot-player',
                                slotKey: slot.key,
                                player,
                            }}
                        />

                        {!isCorrectPosition && (
                            <Typography variant="caption" color="warning.main">
                                prefers {player.position}
                            </Typography>
                        )}

                        <Button
                            size="small"
                            color="inherit"
                            startIcon={<CloseIcon />}
                            onClick={() => onRemove(slot.key)}
                        >
                            Remove
                        </Button>
                    </>
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        Drop here
                    </Typography>
                )}
            </Stack>
        </Paper>
    )
}

export default FormationSlot