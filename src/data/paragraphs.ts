import type { ErrorType, Paragraph, Token } from '../types';

type ErrorMap = Record<number, [ErrorType, string]>;

function build(
  id: string,
  title: string,
  raw: string,
  errors: ErrorMap,
): Paragraph {
  const words = raw.split(/\s+/).filter(Boolean);
  const tokens: Token[] = words.map((text, i) => {
    const e = errors[i];
    if (!e) return { text };
    const [type, correct] = e;
    // If the correction is just the original word with a single trailing
    // punctuation mark added, treat it as a "missing punctuation" error
    // that lives in the gap *after* the word, not on the word itself —
    // this lets the user click between the words to insert it.
    if (correct.startsWith(text)) {
      const tail = correct.slice(text.length);
      if (/^[,;:.!?]$/.test(tail)) {
        return { text, gapError: { type, correct: tail } };
      }
    }
    return { text, error: { type, correct } };
  });
  for (const idx of Object.keys(errors)) {
    if (Number(idx) >= words.length) {
      throw new Error(`Paragraph "${id}" error index ${idx} out of range`);
    }
  }
  return { id, title, tokens };
}

export const PARAGRAPHS: Paragraph[] = [
  build(
    'park',
    'A Day at the Park',
    "my friend Sara and i went too the park on saturday. We brought sandwiches, juice boxes, and a frisbee. It was a sunny day so we played for hours. When we got tired we sat under a big oak tree and wached the clouds drift by.",
    {
      0: ['capitalization', 'My'],
      4: ['capitalization', 'I'],
      6: ['grammar', 'to'],
      10: ['capitalization', 'Saturday.'],
      23: ['punctuation', 'day,'],
      32: ['punctuation', 'tired,'],
      41: ['spelling', 'watched'],
    },
  ),
  build(
    'cafeteria',
    'Lunch in the Cafeteria',
    "Lunchtime is the best part of my day. The cafetiria gets crowded fast so my friends and i race to grab a table by the window. I usually buy a slice of pizza but today I packed a turky sandwich. We talk about teachers, homework, and weekend plans untill the bell rings.",
    {
      9: ['spelling', 'cafeteria'],
      12: ['punctuation', 'fast,'],
      17: ['capitalization', 'I'],
      32: ['punctuation', 'pizza,'],
      38: ['spelling', 'turkey'],
      48: ['spelling', 'until'],
    },
  ),
  build(
    'hamster',
    'Mr. Whiskers',
    "i have a hamster named mr. Whiskers. He lives in a cage on my dresser where he runs on his wheel almost every night. Sometimes he stuffs his cheeks so full of food that he can barely walk back too his nest. My little sister thinks hes the funniest pet we have ever owned.",
    {
      0: ['capitalization', 'I'],
      5: ['capitalization', 'Mr.'],
      14: ['punctuation', 'dresser,'],
      39: ['grammar', 'to'],
      46: ['punctuation', "he's"],
    },
  ),
  build(
    'science-fair',
    'The Science Fair',
    "Last month our class entered the science fair. My partner jake and i built a working volcano out of clay and baking soda. When we mixed in the vineger, lava bubbled out and ran down the sides. The judges were impresed but they said our display board needed more reserch. we came in third place which felt like a victory anyway.",
    {
      1: ['punctuation', 'month,'],
      10: ['capitalization', 'Jake'],
      12: ['capitalization', 'I'],
      28: ['spelling', 'vinegar,'],
      40: ['spelling', 'impressed'],
      49: ['spelling', 'research.'],
      50: ['capitalization', 'We'],
      54: ['punctuation', 'place,'],
    },
  ),
  build(
    'soccer',
    'Soccer Practice',
    "Every tuesday after school our soccer team practices at lincoln Field. Coach davis always makes us run laps before we touch the ball. After warm-ups we split into two teams and scrimadge for an hour. By the time practice ends my legs feel like jelly and i am starving.",
    {
      1: ['capitalization', 'Tuesday'],
      3: ['punctuation', 'school,'],
      9: ['capitalization', 'Lincoln'],
      12: ['capitalization', 'Davis'],
      24: ['punctuation', 'warm-ups,'],
      31: ['spelling', 'scrimmage'],
      39: ['punctuation', 'ends,'],
      46: ['capitalization', 'I'],
    },
  ),
  build(
    'dance',
    'The School Dance',
    "Last friday night our school held it's first dance of the year. The gym was decorated with baloons, streamers, and twinkling lights. a DJ played music while everyone laughed and tryed out new dance moves. By the end of the night my feet were sore but my smile was huge.",
    {
      1: ['capitalization', 'Friday'],
      2: ['punctuation', 'night,'],
      6: ['grammar', 'its'],
      17: ['spelling', 'balloons,'],
      22: ['capitalization', 'A'],
      30: ['spelling', 'tried'],
      40: ['punctuation', 'night,'],
    },
  ),
  build(
    'library',
    'A Trip to the Library',
    "I love spending saturday afternoons at the public library. The quiet rooms upstairs are perfect for getting homework done. Sometimes I pick a thick novel from the shelf and loose track of time completly. Before i leave I always grab a stack of books to take home for the week.",
    {
      3: ['capitalization', 'Saturday'],
      29: ['grammar', 'lose'],
      33: ['spelling', 'completely.'],
      35: ['capitalization', 'I'],
      36: ['punctuation', 'leave,'],
    },
  ),
  build(
    'beach',
    'A Trip to the Beach',
    "We drove too the beach early in the morning to beat the crowds. The waves were huge that day and the seagulls swooped overhead looking for snacks. My brother and i built a sandcastle taller then any I had ever made. By lunchtime we were exausted salty and happy.",
    {
      2: ['grammar', 'to'],
      18: ['punctuation', 'day,'],
      30: ['capitalization', 'I'],
      35: ['grammar', 'than'],
      42: ['punctuation', 'lunchtime,'],
      45: ['spelling', 'exhausted'],
    },
  ),
  build(
    'old-house',
    'The Old House on Maple Street',
    "Down at the end of maple street stood the old henderson house which had been empty for years. We dared each other to walk up the cracked porch and ring the bell, even though we knew nobody would answer. Strange shadows seemed too move behind the cloudy windows whenever we looked. Even our toughest friend Marcus refused to step inside on halloween night.",
    {
      5: ['capitalization', 'Maple'],
      6: ['capitalization', 'Street'],
      10: ['capitalization', 'Henderson'],
      11: ['punctuation', 'house,'],
      42: ['grammar', 'to'],
      54: ['punctuation', 'friend,'],
      55: ['punctuation', 'Marcus,'],
      61: ['capitalization', 'Halloween'],
    },
  ),
  build(
    'cooking',
    'Cooking Dinner with Dad',
    "On sunday evenings my dad and I cook dinner together while my mom relaxes. Last week we tryed a new speghetti recipe that we found in an old cookbook. The kitchen was a mess by the end but the meatballs turned out incredable. We agreed it was the best meal we had made all year.",
    {
      1: ['capitalization', 'Sunday'],
      2: ['punctuation', 'evenings,'],
      17: ['spelling', 'tried'],
      20: ['spelling', 'spaghetti'],
      35: ['punctuation', 'end,'],
      42: ['spelling', 'incredible.'],
    },
  ),
  build(
    'first-day',
    'First Day of Middle School',
    "On the first day of sixth grade i was so nervous that I barely ate breakfast. My mom dropped me off gave me a quick hug, and reminded me too be brave. The halways felt enourmous and every locker looked exactly the same. Somehow I made it to homeroom found a seat, and the year began.",
    {
      6: ['punctuation', 'grade,'],
      7: ['capitalization', 'I'],
      20: ['punctuation', 'off,'],
      29: ['grammar', 'to'],
      33: ['spelling', 'hallways'],
      35: ['spelling', 'enormous'],
      48: ['punctuation', 'homeroom,'],
    },
  ),
  build(
    'camping',
    'Camping in the Mountains',
    "When we go camping in the mountains my favorite part is sitting around the campfire at night. Dad tells the same scary stories every year but my little brother still jumps at every twig that snaps. We roast marshmellows untill they are golden then squish them between graham crackers. By the time we crawl into our sleeping bags our cheeks ake from laughing.",
    {
      6: ['punctuation', 'mountains,'],
      24: ['punctuation', 'year,'],
      38: ['spelling', 'marshmallows'],
      39: ['spelling', 'until'],
      42: ['punctuation', 'golden,'],
      57: ['punctuation', 'bags,'],
      60: ['spelling', 'ache'],
    },
  ),
  build(
    'talent-show',
    'The Talent Show',
    "Auditions for the talent show were held last wednesday after school. My best friend lila signed up to sing but I chose to do magic tricks instead. We practiced every afternoon for three weeks untill our acts felt smoth. When the curtain finally rose my hands were shaking but my voice stayed calm.",
    {
      8: ['capitalization', 'Wednesday'],
      14: ['capitalization', 'Lila'],
      18: ['punctuation', 'sing,'],
      34: ['spelling', 'until'],
      38: ['spelling', 'smooth.'],
      43: ['punctuation', 'rose,'],
    },
  ),
  build(
    'big-game',
    'The Big Game',
    "By halftime our basketball team was down by twelve points and the crowd had gone quite. Coach gathered us in the locker room and reminded us that nothing was over yet. When the second half started we played with a focuse we had never shown before. With three seconds left our point gaurd sank a buzzer-beater and the gym exploaded.",
    {
      1: ['punctuation', 'halftime,'],
      9: ['punctuation', 'points,'],
      15: ['grammar', 'quiet.'],
      35: ['punctuation', 'started,'],
      40: ['spelling', 'focus'],
      49: ['punctuation', 'left,'],
      52: ['spelling', 'guard'],
      59: ['spelling', 'exploded.'],
    },
  ),
  build(
    'museum',
    'The Field Trip',
    "Our class took a feild trip to the natural history museum last friday. We saw dinosaur bones, a real meteorite, and a model of the human heart that was bigger then a car. Mrs. Patterson reminded us to stay together but I kept wandering torward the gift shop. By the end of the afternoon my notebook was full of skeches and questions.",
    {
      4: ['spelling', 'field'],
      12: ['capitalization', 'Friday.'],
      29: ['grammar', 'than'],
      38: ['punctuation', 'together,'],
      43: ['spelling', 'toward'],
      53: ['punctuation', 'afternoon,'],
      59: ['spelling', 'sketches'],
    },
  ),
];

export function countErrorsByType(p: Paragraph): Record<ErrorType, number> {
  const out: Record<ErrorType, number> = {
    spelling: 0,
    punctuation: 0,
    capitalization: 0,
    grammar: 0,
  };
  for (const t of p.tokens) {
    if (t.error) out[t.error.type]++;
    if (t.gapError) out[t.gapError.type]++;
  }
  return out;
}

export function totalErrors(p: Paragraph): number {
  return p.tokens.reduce(
    (n, t) => n + (t.error ? 1 : 0) + (t.gapError ? 1 : 0),
    0,
  );
}
