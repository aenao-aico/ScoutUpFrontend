import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'

const SquadCard = ({ squad, onOpen, onDelete }) => {
    const squadPlayers = squad.squad_players ?? []
    const playersCount = squadPlayers.length
    const chemistryScore = squad.chemistry_score ?? 0
    const progressValue = Math.min((playersCount / 12) * 100, 100)

    return (
        <Card variant="outlined" className="squad-card">
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        className="squad-card-header"
                    >
                        <Box>
                            <Typography variant="h5" className="squad-card-title">
                                {squad.name}
                            </Typography>

                            <Typography color="text.secondary">
                                Formation {squad.formation}
                            </Typography>
                        </Box>

                        <Chip
                            icon={<SportsSoccerIcon />}
                            label={`${playersCount}/12 players`}
                            color={playersCount >= 11 ? 'primary' : 'default'}
                        />
                    </Stack>

                    <Stack spacing={1}>
                        <Stack direction="row" className="squad-card-metric-row">
                            <Typography variant="body2" color="text.secondary">
                                Chemistry
                            </Typography>

                            <Typography variant="body2" className="squad-card-metric-value">
                                {chemistryScore}/100
                            </Typography>
                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={chemistryScore}
                            className="squad-card-progress"
                        />
                    </Stack>

                    <Stack spacing={1}>
                        <Stack direction="row" className="squad-card-metric-row">
                            <Typography variant="body2" color="text.secondary">
                                Squad completion
                            </Typography>

                            <Typography variant="body2" className="squad-card-metric-value">
                                {playersCount}/12
                            </Typography>
                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={progressValue}
                            className="squad-card-progress"
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} className="squad-card-actions">
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => onOpen(squad)}
                        >
                            Open
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => onDelete(squad)}
                        >
                            Delete
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    )
}

export default SquadCard