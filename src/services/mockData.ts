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
    }
];
