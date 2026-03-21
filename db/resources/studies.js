import { Course, Professor } from '@models';

// Maps course name → professor email (mirrors courses.js author assignments)
const courseAuthorMap = {
  'Sicilian Defense Mastery': 'alex.banzea@email.com',
  'Jobava London System': 'alex.banzea@email.com',
  'Tactics Mastery: From Beginner to Expert': 'alex.banzea@email.com',
  "King's Indian Defense": 'grandmaster@email.com',
  'Advanced Endgame Strategy': 'grandmaster@email.com',
  'The Ruy Lopez (Spanish Opening)': 'grandmaster@email.com',
  'Positional Play & Strategy': 'strategy@email.com',
  'Attacking Secrets': 'strategy@email.com',
  'Chess Fundamentals': 'strategy@email.com',
};

const studyBlueprints = {
  'Sicilian Defense Mastery': [
    { name: 'Sicilian Najdorf Foundations', icon: 'fa-water', color: '#155e75' },
    { name: 'Anti-Sicilian Playbook', icon: 'fa-shield-halved', color: '#7c2d12' },
    { name: 'Sicilian Tactics Lab', icon: 'fa-bolt', color: '#7f1d1d' },
    { name: 'Sicilian Dragon & Scheveningen Lab', icon: 'fa-dragon', color: '#991b1b' },
  ],
  'Jobava London System': [
    { name: 'Jobava Essential Structures', icon: 'fa-chess-board', color: '#1d4ed8' },
    { name: 'Jobava Attacking Frameworks', icon: 'fa-bullseye', color: '#9333ea' },
    { name: 'Jobava Starter Exercises', icon: 'fa-puzzle-piece', color: '#0f766e' },
    { name: 'London Move-Orders & Sidelines', icon: 'fa-route', color: '#0369a1' },
  ],
  'Tactics Mastery: From Beginner to Expert': [
    { name: 'Core Tactical Motifs', icon: 'fa-crosshairs', color: '#991b1b' },
    { name: 'Calculation Under Pressure', icon: 'fa-stopwatch', color: '#92400e' },
    { name: 'Mixed Exercise Pack', icon: 'fa-fire', color: '#be123c' },
    { name: 'Master-Level Combination Themes', icon: 'fa-brain', color: '#7c2d12' },
  ],
  "King's Indian Defense": [
    { name: 'KID Classical Setup', icon: 'fa-chess-king', color: '#14532d' },
    { name: 'Mar del Plata Attack Plans', icon: 'fa-mountain-sun', color: '#7c3aed' },
    { name: 'Fianchetto Counterplay', icon: 'fa-arrows-left-right', color: '#1e3a8a' },
    { name: 'KID Universal Attack Plans', icon: 'fa-chess-knight', color: '#b45309' },
  ],
  'Advanced Endgame Strategy': [
    { name: 'King and Pawn Essentials', icon: 'fa-chess-pawn', color: '#166534' },
    { name: 'Rook Endgame Technique', icon: 'fa-chess-rook', color: '#0f766e' },
    { name: 'Minor Piece Endgames', icon: 'fa-chess-knight', color: '#7c2d12' },
    { name: 'Practical Endgame Studies', icon: 'fa-clipboard-list', color: '#1e40af' },
  ],
  'The Ruy Lopez (Spanish Opening)': [
    { name: 'Closed Ruy Lopez Plans', icon: 'fa-chess-bishop', color: '#1d4ed8' },
    { name: 'Open Spanish Tactics', icon: 'fa-swords', color: '#9a3412' },
    { name: 'Ruy Lopez Endgame Structures', icon: 'fa-diagram-project', color: '#475569' },
    { name: 'Spanish Critical Lines', icon: 'fa-flag', color: '#b91c1c' },
  ],
  'Positional Play & Strategy': [
    { name: 'Model Strategic Games', icon: 'fa-book-open-reader', color: '#334155' },
    { name: 'Pawn Structure Workshop', icon: 'fa-cubes-stacked', color: '#1f2937' },
    { name: 'Prophylaxis and Improvement', icon: 'fa-shield-heart', color: '#0f766e' },
    { name: 'Strategic Plans Capsule', icon: 'fa-compass', color: '#4f46e5' },
  ],
  'Attacking Secrets': [
    { name: 'Kingside Attack Patterns', icon: 'fa-burst', color: '#b91c1c' },
    { name: 'Sacrifice Case Studies', icon: 'fa-hand-fist', color: '#7c2d12' },
    { name: 'Initiative Management', icon: 'fa-forward', color: '#9f1239' },
    { name: 'Practical Attack Workshop', icon: 'fa-fire-flame-curved', color: '#ea580c' },
  ],
  'Chess Fundamentals': [
    { name: 'Opening Principles', icon: 'fa-graduation-cap', color: '#0369a1' },
    { name: 'Basic Checkmates', icon: 'fa-chess-queen', color: '#7c3aed' },
    { name: 'First Tactical Patterns', icon: 'fa-lightbulb', color: '#0f766e' },
    { name: 'Club Player Starter Drills', icon: 'fa-dumbbell', color: '#059669' },
  ],
};

export default async () => {
  const courses = await Course.find().lean();
  const professors = await Professor.find().lean();
  const professorByEmail = Object.fromEntries(professors.map((p) => [p.email, p]));

  return courses.flatMap((course) => {
    const blueprints = studyBlueprints[course.name] || [];
    const authorEmail = courseAuthorMap[course.name];
    const professor = professorByEmail[authorEmail] || professors[0];
    const author = professor ? { _id: professor._id, name: professor.name } : undefined;

    return blueprints.map((study) => ({
      ...study,
      author,
      chapters: [],
      course: course._id,
      active: true,
    }));
  });
};
