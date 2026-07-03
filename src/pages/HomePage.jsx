import { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Paper,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/Logout'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { requestJson } from '../api/apiClient'
import { useAuth } from '../auth/AuthContext'
import CreateSquadDialog from '../components/squad/CreateSquadDialog'
import EmptySquadsState from '../components/squad/EmptySquadsState'
import SquadCard from '../components/squad/SquadCard'

import './css/HomePage.css'

const HomePage = () => {
    const navigate = useNavigate()
    const { currentUser, isAdmin, logout } = useAuth()

    const [squads, setSquads] = useState(null)
    const [error, setError] = useState('')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const squadsList = squads ?? []
    const loading = squads === null

    const stats = useMemo(() => {
        const totalSquads = squadsList.length

        const completedSquads = squadsList.filter((squad) => {
            return (squad.squad_players?.length ?? 0) >= 11
        }).length

        const averageChemistry =
            totalSquads === 0
                ? 0
                : Math.round(
                    squadsList.reduce(
                        (sum, squad) => sum + (squad.chemistry_score ?? 0),
                        0,
                    ) / totalSquads,
                )

        return {
            totalSquads,
            completedSquads,
            averageChemistry,
        }
    }, [squadsList])

    useEffect(() => {
        let ignore = false

        const loadSquads = async () => {
            try {
                setError('')

                const squadsData = await requestJson('/squads')

                if (!ignore) {
                    setSquads(squadsData)
                }
            } catch (error) {
                if (!ignore) {
                    setError(error.message || 'Could not load squads.')
                }

                console.error(error)
            }
        }

        loadSquads()

        return () => {
            ignore = true
        }
    }, [])

    const handleCreateSquad = async (formData) => {
        try {
            setError('')

            const createdSquad = await requestJson('/squads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            setCreateDialogOpen(false)
            setSquads((currentSquads) => [createdSquad, ...(currentSquads ?? [])])

            navigate(`/squads/${createdSquad.id}`)
        } catch (error) {
            setError(error.message || 'Could not create squad.')
            console.error(error)
        }
    }

    const handleOpenSquad = (squad) => {
        navigate(`/squads/${squad.id}`)
    }

    const handleDeleteSquad = async (squad) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${squad.name}"?`,
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await requestJson(`/squads/${squad.id}`, {
                method: 'DELETE',
            })

            setSquads((currentSquads) =>
                (currentSquads ?? []).filter((currentSquad) => currentSquad.id !== squad.id),
            )
        } catch (error) {
            setError(error.message || 'Could not delete squad.')
            console.error(error)
        }
    }

    return (
        <Box className="home-page">
            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                className="home-appbar"
            >
                <Toolbar className="home-toolbar">
                    <SportsSoccerIcon color="primary" className="home-logo-icon" />

                    <Typography variant="h6" className="home-logo-text">
                        ScoutUp
                    </Typography>

                    <Box className="home-toolbar-spacer" />

                    <Stack direction="row" spacing={2} className="home-toolbar-actions">
                        {isAdmin && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/admin"
                                startIcon={<AdminPanelSettingsIcon />}
                            >
                                Admin
                            </Button>
                        )}

                        <Chip
                            label={currentUser?.name ?? 'User'}
                            variant="outlined"
                        />

                        <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" className="home-container">
                <Stack spacing={4}>
                    <Paper variant="outlined" className="home-hero">
                        <Stack spacing={3}>
                            <Box>
                                <Typography
                                    variant="overline"
                                    color="primary"
                                    className="home-overline"
                                >
                                    FIFA-style squad builder
                                </Typography>

                                <Typography variant="h2" className="home-title">
                                    Build your perfect football squad
                                </Typography>

                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    className="home-subtitle"
                                >
                                    Create squads, place players into formations and prepare for
                                    chemistry-based scouting decisions.
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={2} className="home-hero-actions">
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateDialogOpen(true)}
                                >
                                    New Squad
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Box className="home-stats-grid">
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Saved squads</Typography>
                                <Typography variant="h3" className="home-stat-value">
                                    {stats.totalSquads}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Completed squads</Typography>
                                <Typography variant="h3" className="home-stat-value">
                                    {stats.completedSquads}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Average chemistry</Typography>
                                <Typography variant="h3" className="home-stat-value">
                                    {stats.averageChemistry}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            className="home-section-header"
                        >
                            <Box>
                                <Typography variant="h4" className="home-section-title">
                                    Your squads
                                </Typography>

                                <Typography color="text.secondary">
                                    Open an existing squad or create a new one.
                                </Typography>
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                New Squad
                            </Button>
                        </Stack>

                        {loading ? (
                            <Paper variant="outlined" className="home-loading-state">
                                <Typography color="text.secondary">
                                    Loading squads...
                                </Typography>
                            </Paper>
                        ) : squadsList.length === 0 ? (
                            <EmptySquadsState onCreateClick={() => setCreateDialogOpen(true)} />
                        ) : (
                            <Box className="squads-grid">
                                {squadsList.map((squad) => (
                                    <SquadCard
                                        key={squad.id}
                                        squad={squad}
                                        onOpen={handleOpenSquad}
                                        onDelete={handleDeleteSquad}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Container>

            <CreateSquadDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={handleCreateSquad}
            />
        </Box>
    )
}

export default HomePage