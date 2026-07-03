import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

const PlayerCard = ({
                        player,
                        compact = false,
                        draggable = true,
                        dragId,
                        dragData,
                    }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: dragId ?? `player-${player.id}`,
        data: dragData ?? {
            type: 'player',
            player,
        },
        disabled: !draggable,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    const fullName = `${player.first_name} ${player.last_name}`
    const displayPosition = player.position === 'MANAGER' ? 'M' : player.position

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            className={[
                'player-card',
                compact ? 'player-card-compact' : '',
                isDragging ? 'player-card-dragging' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            {...listeners}
            {...attributes}
        >
            <Stack spacing={1}>
                <Stack direction="row" className="player-card-header">
                    <Chip
                        label={displayPosition}
                        color="primary"
                        size="small"
                        className="player-card-position"
                    />

                    {player.age && (
                        <Typography variant="caption" color="text.secondary">
                            {player.age} yrs
                        </Typography>
                    )}
                </Stack>

                <Box>
                    <Typography className="player-card-name">
                        {fullName}
                    </Typography>

                    {!compact && (
                        <Typography variant="body2" color="text.secondary">
                            {player.team?.name ?? 'No team'}
                        </Typography>
                    )}
                </Box>

                {!compact && (
                    <Stack direction="row" spacing={1} className="player-card-tags">
                        {player.nationality && (
                            <Chip label={player.nationality} size="small" variant="outlined" />
                        )}

                        {player.team?.league && (
                            <Chip label={player.team.league} size="small" variant="outlined" />
                        )}
                    </Stack>
                )}
            </Stack>
        </Paper>
    )
}

export default PlayerCard