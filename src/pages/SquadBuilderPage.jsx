import { useEffect, useState } from 'react'
import {
    Alert,
    AppBar,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { requestJson } from '../api/apiClient'
import SquadBuilder from '../components/squad-builder/SquadBuilder'

import './css/SquadBuilderPage.css'
import '../components/squad-builder/css/SquadBuilder.css'

const SquadBuilderPage = () => {
    const { squadId } = useParams()

    const [squad, setSquad] = useState(null)
    const [players, setPlayers] = useState(null)
    const [error, setError] = useState('')

    const loading = squad === null || players === null

    useEffect(() => {
        let ignore = false

        const loadData = async () => {
            try {
                setError('')

                const [squadData, playersData] = await Promise.all([
                    requestJson(`/squads/${squadId}`),
                    requestJson('/players'),
                ])

                if (!ignore) {
                    setSquad(squadData)
                    setPlayers(playersData)
                }
            } catch (error) {
                if (!ignore) {
                    setError(error.message || 'Could not load squad builder.')
                }

                console.error(error)
            }
        }

        loadData()

        return () => {
            ignore = true
        }
    }, [squadId])

    const handleSaveSquad = async (payload) => {
        const updatedSquad = await requestJson(`/squads/${squadId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        setSquad(updatedSquad)

        return updatedSquad
    }

    return (
        <Box className="squad-builder-page">
            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                className="squad-builder-appbar"
            >
                <Toolbar className="squad-builder-toolbar">
                    <SportsSoccerIcon color="primary" className="squad-builder-logo-icon" />

                    <Typography variant="h6" className="squad-builder-logo-text">
                        Squad Builder
                    </Typography>

                    <Box className="squad-builder-toolbar-spacer" />

                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to squads
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" className="squad-builder-container">
                {error && (
                    <Alert severity="error" className="squad-builder-error">
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Paper variant="outlined" className="squad-builder-loading">
                        <Typography color="text.secondary">
                            Loading squad builder...
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={3}>
                        <Paper variant="outlined" className="squad-builder-header">
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                className="squad-builder-header-row"
                            >
                                <Box>
                                    <Typography variant="overline" color="primary">
                                        {squad.formation}
                                    </Typography>

                                    <Typography variant="h3" className="squad-builder-title">
                                        {squad.name}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Drag players onto the pitch, build your formation and save your squad.
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <Chip label={`${squad.squad_players?.length ?? 0}/12 players`} />
                                    <Chip
                                        color="primary"
                                        label={`${squad.chemistry_score ?? 0} chemistry`}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>

                        <SquadBuilder
                            squad={squad}
                            players={players}
                            onSave={handleSaveSquad}
                        />
                    </Stack>
                )}
            </Container>
        </Box>
    )
}

export default SquadBuilderPage