import { Button, Paper, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'

const EmptySquadsState = ({ onCreateClick }) => {
    return (
        <Paper variant="outlined" className="empty-squads-state">
            <Stack spacing={2} className="empty-squads-content">
                <SportsSoccerIcon color="primary" className="empty-squads-icon" />

                <Typography variant="h5" className="empty-squads-title">
                    No squads yet
                </Typography>

                <Typography color="text.secondary">
                    Create your first FIFA-style squad and start building your best XI.
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateClick}
                >
                    Create squad
                </Button>
            </Stack>
        </Paper>
    )
}

export default EmptySquadsState