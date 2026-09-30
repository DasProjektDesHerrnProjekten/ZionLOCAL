import { Exam } from './exams';

export const physicsExam: Exam = {
  id: 'physics-miskaye-hizunan-2024',
  title: 'MESKAYE ONLINE EXAM 2018 MODEL-1 PHYSICS',
  subject: 'Physics',
  duration: 120,
  totalQuestions: 50,
  description: 'Grade 12 Physics Mock Examination',
  scheduledDate: '2026-02-26',
  status: 'ongoing',
  stream: 'natural',
  password: 'PHYSICS2025',
  questions: [
    {
      id: 1,
      text: 'Which of the following is not true about uniform motion?',
      image: '/Phyiscsimages/q1.jpg',
      options: [
        'It covers equal intervals of distance at equal intervals of time in a fixed direction.',
        'Its speed remains constant throughout its motion along a straight line.',
        'Its acceleration stays uniform throughout its motion on its way at a given time.',
        'Its velocity-time graph is a straight line with a constant positive slope.'
      ],
      correctAnswer: 2
    },
    {
      id: 2,
      text: 'Two students walk from school to home. Student A takes a short cut in a straight line, but student B follows the road which curves around a hill. Which one is true?',
      options: [
        'Student A has a greater distance but the same displacement.',
        'Student B has a greater distance but the same displacement.',
        'Student A has a greater displacement but the same distance.',
        'Both distance and displacement are the same for both students.'
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      text: 'The speed-time (v-t) graph of an object moving along a straight line is shown in the figure below. What is the average speed of the object for the whole journey?',
      image: '/Phyiscsimages/q3.jpg',
      options: [
        '0 m/s',
        '2.5 m/s',
        '5 m/s',
        '10 m/s'
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      text: 'If the force of attraction between two point masses at a distance r is 250 N, what will be the new force if the distance between them is decreased by a quarter for the same masses?',
      options: [
        '1600 N',
        '8000 N',
        '4000 N',
        '1200 N'
      ],
      correctAnswer: 0
    },
    {
      id: 5,
      text: 'All are dimensionless except:',
      options: [
        'Specific gravity',
        'Young’s modulus',
        'Strain',
        'Index of refraction'
      ],
      correctAnswer: 1
    },
    {
      id: 6,
      text: 'Which of the following is necessarily true?',
      options: [
        'If the velocity of an object is zero, then its acceleration is also zero.',
        'If the acceleration of an object is zero, then its velocity is also zero.',
        'Deceleration means that acceleration is necessarily negative.',
        'The instantaneous acceleration has the same value as the average acceleration if the motion is uniformly accelerated.'
      ],
      correctAnswer: 3
    },
    {
      id: 7,
      text: 'The graph below describes the relationship between velocity and time for a moving object. From this graph, which one of the following is WRONG?',
      image: '/Phyiscsimages/q7.jpg',
      options: [
        'The acceleration at time t = 1 sec is -2 m/s2.',
        'The total displacement for the entire trip is 30 m.',
        'The acceleration at time t = 6 sec is 5 m/s2.',
        'The total distance traveled for the entire trip is 30 m.'
      ],
      correctAnswer: 1
    },
    {
      id: 8,
      text: 'Which of the following sets of quantities remains constant in uniform circular motion?',
      options: [
        'Velocity, speed, radius',
        'Velocity, acceleration, kinetic energy',
        'Speed, acceleration, radius',
        'Speed, radius, kinetic energy'
      ],
      correctAnswer: 3
    },
    {
      id: 9,
      text: 'When a driver applies a sudden brake to save a child, you are moved forward from your seat. Which of Newton’s laws expresses this phenomenon best?',
      options: [
        'Newton’s first law',
        'Newton’s second law',
        'Newton’s third law',
        'Newton’s law of gravitation'
      ],
      correctAnswer: 0
    },
    {
      id: 10,
      text: 'A 20 kg block is placed on a smooth horizontal surface. A horizontal rope over a light frictionless pulley is attached to a 24 kg body as shown below (g = 10 m/s2). What will be the tension on the rope?',
      image: '/Phyiscsimages/q10.jpg',
      options: [
        '96 N',
        '72 N',
        '6 N',
        '44 N'
      ],
      correctAnswer: 0
    },
    {
      id: 11,
      text: 'Two masses m1 = 8 kg and m2 = 4 kg that are connected by a light string are pulled horizontally by a 100 N force that makes an angle of 53◦ to the horizontal as shown in the figure below. If the surfaces are frictionless, then what is the acceleration of the system?',
      image: '/Phyiscsimages/q11.jpg',
      options: [
        '2 m/s2',
        '4 m/s2',
        '5 m/s2',
        '1 m/s2'
      ],
      correctAnswer: 2
    },
    {
      id: 12,
      text: 'Which one of the following is false?',
      options: [
        'The slope of an acceleration versus time graph is velocity.',
        'The area under a velocity versus time graph is displacement.',
        'The area under an acceleration versus time graph is change in velocity.',
        'The slope of a velocity versus time graph is acceleration.'
      ],
      correctAnswer: 0
    },
    {
      id: 13,
      text: 'In which one of the following cases is work done in physics?',
      options: [
        'Holding a 200 N load without moving.',
        'Pushing a concrete wall horizontally by applying a horizontal force.',
        'Pushing a block horizontally by applying a horizontal force, causing it to move.',
        'Carrying a load on your shoulder and walking along a straight line on level ground for 2 km.'
      ],
      correctAnswer: 2
    },
    {
      id: 14,
      text: 'An object of mass m is dropped from a certain height to the ground. At what height above the ground do we assume that the object has the same potential and kinetic energies if its velocity at that point is 20 m/s?',
      options: [
        '5 m',
        '20 m',
        '60 m',
        '40 m'
      ],
      correctAnswer: 1
    },
    {
      id: 15,
      text: 'A car initially at rest is uniformly accelerated along a straight road. The car passes two marks separated by 48 m at t = 4 s and t = 8 s respectively. What is the acceleration of the car?',
      options: [
        '1 m/s2',
        '3 m/s2',
        '2 m/s2',
        '4 m/s2'
      ],
      correctAnswer: 2
    },
    {
      id: 16,
      text: 'A uniform meter stick supported at the 50 cm mark has 300 g and 200 g masses hanging from it at the 10 cm and 60 cm marks respectively. What mass must be hung at the 75 cm mark to keep the meter stick balanced?',
      image: '/Phyiscsimages/q16.jpg',
      options: [
        '400 g',
        '250 g',
        '500 g',
        '300 g'
      ],
      correctAnswer: 0
    },
    {
      id: 17,
      text: 'Two charges of +9 μC and +25 μC are 40 cm apart. At what distance from either charge is the electric field zero?',
      options: [
        '15 cm from q1 & 25 cm from q2',
        '10 cm from q1 & 15 cm from q2',
        '35 cm from q1 & 15 cm from q2',
        '20 cm from q1 & 45 cm from q2'
      ],
      correctAnswer: 0
    },
    {
      id: 18,
      text: 'A body falls from a height of 100 m. At the same instant, a second body is thrown vertically downward from a height of 400 m with a velocity v0. The two bodies strike the earth at the same instant. Find the initial velocity of the second body.',
      options: [
        '10√5 m/s',
        '30√5 m/s',
        '20√5 m/s',
        '40√5 m/s'
      ],
      correctAnswer: 2
    },
    {
      id: 19,
      text: 'From the given circuit below, the currents through the 6 Ω and 12 Ω resistors respectively are:',
      image: '/Phyiscsimages/q19.jpg',
      options: [
        '3 A & 2 A',
        '4 A & 3 A',
        '1 A & 0.5 A',
        '1.2 A & 3 A'
      ],
      correctAnswer: 2
    },
    {
      id: 20,
      text: 'A substance whose density is equal to 0.4 × 103 kg/m3 floats in fresh water (ρw = 1000 kg/m3). What fraction of its volume is submerged?',
      options: [
        '1/2',
        '1/5',
        '2/5',
        '1/4'
      ],
      correctAnswer: 2
    },
    {
      id: 21,
      text: 'In the figure, the time it takes for the planet to go from A to B, C to D, and E to F is the same. Compare the areas A1, A2, and A3 in terms of size.',
      image: '/Phyiscsimages/q21.jpg',
      options: [
        'A1 ≠ A2 ≠ A3',
        'A1 = A2 = A3',
        'A1 = A2 > A3',
        'A1 > A2 = A3'
      ],
      correctAnswer: 1
    },
    {
      id: 22,
      text: 'Which one of the following is a WRONG action when a leak is suspected in high-pressure equipment?',
      options: [
        'Shut down and depressurize the system safely.',
        'Use hands to feel for escaping fluid from the system.',
        'Keep a safe distance from the suspected leak.',
        'Report the issue according to safety procedures.'
      ],
      correctAnswer: 1
    },
    {
      id: 23,
      text: 'The vertical component of a force acting at an angle of 37◦ to the horizontal is 12 N. What will be the magnitude of the force and its horizontal component respectively?',
      options: [
        '50 N, 30 N',
        '20 N, 16 N',
        '20 N, 25 N',
        '5 N, 25 N'
      ],
      correctAnswer: 1
    },
    {
      id: 24,
      text: 'What will be the value of m such that vectors A⃗ = 6ˆi−4ˆj +3ˆk and B⃗ = 2ˆi+mˆj −2ˆk are perpendicular?',
      options: [
        '2.5',
        '3',
        '1.5',
        '4'
      ],
      correctAnswer: 2
    },
    {
      id: 25,
      text: 'A particle moves in a circular path of radius 0.1 m with a constant angular speed of 10 rad/s. What is the centripetal acceleration of the particle?',
      options: [
        '10π2 m/s2',
        '20π2 m/s2',
        '10 m/s2',
        '40π2 m/s2'
      ],
      correctAnswer: 2
    },
    {
      id: 26,
      text: 'Three balls A, B, and C are thrown at angles 37◦, 45◦, and 53◦ respectively from the ground with the same initial speed u. Which of the following comparisons is correct about the horizontal distances (ranges) they travel?',
      options: [
        'Range of A = Range of B = Range of C',
        'Range of A = Range of C > Range of B',
        'Range of A = Range of C < Range of B',
        'Range of B > Range of C > Range of A'
      ],
      correctAnswer: 2
    },
    {
      id: 27,
      text: 'A solid sphere of radius R and moment of inertia I = 2/5 mR2 starts from rest and rolls down an inclined plane of height 7 m. What is the speed of the sphere at the bottom of the inclined plane? (Ignore friction)',
      options: [
        '10 m/s',
        '100 m/s',
        '30 m/s',
        '5 m/s'
      ],
      correctAnswer: 0
    },
    {
      id: 28,
      text: 'In a circuit diagram, a voltmeter is always connected in:',
      options: [
        'Series with the component',
        'Parallel with the component',
        'Either series or parallel',
        'It doesn’t matter'
      ],
      correctAnswer: 1
    },
    {
      id: 29,
      text: 'An ideal voltmeter should have:',
      options: [
        'Very low resistance',
        'Very high resistance',
        'Zero resistance',
        'Resistance equal to the circuit resistance'
      ],
      correctAnswer: 1
    },
    {
      id: 30,
      text: 'In the circuit below, if the ammeter A1 reads 3 A, what will be the reading of ammeter A2?',
      image: '/Phyiscsimages/q30.jpg',
      options: [
        '1 A',
        '2 A',
        '3 A',
        '6 A'
      ],
      correctAnswer: 0
    },
    {
      id: 31,
      text: 'Which of the following is a safety device that breaks the circuit when excess current flows?',
      options: [
        'Voltmeter',
        'Ammeter',
        'Fuse',
        'Rheostat'
      ],
      correctAnswer: 2
    },
    {
      id: 32,
      text: 'The north-seeking end of a compass needle points toward Earth’s:',
      options: [
        'Geographic North Pole, which is a magnetic north pole.',
        'Geographic North Pole, which is a magnetic south pole.',
        'Geographic South Pole, which is a magnetic north pole.',
        'Geographic South Pole, which is a magnetic south pole.'
      ],
      correctAnswer: 1
    },
    {
      id: 33,
      text: 'A long straight wire carries current upward as shown. At point P (east of the wire), the magnetic field direction is:',
      image: '/Phyiscsimages/q33.jpg',
      options: [
        'Into the page (⊗)',
        'Out of the page (⊙)',
        'Toward the wire',
        'Away from the wire'
      ],
      correctAnswer: 1
    },
    {
      id: 34,
      text: 'Two parallel wires carry currents in the directions shown. The force between them is:',
      image: '/Phyiscsimages/q34.jpg',
      options: [
        'Both cases show attraction.',
        'Both cases show repulsion.',
        'Case 1: Attraction, Case 2: Repulsion.',
        'Case 1: Repulsion, Case 2: Attraction.'
      ],
      correctAnswer: 2
    },
    {
      id: 35,
      text: 'When light passes from air into water, it bends:',
      options: [
        'Away from the normal',
        'Toward the normal',
        'Without bending',
        'Back into the air'
      ],
      correctAnswer: 1
    },
    {
      id: 36,
      text: 'A transformer has 200 primary turns and 50 secondary turns. If the input voltage is 120 V, what is the output voltage?',
      options: [
        '30 V',
        '60 V',
        '240 V',
        '480 V'
      ],
      correctAnswer: 0
    },
    {
      id: 37,
      text: 'A neutron decays into a proton, an electron, and an antineutrino. Which conservation law is most critical here?',
      options: [
        'Charge',
        'Mass',
        'Momentum',
        'Energy'
      ],
      correctAnswer: 0
    },
    {
      id: 38,
      text: 'Two identical guns fire identical bullets horizontally at the same speed from the same height above level planes, one on the Earth and the other on the Moon. (gMoon = 1/6 gEarth) Which of the following statements is true?',
      options: [
        'The horizontal distance traveled by the bullet is greater for the Earth.',
        'The flight time is less for the bullet on the Moon.',
        'The vertical component of velocity of the bullet just before impact is greater for the Earth.',
        'The vertical component of velocity of the bullet just before impact is greater for the Moon.'
      ],
      correctAnswer: 2
    },
    {
      id: 39,
      text: 'At a stop light, a truck traveling at a constant speed of 15 m/s passes a car as it starts from rest. If the car accelerates at 3 m/s2, how long will it take the car to overtake the truck?',
      options: [
        '5 s',
        '10 s',
        '15 s',
        '20 s'
      ],
      correctAnswer: 1
    },
    {
      id: 40,
      text: 'A river flows at 5 km/h west. A man rowing a boat at 10 km/h wishes to cross from the south bank to a point directly opposite on the north bank. At what angle must the boat be headed?',
      options: [
        '30° East of North',
        '60° East of North',
        '30° North of East',
        '60° North of West'
      ],
      correctAnswer: 0
    },
    {
      id: 41,
      text: 'A 0.5 kg block rests on a horizontal, frictionless surface as in the figure below. The block is pressed back against a spring having a constant of k = 625 N/m, compressing the spring by 10 cm to point A and then released. What is the speed of the block when it loses contact with the spring?',
      image: '/Phyiscsimages/q41.jpg',
      options: [
        '2.25 m/s',
        '1.25 m/s',
        '2.5 m/s',
        '5.0 m/s'
      ],
      correctAnswer: 2
    },
    {
      id: 42,
      text: 'What is the purpose of a simple machine?',
      options: [
        'To multiply either force or distance.',
        'To multiply energy, force, and speed.',
        'To multiply work, speed, and change direction.',
        'To multiply both force and speed at the same time.'
      ],
      correctAnswer: 0
    },
    {
      id: 43,
      text: 'Hydraulic car lifts make use of the principle of a hydraulic press in which the smaller circular piston has a radius of 10 mm and the larger piston has a radius of 4 cm. What force must be applied to the smaller piston to obtain a force of 1600 N at the larger piston?',
      options: [
        '6.25 N',
        '400 N',
        '25 N',
        '100 N'
      ],
      correctAnswer: 3
    },
    {
      id: 44,
      text: 'The point in the phase diagram where the fusion curve, the vapor pressure curve, and the sublimation curve join is called the:',
      options: [
        'Boiling point.',
        'Triple point.',
        'Critical point.',
        'Melting point.'
      ],
      correctAnswer: 1
    },
    {
      id: 45,
      text: 'What makes an oscillatory motion a simple harmonic motion?',
      options: [
        'The acceleration of the motion is directly proportional to the velocity.',
        'The velocity of the motion is directly proportional to the displacement.',
        'The acceleration of the motion is directly proportional in magnitude but opposite in direction to the displacement.',
        'The velocity of the motion is inversely proportional to the displacement.'
      ],
      correctAnswer: 0
    },
    {
      id: 46,
      text: 'The loudness of sound changes from L1 = 30 dB to L2 = 60 dB. What is the ratio of intensities I2 / I1 in the two cases?',
      options: [
        '2',
        '4',
        '600',
        '1000'
      ],
      correctAnswer: 3
    },
    {
      id: 47,
      text: 'Why is an interference pattern NOT observed between the lights produced from a pair of car headlights?',
      options: [
        'The light sources are not collimated.',
        'The light sources are not coherent.',
        'Interference is observed only in laboratory conditions.',
        'The spread of light as it travels out of the source.'
      ],
      correctAnswer: 1
    },
    {
      id: 48,
      text: 'Which of the following is the application of the Doppler effect?',
      options: [
        'Radar',
        'Medical imaging (ultrasound)',
        'Astronomy',
        'All of the above'
      ],
      correctAnswer: 3
    },
    {
      id: 49,
      text: 'Which application of quantum physics is specifically designed to enhance the security of information exchange?',
      options: [
        'Quantum computing',
        'Quantum cryptography',
        'Quantum tunneling',
        'Quantum imaging'
      ],
      correctAnswer: 1
    },
    {
      id: 50,
      text: 'MRI technology relies on the magnetic behavior of:',
      options: [
        'Hydrogen nuclei',
        'X-ray photons',
        'Neutrons in solids',
        'Electrons in metals'
      ],
      correctAnswer: 0
    }
  ]
};
