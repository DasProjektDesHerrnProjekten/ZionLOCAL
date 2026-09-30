export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  type: 'antonym' | 'synonym' | 'analogy' | 'comprehension' | 'logical' | 'classification' | 'spelling';
  section: string;
  passage?: string;
  explanation?: string;
}

export const eueeVerbal2021Questions: Question[] = [
  // Classification Items (1-4)
  {
    id: 'v1',
    question_text: `Choose the word which does not fit the relation:`,
    options: ["Aloof", "Sociable", "Reticent", "Haughty"],
    correct_answer: 1, // Sociable
    type: 'classification',
    section: 'I. CLASSIFICATION',
    explanation: "All other words describe someone who is reserved or distant; 'Sociable' is the opposite."
  },
  {
    id: 'v2',
    question_text: `Choose the word which does not fit the relation:`,
    options: ["Swindle", "Deceit", "Morbid", "Treachery"],
    correct_answer: 2, // Morbid
    type: 'classification',
    section: 'I. CLASSIFICATION',
    explanation: "All other words relate to deception; 'Morbid' relates to disease or death."
  },
  {
    id: 'v3',
    question_text: `Choose the word which does not fit the relation:`,
    options: ["Scarce", "Intermittent", "Frequent", "Sporadic"],
    correct_answer: 2, // Frequent
    type: 'classification',
    section: 'I. CLASSIFICATION',
    explanation: "All other words suggest something that is not constant; 'Frequent' is the opposite."
  },
  {
    id: 'v4',
    question_text: `Choose the word which does not fit the relation:`,
    options: ["Commence", "Initiate", "Launch", "Cease"],
    correct_answer: 3, // Cease
    type: 'classification',
    section: 'I. CLASSIFICATION',
    explanation: "All other words mean to begin; 'Cease' means to stop."
  },

  // Analytical and Logical Reasoning (5-14)
  {
    id: 'v5',
    question_text: `XYZ, a specialty restaurant, is open for business every Monday through Saturday but is closed Sundays. Lunch is the only meal served on Mondays, Tuesdays and Thursdays. Dinner is the only meal served on Wednesdays, Fridays and Saturdays.

The restaurant's maintenance schedule is as follows:
• Plants are watered two days each week, but never on consecutive days and never on the same day that floors are polished.
• Floors are polished on Monday and two other days each week, but never on consecutive days and never on the same day that plants are watered.


Based on this information, which of the following could be true?`,
    options: [
      "Dinner is served on Thursday.",
      "Floors are polished on Tuesday.",
      "Lunch is served on Friday.",
      "Plants are watered on Sunday."
    ],
    correct_answer: 1, // Floors are polished on Tuesday
    type: 'logical',
    section: 'II. LOGICAL REASONING',
    passage: ""
  },
  {
    id: 'v6',
    question_text: `XYZ, a specialty restaurant, is open for business every Monday through Saturday but is closed Sundays. Lunch is the only meal served on Mondays, Tuesdays and Thursdays. Dinner is the only meal served on Wednesdays, Fridays and Saturdays.

The restaurant's maintenance schedule is as follows:
• Plants are watered two days each week, but never on consecutive days and never on the same day that floors are polished.
• Floors are polished on Monday and two other days each week, but never on consecutive days and never on the same day that plants are watered.

If the plants are watered on Tuesday, on which of the following days must the floors be polished?`,
    options: ["Wednesday", "Thursday", "Friday", "Saturday"],
    correct_answer: 1, // Thursday
    type: 'logical',
    section: 'II. LOGICAL REASONING',
    passage: ""
  },
  {
    id: 'v7',
    question_text: `XYZ, a specialty restaurant, is open for business every Monday through Saturday but is closed Sundays. Lunch is the only meal served on Mondays, Tuesdays and Thursdays. Dinner is the only meal served on Wednesdays, Fridays and Saturdays.

The restaurant's maintenance schedule is as follows:
• Plants are watered two days each week, but never on consecutive days and never on the same day that floors are polished.
• Floors are polished on Monday and two other days each week, but never on consecutive days and never on the same day that plants are watered.

If the plants are watered on Thursday, which of the following must be true?`,
    options: [
      "Floors are polished on Tuesday",
      "Floors are polished on Friday",
      "Floors are polished on Saturday",
      "Plants are watered on Saturday"
    ],
    correct_answer: 0, // Floors are polished on Tuesday
    type: 'logical',
    section: 'II. LOGICAL REASONING',
    passage: ""
  },
  {
    id: 'v8',
    question_text: `XYZ, a specialty restaurant, is open for business every Monday through Saturday but is closed Sundays. Lunch is the only meal served on Mondays, Tuesdays and Thursdays. Dinner is the only meal served on Wednesdays, Fridays and Saturdays.

The restaurant's maintenance schedule is as follows:
• Plants are watered two days each week, but never on consecutive days and never on the same day that floors are polished.
• Floors are polished on Monday and two other days each week, but never on consecutive days and never on the same day that plants are watered.

If the floors are polished on Wednesday, on which of the following days must the plants be watered?`,
    options: ["Monday", "Tuesday", "Thursday", "Friday"],
    correct_answer: 2, // Thursday
    type: 'logical',
    section: 'II. LOGICAL REASONING',
    passage: `XYZ, a specialty restaurant, is open for business every Monday through Saturday but is closed Sundays. Lunch is the only meal served on Mondays, Tuesdays and Thursdays. Dinner is the only meal served on Wednesdays, Fridays and Saturdays. The restaurant's floors are polished and its plants are watered only on days that XYZ is open for business, according to the following schedule:
• Plants are watered two days each week, but never on consecutive days and never on the same day that floors are polished.
• Floors are polished on Monday and two other days each week, but never on consecutive days and never on the same day that plants are watered.`
  },
  {
    id: 'v9',
    question_text: `The college's football team has had a losing record for the past five years. 
    The college's alumni contributions have decreased by 30% during the same period.
    
    The argument about the college's alumni contributions relies on which of the following assumptions about the college?`,
    options: [
      "The college's football team will continue its losing streak next year.",
      "The college's alumni contributions depend to an extent on a winning record by the college's football team.",
      "Contributions from alumni are needed for the college to produce a winning football team.",
      "The college's reputation for academic excellence depends on the performance of its football team."
    ],
    correct_answer: 1, // Alumni contributions depend on football performance
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    explanation: "The argument assumes a direct relationship between football performance and alumni contributions."
  },
  {
    id: 'v10',
    question_text: `It is well known that the world urgently needs the adequate distribution of food so that everyone gets enough. 
    Adequate distribution of medicine is just as urgent as the need for food. 
    Medical expertise and medical supplies need to be redistributed throughout the world so that people in emerging nations will have proper medical care.
    
    The paragraph best supports the statement that`,
    options: [
      "many people who live in emerging nations are not receiving proper medical care.",
      "the medical-supply industry should step up production of its products.",
      "most of the world's doctors are selfish about giving time and money to the poor.",
      "food production in emerging nations has slowed during the past several years."
    ],
    correct_answer: 0, // many people in emerging nations lack proper medical care
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    passage: "It is well known that the world urgently needs the adequate distribution of food so that everyone gets enough. Adequate distribution of medicine is just as urgent as the need for food. Medical expertise and medical supplies need to be redistributed throughout the world so that people in emerging nations will have proper medical care.",
    explanation: "The passage explicitly states that people in emerging nations need better access to medical care."
  },
  {
    id: 'v11',
    question_text: `Five children (K, P, R, S, T) are sitting in a row from left to right.
    
    Clues:
    1. S is sitting next to P but not T
    2. K is sitting next to R
    3. R is sitting on the extreme left
    4. T is not sitting next to K
    
    Who are sitting adjacent to S?`,
    options: [
      "R & P",
      "K & P",
      "P & T",
      "Only P"
    ],
    correct_answer: 2, // P & T
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    explanation: "Based on the seating arrangement: R, K, P, S, T. So S is sitting between P and T."
  },
  {
    id: 'v12',
    question_text: `Family Members:
    - Husband
    - Wife
    - Two sons
    - Two daughters
    
    Situation:
    • All ladies (wife + 2 daughters) were invited to a dinner
    • Both sons went out to play
    • Husband did not return from office
    
    Who was at home?`,
    options: [
      "All ladies were at home.",
      "Only sons were at home.",
      "Nobody was at home.",
      "Only wife was at home."
    ],
    correct_answer: 2, // Nobody was at home
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    explanation: "All family members are either out or not at home: ladies at dinner, sons playing, husband at office."
  },
  {
    id: 'v13',
    question_text: `Statement: "Parents are prepared to pay any price for an elite education to their children."
    
    Which conclusion can be reached based on this statement?`,
    options: [
      "Rich parents were more concerned for their children's education than poor parents are.",
      "Parents are ready to do whatever they can to satisfy their children",
      "Parents have an obsessive passion for perfect development of their children through good schooling.",
      "All parents these days are very well off."
    ],
    correct_answer: 2, // Parents have an obsessive passion for perfect development of their children through good schooling.
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    explanation: "This is the most direct and reasonable conclusion that can be drawn from the statement."
  },
  {
    id: 'v14',
    question_text: `Arrange the following sentences in proper sequence to form a meaningful paragraph:
    
    1. Kemal received a call to attend the interview.
    2. He applied for a new job.
    3. Kemal was an ambitious boy.
    4. But, he was not happy there.
    5. His father had put him in a clerical job.`,
    options: [
      "4,2,1,5,3",
      "2,4,5,3,1",
      "2,5,4,3,1",
      "3,5,4,2,1"
    ],
    correct_answer: 3, // 3,5,4,2,1
    type: 'logical',
    section: 'II. ANALYTICAL REASONING',
    explanation: "The correct sequence is: Kemal was ambitious (3), his father put him in a job (5), he wasn't happy there (4), he applied for a new job (2), then got an interview call (1)."
  },

  // Antonyms (15-17)
  {
    id: 'v15',
    question_text: "What is the opposite of IMPARTIAL?",
    options: ["worried", "biased", "need", "hostile"],
    correct_answer: 1, // biased
    type: 'antonym',
    section: 'III. ANTONYMS',
    explanation: "'Impartial' means fair and unbiased, so the opposite is 'biased'."
  },
  {
    id: 'v16',
    question_text: "What is the opposite of PROGRESS?",
    options: ["advance", "reversion", "movement", "silence"],
    correct_answer: 1, // reversion
    type: 'antonym',
    section: 'III. ANTONYMS',
    explanation: "'Progress' means moving forward, so the opposite is 'reversion' (moving backward)."
  },
  {
    id: 'v17',
    question_text: "What is the opposite of CANDID?",
    options: ["deceptive", "cunning", "rude", "vague"],
    correct_answer: 0, // deceptive
    type: 'antonym',
    section: 'III. ANTONYMS',
    explanation: "'Candid' means honest and straightforward, so the opposite is 'deceptive'."
  },

  // Reading Comprehension (18-25)
  {
    id: 'v18',
    question_text: `The coconut is an unusual food for many reasons. It is technically a seed, produced by the coconut palm tree, and as such is one of the largest edible seeds produced by any plant. Its unusual contents also make it unique in the seed world the interior consists of both 'meat' and 'water.' The meat is the white pith with which we are all familiar, as it is used extensively for cooking and flavorings; the coconut water is a white liquid that is very sweet and thirst-quenching. Portuguese explorers gave the nut its name in the 15th century, referring to it as coco, meaning 'ghost' in their language. The three dimples and the hairy texture reminded them of a ghost's face, and the tree has retained that name ever since.
    
    The coconut earned the nickname 'ghost' because`,
    options: [
      "of its smell.",
      "it is round",
      "it resembles ghost's face",
      "its pale color"
    ],
    correct_answer: 2, // it resembles ghost's face
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage states that the three dimples and hairy texture reminded Portuguese explorers of a ghost's face."
  },
  {
    id: 'v19',
    question_text: `The coconut is an unusual food for many reasons. It is technically a seed, produced by the coconut palm tree, and as such is one of the largest edible seeds produced by any plant. Its unusual contents also make it unique in the seed world the interior consists of both 'meat' and 'water.' The meat is the white pith with which we are all familiar, as it is used extensively for cooking and flavorings; the coconut water is a white liquid that is very sweet and thirst-quenching. Portuguese explorers gave the nut its name in the 15th century, referring to it as coco, meaning 'ghost' in their language. The three dimples and the hairy texture reminded them of a ghost's face, and the tree has retained that name ever since.
    
    What is the main focus of this passage?`,
    options: [
      "Portuguese discoveries.",
      "how cooking oil is made",
      "Coconut trees have many uses.",
      "the history of coconuts"
    ],
    correct_answer: 2, // Coconut trees have many uses.
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage primarily discusses the various uses and characteristics of coconuts."
  },
  {
    id: 'v20',
    question_text: `The coconut is an unusual food for many reasons. It is technically a seed, produced by the coconut palm tree, and as such is one of the largest edible seeds produced by any plant. Its unusual contents also make it unique in the seed world the interior consists of both 'meat' and 'water.' The meat is the white pith with which we are all familiar, as it is used extensively for cooking and flavorings; the coconut water is a white liquid that is very sweet and thirst-quenching. Portuguese explorers gave the nut its name in the 15th century, referring to it as coco, meaning 'ghost' in their language. The three dimples and the hairy texture reminded them of a ghost's face, and the tree has retained that name ever since.
    
    The passage implies that coconut palms are`,
    options: [
      "coconut palms are good shade trees.",
      "Portuguese explorers loved coconuts",
      "coconut oil is the best way to cook.",
      "known valuable plants."
    ],
    correct_answer: 3, // known valuable plants
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage highlights the many valuable uses of coconuts, implying they are valuable plants."
  },
  {
    id: 'v21',
    question_text: `The coconut is an unusual food for many reasons. It is technically a seed, produced by the coconut palm tree, and as such is one of the largest edible seeds produced by any plant. Its unusual contents also make it unique in the seed world the interior consists of both 'meat' and 'water.' The meat is the white pith with which we are all familiar, as it is used extensively for cooking and flavorings; the coconut water is a white liquid that is very sweet and thirst-quenching. Portuguese explorers gave the nut its name in the 15th century, referring to it as coco, meaning 'ghost' in their language. The three dimples and the hairy texture reminded them of a ghost's face, and the tree has retained that name ever since.
    
    Coconut differs from other seeds because of its`,
    options: [
      "flavor.",
      "contents.",
      "special uses.",
      "color."
    ],
    correct_answer: 1, // contents
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage mentions that the coconut's unique contents (meat and water) make it different from other seeds."
  },
  {
    id: 'v22',
    question_text: `Dogs and cats should never be permitted to eat chocolate because chocolate works like a poison in their bodies. Chocolate contains a chemical called theobromine, which is similar to caffeine. Human bodies are able to process the theobromine without any ill side effects, but dogs and cats cannot.
    
    According to the passage, why is chocolate poisonous for dogs and cats?`,
    options: [
      "Chocolate is made from processed cocoa.",
      "They cannot process theobromine.",
      "It gets stuck in their intestines.",
      "It contains caffeine."
    ],
    correct_answer: 1, // They cannot process theobromine
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage states that dogs and cats cannot process theobromine, making chocolate poisonous to them."
  },
  {
    id: 'v23',
    question_text: `Dogs and cats should never be permitted to eat chocolate because chocolate works like a poison in their bodies. Chocolate contains a chemical called theobromine, which is similar to caffeine. Human bodies are able to process the theobromine without any ill side effects, but dogs and cats cannot. For a 20-pound dog, a dose of approximately 20 ounces of milk chocolate could be lethal. Cats are more sensitive to theobromine than dogs, and would be affected by a smaller amount.
    
    According to the passage, how much milk chocolate would be poisonous to a cat?`,
    options: [
      "half a Hershey bar",
      "approximately one pound",
      "substantially more than 20 ounces",
      "substantially less than 20 ounces"
    ],
    correct_answer: 3, // substantially less than 20 ounces
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage states that 20 ounces is dangerous for a 20-pound dog, so a smaller amount would be dangerous for a cat."
  },
  {
    id: 'v24',
    question_text: `Dogs and cats should never be permitted to eat chocolate because chocolate works like a poison in their bodies. Chocolate contains a chemical called theobromine, which is similar to caffeine. Human bodies are able to process the theobromine without any ill side effects, but dogs and cats cannot. Many pet owners are unaware of this danger, and may accidentally leave chocolate within reach of their pets. Dogs, being naturally curious and often eager to please, will sample nearly anything they see their masters eating.
    
    Why might a dog eat chocolate, according to the passage?`,
    options: [
      "Dogs like to imitate their owners.",
      "They can smell the theobromine.",
      "Dogs won't eat chocolate.",
      "Because it tastes good."
    ],
    correct_answer: 0, // Dogs like to imitate their owners
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The passage states that dogs will sample nearly anything they see their masters eating."
  },
  {
    id: 'v25',
    question_text: `Dogs and cats should never be permitted to eat chocolate because chocolate works like a poison in their bodies. Chocolate contains a chemical called theobromine, which is similar to caffeine. Human bodies are able to process the theobromine without any ill side effects, but dogs and cats cannot. For a 20-pound dog, a dose of approximately 20 ounces of milk chocolate could be lethal. Cats are more sensitive to theobromine than dogs, and would be affected by a smaller amount. Many pet owners are unaware of this danger, and may accidentally leave chocolate within reach of their pets. Dogs, being naturally curious and often eager to please, will sample nearly anything they see their masters eating.
    
    What best summarizes this passage?`,
    options: [
      "A penny saved is a penny earned.",
      "Monkey see, monkey do.",
      "Pet food for pets, people food for people.",
      "Look before you leap."
    ],
    correct_answer: 2, // Pet food for pets, people food for people
    type: 'comprehension',
    section: 'IV. READING COMPREHENSION',
    explanation: "The main idea is that chocolate, while safe for humans, is dangerous for pets."
  },

  // Synonyms (26-28)
  {
    id: 'v26',
    question_text: "What is the meaning of ATTACHMENT?",
    options: ["appendage", "causation", "influence", "affinity"],
    correct_answer: 0, // appendage
    type: 'synonym',
    section: 'V. SYNONYMS',
    explanation: "'Attachment' can mean an appendage or something attached."
  },
  {
    id: 'v27',
    question_text: "What is the meaning of FOUND?",
    options: ["search", "realize", "establish", "see"],
    correct_answer: 2, // establish
    type: 'synonym',
    section: 'V. SYNONYMS',
    explanation: "'Found' means to establish or set up."
  },
  {
    id: 'v28',
    question_text: "What is the meaning of ADVICE?",
    options: ["proposal", "practice", "counsel", "council"],
    correct_answer: 2, // counsel
    type: 'synonym',
    section: 'V. SYNONYMS',
    explanation: "'Advice' means guidance or counsel."
  },

  // Analogies (29-35)
  {
    id: 'v29',
    question_text: "BRIDGE is to RIVER as TUNNEL is to:",
    options: ["rock", "mountain", "underway", "nails"],
    correct_answer: 1, // mountain
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "A bridge goes over a river, just as a tunnel goes through a mountain."
  },
  {
    id: 'v30',
    question_text: "PROSE is to POETRY as CONVERSATION is to:",
    options: ["song", "poem", "language", "listening"],
    correct_answer: 0, // song
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "Prose is to poetry (structured writing) as conversation is to song (structured speech)."
  },
  {
    id: 'v31',
    question_text: "READING is to KNOWLEDGE as WORK is to:",
    options: ["engagement", "experience", "employment", "money"],
    correct_answer: 3, // money
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "Reading leads to knowledge, just as work leads to money."
  },
  {
    id: 'v32',
    question_text: "COLLEGE is related to TEACHERS in the same way as HOSPITAL is related to:",
    options: ["beds", "medicine", "patients", "doctors"],
    correct_answer: 3, // doctors
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "Teachers work at a college, just as doctors work at a hospital."
  },
  {
    id: 'v33',
    question_text: "TABLE is related to WOOD in the same way as SHIRT is related to:",
    options: ["uniform", "dress", "cloth", "cotton"],
    correct_answer: 2, // cloth
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "A table is made of wood, just as a shirt is made of cloth."
  },
  {
    id: 'v34',
    question_text: "WALK is to RUN as BREEZE is to:",
    options: ["air", "wind", "dust", "cold"],
    correct_answer: 1, // wind
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "Walking is a slower form of movement than running, just as a breeze is a gentler form of wind."
  },
  {
    id: 'v35',
    question_text: "WAX is related to GREASE in the same as MILK is related to:",
    options: ["curd", "protein", "ghee", "drink"],
    correct_answer: 2, // ghee
    type: 'analogy',
    section: 'VI. ANALOGIES',
    explanation: "Wax can be processed into grease, just as milk can be processed into ghee (clarified butter)."
  },
  
  // Spelling Challenge (35-39)
  {
    id: 'v35',
    question_text: "Which is the correct spelling?",
    options: ["Accommodation", "Accomodation", "Acommodation", "Acomodation"],
    correct_answer: 0, // Accommodation
    type: 'spelling',
    section: 'VII. SPELLING CHALLENGE',
    explanation: "The correct spelling is 'Accommodation' with two 'm's and two 'd's."
  },
  {
    id: 'v36',
    question_text: "Which is the correct spelling?",
    options: ["Necessary", "Neccesary", "Necesary", "Nessecary"],
    correct_answer: 0, // Necessary
    type: 'spelling',
    section: 'VII. SPELLING CHALLENGE',
    explanation: "The correct spelling is 'Necessary' with one 'c' and two 's's."
  },
  {
    id: 'v37',
    question_text: "Which is the correct spelling?",
    options: ["Separate", "Seperate", "Seperrate", "Separrate"],
    correct_answer: 0, // Separate
    type: 'spelling',
    section: 'VII. SPELLING CHALLENGE',
    explanation: "The correct spelling is 'Separate' with an 'a' after the 'p'."
  },
  {
    id: 'v38',
    question_text: "Which is the correct spelling?",
    options: ["Occasionally", "Ocasionally", "Occasionaly", "Occasionaly"],
    correct_answer: 0, // Occasionally
    type: 'spelling',
    section: 'VII. SPELLING CHALLENGE',
    explanation: "The correct spelling is 'Occasionally' with two 'c's and two 'l's."
  },
  {
    id: 'v39',
    question_text: "Which is the correct spelling?",
    options: ["Disappointed", "Dissapointed", "Disapointed", "Dissappointed"],
    correct_answer: 0, // Disappointed
    type: 'spelling',
    section: 'VII. SPELLING CHALLENGE',
    explanation: "The correct spelling is 'Disappointed' with one 's' and two 'p's."
  }
];
