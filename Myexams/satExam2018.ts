import { Exam } from './exams';

export const satExam2018: Exam = {
  id: 'sat-2018',
  title: '2018 EC MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL Scholastic Aptitude Test (SAT)- For Grade 12',
  subject: 'SAT',
  duration: 60,
  totalQuestions: 35,
  description: 'Scholastic Aptitude Test for Grade 12 Students',
  scheduledDate: '2026-02-27',
  status: 'ongoing',
  stream: 'both',
  password: 'SAT2018',
  questions: [
    {
      id: 1,
      text: 'The weather outside was extremely pleasant and hence we decided to ______________.',
      options: [
        'Employ this rare opportunity for writing letters',
        'Enjoy a morning ride in the open',
        'Refrain from going out for a morning walk',
        'Utilize our time watching the television'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      text: 'She never visits any zoo because she is a strong opponent of the idea of ____________.',
      options: [
        'Going out of the house on a holiday',
        'Feeding the animals while other are watching',
        'Holding the animal in captivity for our joy',
        'Setting the animal free into the forest'
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      text: 'I felt somewhat more relaxed ______________.',
      options: [
        'And tension free as compared to earlier',
        'As there was already no tension at all',
        'And tense as compared to earlier',
        'But tense as compared to earlier'
      ],
      correctAnswer: 0
    },
    {
      id: 4,
      text: 'Practically, very little work could be completed in the last week as it was ___________.',
      options: [
        'a very hectic week',
        'a very busy week',
        'full of working days',
        'full of holidays'
      ],
      correctAnswer: 3
    },
    {
      id: 5,
      text: 'Despite all the efforts made to stop the war, ______________.',
      options: [
        'The two groups expressed interest for peace',
        'The two groups seem determined to continue fighting',
        'The two groups do not seem to continue fighting',
        'The two groups agreed to negotiate'
      ],
      correctAnswer: 1
    },
    {
      id: 6,
      text: 'MARATHON is to RACE as HIBERNATION is to ______________.',
      options: [
        'Bear',
        'Sleep',
        'Dream',
        'Winter'
      ],
      correctAnswer: 1
    },
    {
      id: 7,
      text: 'CUP is to COFFEE as BOWEL is to ______________.',
      options: [
        'Food',
        'Spoon',
        'Soup',
        'Dish'
      ],
      correctAnswer: 2
    },
    {
      id: 8,
      text: 'EMBARRASSED is to HUMILIATED as FRIGHTENED is to ______________.',
      options: [
        'Reckless',
        'Courageous',
        'Agitated',
        'Terrified'
      ],
      correctAnswer: 3
    },
    {
      id: 9,
      text: 'OPTIMIST is to CHEERFUL as PESSIMIST is to ______________.',
      options: [
        'Helpful',
        'Mean',
        'Gloomy',
        'Petty'
      ],
      correctAnswer: 2
    },
    {
      id: 10,
      text: 'COBBLER is to SHOE as CONTRACTOR is to ______________.',
      options: [
        'Building',
        'Boot',
        'Stone',
        'Horse'
      ],
      correctAnswer: 0
    },
    {
      id: 'passage-sat-reading',
      type: 'passage',
      text: 'To read a lot is essential. It is stupid not to venture outside the examination “set books” or the textbooks you have chosen for the intensive study. Read as many books in English as you can, not as study material but for pleasure. Do not choose the most difficult books you find with the idea of listing and learning as many new words as possible. Choose what is likely to interest you and be sure in advance that for that deadens the interest and checks real learning. Look up a word here and there but, as a general policy try to push ahead, guessing what works mean from the context. It is extensive reading that normally helps you to get interest in extra reading and thereby improve your English. You should enjoy the feeling, what extensive reading gives, some command of the language. As you read, you will become more familiar with words and the language. As you read, you will become more familiar with words and sentence patterns you already know, understanding them better as you meet them in more contexts, some of which may differ only slightly from others.',
      isPassage: true
    },
    {
      id: 11,
      text: 'The main purpose of the passage',
      options: [
        'Telling readers how to improve their English',
        'Giving advice on how to learn new English words',
        'Giving advice on how to teach English',
        'Describing the importance of English'
      ],
      correctAnswer: 0,
      passageId: 'passage-sat-reading'
    },
    {
      id: 12,
      text: 'On what factors learning and improving English depends on?',
      options: [
        'Constantly looking up new words in a dictionary',
        'The material you use',
        'The place where you live',
        'Reading a lot of English books'
      ],
      correctAnswer: 3,
      passageId: 'passage-sat-reading'
    },
    {
      id: 13,
      text: 'What is essential when you learn English?',
      options: [
        'You should enjoy the feeling of reading.',
        'Translate new words into your mother tongues.',
        'Read a lot of English books.',
        'Learn different words from people.'
      ],
      correctAnswer: 2,
      passageId: 'passage-sat-reading'
    },
    {
      id: 14,
      text: 'What precautions should you take while choosing a book to read?',
      options: [
        'Intensive reading',
        'Extensive reading',
        'Choose the more difficult books from your subject books.',
        'Choose the books from outside your examination course.'
      ],
      correctAnswer: 3,
      passageId: 'passage-sat-reading'
    },
    {
      id: 15,
      text: 'Which of reading can help you?',
      options: [
        'Reading dictionary words',
        'Extensive reading',
        'Reading difficult words',
        'Intensive reading'
      ],
      correctAnswer: 1,
      passageId: 'passage-sat-reading'
    },
    {
      id: 'passage-music-therapy',
      type: 'passage',
      text: `(1) Mental and physical health professionals may consider referring clients and patients to a music therapist for a number of reasons. It seems a particularly good choice for the social worker who is coordinating a client’s case. Music therapists use music to establish a relationship with the patient and to improve the patient’s health, using highly structured musical interactions. Patients and therapists may sing, play instruments, dance, compose, or simply listen to music.

(2) The course of training for music therapists is comprehensive. In addition to formal musical and therapy training, music therapists are taught to discern what kinds of interventions will be most beneficial for each individual patient. Because each patient is different and has different goals, the music therapist must be able to understand the patient’s situation and choose the music and activities that will do the most toward helping the patient achieve his or her goals. The referring social worker can help this process by clearly communicating each client’s history.

(3) Although patients may develop their musical skills, that is not the main goal of music therapy. Any client who needs particular work on communication or on academic, emotional, and social skills, and who is not responding to traditional therapy, is an excellent candidate for music therapy.`,
      isPassage: true
    },
    {
      id: 16,
      text: 'Which of the following best summarizes the main idea of paragraph 1?',
      options: [
        'Locating a music therapist',
        'A typical music therapy intervention',
        'Using music therapy',
        'Music therapy and social work'
      ],
      correctAnswer: 1,
      passageId: 'passage-music-therapy'
    },
    {
      id: 17,
      text: 'Which of the following best organizes the main ideas of paragraph 3?',
      options: [
        'Who benefits from the music therapy.',
        'Skills addressed by music therapy',
        'Training for music therapists',
        'Referring patients to music therapists.'
      ],
      correctAnswer: 1,
      passageId: 'passage-music-therapy'
    },
    {
      id: 18,
      text: 'Which of the following would be the most appropriate title for this passage?',
      options: [
        'The Social Worker as Music Therapist and training they need',
        'Training for a Career in Music Therapy and its use',
        'What Social Workers Need to Know about Music Therapy',
        'How to Use Music to Combat Depression through Music Therapy'
      ],
      correctAnswer: 2,
      passageId: 'passage-music-therapy'
    },
    {
      id: 19,
      text: 'According to the information presented in the passage, music therapy can be prescribed for social work clients who',
      options: [
        'Need to improve social skills.',
        'Need to resolve family issues.',
        'Were orphaned as children.',
        'Need to develop coping skills.'
      ],
      correctAnswer: 0,
      passageId: 'passage-music-therapy'
    },
    {
      id: 20,
      text: 'Which of the following inferences can be drawn from the passage?',
      options: [
        'Music therapy is only appropriate in a limited number of circumstances.',
        'Music therapy is particularly beneficial for young children.',
        'Music therapy is a relatively new field.',
        'Music therapy can succeed where traditional therapies have failed.'
      ],
      correctAnswer: 3,
      passageId: 'passage-music-therapy'
    },
    {
      id: 'passage-synonym',
      type: 'passage',
      text: 'SYNONYM',
      isPassage: true
    },
    {
      id: 21,
      text: 'The spies conducted a **covert** operation, without being noticed by anyone.',
      options: [
        'Illegal',
        'Hidden',
        'Foreign',
        'Dangerous'
      ],
      correctAnswer: 1,
      passageId: 'passage-synonym'
    },
    {
      id: 22,
      text: 'The designer window treatment in her house, installed 17 years ago, were **outmoded** and thus needs to be changed.',
      options: [
        'Outdated',
        'Modern',
        'Cheap',
        'Expensive'
      ],
      correctAnswer: 0,
      passageId: 'passage-synonym'
    },
    {
      id: 23,
      text: 'She showed a **blatant** disregard for the rules.',
      options: [
        'Rebellious',
        'Respectful',
        'Hidden',
        'Obvious'
      ],
      correctAnswer: 3,
      passageId: 'passage-synonym'
    },
    {
      id: 24,
      text: 'The interior of the hotel is so **repulsive** that everybody returns as soon as they enter it.',
      options: [
        'Attractive',
        'Bright',
        'Repugnant',
        'Ugly'
      ],
      correctAnswer: 2,
      passageId: 'passage-synonym'
    },
    {
      id: 25,
      text: 'Yonas has a paper route. Each morning, he delivers 37 newspapers to customers in his neighborhood. It takes Yonas 50 minutes to deliver all the papers. If Yonas is sick or has other problems, his friend kedir, who lives in the same street, will sometimes deliver the paper for him.',
      options: [
        'Kedir would like to have his own paper route.',
        'It is dark outside when Yonas begins his deliveries.',
        'It takes Kedir more than 50 minutes to deliver the papers.',
        'Yonas and Kedir live in the same neighborhood.'
      ],
      correctAnswer: 3
    },
    {
      id: 26,
      text: 'Derartu is twelve years old. For three years, she has been asking her parents for a dog. Her parents have told her that they believe a dog would not be happy in an apartment, but they have given her permission to have a bird. Derartu has not yet decided what kind of bird she would like to have.',
      options: [
        'Derartu and her parents would like to move.',
        'Derartu and her parents live in an apartment.',
        'Derartu does not like birds.',
        'Derartu\'s parents like birds better than they like dogs.'
      ],
      correctAnswer: 1
    },
    {
      id: 27,
      text: 'One of the warmest winters on record has put consumers in the mood to spend money. Spending is likely to be the strongest in thirteen years. During the month of February, sales of existing single-family homes hit an annual record rate of 4.75 million.',
      options: [
        'Warm winter weather is likely to affect the rate of home sales.',
        'During the winter months, the prices of single-family homes are the lowest.',
        'More people buy houses in the month of February than in any other month.',
        'Consumer spending will be higher thirteen years from now than it is today.'
      ],
      correctAnswer: 0
    },
    {
      id: 28,
      text: 'Frehiwot likes to let her students choose who their partners will be; however, no pair of students may work together more than seven class periods in a row. Adem and Belay have studied together seven class periods in a row. Kiya and Africho have worked together three class periods in a row. Kiya does not want to work with Adem. Who should be assigned to work with Belay?',
      options: [
        'Frehiwot',
        'Africho',
        'Adem',
        'Kiya'
      ],
      correctAnswer: 3
    },
    {
      id: 29,
      text: 'The High School English Department needs to appoint a new chairperson, which will be based on seniority. Hawi has less seniority than Temam, but more than Bekelech. Redwan has more seniority than Hawi, but less than Temam. Temam doesn\'t want the job. Who will be the new English Department Chairperson?',
      options: [
        'Bekelech',
        'Redwan',
        'Temam',
        'Hawi'
      ],
      correctAnswer: 1
    },
    {
      id: 30,
      text: 'Nurse Nefisa has worked more night shifts in a row than Nurse Libamo, who has worked five. Nurse Lomi has worked fifteen night shifts in a row, more than Nurses Nefisa and Libamo combined. Nurse Gelgalo has worked eight-night shifts in a row, less than Nurse Nefisa. How many night shifts in a row has Nurse Negisa worked?',
      options: [
        'Eleven',
        'ten',
        'nine',
        'eight'
      ],
      correctAnswer: 2
    },
    {
      id: 31,
      text: 'Critical reading is a demanding process. To read critically, you must slow down your reading and, with a pencil in hand, perform specific operations on the text. Mark up the text with your reaction, conclusions, and questions. When you read, become an active participant.',
      options: [
        'Readers should get in the habit of questioning the truth of what they read.',
        'Critical reading is a slow, dull, but essential process.',
        'Critical reading requires thoughtful and careful attention.',
        'The best critical reading happens at critical times in a person\'s life.'
      ],
      correctAnswer: 2
    },
    {
      id: 32,
      text: 'Exams are to be conducted on four days from Monday till Thursday. The exams to be conducted are English, Mathematics, Physics and Biology. Neither English Physics to be conducted on Thursday. Neither Physic nor Mathematics is to be conducted on Tuesday. There are three exams conducted after Biology. Physics exam is conducted on:',
      options: [
        'Tuesday',
        'Thursday',
        'Wednesday',
        'Monday'
      ],
      correctAnswer: 2
    },
    {
      id: 33,
      text: 'The guest made **derogatory** remarks about the food he was served and by doing so he proved to be ungrateful and disrespectful.',
      options: [
        'interesting',
        'complimentary',
        'unnecessary',
        'cheerful'
      ],
      correctAnswer: 1
    },
    {
      id: 34,
      text: 'All of his brothers like milk but he has a strong **aversion** for it.',
      options: [
        'hate',
        'care',
        'love',
        'dear'
      ],
      correctAnswer: 2
    },
    {
      id: 35,
      text: 'The inhabitants of the island were **barbarians** who have never lived in the modern world.',
      options: [
        'hate',
        'bad',
        'cruel',
        'civilized'
      ],
      correctAnswer: 3
    }
  ]
};
