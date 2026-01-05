import getFileContent from '@db/functions/get-file-content';
import { Study } from '@models';

export default async () => {
  const studies = await Study.find({ course: { $exists: true } }).lean();

  // Find the Jobava London studies
  const jobavaStudies = studies.filter((study) => study.name.startsWith('Jobava'));
  const randomStudies = studies.filter((study) => !study.name.startsWith('Jobava'));

  const videoBaseUrl = 'https://www.youtube.com/watch?v=jEG8dQ-ldYg';

  return [
    {
      study: jobavaStudies[0],
      index: 0,
      name: 'Jobava London: essential theory: English Attack',
      pgn: getFileContent('../pgn/jobava-london-0-english-attack.pgn'),
      video: `${videoBaseUrl}&t=0`,
    },
    {
      study: jobavaStudies[0],
      index: 1,
      name: 'Jobava London: essential theory: Pawn storm',
      pgn: getFileContent('../pgn/jobava-london-1-pawn-storm.pgn'),
      video: `${videoBaseUrl}&t=240`,
    },
    {
      study: jobavaStudies[0],
      index: 2,
      name: 'Jobava London: essential theory: The ...Bb4 pin (Colosseum structure)',
      pgn: getFileContent('../pgn/jobava-london-2-colosseum-structure.pgn'),
      video: `${videoBaseUrl}&t=480`,
    },
    {
      study: jobavaStudies[0],
      index: 3,
      name: "Jobava London: essential theory: The ...Be7 lines (Pandora's Box structure)",
      pgn: getFileContent('../pgn/jobava-london-3-pandoras-box-structure.pgn'),
      video: `${videoBaseUrl}&t=720`,
    },
    {
      study: jobavaStudies[0],
      index: 4,
      name: 'Jobava London: essential theory: The ...Bd6 lines (Boa-Snake structure)',
      pgn: getFileContent('../pgn/jobava-london-4-boa-snake-structure.pgn'),
      video: `${videoBaseUrl}&t=960`,
    },
    {
      study: jobavaStudies[0],
      index: 5,
      name: 'Jobava London: essential theory: The ...c5-lines',
      pgn: getFileContent('../pgn/jobava-london-5-c5-lines.pgn'),
      video: `${videoBaseUrl}&t=1200`,
    },
    {
      study: jobavaStudies[1],
      index: 0,
      name: 'Jobava London: essential theory: English Attack',
      pgn: getFileContent('../pgn/jobava-london-0-english-attack.pgn'),
      video: `${videoBaseUrl}&t=1440`,
    },
    {
      study: jobavaStudies[1],
      index: 1,
      name: 'Jobava London: essential theory: Pawn storm',
      pgn: getFileContent('../pgn/jobava-london-1-pawn-storm.pgn'),
      video: `${videoBaseUrl}&t=1680`,
    },
    {
      study: jobavaStudies[1],
      index: 2,
      name: 'Jobava London: essential theory: The ...Bb4 pin (Colosseum structure)',
      pgn: getFileContent('../pgn/jobava-london-2-colosseum-structure.pgn'),
      video: `${videoBaseUrl}&t=1920`,
    },
    {
      study: jobavaStudies[1],
      index: 3,
      name: "Jobava London: essential theory: The ...Be7 lines (Pandora's Box structure)",
      pgn: getFileContent('../pgn/jobava-london-3-pandoras-box-structure.pgn'),
      video: `${videoBaseUrl}&t=2160`,
    },
    {
      study: jobavaStudies[1],
      index: 4,
      name: 'Jobava London: essential theory: The ...Bd6 lines (Boa-Snake structure)',
      pgn: getFileContent('../pgn/jobava-london-4-boa-snake-structure.pgn'),
      video: `${videoBaseUrl}&t=2400`,
    },
    {
      study: jobavaStudies[1],
      index: 5,
      name: 'Jobava London: essential theory: The ...c5-lines',
      pgn: getFileContent('../pgn/jobava-london-5-c5-lines.pgn'),
      video: `${videoBaseUrl}&t=2640`,
    },
    {
      study: randomStudies[0],
      index: 0,
      name: 'Gukesh D - Ding, Liren (Game 1)',
      pgn: getFileContent('../pgn/gukesh-liren-game1.pgn'),
      video: `${videoBaseUrl}&t=2880`,
    },
    {
      study: randomStudies[0],
      index: 1,
      name: 'Ding, Liren - Gukesh D (Game 2)',
      pgn: getFileContent('../pgn/ding-gukesh-game2.pgn'),
      video: `${videoBaseUrl}&t=3120`,
    },
    {
      study: randomStudies[0],
      index: 2,
      name: 'Gukesh D - Ding, Liren (Game 3)',
      pgn: getFileContent('../pgn/gukesh-liren-game3.pgn'),
      video: `${videoBaseUrl}&t=3360`,
    },
    {
      study: randomStudies[0],
      index: 3,
      name: 'Ding, Liren - Gukesh D (Game 4)',
      pgn: getFileContent('../pgn/ding-gukesh-game4.pgn'),
      video: `${videoBaseUrl}&t=3600`,
    },
    {
      study: randomStudies[0],
      index: 4,
      name: 'Gukesh D - Ding, Liren (Game 5)',
      pgn: getFileContent('../pgn/gukesh-liren-game5.pgn'),
      video: `${videoBaseUrl}&t=3840`,
    },
    {
      study: randomStudies[1],
      index: 0,
      name: 'Gukesh D - Ding, Liren (Game 1)',
      pgn: getFileContent('../pgn/gukesh-liren-game1.pgn'),
      video: `${videoBaseUrl}&t=4080`,
    },
    {
      study: randomStudies[1],
      index: 1,
      name: 'Ding, Liren - Gukesh D (Game 2)',
      pgn: getFileContent('../pgn/ding-gukesh-game2.pgn'),
      video: `${videoBaseUrl}&t=4320`,
    },
    {
      study: randomStudies[1],
      index: 2,
      name: 'Gukesh D - Ding, Liren (Game 3)',
      pgn: getFileContent('../pgn/gukesh-liren-game3.pgn'),
      video: `${videoBaseUrl}&t=4560`,
    },
    {
      study: randomStudies[1],
      index: 3,
      name: 'Ding, Liren - Gukesh D (Game 4)',
      pgn: getFileContent('../pgn/ding-gukesh-game4.pgn'),
      video: `${videoBaseUrl}&t=4800`,
    },
    {
      study: randomStudies[1],
      index: 4,
      name: 'Gukesh D - Ding, Liren (Game 5)',
      pgn: getFileContent('../pgn/gukesh-liren-game5.pgn'),
      video: `${videoBaseUrl}&t=5040`,
    },
    {
      study: randomStudies[2],
      index: 0,
      name: 'Gukesh D - Ding, Liren (Game 1)',
      pgn: getFileContent('../pgn/gukesh-liren-game1.pgn'),
      video: `${videoBaseUrl}&t=5280`,
    },
    {
      study: randomStudies[2],
      index: 1,
      name: 'Ding, Liren - Gukesh D (Game 2)',
      pgn: getFileContent('../pgn/ding-gukesh-game2.pgn'),
      video: `${videoBaseUrl}&t=5520`,
    },
    {
      study: randomStudies[2],
      index: 2,
      name: 'Gukesh D - Ding, Liren (Game 3)',
      pgn: getFileContent('../pgn/gukesh-liren-game3.pgn'),
      video: `${videoBaseUrl}&t=5760`,
    },
    {
      study: randomStudies[2],
      index: 3,
      name: 'Ding, Liren - Gukesh D (Game 4)',
      pgn: getFileContent('../pgn/ding-gukesh-game4.pgn'),
      video: `${videoBaseUrl}&t=6000`,
    },
    {
      study: randomStudies[2],
      index: 4,
      name: 'Gukesh D - Ding, Liren (Game 5)',
      pgn: getFileContent('../pgn/gukesh-liren-game5.pgn'),
      video: `${videoBaseUrl}&t=6240`,
    },
    {
      study: randomStudies[3],
      index: 0,
      name: 'Gukesh D - Ding, Liren (Game 1)',
      pgn: getFileContent('../pgn/gukesh-liren-game1.pgn'),
      video: `${videoBaseUrl}&t=6480`,
    },
    {
      study: randomStudies[3],
      index: 1,
      name: 'Ding, Liren - Gukesh D (Game 2)',
      pgn: getFileContent('../pgn/ding-gukesh-game2.pgn'),
      video: `${videoBaseUrl}&t=6720`,
    },
    {
      study: randomStudies[3],
      index: 2,
      name: 'Gukesh D - Ding, Liren (Game 3)',
      pgn: getFileContent('../pgn/gukesh-liren-game3.pgn'),
      video: `${videoBaseUrl}&t=6960`,
    },
    {
      study: randomStudies[3],
      index: 3,
      name: 'Ding, Liren - Gukesh D (Game 4)',
      pgn: getFileContent('../pgn/ding-gukesh-game4.pgn'),
      video: `${videoBaseUrl}&t=7200`,
    },
    {
      study: randomStudies[3],
      index: 4,
      name: 'Gukesh D - Ding, Liren (Game 5)',
      pgn: getFileContent('../pgn/gukesh-liren-game5.pgn'),
      video: `${videoBaseUrl}&t=7440`,
    },
  ];
};
