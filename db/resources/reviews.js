import { Course, Identity } from '@models';

const reviewSetsByCourse = {
  'Sicilian Defense Mastery': [
    {
      name: 'Worth every euro',
      review:
        'The Najdorf section finally made 6...e5 lines click for me. The drills against the English Attack are exactly what I needed.',
      rating: 5,
    },
    {
      name: 'Deep but clear',
      review:
        'Lots of theory, but the chapter pacing keeps it manageable. Anti-Sicilian chapter alone paid for the course.',
      rating: 4,
    },
    {
      name: 'My black repertoire anchor',
      review:
        'I play the Sicilian in league games now with way more confidence. Tactics lab positions are memorable.',
      rating: 5,
    },
  ],
  'Jobava London System': [
    {
      name: 'Aggressive London that works',
      review:
        'Finally a London course that is not boring. The Colosseum and Boa-snake structures are explained with real plans.',
      rating: 5,
    },
    {
      name: 'Great for club players',
      review:
        'Interactive exercises helped me remember the move orders. Small price for how much I use this in rapid.',
      rating: 4,
    },
  ],
  'Tactics Mastery: From Beginner to Expert': [
    {
      name: 'Calculation boot camp',
      review:
        'Mixed pack is brutal in a good way. I revisit the deflection and attraction chapters before tournaments.',
      rating: 5,
    },
    {
      name: 'Saw patterns I was missing',
      review:
        'Forks and pins chapter sounds basic but the positions are sharp. Rating feels accurate for intermediate.',
      rating: 4,
    },
    {
      name: 'Daily puzzles habit',
      review:
        'Short chapters make it easy to do one a day. My blunder rate dropped noticeably after two weeks.',
      rating: 5,
    },
  ],
  "King's Indian Defense": [
    {
      name: 'Mar del Plata gold',
      review:
        'The kingside attack plans are laid out step by step. Fianchetto section covers lines I never understood before.',
      rating: 5,
    },
    {
      name: 'For committed KID players',
      review:
        'Advanced material — not a quick fix. Classical setup chapters match what I see most often online.',
      rating: 4,
    },
  ],
  'Advanced Endgame Strategy': [
    {
      name: 'Lucena and Philidor done right',
      review:
        'Rook endgames were my weakness; the technique chapters are concise and the FEN exercises stick.',
      rating: 5,
    },
    {
      name: 'Minor piece gems',
      review:
        'Good knight vs bad bishop section mirrors positions from my own games. King and pawn opposition drills are solid.',
      rating: 4,
    },
  ],
  'The Ruy Lopez (Spanish Opening)': [
    {
      name: 'Closed Spanish roadmap',
      review:
        'Main line development and d4 break chapters connect well. Open Spanish tactics saved me a few blitz games.',
      rating: 5,
    },
    {
      name: 'Endgame chapter bonus',
      review:
        'Did not expect the Spanish ending structures to be this useful. Minority attack ideas carry to other openings.',
      rating: 4,
    },
  ],
  'Positional Play & Strategy': [
    {
      name: 'Model games are inspiring',
      review:
        'Gukesh–Ding games with commentary-style flow helped my strategic intuition. Pawn structure workshop is dense but good.',
      rating: 5,
    },
    {
      name: 'Prophylaxis clicked',
      review:
        'The prophylaxis exercises feel like real games. I stop fewer premature attacks now.',
      rating: 4,
    },
  ],
  'Attacking Secrets': [
    {
      name: 'h7 sacrifice explained',
      review:
        'Greek gift chapter shows when it works and when it does not. Initiative management chapter ties it together.',
      rating: 5,
    },
    {
      name: 'Fun attacking chess',
      review:
        'Sacrifice case studies are dramatic but instructive. Good bridge from tactics courses to real attacks.',
      rating: 4,
    },
  ],
  'Chess Fundamentals': [
    {
      name: 'Perfect free starter',
      review:
        'Opening principles and basic mates got my nephew playing real games in a week. Clear and friendly.',
      rating: 5,
    },
    {
      name: 'Back to basics win',
      review:
        'I came back to chess after years; first tactical patterns chapter was a confidence boost. Great free resource.',
      rating: 5,
    },
  ],
};

export default async () => {
  const [courses, clients] = await Promise.all([
    Course.find().lean(),
    Identity.find({ __t: 'client' }).lean(),
  ]);

  if (!clients.length) {
    return [];
  }

  const courseByName = Object.fromEntries(courses.map((c) => [c.name, c]));

  return Object.entries(reviewSetsByCourse).flatMap(([courseName, items]) => {
    const course = courseByName[courseName];
    if (!course) {
      return [];
    }

    return items.map((item, index) => {
      const client = clients[index % clients.length];

      return {
        approved: true,
        course: { _id: course._id, name: course.name },
        name: item.name,
        rating: item.rating,
        review: item.review,
        user: client._id,
      };
    });
  });
};
