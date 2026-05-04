import type { ErrorType, Paragraph, Token } from '../types';

const SP: ErrorType = 'spelling';
const PN: ErrorType = 'punctuation';
const CP: ErrorType = 'capitalization';
const GR: ErrorType = 'grammar';

type ErrorSpec = [match: string, type: ErrorType, correct: string];

/**
 * Build a paragraph by matching error tokens by their *text* (in order)
 * rather than by index. Eliminates off-by-one bugs when authoring data.
 *
 * The tokenizer walks the raw text left-to-right, consuming tokens as it
 * matches. Each error spec finds the next occurrence of `match` that hasn't
 * been claimed yet. Throws at module load time if a match can't be found.
 */
function P(
  id: string,
  title: string,
  raw: string,
  errors: ErrorSpec[],
): Paragraph {
  const words = raw.split(/\s+/).filter(Boolean);
  let pos = 0;
  const tokens: Token[] = words.map((text) => ({ text }));

  for (const [match, type, correct] of errors) {
    while (pos < words.length && words[pos] !== match) pos++;
    if (pos >= words.length) {
      throw new Error(
        `Paragraph "${id}": cannot find "${match}" past position ${pos} in raw text`,
      );
    }
    // Detect "missing trailing punctuation" → gapError, otherwise word error.
    if (correct.startsWith(match)) {
      const tail = correct.slice(match.length);
      if (/^[,;:.!?]$/.test(tail)) {
        tokens[pos] = { text: match, gapError: { type, correct: tail } };
        pos++;
        continue;
      }
    }
    tokens[pos] = { text: match, error: { type, correct } };
    pos++;
  }

  return { id, title, tokens };
}

