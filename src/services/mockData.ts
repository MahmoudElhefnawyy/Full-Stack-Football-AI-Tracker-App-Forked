export const mockUser = {
    id: 'user_1',
    name: 'Mohamed',
    email: 'mohamed@gmail.com',
    avatar: 'MO',
    plan: 'Active Member',
    joinedDate: 'March 2026',
    stats: {
        totalVideos: 10,
        analyzed: 4,
        teamsTracked: 2,
        matchesReviewed: 8
    }
};

export const mockRecordings = [
    {
        id: 'rec_1',
        title: 'FC Green Eagles vs Black Panthers - League Match',
        date: '2026-03-03',
        duration: '90:00',
        status: 'Analyzed',
        thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
        homeTeam: 'FC Green Eagles',
        awayTeam: 'Black Panthers FC',
        score: '3-1'
    },
    {
        id: 'rec_2',
        title: 'Training Session - Tactical Drill',
        date: '2026-03-05',
        duration: '45:20',
        status: 'Processing',
        thumbnail: 'https://images.unsplash.com/photo-1526232761682-d26e43ac148e?q=80&w=800&auto=format&fit=crop',
        homeTeam: 'FC Green Eagles',
        awayTeam: 'N/A',
        score: null
    }
];

export const mockTeams = [
    {
        id: 'team_1',
        name: 'FC Green Eagles',
        stadium: 'Eagle Nest Stadium',
        coach: 'Marco Silva',
        founded: 2010,
        players: 11,
        stats: {
            wins: 18,
            draws: 4,
            losses: 2,
            goalsFor: 62,
            goalsAgainst: 21,
            avgRating: 8.2
        },
        attributes: {
            attack: 85,
            passing: 78,
            defense: 72,
            speed: 88,
            dribbling: 82,
            shooting: 80
        }
    },
    {
        id: 'team_2',
        name: 'Black Panthers FC',
        stadium: 'Panther Den',
        coach: 'Julian Rogers',
        founded: 2012,
        players: 11,
        stats: {
            wins: 12,
            draws: 5,
            losses: 7,
            goalsFor: 44,
            goalsAgainst: 30,
            avgRating: 7.6
        },
        attributes: {
            attack: 75,
            passing: 70,
            defense: 80,
            speed: 82,
            dribbling: 77,
            shooting: 74
        }
    }
];

export const mockPlayers = [
    {
        id: 'player_1',
        name: 'Alex Hunter',
        team: 'FC Green Eagles',
        position: 'Striker',
        number: 9,
        stats: {
            goals: 14,
            assists: 5,
            matchesPlayed: 20,
            rating: 8.6
        },
        attributes: [
            { subject: 'Pace', A: 90 },
            { subject: 'Shooting', A: 85 },
            { subject: 'Passing', A: 75 },
            { subject: 'Dribbling', A: 88 },
            { subject: 'Defending', A: 40 },
            { subject: 'Physical', A: 78 }
        ]
    },
    {
        id: 'player_2',
        name: 'Kevin De Start',
        team: 'FC Green Eagles',
        position: 'Midfielder',
        number: 10,
        stats: {
            goals: 6,
            assists: 15,
            matchesPlayed: 21,
            rating: 8.8
        },
        attributes: [
            { subject: 'Pace', A: 75 },
            { subject: 'Shooting', A: 82 },
            { subject: 'Passing', A: 95 },
            { subject: 'Dribbling', A: 86 },
            { subject: 'Defending', A: 65 },
            { subject: 'Physical', A: 70 }
        ]
    }
];

export const mockMatchEvents = [
    { id: 1, time: "12'", type: 'Goal', player: 'Alex Hunter', team: 'FC Green Eagles', description: 'Powerful strike from outside the box.' },
    { id: 2, time: "25'", type: 'Yellow Card', player: 'John Doe', team: 'Black Panthers FC', description: 'Late tackle.' },
    { id: 3, time: "44'", type: 'Goal', player: 'Kevin De Start', team: 'FC Green Eagles', description: 'Tap in after a great cross.' },
    { id: 4, time: "60'", type: 'Substitution', player: 'Sam Smith', team: 'Black Panthers FC', description: 'In for John Doe.' },
    { id: 5, time: "80'", type: 'Goal', player: 'Sam Smith', team: 'Black Panthers FC', description: 'Header from a corner kick.' },
    { id: 6, time: "89'", type: 'Goal', player: 'Alex Hunter', team: 'FC Green Eagles', description: 'Penalty converted.' },
];

export const mockHeatmapData = [
    { x: 10, y: 20, value: 5 }, { x: 15, y: 25, value: 8 }, { x: 20, y: 30, value: 12 },
    { x: 50, y: 50, value: 20 }, { x: 55, y: 45, value: 18 }, { x: 60, y: 60, value: 15 },
    { x: 80, y: 20, value: 10 }, { x: 85, y: 25, value: 7 }, { x: 90, y: 30, value: 4 },
];

export const performanceData = [
    { name: 'Match 1', value: 7.2 },
    { name: 'Match 2', value: 7.8 },
    { name: 'Match 3', value: 8.5 },
    { name: 'Match 4', value: 8.1 },
    { name: 'Match 5', value: 8.9 },
];

export const teamStatsDistribution = [
    { name: 'Possession', value: 65 },
    { name: 'Duels Won', value: 55 },
    { name: 'Pass Accuracy', value: 85 },
    { name: 'Shots on Target', value: 45 },
];
