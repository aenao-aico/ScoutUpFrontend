import { useMemo, useState } from 'react'
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import PlayerCard from './PlayerCard'

const PlayerPool = ({ players, selectedPlayerIds }) => {
    const [search, setSearch] = useState('')
    const [positionFilter, setPositionFilter] = useState('')

    const availablePlayers = useMemo(() => {
        const trimmedSearch = search.trim().toLowerCase()

        return players
            .filter((player) => !selectedPlayerIds.includes(player.id))
            .filter((player) => {
                if (!positionFilter) {
                    return true
                }

                return player.position === positionFilter
            })
            .filter((player) => {
                if (!trimmedSearch) {
                    return true
                }

                const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
                const teamName = player.team?.name?.toLowerCase() ?? ''
                const nationality = player.nationality?.toLowerCase() ?? ''

                return (
                    fullName.includes(trimmedSearch) ||
                    teamName.includes(trimmedSearch) ||
                    nationality.includes(trimmedSearch) ||
                    player.position.toLowerCase().includes(trimmedSearch)
                )
            })
    }, [players, selectedPlayerIds, search, positionFilter])

    const positions = useMemo(() => {
        return Array.from(new Set(players.map((player) => player.position))).sort()
    }, [players])

    return (
        <Paper variant="outlined" className="player-pool">
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h5" className="squad-builder-panel-title">
                        Player Pool
                    </Typography>

                    <Typography color="text.secondary">
                        Drag players onto the pitch.
                    </Typography>
                </Box>

                <TextField
                    label="Search players"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Name, team, nationality..."
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Position</InputLabel>

                    <Select
                        label="Position"
                        value={positionFilter}
                        onChange={(event) => setPositionFilter(event.target.value)}
                    >
                        <MenuItem value="">All positions</MenuItem>

                        {positions.map((position) => (
                            <MenuItem key={position} value={position}>
                                {position}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                    {availablePlayers.length} available players
                </Typography>

                <Box className="player-pool-list">
                    {availablePlayers.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </Box>
            </Stack>
        </Paper>
    )
}

export default PlayerPool