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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

const requestJson = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function App() {
  const [activeTab, setActiveTab] = useState(0)

  const [teams, setTeams] = useState(null)
  const [players, setPlayers] = useState(null)

  const [error, setError] = useState('')

  const [teamFormData, setTeamFormData] = useState(emptyTeamForm)
  const [playerFormData, setPlayerFormData] = useState(emptyPlayerForm)

  const [teamSearch, setTeamSearch] = useState('')

  const [editingTeam, setEditingTeam] = useState(null)
  const [editTeamData, setEditTeamData] = useState(emptyTeamForm)

  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editPlayerData, setEditPlayerData] = useState(emptyPlayerForm)

  const teamsList = teams ?? []
  const playersList = players ?? []
  const loading = teams === null || players === null

  const getTeamsEndpoint = (searchValue = teamSearch) => {
    const trimmedSearch = searchValue.trim()

    if(!trimmedSearch) {
      return '/teams'
    }

    return `/teams?search=${encodeURIComponent(trimmedSearch)}`
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
          setError('Could not load data. Check if the Laravel backend is running.')
        }

        console.error(error)
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [])

  const refreshData = async (searchValue = teamSearch) => {
    try {
      setError('')

      const [teamsData, playersData] = await Promise.all([
        requestJson(getTeamsEndpoint(searchValue)),
        requestJson('/players'),
      ])

      setTeams(teamsData)
      setPlayers(playersData)
    } catch (error) {
      setError('Could not refresh data. Check if the Laravel backend is running.')
      console.error(error)
    }
  }

  const handleTeamSearchSubmit = async (event) => {
    console.log('Search clicked:', teamSearch)
    event.preventDefault()
    await refreshData(teamSearch)
  }

  const handleClearTeamSearch = async (
  ) => {
    setTeamSearch('')
    await refreshData('')
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
      setError('Could not create team.')
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
      setError('Could not create player.')
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
      setError('Could not update team.')
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
      setError('Could not update player.')
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
      setError('Could not delete team.')
      console.error(error)
    }
  }

  const handleDeletePlayer = async (playerId) => {
    const confirmed = window.confirm('Are you sure you want to delete this player?')

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
      setError('Could not delete player.')
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <SportsSoccerIcon color="primary" sx={{ mr: 1.5 }} />

            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
              ScoutUp
            </Typography>

          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
                variant="overline"
                color="primary"
                sx={{ fontWeight: 800, letterSpacing: 2 }}
            >
              Football scouting platform
            </Typography>

            <Typography variant="h2" sx={{ fontWeight: 900, mt: 1 }}>
              ScoutUp Dashboard
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              Manage football teams and players from a simple admin dashboard.
            </Typography>
          </Box>

          {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
              >
                <Stack direction="row" spacing={1}>
                  <Chip icon={<GroupsIcon />} label={`${teamsList.length} teams`} />
                  <Chip icon={<PersonIcon />} label={`${playersList.length} players`} />
                </Stack>

                <Button variant="outlined" onClick={refreshData}>
                  Refresh
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Teams" icon={<GroupsIcon />} iconPosition="start" />
              <Tab label="Players" icon={<PersonIcon />} iconPosition="start" />
            </Tabs>

            <CardContent>
              {activeTab === 0 && (
                  <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '360px 1fr' },
                        gap: 3,
                      }}
                  >
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <AddIcon color="primary" />
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
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
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                          Teams
                        </Typography>

                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          View, edit and delete football teams.
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Box
                            component="form"
                            onSubmit={handleTeamSearchSubmit}
                            sx={{
                              display: 'flex',
                              gap: 1,
                              mb: 2,
                            }}
                        >
                          <TextField
                              label="Search teams"
                              value={teamSearch}
                              onChange={(event) => setTeamSearch(event.currentTarget.value)}
                              placeholder="Search by name, city or stadium"
                              fullWidth
                          />

                          <Button type="submit" variant="contained">
                            Search
                          </Button>

                          <Button type="button" variant="outlined" onClick={handleClearTeamSearch}>
                            Clear
                          </Button>
                        </Box>

                        {loading ? (
                            <Typography color="text.secondary">Loading teams...</Typography>
                        ) : teamsList.length === 0 ? (
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                              <Typography color="text.secondary">
                                No teams found. Add your first team.
                              </Typography>
                            </Paper>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>City</TableCell>
                                    <TableCell>Stadium</TableCell>
                                    <TableCell>Founded</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {teamsList.map((team) => (
                                      <TableRow key={team.id} hover>
                                        <TableCell sx={{ fontWeight: 700 }}>
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
                  <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '360px 1fr' },
                        gap: 3,
                      }}
                  >
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <AddIcon color="primary" />
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Add player
                          </Typography>
                        </Stack>

                        {teamsList.length === 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              You need to add a team before adding players.
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleCreatePlayer}>
                          <Stack spacing={2}>
                            <FormControl fullWidth required disabled={teamsList.length === 0}>
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
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                          Players
                        </Typography>

                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          View, edit and delete football players.
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        {loading ? (
                            <Typography color="text.secondary">Loading players...</Typography>
                        ) : playersList.length === 0 ? (
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                              <Typography color="text.secondary">
                                No players found. Add your first player.
                              </Typography>
                            </Paper>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Team</TableCell>
                                    <TableCell>Position</TableCell>
                                    <TableCell>Age</TableCell>
                                    <TableCell>Nationality</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {playersList.map((player) => (
                                      <TableRow key={player.id} hover>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                          {player.first_name} {player.last_name}
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
            <Stack spacing={2} sx={{ mt: 1 }}>
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
            <Stack spacing={2} sx={{ mt: 1 }}>
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

export default App