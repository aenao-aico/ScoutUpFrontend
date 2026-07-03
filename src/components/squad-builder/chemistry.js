import { getFormationSlots } from './formations'

const getSelectedPlayers = (lineup) => {
    return Object.values(lineup).filter(Boolean)
}

const countSameValueLinks = (players, getValue) => {
    let links = 0

    for (let i = 0; i < players.length; i += 1) {
        for (let j = i + 1; j < players.length; j += 1) {
            const firstValue = getValue(players[i])
            const secondValue = getValue(players[j])

            if (firstValue && secondValue && firstValue === secondValue) {
                links += 1
            }
        }
    }

    return links
}

export const calculateChemistry = (lineup, formation = '4-3-3') => {
    const slots = getFormationSlots(formation)
    const selectedPlayers = getSelectedPlayers(lineup)
    const totalSlots = slots.length

    const positionMatches = slots.filter((slot) => {
        const player = lineup[slot.key]

        return player?.position === slot.position
    }).length

    const sameTeamLinks = countSameValueLinks(
        selectedPlayers,
        (player) => player.team_id ?? player.team?.id,
    )

    const sameNationalityLinks = countSameValueLinks(
        selectedPlayers,
        (player) => player.nationality,
    )

    const sameLeagueLinks = countSameValueLinks(
        selectedPlayers,
        (player) => player.team?.league,
    )

    const completionScore = Math.round((selectedPlayers.length / totalSlots) * 10)
    const positionScore = Math.round((positionMatches / totalSlots) * 40)
    const teamScore = Math.min(sameTeamLinks * 3, 20)
    const nationalityScore = Math.min(sameNationalityLinks * 2, 20)
    const leagueScore = Math.min(sameLeagueLinks * 2, 10)

    const total = Math.min(
        completionScore + positionScore + teamScore + nationalityScore + leagueScore,
        100,
    )

    return {
        total,
        selectedPlayers: selectedPlayers.length,
        totalSlots,
        positionMatches,
        sameTeamLinks,
        sameNationalityLinks,
        sameLeagueLinks,
        completionScore,
        positionScore,
        teamScore,
        nationalityScore,
        leagueScore,
    }
}