export const PARAGRAPHS: Paragraph[] = [
  P(
    'park',
    'A Day at the Park',
    "my friend Sara and i went too the park on saturday. We brought sandwiches, juice boxes, and a frisbee. It was a sunny day so we played for hours. When we got tired we sat under a big oak tree and wached the clouds drift by.",
    [
      ['my', CP, 'My'],
      ['i', CP, 'I'],
      ['too', GR, 'to'],
      ['saturday.', CP, 'Saturday.'],
      ['day', PN, 'day,'],
      ['tired', PN, 'tired,'],
      ['wached', SP, 'watched'],
    ],
  ),
  P(
    'cafeteria',
    'Lunch in the Cafeteria',
    "Lunchtime is the best part of my day. The cafetiria gets crowded fast so my friends and i race to grab a table by the window. I usually buy a slice of pizza but today I packed a turky sandwich. We talk about teachers, homework, and weekend plans untill the bell rings.",
    [
      ['cafetiria', SP, 'cafeteria'],
      ['fast', PN, 'fast,'],
      ['i', CP, 'I'],
      ['pizza', PN, 'pizza,'],
      ['turky', SP, 'turkey'],
      ['untill', SP, 'until'],
    ],
  ),
  P(
    'hamster',
    'Mr. Whiskers',
    "i have a hamster named mr. Whiskers. He lives in a cage on my dresser where he runs on his wheel almost every night. Sometimes he stuffs his cheeks so full of food that he can barely walk back too his nest. My little sister thinks hes the funniest pet we have ever owned.",
    [
      ['i', CP, 'I'],
      ['mr.', CP, 'Mr.'],
      ['dresser', PN, 'dresser,'],
      ['too', GR, 'to'],
      ['hes', PN, "he's"],
    ],
  ),
  P(
    'science-fair',
    'The Science Fair',
    "Last month our class entered the science fair. My partner jake and i built a working volcano out of clay and baking soda. When we mixed in the vineger, lava bubbled out and ran down the sides. The judges were impresed but they said our display board needed more reserch. we came in third place which felt like a victory anyway.",
    [
      ['month', PN, 'month,'],
      ['jake', CP, 'Jake'],
      ['i', CP, 'I'],
      ['vineger,', SP, 'vinegar,'],
      ['impresed', SP, 'impressed'],
      ['reserch.', SP, 'research.'],
      ['we', CP, 'We'],
      ['place', PN, 'place,'],
    ],
  ),
  P(
    'soccer',
    'Soccer Practice',
    "Every tuesday after school our soccer team practices at lincoln Field. Coach davis always makes us run laps before we touch the ball. After warm-ups we split into two teams and scrimadge for an hour. By the time practice ends my legs feel like jelly and i am starving.",
    [
      ['tuesday', CP, 'Tuesday'],
      ['school', PN, 'school,'],
      ['lincoln', CP, 'Lincoln'],
      ['davis', CP, 'Davis'],
      ['warm-ups', PN, 'warm-ups,'],
      ['scrimadge', SP, 'scrimmage'],
      ['ends', PN, 'ends,'],
      ['i', CP, 'I'],
    ],
  ),
  P(
    'dance',
    'The School Dance',
    "Last friday night our school held it's first dance of the year. The gym was decorated with baloons, streamers, and twinkling lights. a DJ played music while everyone laughed and tryed out new dance moves. By the end of the night my feet were sore but my smile was huge.",
    [
      ['friday', CP, 'Friday'],
      ['night', PN, 'night,'],
      ["it's", GR, 'its'],
      ['baloons,', SP, 'balloons,'],
      ['a', CP, 'A'],
      ['tryed', SP, 'tried'],
      ['night', PN, 'night,'],
    ],
  ),
  P(
    'library',
    'A Trip to the Library',
    "I love spending saturday afternoons at the public library. The quiet rooms upstairs are perfect for getting homework done. Sometimes I pick a thick novel from the shelf and loose track of time completly. Before i leave I always grab a stack of books to take home for the week.",
    [
      ['saturday', CP, 'Saturday'],
      ['loose', GR, 'lose'],
      ['completly.', SP, 'completely.'],
      ['i', CP, 'I'],
      ['leave', PN, 'leave,'],
    ],
  ),
  P(
    'beach',
    'A Trip to the Beach',
    "We drove too the beach early in the morning to beat the crowds. The waves were huge that day and the seagulls swooped overhead looking for snacks. My brother and i built a sandcastle taller then any I had ever made. By lunchtime we were exausted salty and happy.",
    [
      ['too', GR, 'to'],
      ['day', PN, 'day,'],
      ['i', CP, 'I'],
      ['then', GR, 'than'],
      ['lunchtime', PN, 'lunchtime,'],
      ['exausted', SP, 'exhausted'],
    ],
  ),
  P(
    'old-house',
    'The Old House on Maple Street',
    "Down at the end of maple street stood the old henderson house which had been empty for years. We dared each other to walk up the cracked porch and ring the bell, even though we knew nobody would answer. Strange shadows seemed too move behind the cloudy windows whenever we looked. Even our toughest friend Marcus refused to step inside on halloween night.",
    [
      ['maple', CP, 'Maple'],
      ['street', CP, 'Street'],
      ['henderson', CP, 'Henderson'],
      ['house', PN, 'house,'],
      ['too', GR, 'to'],
      ['friend', PN, 'friend,'],
      ['Marcus', PN, 'Marcus,'],
      ['halloween', CP, 'Halloween'],
    ],
  ),
  P(
    'cooking',
    'Cooking Dinner with Dad',
    "On sunday evenings my dad and I cook dinner together while my mom relaxes. Last week we tryed a new speghetti recipe that we found in an old cookbook. The kitchen was a mess by the end but the meatballs turned out incredable. We agreed it was the best meal we had made all year.",
    [
      ['sunday', CP, 'Sunday'],
      ['evenings', PN, 'evenings,'],
      ['tryed', SP, 'tried'],
      ['speghetti', SP, 'spaghetti'],
      ['end', PN, 'end,'],
      ['incredable.', SP, 'incredible.'],
    ],
  ),
  P(
    'first-day',
    'First Day of Middle School',
    "On the first day of sixth grade i was so nervous that I barely ate breakfast. My mom dropped me off gave me a quick hug, and reminded me too be brave. The halways felt enourmous and every locker looked exactly the same. Somehow I made it to homeroom found a seat, and the year began.",
    [
      ['grade', PN, 'grade,'],
      ['i', CP, 'I'],
      ['off', PN, 'off,'],
      ['too', GR, 'to'],
      ['halways', SP, 'hallways'],
      ['enourmous', SP, 'enormous'],
      ['homeroom', PN, 'homeroom,'],
    ],
  ),
  P(
    'camping',
    'Camping in the Mountains',
    "When we go camping in the mountains my favorite part is sitting around the campfire at night. Dad tells the same scary stories every year but my little brother still jumps at every twig that snaps. We roast marshmellows untill they are golden then squish them between graham crackers. By the time we crawl into our sleeping bags our cheeks ake from laughing.",
    [
      ['mountains', PN, 'mountains,'],
      ['year', PN, 'year,'],
      ['marshmellows', SP, 'marshmallows'],
      ['untill', SP, 'until'],
      ['golden', PN, 'golden,'],
      ['bags', PN, 'bags,'],
      ['ake', SP, 'ache'],
    ],
  ),
  P(
    'talent-show',
    'The Talent Show',
    "Auditions for the talent show were held last wednesday after school. My best friend lila signed up to sing but I chose to do magic tricks instead. We practiced every afternoon for three weeks untill our acts felt smoth. When the curtain finally rose my hands were shaking but my voice stayed calm.",
    [
      ['wednesday', CP, 'Wednesday'],
      ['lila', CP, 'Lila'],
      ['sing', PN, 'sing,'],
      ['untill', SP, 'until'],
      ['smoth.', SP, 'smooth.'],
      ['rose', PN, 'rose,'],
    ],
  ),
  P(
    'big-game',
    'The Big Game',
    "By halftime our basketball team was down by twelve points and the crowd had gone quite. Coach gathered us in the locker room and reminded us that nothing was over yet. When the second half started we played with a focuse we had never shown before. With three seconds left our point gaurd sank a buzzer-beater and the gym exploaded.",
    [
      ['halftime', PN, 'halftime,'],
      ['points', PN, 'points,'],
      ['quite.', GR, 'quiet.'],
      ['started', PN, 'started,'],
      ['focuse', SP, 'focus'],
      ['left', PN, 'left,'],
      ['gaurd', SP, 'guard'],
      ['exploaded.', SP, 'exploded.'],
    ],
  ),
  P(
    'museum',
    'The Field Trip',
    "Our class took a feild trip to the natural history museum last friday. We saw dinosaur bones, a real meteorite, and a model of the human heart that was bigger then a car. Mrs. Patterson reminded us to stay together but I kept wandering torward the gift shop. By the end of the afternoon my notebook was full of skeches and questions.",
    [
      ['feild', SP, 'field'],
      ['friday.', CP, 'Friday.'],
      ['then', GR, 'than'],
      ['together', PN, 'together,'],
      ['torward', SP, 'toward'],
      ['afternoon', PN, 'afternoon,'],
      ['skeches', SP, 'sketches'],
    ],
  ),
  P(
    'substitute',
    'Substitute Teacher Day',
    "Last Tuesday our math teacher Mrs. Greer was out sick so we had a substitute named Mr. Phillips. He kept calling everyone champ and didnt know that we never have homework on quiz days. Devon raised his hand and tryed to explain the rules but Mr. Phillips just smiled and assigned thirty problems anyway. By the end of class half of us were laughing and the other half were quietly counting the minutes untill lunch.",
    [
      ['Tuesday', PN, 'Tuesday,'],
      ['sick', PN, 'sick,'],
      ['didnt', PN, "didn't"],
      ['tryed', SP, 'tried'],
      ['rules', PN, 'rules,'],
      ['class', PN, 'class,'],
      ['untill', SP, 'until'],
    ],
  ),
  P(
    'picture-day',
    'Picture Day Disaster',
    "picture day always sneeks up on me and this year was no exception. I forgot to comb my hair and I noticed a chocolate stain on my shirt during second period. The photogrofer counted to three but I sneezed at exactly the wrong moment. When the proofs came back two weeks later my mom laughed so hard that she actuly framed it.",
    [
      ['picture', CP, 'Picture'],
      ['sneeks', SP, 'sneaks'],
      ['me', PN, 'me,'],
      ['hair', PN, 'hair,'],
      ['photogrofer', SP, 'photographer'],
      ['three', PN, 'three,'],
      ['later', PN, 'later,'],
      ['actuly', SP, 'actually'],
    ],
  ),
  P(
    'class-pet',
    'The Class Pet Escape',
    "Our class hamster Cinnamon escaped from her cage during third period last wednesday. Mr. Lopez told us to stay calm and search quietly but Allie immediately stood on her chair and shrieked. We finally found Cinnamon hiding inside someones open lunch box contentedly nibbling on a granola bar. The principle heard the chaos from down the hall and never found out exactly what happened.",
    [
      ['hamster', PN, 'hamster,'],
      ['Cinnamon', PN, 'Cinnamon,'],
      ['wednesday.', CP, 'Wednesday.'],
      ['quietly', PN, 'quietly,'],
      ['someones', PN, "someone's"],
      ['box', PN, 'box,'],
      ['principle', GR, 'principal'],
    ],
  ),
  P(
    'haircut',
    "My Brother's Disaster Haircut",
    "My older brother decided to give himself a haircut last saturday because mom wouldnt drive him to the barber. He used clippers without checking the guard which left a perfectly bald patch right above his left ear. When he finally looked in the mirror his face turned the color of a stop sign. Now hes wearing a beanie everywhere even at dinner and refuses too take it off untill his hair grows back.",
    [
      ['saturday', CP, 'Saturday'],
      ['wouldnt', PN, "wouldn't"],
      ['guard', PN, 'guard,'],
      ['mirror', PN, 'mirror,'],
      ['hes', PN, "he's"],
      ['everywhere', PN, 'everywhere,'],
      ['dinner', PN, 'dinner,'],
      ['too', GR, 'to'],
      ['untill', SP, 'until'],
    ],
  ),
  P(
    'group-project',
    'The Group Project',
    "Our science teacher assigned a group project about ecosystems and somehow I ended up with two of the laziest kids in the grade. marcus claimed he had a stomachache every time we tryed to schedule a study session and Tara just kept nodding without actualy doing anything. The night before the presentation I built the entire diorama myself out of cardboard and dryed leaves. We got an A but Im pretty sure I aged six years that weekend.",
    [
      ['ecosystems', PN, 'ecosystems,'],
      ['marcus', CP, 'Marcus'],
      ['tryed', SP, 'tried'],
      ['session', PN, 'session,'],
      ['actualy', SP, 'actually'],
      ['presentation', PN, 'presentation,'],
      ['dryed', SP, 'dried'],
      ['A', PN, 'A,'],
      ['Im', PN, "I'm"],
    ],
  ),
  P(
    'snow-day',
    'Snow Day Hopes',
    "On sunday night every single student in the district stares at the sky hoping for snow. I checked five different weather apps before bed and three of them promised six inches by morning. When my alarm rang at six I sprinted to the window with my heart pounding like a drum. There wasnt a single flake on the lawn only my dads confused face holding two cups of coffee.",
    [
      ['sunday', CP, 'Sunday'],
      ['night', PN, 'night,'],
      ['sky', PN, 'sky,'],
      ['bed', PN, 'bed,'],
      ['six', PN, 'six,'],
      ['wasnt', PN, "wasn't"],
      ['lawn', PN, 'lawn,'],
      ['dads', PN, "dad's"],
    ],
  ),
  P(
    'pizza-party',
    'The Pizza Party Negotiation',
    "Last month our class earned a pizza party by reading more books than any other sixth grade. Our teacher mrs. Hill asked us what toppings we wanted which started a thirty-minute argument between the cheese-only group and the everything-on-it group. Daniel shouted his pineapple opinion so loudly that Mrs. Hill almost canseled the whole event. We finaly agreed on three large pizzas with absolutly nothing controversial and it was still the best friday of the year.",
    [
      ['month', PN, 'month,'],
      ['mrs.', CP, 'Mrs.'],
      ['wanted', PN, 'wanted,'],
      ['canseled', SP, 'canceled'],
      ['finaly', SP, 'finally'],
      ['absolutly', SP, 'absolutely'],
      ['controversial', PN, 'controversial,'],
      ['friday', CP, 'Friday'],
    ],
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
