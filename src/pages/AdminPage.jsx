import { useEffect, useState } from 'react'
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tabs,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link as RouterLink } from 'react-router-dom'
import { requestJson } from '../api/apiClient'
import { useAuth } from '../auth/AuthContext'

import './css/AdminPage.css'

const emptyTeamForm = {
    name: '',
    city: '',
    stadium: '',
    founded_year: '',
}

const emptyPlayerForm = {
    team_id: '',
    first_name: '',
    last_name: '',
    position: '',
    age: '',
    nationality: '',
}

const AdminPage = () => {
    const { currentUser, logout } = useAuth()

    const [activeTab, setActiveTab] = useState(0)

    const [teams, setTeams] = useState(null)
    const [players, setPlayers] = useState(null)

    const [error, setError] = useState('')

    const [teamFormData, setTeamFormData] = useState(emptyTeamForm)
    const [playerFormData, setPlayerFormData] = useState(emptyPlayerForm)

    const [teamSearch, setTeamSearch] = useState('')
    const [playerSearch, setPlayerSearch] = useState('')

    const [teamFoundedAfter, setTeamFoundedAfter] = useState('')
    const [teamFoundedBefore, setTeamFoundedBefore] = useState('')

    const [playerAgeAfter, setPlayerAgeAfter] = useState('')
    const [playerAgeBefore, setPlayerAgeBefore] = useState('')

    const [teamSortBy, setTeamSortBy] = useState('created_at')
    const [teamSortDirection, setTeamSortDirection] = useState('desc')

    const [playerSortBy, setPlayerSortBy] = useState('created_at')
    const [playerSortDirection, setPlayerSortDirection] = useState('desc')

    const [editingTeam, setEditingTeam] = useState(null)
    const [editTeamData, setEditTeamData] = useState(emptyTeamForm)

    const [editingPlayer, setEditingPlayer] = useState(null)
    const [editPlayerData, setEditPlayerData] = useState(emptyPlayerForm)

    const teamsList = teams ?? []
    const playersList = players ?? []
    const loading = teams === null || players === null

    const getTeamsEndpoint = ({
                                  searchValue = teamSearch,
                                  foundedAfterValue = teamFoundedAfter,
                                  foundedBeforeValue = teamFoundedBefore,
                                  sortByValue = teamSortBy,
                                  sortDirectionValue = teamSortDirection,
                              } = {}) => {
        const params = new URLSearchParams()
        const trimmedSearch = searchValue.trim()

        if (trimmedSearch) {
            params.append('search', trimmedSearch)
        }

        if (foundedAfterValue) {
            params.append('founded_after', foundedAfterValue)
        }

        if (foundedBeforeValue) {
            params.append('founded_before', foundedBeforeValue)
        }

        if (sortByValue) {
            params.append('sort_by', sortByValue)
        }

        if (sortDirectionValue) {
            params.append('sort_direction', sortDirectionValue)
        }

        const queryString = params.toString()

        if (!queryString) {
            return '/teams'
        }

        return `/teams?${queryString}`
    }

    const getPlayersEndpoint = ({
                                    searchValue = playerSearch,
                                    playerAgeAfterValue = playerAgeAfter,
                                    playerAgeBeforeValue = playerAgeBefore,
                                    sortByValue = playerSortBy,
                                    sortDirectionValue = playerSortDirection,
                                } = {}) => {
        const params = new URLSearchParams()
        const trimmedSearch = searchValue.trim()

        if (trimmedSearch) {
            params.append('search', trimmedSearch)
        }

        if (playerAgeAfterValue) {
            params.append('age_after', playerAgeAfterValue)
        }

        if (playerAgeBeforeValue) {
            params.append('age_before', playerAgeBeforeValue)
        }

        if (sortByValue) {
            params.append('sort_by', sortByValue)
        }

        if (sortDirectionValue) {
            params.append('sort_direction', sortDirectionValue)
        }

        const queryString = params.toString()

        if (!queryString) {
            return '/players'
        }

        return `/players?${queryString}`
    }

    useEffect(() => {
        let ignore = false

        const loadInitialData = async () => {
            try {
                const [teamsData, playersData] = await Promise.all([
                    requestJson('/teams'),
                    requestJson('/players'),
                ])

                if (!ignore) {
                    setTeams(teamsData)
                    setPlayers(playersData)
                }
            } catch (error) {
                if (!ignore) {
                    setError(
                        error.message ||
                        'Could not load data. Check if the Laravel backend is running.',
                    )
                }

                console.error(error)
            }
        }

        loadInitialData()

        return () => {
            ignore = true
        }
    }, [])

    const refreshData = async ({
                                   teamFilters = {},
                                   playerFilters = {},
                               } = {}) => {
        try {
            setError('')

            const [teamsData, playersData] = await Promise.all([
                requestJson(getTeamsEndpoint(teamFilters)),
                requestJson(getPlayersEndpoint(playerFilters)),
            ])

            setTeams(teamsData)
            setPlayers(playersData)
        } catch (error) {
            setError(error.message || 'Could not refresh data.')
            console.error(error)
        }
    }

    const handleTeamSort = async (column) => {
        const isSameColumn = teamSortBy === column
        const nextDirection =
            isSameColumn && teamSortDirection === 'asc' ? 'desc' : 'asc'

        setTeamSortBy(column)
        setTeamSortDirection(nextDirection)

        await refreshData({
            teamFilters: {
                sortByValue: column,
                sortDirectionValue: nextDirection,
            },
        })
    }

    const handlePlayerSort = async (column) => {
        const isSameColumn = playerSortBy === column
        const nextDirection =
            isSameColumn && playerSortDirection === 'asc' ? 'desc' : 'asc'

        setPlayerSortBy(column)
        setPlayerSortDirection(nextDirection)

        await refreshData({
            playerFilters: {
                sortByValue: column,
                sortDirectionValue: nextDirection,
            },
        })
    }

    const handleTeamSearchSubmit = async (event) => {
        event.preventDefault()

        await refreshData()
    }

    const handlePlayerSearchSubmit = async (event) => {
        event.preventDefault()

        await refreshData()
    }

    const handleClearTeamSearch = async () => {
        setTeamSearch('')
        setTeamFoundedAfter('')
        setTeamFoundedBefore('')
        setTeamSortBy('created_at')
        setTeamSortDirection('desc')

        await refreshData({
            teamFilters: {
                searchValue: '',
                foundedAfterValue: '',
                foundedBeforeValue: '',
                sortByValue: 'created_at',
                sortDirectionValue: 'desc',
            },
        })
    }

    const handleClearPlayerSearch = async () => {
        setPlayerSearch('')
        setPlayerAgeAfter('')
        setPlayerAgeBefore('')
        setPlayerSortBy('created_at')
        setPlayerSortDirection('desc')

        await refreshData({
            playerFilters: {
                searchValue: '',
                playerAgeAfterValue: '',
                playerAgeBeforeValue: '',
                sortByValue: 'created_at',
                sortDirectionValue: 'desc',
            },
        })
    }

    const handleTeamInputChange = (event) => {
        const { name, value } = event.target

        setTeamFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }))
    }

    const handlePlayerInputChange = (event) => {
        const { name, value } = event.target

        setPlayerFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }))
    }

    const handleEditTeamInputChange = (event) => {
        const { name, value } = event.target

        setEditTeamData((currentData) => ({
            ...currentData,
            [name]: value,
        }))
    }

    const handleEditPlayerInputChange = (event) => {
        const { name, value } = event.target

        setEditPlayerData((currentData) => ({
            ...currentData,
            [name]: value,
        }))
    }

    const prepareTeamPayload = (data) => ({
        ...data,
        founded_year: data.founded_year ? Number(data.founded_year) : null,
    })

    const preparePlayerPayload = (data) => ({
        ...data,
        team_id: Number(data.team_id),
        age: data.age ? Number(data.age) : null,
    })

    const handleCreateTeam = async (event) => {
        event.preventDefault()

        try {
            setError('')

            await requestJson('/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prepareTeamPayload(teamFormData)),
            })

            setTeamFormData(emptyTeamForm)
            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not create team.')
            console.error(error)
        }
    }

    const handleCreatePlayer = async (event) => {
        event.preventDefault()

        try {
            setError('')

            await requestJson('/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preparePlayerPayload(playerFormData)),
            })

            setPlayerFormData(emptyPlayerForm)
            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not create player.')
            console.error(error)
        }
    }

    const openEditTeamDialog = (team) => {
        setEditingTeam(team)
        setEditTeamData({
            name: team.name ?? '',
            city: team.city ?? '',
            stadium: team.stadium ?? '',
            founded_year: team.founded_year ?? '',
        })
    }

    const closeEditTeamDialog = () => {
        setEditingTeam(null)
        setEditTeamData(emptyTeamForm)
    }

    const handleUpdateTeam = async () => {
        if (!editingTeam) {
            return
        }

        try {
            setError('')

            await requestJson(`/teams/${editingTeam.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prepareTeamPayload(editTeamData)),
            })

            closeEditTeamDialog()
            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not update team.')
            console.error(error)
        }
    }

    const openEditPlayerDialog = (player) => {
        setEditingPlayer(player)
        setEditPlayerData({
            team_id: player.team_id ?? player.team?.id ?? '',
            first_name: player.first_name ?? '',
            last_name: player.last_name ?? '',
            position: player.position ?? '',
            age: player.age ?? '',
            nationality: player.nationality ?? '',
        })
    }

    const closeEditPlayerDialog = () => {
        setEditingPlayer(null)
        setEditPlayerData(emptyPlayerForm)
    }

    const handleUpdatePlayer = async () => {
        if (!editingPlayer) {
            return
        }

        try {
            setError('')

            await requestJson(`/players/${editingPlayer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preparePlayerPayload(editPlayerData)),
            })

            closeEditPlayerDialog()
            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not update player.')
            console.error(error)
        }
    }

    const handleDeleteTeam = async (teamId) => {
        const confirmed = window.confirm(
            'Are you sure? Deleting a team will also delete its players.',
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await requestJson(`/teams/${teamId}`, {
                method: 'DELETE',
            })

            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not delete team.')
            console.error(error)
        }
    }

    const handleDeletePlayer = async (playerId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this player?',
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await requestJson(`/players/${playerId}`, {
                method: 'DELETE',
            })

            await refreshData()
        } catch (error) {
            setError(error.message || 'Could not delete player.')
            console.error(error)
        }
    }

    const getPlayerTeamName = (player) => {
        if (player.team?.name) {
            return player.team.name
        }

        const team = teamsList.find((team) => team.id === player.team_id)

        return team ? team.name : '-'
    }

    return (
        <Box className="admin-page">
            <AppBar position="static"
                    color="transparent"
                    elevation={0}
                    className="admin-appbar">
                <Toolbar className="admin-toolbar">
                    <SportsSoccerIcon color="primary" className="admin-logo-icon" />

                    <Typography variant="h6" className="admin-logo-text">
                        ScoutUp Admin
                    </Typography>

                    <Box className="admin-toolbar-spacer" />

                    <Stack direction="row" spacing={2} className="admin-toolbar-actions">
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<HomeIcon />}
                        >
                            Home
                        </Button>

                        <Chip
                            label={`${currentUser?.name ?? 'Admin'} (${currentUser?.role ?? 'admin'})`}
                            variant="outlined"
                        />

                        <Button
                            color="inherit"
                            onClick={logout}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" className="admin-container">
                <Box className="admin-hero">
                    <Typography
                        variant="overline"
                        color="primary"
                        className="admin-overline"
                    >
                        Football scouting platform
                    </Typography>

                    <Typography variant="h2" className="admin-title">
                        ScoutUp Dashboard
                    </Typography>

                    <Typography variant="h6" color="text.secondary" className="admin-subtitle">
                        Manage football teams and players from a simple admin dashboard.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" className="admin-error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Card className="admin-stats-card">
                    <CardContent>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            className="admin-stats-row"
                        >
                            <Stack direction="row" spacing={1}>
                                <Chip icon={<GroupsIcon />} label={`${teamsList.length} teams`} />
                                <Chip icon={<PersonIcon />} label={`${playersList.length} players`} />
                            </Stack>

                            <Button variant="outlined" onClick={() => refreshData()}>
                                Refresh
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Card>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        className="admin-tabs"
                    >
                        <Tab label="Teams" icon={<GroupsIcon />} iconPosition="start" />
                        <Tab label="Players" icon={<PersonIcon />} iconPosition="start" />
                    </Tabs>

                    <CardContent>
                        {activeTab === 0 && (
                            <Box className="admin-content-grid">
                                <Card variant="outlined">
                                    <CardContent>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            className="admin-section-title-row"
                                        >
                                            <AddIcon color="primary" />
                                            <Typography variant="h5" className="admin-section-title">
                                                Add team
                                            </Typography>
                                        </Stack>

                                        <Box component="form" onSubmit={handleCreateTeam}>
                                            <Stack spacing={2}>
                                                <TextField
                                                    label="Team name"
                                                    name="name"
                                                    value={teamFormData.name}
                                                    onChange={handleTeamInputChange}
                                                    placeholder="FC ScoutUp"
                                                    required
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="City"
                                                    name="city"
                                                    value={teamFormData.city}
                                                    onChange={handleTeamInputChange}
                                                    placeholder="Cluj-Napoca"
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Stadium"
                                                    name="stadium"
                                                    value={teamFormData.stadium}
                                                    onChange={handleTeamInputChange}
                                                    placeholder="ScoutUp Arena"
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Founded year"
                                                    name="founded_year"
                                                    type="number"
                                                    value={teamFormData.founded_year}
                                                    onChange={handleTeamInputChange}
                                                    placeholder="2026"
                                                    fullWidth
                                                />

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<AddIcon />}
                                                >
                                                    Add team
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h5" className="admin-section-title">
                                            Teams
                                        </Typography>

                                        <Typography color="text.secondary" className="admin-section-description">
                                            View, edit and delete football teams.
                                        </Typography>

                                        <Divider className="admin-divider" />

                                        <Box
                                            component="form"
                                            onSubmit={handleTeamSearchSubmit}
                                            className="admin-filter-form"
                                        >
                                            <TextField
                                                label="Search teams"
                                                value={teamSearch}
                                                onChange={(event) =>
                                                    setTeamSearch(event.currentTarget.value)
                                                }
                                                placeholder="Name, city or stadium"
                                                fullWidth
                                            />

                                            <TextField
                                                label="Founded after"
                                                type="number"
                                                value={teamFoundedAfter}
                                                onChange={(event) =>
                                                    setTeamFoundedAfter(event.currentTarget.value)
                                                }
                                                placeholder="2000"
                                                fullWidth
                                            />

                                            <TextField
                                                label="Founded before"
                                                type="number"
                                                value={teamFoundedBefore}
                                                onChange={(event) =>
                                                    setTeamFoundedBefore(event.currentTarget.value)
                                                }
                                                placeholder="2020"
                                                fullWidth
                                            />

                                            <Button type="submit" variant="contained">
                                                Apply
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outlined"
                                                onClick={handleClearTeamSearch}
                                            >
                                                Clear
                                            </Button>
                                        </Box>

                                        {loading ? (
                                            <Typography color="text.secondary">
                                                Loading teams...
                                            </Typography>
                                        ) : teamsList.length === 0 ? (
                                            <Paper variant="outlined" className="admin-empty-state">
                                                <Typography color="text.secondary">
                                                    No teams found. Add your first team.
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell className="admin-table-bold-cell">
                                                                <TableSortLabel
                                                                    active={teamSortBy === 'name'}
                                                                    direction={
                                                                        teamSortBy === 'name'
                                                                            ? teamSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handleTeamSort('name')}
                                                                >
                                                                    Name
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell className="admin-table-bold-cell">
                                                                <TableSortLabel
                                                                    active={teamSortBy === 'city'}
                                                                    direction={
                                                                        teamSortBy === 'city'
                                                                            ? teamSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handleTeamSort('city')}
                                                                >
                                                                    City
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell className="admin-table-bold-cell">
                                                                <TableSortLabel
                                                                    active={teamSortBy === 'stadium'}
                                                                    direction={
                                                                        teamSortBy === 'stadium'
                                                                            ? teamSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handleTeamSort('stadium')}
                                                                >
                                                                    Stadium
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell className="admin-table-bold-cell">
                                                                <TableSortLabel
                                                                    active={teamSortBy === 'founded_year'}
                                                                    direction={
                                                                        teamSortBy === 'founded_year'
                                                                            ? teamSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handleTeamSort('founded_year')}
                                                                >
                                                                    Founded
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell align="right">Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {teamsList.map((team) => (
                                                            <TableRow key={team.id} hover>
                                                                <TableCell className="admin-table-bold-cell">
                                                                    {team.name}
                                                                </TableCell>

                                                                <TableCell>{team.city || '-'}</TableCell>
                                                                <TableCell>{team.stadium || '-'}</TableCell>
                                                                <TableCell>{team.founded_year || '-'}</TableCell>

                                                                <TableCell align="right">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => openEditTeamDialog(team)}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() => handleDeleteTeam(team.id)}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box className="admin-content-grid">
                                <Card variant="outlined">
                                    <CardContent>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            className="admin-section-title-row"
                                        >
                                            <AddIcon color="primary" />
                                            <Typography variant="h5" className="admin-section-title">
                                                Add player
                                            </Typography>
                                        </Stack>

                                        {teamsList.length === 0 && (
                                            <Alert severity="warning" className="admin-warning">
                                                You need to add a team before adding players.
                                            </Alert>
                                        )}

                                        <Box component="form" onSubmit={handleCreatePlayer}>
                                            <Stack spacing={2}>
                                                <FormControl
                                                    fullWidth
                                                    required
                                                    disabled={teamsList.length === 0}
                                                >
                                                    <InputLabel>Team</InputLabel>
                                                    <Select
                                                        label="Team"
                                                        name="team_id"
                                                        value={playerFormData.team_id}
                                                        onChange={handlePlayerInputChange}
                                                    >
                                                        {teamsList.map((team) => (
                                                            <MenuItem key={team.id} value={team.id}>
                                                                {team.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <TextField
                                                    label="First name"
                                                    name="first_name"
                                                    value={playerFormData.first_name}
                                                    onChange={handlePlayerInputChange}
                                                    placeholder="Alex"
                                                    required
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Last name"
                                                    name="last_name"
                                                    value={playerFormData.last_name}
                                                    onChange={handlePlayerInputChange}
                                                    placeholder="Popescu"
                                                    required
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Position"
                                                    name="position"
                                                    value={playerFormData.position}
                                                    onChange={handlePlayerInputChange}
                                                    placeholder="Striker"
                                                    required
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Age"
                                                    name="age"
                                                    type="number"
                                                    value={playerFormData.age}
                                                    onChange={handlePlayerInputChange}
                                                    placeholder="22"
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="Nationality"
                                                    name="nationality"
                                                    value={playerFormData.nationality}
                                                    onChange={handlePlayerInputChange}
                                                    placeholder="Romanian"
                                                    fullWidth
                                                />

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<AddIcon />}
                                                    disabled={teamsList.length === 0}
                                                >
                                                    Add player
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h5" className="admin-section-title">
                                            Players
                                        </Typography>

                                        <Typography color="text.secondary" className="admin-section-description">
                                            View, edit and delete football players.
                                        </Typography>

                                        <Divider className="admin-divider" />

                                        <Box
                                            component="form"
                                            onSubmit={handlePlayerSearchSubmit}
                                            className="admin-filter-form"
                                        >
                                            <TextField
                                                label="Search players"
                                                value={playerSearch}
                                                onChange={(event) =>
                                                    setPlayerSearch(event.currentTarget.value)
                                                }
                                                placeholder="First name, last name, position or nationality"
                                                fullWidth
                                            />

                                            <TextField
                                                label="Age after"
                                                type="number"
                                                value={playerAgeAfter}
                                                onChange={(event) =>
                                                    setPlayerAgeAfter(event.currentTarget.value)
                                                }
                                                placeholder="20"
                                                fullWidth
                                            />

                                            <TextField
                                                label="Age before"
                                                type="number"
                                                value={playerAgeBefore}
                                                onChange={(event) =>
                                                    setPlayerAgeBefore(event.currentTarget.value)
                                                }
                                                placeholder="30"
                                                fullWidth
                                            />

                                            <Button type="submit" variant="contained">
                                                Apply
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outlined"
                                                onClick={handleClearPlayerSearch}
                                            >
                                                Clear
                                            </Button>
                                        </Box>

                                        {loading ? (
                                            <Typography color="text.secondary">
                                                Loading players...
                                            </Typography>
                                        ) : playersList.length === 0 ? (
                                            <Paper variant="outlined" className="admin-empty-state">
                                                <Typography color="text.secondary">
                                                    No players found. Add your first player.
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'first_name'}
                                                                    direction={
                                                                        playerSortBy === 'first_name'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('first_name')}
                                                                >
                                                                    First Name
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'last_name'}
                                                                    direction={
                                                                        playerSortBy === 'last_name'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('last_name')}
                                                                >
                                                                    Last Name
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'team_id'}
                                                                    direction={
                                                                        playerSortBy === 'team_id'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('team_id')}
                                                                >
                                                                    Team
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'position'}
                                                                    direction={
                                                                        playerSortBy === 'position'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('position')}
                                                                >
                                                                    Position
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'age'}
                                                                    direction={
                                                                        playerSortBy === 'age'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('age')}
                                                                >
                                                                    Age
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={playerSortBy === 'nationality'}
                                                                    direction={
                                                                        playerSortBy === 'nationality'
                                                                            ? playerSortDirection
                                                                            : 'asc'
                                                                    }
                                                                    onClick={() => handlePlayerSort('nationality')}
                                                                >
                                                                    Nationality
                                                                </TableSortLabel>
                                                            </TableCell>

                                                            <TableCell align="right">Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {playersList.map((player) => (
                                                            <TableRow key={player.id} hover>
                                                                <TableCell className="admin-table-bold-cell">
                                                                    {player.first_name}
                                                                </TableCell>

                                                                <TableCell className="admin-table-bold-cell">
                                                                    {player.last_name}
                                                                </TableCell>

                                                                <TableCell>{getPlayerTeamName(player)}</TableCell>
                                                                <TableCell>{player.position}</TableCell>
                                                                <TableCell>{player.age || '-'}</TableCell>
                                                                <TableCell>{player.nationality || '-'}</TableCell>

                                                                <TableCell align="right">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => openEditPlayerDialog(player)}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() => handleDeletePlayer(player.id)}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>

            <Dialog
                open={Boolean(editingTeam)}
                onClose={closeEditTeamDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit team</DialogTitle>

                <DialogContent>
                    <Stack spacing={2} className="admin-dialog-content">
                        <TextField
                            label="Team name"
                            name="name"
                            value={editTeamData.name}
                            onChange={handleEditTeamInputChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="City"
                            name="city"
                            value={editTeamData.city}
                            onChange={handleEditTeamInputChange}
                            fullWidth
                        />

                        <TextField
                            label="Stadium"
                            name="stadium"
                            value={editTeamData.stadium}
                            onChange={handleEditTeamInputChange}
                            fullWidth
                        />

                        <TextField
                            label="Founded year"
                            name="founded_year"
                            type="number"
                            value={editTeamData.founded_year}
                            onChange={handleEditTeamInputChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeEditTeamDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateTeam}>
                        Save changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(editingPlayer)}
                onClose={closeEditPlayerDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit player</DialogTitle>

                <DialogContent>
                    <Stack spacing={2} className="admin-dialog-content">
                        <FormControl fullWidth required>
                            <InputLabel>Team</InputLabel>
                            <Select
                                label="Team"
                                name="team_id"
                                value={editPlayerData.team_id}
                                onChange={handleEditPlayerInputChange}
                            >
                                {teamsList.map((team) => (
                                    <MenuItem key={team.id} value={team.id}>
                                        {team.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="First name"
                            name="first_name"
                            value={editPlayerData.first_name}
                            onChange={handleEditPlayerInputChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Last name"
                            name="last_name"
                            value={editPlayerData.last_name}
                            onChange={handleEditPlayerInputChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Position"
                            name="position"
                            value={editPlayerData.position}
                            onChange={handleEditPlayerInputChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Age"
                            name="age"
                            type="number"
                            value={editPlayerData.age}
                            onChange={handleEditPlayerInputChange}
                            fullWidth
                        />

                        <TextField
                            label="Nationality"
                            name="nationality"
                            value={editPlayerData.nationality}
                            onChange={handleEditPlayerInputChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeEditPlayerDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdatePlayer}>
                        Save changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default AdminPage