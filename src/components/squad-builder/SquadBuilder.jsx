import { useMemo, useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import { Alert, Box, Stack } from '@mui/material'
import ChemistryPanel from './ChemistryPanel'
import FootballPitch from './FootballPitch'
import PlayerPool from './PlayerPool'
import { calculateChemistry } from './chemistry'
import { createEmptyLineup } from './formations'

const buildInitialLineup = (squad) => {
    const lineup = createEmptyLineup(squad.formation)

    const squadPlayers = squad.squad_players ?? []

    squadPlayers.forEach((squadPlayer) => {
        if (squadPlayer.slot && squadPlayer.player) {
            lineup[squadPlayer.slot] = squadPlayer.player
        }
    })

    return lineup
}

const SquadBuilder = ({ squad, players, onSave }) => {
    const [lineup, setLineup] = useState(() => buildInitialLineup(squad))
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    const selectedPlayerIds = useMemo(() => {
        return Object.values(lineup)
            .filter(Boolean)
            .map((player) => player.id)
    }, [lineup])

    const chemistry = useMemo(() => {
        return calculateChemistry(lineup, squad.formation)
    }, [lineup, squad.formation])

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (!over) {
            return
        }

        const overSlotKey = over.data.current?.slotKey
        const activeData = active.data.current

        if (!overSlotKey || !activeData) {
            return
        }

        setLineup((currentLineup) => {
            const nextLineup = { ...currentLineup }

            if (activeData.type === 'player') {
                const draggedPlayer = activeData.player

                const previousSlot = Object.keys(nextLineup).find((slotKey) => {
                    return nextLineup[slotKey]?.id === draggedPlayer.id
                })

                if (previousSlot) {
                    nextLineup[previousSlot] = null
                }

                nextLineup[overSlotKey] = draggedPlayer

                return nextLineup
            }

            if (activeData.type === 'slot-player') {
                const fromSlotKey = activeData.slotKey

                if (fromSlotKey === overSlotKey) {
                    return currentLineup
                }

                const movedPlayer = nextLineup[fromSlotKey]
                const targetPlayer = nextLineup[overSlotKey]

                nextLineup[overSlotKey] = movedPlayer
                nextLineup[fromSlotKey] = targetPlayer ?? null

                return nextLineup
            }

            return currentLineup
        })
    }

    const handleRemovePlayer = (slotKey) => {
        setLineup((currentLineup) => ({
            ...currentLineup,
            [slotKey]: null,
        }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setMessage('')

            const squadPlayersPayload = Object.entries(lineup)
                .filter(([, player]) => Boolean(player))
                .map(([slot, player]) => ({
                    slot,
                    player_id: player.id,
                }))

            await onSave({
                name: squad.name,
                formation: squad.formation,
                chemistry_score: chemistry.total,
                players: squadPlayersPayload,
            })

            setMessage('Squad saved successfully.')
        } catch (error) {
            setMessage(error.message || 'Could not save squad.')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Stack spacing={2}>
            {message && (
                <Alert
                    severity={message.includes('successfully') ? 'success' : 'error'}
                    onClose={() => setMessage('')}
                >
                    {message}
                </Alert>
            )}

            <DndContext onDragEnd={handleDragEnd}>
                <Box className="squad-builder-layout">
                    <PlayerPool
                        players={players}
                        selectedPlayerIds={selectedPlayerIds}
                    />

                    <FootballPitch
                        formation={squad.formation}
                        lineup={lineup}
                        onRemove={handleRemovePlayer}
                    />

                    <ChemistryPanel
                        chemistry={chemistry}
                        onSave={handleSave}
                        saving={saving}
                    />
                </Box>
            </DndContext>
        </Stack>
    )
}

export default SquadBuilder