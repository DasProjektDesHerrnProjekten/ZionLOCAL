export interface VerbalQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  type: 'antonym' | 'analogy' | 'synonym' | 'completion' | 'comprehension' | 'logical';
  section: string;
  value?: number;
  passage?: string;
}

export const verbalReasoningQuestions: VerbalQuestion[] = [
  // Antonyms (1-3)
  {
    id: 'v1',
    question_text: "He has reached across the world, fomenting violence against west.",
    options: ["Instigating", "planning", "subduing", "negating"],
    correct_answer: 2, // subduing
    type: 'antonym',
    section: 'Antonyms',
    value: 1
  },
  {
    id: 'v2',
    question_text: "My sister came back to find her house in shambles.",
    options: ["Mess", "ruins", "neat", "disorder"],
    correct_answer: 2, // neat
    type: 'antonym',
    section: 'Antonyms',
    value: 1
  },
  {
    id: 'v3',
    question_text: "Which of the following words cannot go together with the others?",
    options: ["Wind", "sky", "rain", "snow"],
    correct_answer: 1, // sky
    type: 'antonym',
    section: 'Antonyms',
    value: 1
  },
  
  // Analytical and Logical Reasoning (4-13)
  {
    id: 'v4',
    question_text: "Which two statements prove that 'Lemlem and Samuel are married'?\nA. Lemlem is married to Alemu's only brother.\nB. Lemlem married her high school sweet heart.\nC. Samuel and Lemlem love each other.\nD. Alemu has the same parents as Samuel.",
    options: ["A and D", "A and C", "B and C", "C and D"],
    correct_answer: 0, // A and D
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v5',
    question_text: "Which two statements prove that 'Senait is a child'?\nA. Senait lives with her parents.\nB. Senait is the little sister of Bekele.\nC. Bekele has just turned 13.\nD. Bekele is still in school.",
    options: ["B and C", "B and D", "C and D", "A and C"],
    correct_answer: 0, // B and C
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v6',
    question_text: "Which two statements prove that Eleni is a doctor?\nA. Eleni loves people.\nB. Eleni's father is a teacher.\nC. Eleni's brother is a doctor.\nD. Eleni has the same job as her sister.",
    options: ["C and D", "A and C", "B and C", "A and D"],
    correct_answer: 0, // C and D
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v7',
    question_text: "Which two statements prove that Hana is younger?\nA. Hana lives with her brother.\nB. Hana is the little sister of Alemu.\nC. Alemu is still a student.\nD. Alemu has just turned 14.",
    options: ["B and D", "A and C", "C and D", "B and C"],
    correct_answer: 0, // B and D
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v8',
    question_text: "Which statements prove that 'Mulualem is a lawyer'?\nA. Mulualem lives with her parents.\nB. Mulualem's mother is an accountant.\nC. Mulualem's brother is a lawyer.\nD. Mulualem has the same job as her brother.",
    options: ["C and D", "A and D", "B and C", "A and C"],
    correct_answer: 0, // C and D
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v9',
    question_text: "Statements: Crows are black. All black birds are loud. All crows are birds. Therefore,\n1. All birds are black.\n2. All crows are black.\n3. All birds are loud.\n4. All crows are loud.",
    options: [
      "Only (2) and (4)",
      "Only (3) and (4)",
      "Only (2) and (3)",
      "Only (1) and (4)"
    ],
    correct_answer: 0, // Only (2) and (4)
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v10',
    question_text: "Statements: Some questions are answers. Some answers are writers. All the writers are poets.\nConclusions:\n1. Some writers are answers.\n2. Some poets are questions.\n3. All the questions are poets.\n4. Some poets are answers.",
    options: [
      "Only (1) and (4)",
      "Only (1) and (2)",
      "Only (2) and (3)",
      "Only (3) and (4)"
    ],
    correct_answer: 0, // Only (1) and (4)
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v11',
    question_text: "Statements: Some envelopes are gums. Some gums are seals. Some seals are adhesives.\nConclusions:\n1. Some envelopes are seals.\n2. Some gums are adhesives.\n3. Some adhesives are seals.\n4. Some adhesives are gums.",
    options: [
      "Only 3",
      "Only 1",
      "Only 4",
      "Only 2"
    ],
    correct_answer: 0, // Only 3
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v12',
    question_text: "Mike finished ahead of Paulos. Paulos and Berhanu both finished before Lema. Orion did not finish last. Who was the last to finish?",
    options: ["Lema", "Orion", "Paulos", "Berhanu"],
    correct_answer: 0, // Lema
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  {
    id: 'v13',
    question_text: "At university, three girls, Almaz, Sophia, and Samara, are dating three boys, Michael, Thomas, and Maru. Almaz is dating Michael. Sophia is not dating the physics major. Samra is not dating the theatre major. Michael is a biology major. Maru is not majoring in theatre. Which of the following statements is correct, based on the above information?",
    options: [
      "Samra is dating Maru, who is majoring in theatre.",
      "Samra is dating Maru, who is a physics major.",
      "Only Almaz and Sophia are dating two of the students.",
      "Almaz is dating a theatre major."
    ],
    correct_answer: 1, // Samra is dating Maru, who is a physics major
    type: 'logical',
    section: 'Analytical and Logical Reasoning',
    value: 1
  },
  
  // Reading Comprehension (14-21)
  {
    id: 'v14',
    question_text: "When she learned that she could not attend the university in Warsaw, she felt ___________.",
    options: ["annoyed", "hopeless", "worried", "delighted"],
    correct_answer: 0, // annoyed
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Marie Curie was one of the most accomplished scientists in history. Together with her husband, Pierre, she discovered radium, an element widely used for treating cancer, and studied uranium and other radioactive substances. Pierre and Marie's amicable collaboration later helped to unlock the secrets of the atom. Marie was born in 1867 in Warsaw, Poland, where her father was a professor of physics. At an early age, she displayed a brilliant mind and blithe personality. Her great exuberance for learning prompted her to continue with her studies after high school. She became disgruntled, however, when she learned that the university in Warsaw was closed to women. Determined to receive a higher education, she defiantly left Poland and in 1891 entered the Sorbonne, a French university, where she earned her master's degree and doctorate in physics.",
    value: 1
  },
  {
    id: 'v15',
    question_text: "Marie _______________ by leaving Poland and traveling to France to enter the Sorbonne.",
    options: [
      "showed intelligence",
      "challenged authority",
      "was distressed",
      "behaved"
    ],
    correct_answer: 1, // challenged authority
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Marie Curie was one of the most accomplished scientists in history. Together with her husband, Pierre, she discovered radium, an element widely used for treating cancer, and studied uranium and other radioactive substances. Pierre and Marie's amicable collaboration later helped to unlock the secrets of the atom. Marie was born in 1867 in Warsaw, Poland, where her father was a professor of physics. At an early age, she displayed a brilliant mind and blithe personality. Her great exuberance for learning prompted her to continue with her studies after high school. She became disgruntled, however, when she learned that the university in Warsaw was closed to women. Determined to receive a higher education, she defiantly left Poland and in 1891 entered the Sorbonne, a French university, where she earned her master's degree and doctorate in physics.",
    value: 1
  },
  {
    id: 'v16',
    question_text: "_______________ she remembered their joy together.",
    options: ["Worriedly", "Dejectedly", "Happily", "Tearfully"],
    correct_answer: 1, // Dejectedly
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Marie was fortunate to have studied at the Sorbonne with some of the greatest scientists of her day, one of whom was Pierre Curie. Marie and Pierre were married in 1895 and spent many productive years working together in the physics laboratory. A short time after they discovered radium, Pierre was killed by a horse-drawn wagon in 1906. Marie was stunned by this horrible misfortune and endured heartbreaking anguish. Despondently she recalled their close relationship and the joy that they had shared in scientific research. The fact that she had two young daughters to raise by herself greatly increased her distress.",
    value: 1
  },
  {
    id: 'v17',
    question_text: "Her _______________ began to fade when she returned to the Sorbonne to succeed her husband.",
    options: ["disappointment", "wretchedness", "misfortune", "anger"],
    correct_answer: 1, // wretchedness
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Curie's feeling of desolation finally began to fade when she was asked to succeed her husband as a physics professor at the Sorbonne. She was the first woman to be given a professorship at the world-famous university. In 1911 she received the Nobel Prize in chemistry for isolating radium. Although Marie Curie eventually suffered a fatal illness from her long exposure to radium, she never became disillusioned about her work. Regardless of the consequences, she had dedicated herself to science and to revealing the mysteries of the physical world.",
    value: 1
  },
  {
    id: 'v18',
    question_text: "According to this passage, regular physical activity is needed to",
    options: [
      "Lose weight",
      "Control one's blood pressure.",
      "Improve one's physical as well as mental health.",
      "Improve one's cognitive skills."
    ],
    correct_answer: 2, // Improve one's physical as well as mental health
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Regular physical activity provides numerous health benefits: from leaner bodies and lower blood pressure to improved mental health and cognitive functioning. As the school physical education program promotes physical activity and can teach skills as well as form or change behavior, it holds an important key to students, we need to rethink the design and delivery of school-based physical education program.",
    value: 1
  },
  {
    id: 'v19',
    question_text: "In order to tone up the physical education program,",
    options: [
      "An assessment of the existing program should be made.",
      "It should be compulsory at school.",
      "The program should be reoriented and implemented.",
      "A committee should be set up in every school."
    ],
    correct_answer: 2, // The program should be reoriented and implemented
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Our first step might be to consider ways to increase curriculum time devoted to physical education. In addition, schools need to thoughtfully analyze the design and delivery of school physical education programs to ensure that they are engaging, developmentally appropriate, inclusive and instructionally powerful.",
    value: 1
  },
  {
    id: 'v20',
    question_text: "According to some countries, health education is more important than teaching.",
    options: [
      "Natural science",
      "Social science",
      "Liberal arts",
      "Any subject"
    ],
    correct_answer: 3, // Any subject
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Adults in some countries think that information about health was more important for students to learn than content in language arts, mathematics, science, history or any other subject. Despite this high ranking, most schools devote minimum curriculum time to teaching students how to lead healthy lives.",
    value: 1
  },
  {
    id: 'v21',
    question_text: "The author wants the reoriented physical education program to be",
    options: [
      "Comprehensive",
      "Short",
      "Thoughtful",
      "Relevant"
    ],
    correct_answer: 0, // Comprehensive
    type: 'comprehension',
    section: 'Reading Comprehension',
    passage: "Schools need to thoughtfully analyze the design and delivery of school physical education programs to ensure that they are engaging, developmentally appropriate, inclusive and instructionally powerful.",
    value: 1
  },
  
  // Sentence Completion (22-25)
  {
    id: 'v22',
    question_text: "Which continuation is right? I don't trust social media. ___________.",
    options: [
      "I have never and I will never",
      "I never have and I never will",
      "Never can I and never I will",
      "Never I have and never I will"
    ],
    correct_answer: 1, // I never have and I never will
    type: 'completion',
    section: 'Sentence Completion',
    value: 1
  },
  {
    id: 'v23',
    question_text: "If I were in your position, I ______________________________",
    options: [
      "Will never have done such silly things.",
      "Would never have done such silly things.",
      "Would have done such silly things.",
      "Would never do such silly things."
    ],
    correct_answer: 3, // Would never do such silly things
    type: 'completion',
    section: 'Sentence Completion',
    value: 1
  },
  {
    id: 'v24',
    question_text: "She contracted COVID-19 easily because she was obese and had other preexisting diseases. The doctor said that if she _______________ obese, her chance of getting the disease would have been slim.",
    options: [
      "had been",
      "had not been",
      "were not",
      "were"
    ],
    correct_answer: 1, // had not been
    type: 'completion',
    section: 'Sentence Completion',
    value: 1
  },
  {
    id: 'v25',
    question_text: "I: Haven't you seen this film?\nFriend: ______________________________",
    options: [
      "No, I have",
      "Yes, I have",
      "Yes, have I",
      "Yes, I haven't"
    ],
    correct_answer: 1, // Yes, I have
    type: 'completion',
    section: 'Sentence Completion',
    value: 1
  },
  
  // Analogies (26-32)
  {
    id: 'v26',
    question_text: "EAGLE is to BIRD as ROSE is to ___________.",
    options: ["BEAUTIFUL", "GENTLEMAN", "FLOWER", "ANIMAL"],
    correct_answer: 2, // FLOWER
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v27',
    question_text: "CAR is to TRANSPORTATION as GAME is to ___________.",
    options: ["INFORMATION", "ENTERTAINMENT", "FOOTBALL", "MANIPULATION"],
    correct_answer: 1, // ENTERTAINMENT
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v28',
    question_text: "SPEED is to FAST as TEMPERATURE is to ___________.",
    options: ["ICE", "THERMOMETER", "CLIMATE", "WARM"],
    correct_answer: 3, // WARM
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v29',
    question_text: "FAST is to RUNNING as SLOW is to ___________.",
    options: ["LAZY", "PACE", "WALKING", "SPEED"],
    correct_answer: 2, // WALKING
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v30',
    question_text: "CANDLE : WAX",
    options: [
      "TREE : LEAVES",
      "BRANCH : WOOD",
      "PAPER : PULP",
      "BAMBOO : FURNITURE"
    ],
    correct_answer: 2, // PAPER : PULP
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v31',
    question_text: "CHEF : FOOD",
    options: [
      "BRUSH : WALL",
      "PAINT : PAINTER",
      "BRICK : CARPENTER",
      "SCULPTOR : STONE"
    ],
    correct_answer: 3, // SCULPTOR : STONE
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  {
    id: 'v32',
    question_text: "BOARD : TRAIN",
    options: [
      "WALK : SHOE",
      "CHAIR : SIT",
      "MOUNT : HORSE",
      "BICYCLE : DRIVE"
    ],
    correct_answer: 2, // MOUNT : HORSE
    type: 'analogy',
    section: 'Analogies',
    value: 1
  },
  
  // Synonyms (33-35)
  {
    id: 'v33',
    question_text: "The man vehemently denied all the charges of killing that were brought against him.",
    options: ["Hysterically", "forcefully", "devoutly", "carelessly"],
    correct_answer: 1, // forcefully
    type: 'synonym',
    section: 'Synonyms',
    value: 1
  },
  {
    id: 'v34',
    question_text: "Which word means the same as counterfeit?",
    options: ["Robbery", "fake", "copy", "match"],
    correct_answer: 1, // fake
    type: 'synonym',
    section: 'Synonyms',
    value: 1
  },
  {
    id: 'v35',
    question_text: "He inherited a large amount of fortune from his parents. So, he lives a very lavish lifestyle.",
    options: ["Stingy", "extravagant", "Spartan", "humble"],
    correct_answer: 1, // extravagant
    type: 'synonym',
    section: 'Synonyms',
    value: 1
  },
  
  // Spelling (36-40)
  {
    id: 'v36',
    question_text: "Which of the following is the correct spelling",
    options: ["Recieve", "Receive", "Recievet", "Recievee"],
    correct_answer: 1, // Receive
    type: 'completion',
    section: 'Spelling',
    value: 1
  },
  {
    id: 'v37',
    question_text: "Choose the correctly spelled word that refers to a particular time or instance of an event.",
    options: ["Occasion", "Occcasion", "Occcassion", "Occassion"],
    correct_answer: 0, // Occasion
    type: 'completion',
    section: 'Spelling',
    value: 1
  },
  {
    id: 'v38',
    question_text: "Identify the proper spelling of the word referring to the state of being aware of and responsive to one's surroundings.",
    options: ["Conciousness", "Consiousniss", "Consciousness", "Consciuosness"],
    correct_answer: 2, // Consciousness
    type: 'completion',
    section: 'Spelling',
    value: 1
  },
  {
    id: 'v39',
    question_text: "Which of the following is the correct spelling for a communication or cooperation which facilitates a close working relationship between people or organizations?",
    options: ["Liason", "Liaisone", "Liaison", "Liaizon"],
    correct_answer: 2, // Liaison
    type: 'completion',
    section: 'Spelling',
    value: 1
  },
  {
    id: 'v40',
    question_text: "Select the correct spelling of the common adjective used to describe something that is not connected or set apart.",
    options: ["Seperat", "Separate", "Seperate", "Saparate"],
    correct_answer: 1, // Separate
    type: 'completion',
    section: 'Spelling',
    value: 1
  }
];
