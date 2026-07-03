import {
    Button,
    Chip,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

const ChemistryPanel = ({ chemistry, onSave, saving }) => {
    return (
        <Paper variant="outlined" className="chemistry-panel">
            <Stack spacing={2}>
                <Typography variant="h5" className="squad-builder-panel-title">
                    Chemistry
                </Typography>

                <Stack spacing={1}>
                    <Typography variant="h2" className="chemistry-score">
                        {chemistry.total}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={chemistry.total}
                        className="chemistry-progress"
                    />

                    <Typography color="text.secondary">
                        Overall chemistry score
                    </Typography>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                    <Stack direction="row" className="chemistry-row">
                        <Typography color="text.secondary">Players</Typography>
                        <Chip
                            label={`${chemistry.selectedPlayers}/${chemistry.totalSlots}`}
                            size="small"
                        />
                    </Stack>

                    <Stack direction="row" className="chemistry-row">
                        <Typography color="text.secondary">Position fit</Typography>
                        <Chip
                            label={`${chemistry.positionMatches}/${chemistry.totalSlots}`}
                            size="small"
                            color="primary"
                        />
                    </Stack>

                    <Stack direction="row" className="chemistry-row">
                        <Typography color="text.secondary">Same team links</Typography>
                        <Chip label={chemistry.sameTeamLinks} size="small" />
                    </Stack>

                    <Stack direction="row" className="chemistry-row">
                        <Typography color="text.secondary">Same nationality links</Typography>
                        <Chip label={chemistry.sameNationalityLinks} size="small" />
                    </Stack>

                    <Stack direction="row" className="chemistry-row">
                        <Typography color="text.secondary">Same league links</Typography>
                        <Chip label={chemistry.sameLeagueLinks} size="small" />
                    </Stack>
                </Stack>

                <Divider />

                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={onSave}
                    disabled={saving}
                    fullWidth
                >
                    {saving ? 'Saving...' : 'Save Squad'}
                </Button>
            </Stack>
        </Paper>
    )
}

export default ChemistryPanel