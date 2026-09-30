export interface EconomicsQuestion {
  id: number;
  question: string;
  options: { [key: string]: string };
  correctAnswer?: string;
}

export const economicsExam: EconomicsQuestion[] = [
  {
    id: 1,
    question: "Which of the following is used to calculate GDP by adding all the incomes accruing to all factors of production used in producing the national output?",
    options: {
      A: "Product approach",
      C: "Income approach",
      B: "Expenditure approach",
      D: "Value added approach"
    },
    correctAnswer: "C"
  },
  {
    id: 2,
    question: "If a farmer sells Wheat to miller for birr.1000 and miller sells flour to baker for birr.1200 and baker sells bread to consumer for birr.1500, then total value added by Miller and baker is:",
    options: {
      A: "500",
      B: "1000",
      C: "1200",
      D: "1500"
    },
    correctAnswer: "A"
  },
  {
    id: 3,
    question: "Reasonable measure of the standard of living in a country is suggested to be:",
    options: {
      A: "Real GDP per person.",
      C: "Nominal GDP per person.",
      B: "The growth rate of nominal GDP per person.",
      D: "Real GDP"
    },
    correctAnswer: "A"
  },
  {
    id: 4,
    question: "In perfect competitive market structure firm A sale 25unit of banan at 5birr per unit and in order to produce 20 unit of banana firm A use 100 total cost , what is the value of total revenue",
    options: {
      A: "215",
      B: "85",
      C: "100",
      D: "125"
    },
    correctAnswer: "D"
  },
  {
    id: 5,
    question: "A perfectly competitive firm produces 50 units at price 20 birr; FC = 200, VC = 600. Profit equals:",
    options: {
      A: "200",
      B: "300",
      C: "400",
      D: "500"
    },
    correctAnswer: "C"
  },
  {
    id: 6,
    question: "A country reports the following data (in billions): C = 650, I = 200, G = 300, X = 150, M = 100. What is GDP?",
    options: {
      A: "1200",
      B: "1100",
      C: "1300",
      D: "1250"
    },
    correctAnswer: "A"
  },
  {
    id: 7,
    question: "Assume that the marginal cost of a competitive firm is given by: MC = 4Q +12  and the marginal Revenue of the firm is given by, MR =  8Q, find the firms profit maximization level of output.",
    options: {
      A: "1",
      B: "3",
      C: "4",
      D: "6"
    },
    correctAnswer: "B"
  },
  {
    id: 8,
    question: "Given below are the cost and revenue functions of a monopolistic firm: TC = 10 + 5 Q; TR = 20 Q –2 Q2 ; MC = 20; MR = 30 – 5 Q, What is Profit-maximizing level of output",
    options: {
      A: "5",
      B: "10",
      C: "2",
      D: "8"
    },
    correctAnswer: "A"
  },
  {
    id: 9,
    question: "Under monopolistic competition, firms face:",
    options: {
      A: "Perfectly elastic demand",
      B: "Downward sloping demand",
      C: "Vertical demand curve",
      D: "No competition"
    },
    correctAnswer: "B"
  },
  {
    id: 10,
    question: "A perfectly competitive firm produces 50 units at price 20 birr; TFC = 200, TVC = 600. Profit equals:",
    options: {
      A: "200",
      B: "300",
      C: "400",
      D: "50"
    },
    correctAnswer: "C"
  },
  {
    id: 11,
    question: "Which of the following scenarios would lead to a simultaneous increase in the price level and an indeterminate change in real GDP in the short run within the AD/AS model?",
    options: {
      A: "An increase in government spending and an increase in net exports",
      B: "A decrease in household savings and an increase in the cost of raw materials",
      C: "A decrease in business taxes and a decrease in the money supply",
      D: "An increase in consumer confidence and a positive supply shock"
    }
  },
  {
    id: 12,
    question: "If an economy is operating at full employment (long-run equilibrium) and the central bank increases the money supply in the long run, we can expect:",
    options: {
      A: "Only the price level to increase",
      B: "Only real GDP to increase",
      C: "Both price level and real GDP to increase",
      D: "The price level to decrease and real GDP to remain unchanged",
      E: "Nominal GDP to remain unchanged but real GDP to increase"
    },
    correctAnswer: "A"
  },
  {
    id: 13,
    question: "An increase in the value of the U.S. dollar relative to other currencies would cause the U.S. aggregate demand curve to:",
    options: {
      A: "Shift to the right due to an increase in exports",
      B: "Shift to the left due to a decrease in imports",
      C: "Shift to the right due to an increase in net exports",
      D: "Shift to the left due to a decrease in net exports",
      E: "Remain unchanged as exchange rates only affect microeconomic demand"
    },
    correctAnswer: "D"
  },
  {
    id: 14,
    question: "The long-run aggregate supply (LRAS) curve is vertical because:",
    options: {
      A: "Nominal wages and other input prices are sticky in the long run",
      B: "In the long run the economy’s potential output is determined by the price level.",
      C: "The LRAS curve represents the idea that input prices have fully adjusted to change in the price level, so real output is independent of the price level",
      D: "Technological advancements only affect the short-run aggregate supply (SRAS) curve, not the long-run potential"
    },
    correctAnswer: "C"
  },
  {
    id: 15,
    question: "In the Kynesian  range of the aggregate supply curve (where it is horizontal), an increase in aggregate demand will lead to:",
    options: {
      A: "An increase in the price level and real national output",
      B: "Only an increase in the price level",
      C: "Only an increase in the level of real national output, with no change in the price level, due to spare capacity",
      D: "A decrease in unemployment and a rise in the price level"
    },
    correctAnswer: "C"
  },
  {
    id: 16,
    question: "Which of the following would likely cause an inward (leftward) shift of a country's short-run aggregate supply (SRAS) curve?",
    options: {
      A: "A significant increase in labor productivity due to better education and training",
      B: "A fall in the general price level (deflation)",
      C: "A substantial depreciation of the nation's currency, making imported components cheaper",
      D: "An increase in the expected future price level, leading to higher wage demands"
    },
    correctAnswer: "D"
  },
  {
    id: 17,
    question: "Suppose an economy is in long-run equilibrium, A negative real shock—such as a severe, prolonged drought that stifles crop growth,would most likely cause:",
    options: {
      A: "The LRAS curve to shift right and the SRAS curve to shift right",
      B: "The AD curve to shift lift , causing a recession in the short run.",
      C: "The LRAS curve to shift left, causing a decrease in potential growth and an increase in inflation (stagflation)",
      D: "No change in LRAS, but a leftward shift of the SRAS as prices temporarily rise"
    },
    correctAnswer: "C"
  },
  {
    id: 18,
    question: "The short-run aggregate supply curve slopes upward because:",
    options: {
      A: "Changes in wages and other resource prices completely offset changes in the price level",
      B: "The real-balance effect causes consumption to change as the price level changes",
      C: "Wages and other resource prices adjust only slowly to changes in the overall price level (sticky wages)",
      D: "Firms become more profitable at lower price levels in the short run"
    },
    correctAnswer: "C"
  },
  {
    id: 19,
    question: "Which of the following factors is fundamental to an economy’s potential growth rate and thus affects the LRAS but not considered a primary determinant of the short-run position of the SRAS curve?",
    options: {
      A: "Availability of natural resources",
      C: "The size and quality of the labor force",
      B: "The level of technology",
      D: "The money supply"
    },
    correctAnswer: "B"
  },
  {
    id: 20,
    question: "In a scenario where the output cost of disinflation needs to be minimized, which characteristic of the SRAS curve is most desirable for policymakers?",
    options: {
      A: "A steeper AS curve, as it requires a smaller drop in output to achieve a given drop in inflation.",
      B: "A flatter AS curve, as it requires a smaller drop in output to achieve a given drop in inflation.",
      C: "A vertical AS curve in the short run.",
      D: "A perfectly elastic AS curve, which prevents any disinflation."
    },
    correctAnswer: "B"
  },
  {
    id: 21,
    question: "When an economy’s actual output is below its potential GDP (long-run macroeconomic equilibrium), what is the implication for input prices like wages in the long run?",
    options: {
      A: "Input prices will immediately rise to match the price level, restoring equilibrium.",
      B: "Input prices will fall to adjust to the lower demand, shifting the SRAS to the lower demand ,shifting  the SRAS to the  right restoring full employment in the long run.",
      C: "Input prices will remain unchanged indefinitely due to labor contracts.",
      D: "The AD curve will shift to the right to meet the SRAS at the lower output level."
    },
    correctAnswer: "B"
  },
  {
    id: 22,
    question: "An improvement in technology, other things equal, will cause:",
    options: {
      A: "The aggregate demand curve to shift to the left",
      B: "The short-run aggregate supply curve to shift to the left",
      C: "The short-run aggregate supply curve to shift to the right and the long-run aggregate supply curve to shift to the right",
      D: "No change in aggregate supply, only an increase in the price level"
    },
    correctAnswer: "C"
  },
  {
    id: 23,
    question: "In the long run ,the position of the aggregate supply curve is determined by:",
    options: {
      A: "The level of government spending and taxation",
      B: "The quantity and quality of production factors such as labor, capital, and technology",
      C: "The current price level and the expected future price level",
      D: "The level of consumer and business confidence"
    },
    correctAnswer: "B"
  },
  {
    id: 24,
    question: "The “free-rider” problem is most likely to occur with a good that is:",
    options: {
      A: "Rival and excludable",
      C: "Non-rival and excludable",
      B: "Rival and non-excludable",
      D: "Non-rival and non-excludable"
    },
    correctAnswer: "D"
  },
  {
    id: 25,
    question: "A common-pool resource (e.g., an ocean fishery) is characterized by which of the following?",
    options: {
      A: "Non-rivalry and excludability",
      C: "Non-rivalry and non-excludability",
      B: "Rivalry and excludability",
      D: "Rivalry and non-excludability"
    },
    correctAnswer: "D"
  },
  {
    id: 26,
    question: "In the presence of a negative production externality, the competitive market equilibrium results in a quantity that is:",
    options: {
      A: "Socially optimal",
      C: "Greater than the socially optimal quantity",
      B: "Less than the socially optimal quantity",
      D: "Efficient only if the Coase theorem conditions are Meet."
    },
    correctAnswer: "C"
  },
  {
    id: 27,
    question: "A Pigovian tax is most effective when it is levied at a rate equal to the:",
    options: {
      A: "Marginal private cost at the market equilibrium",
      B: "Marginal social benefit at the market equilibrium",
      C: "Marginal external cost at the socially optimal output level",
      D: "Total external cost at the market equilibrium"
    },
    correctAnswer: "C"
  },
  {
    id: 28,
    question: "When a beekeeper's bees pollinate a neighbor’s orchard owner's apple trees, a positive production externality occurs. In an unregulated market, this activity will likely be:",
    options: {
      A: "Over-produced relative to the social optimum",
      C: "Produced  at the social optimum  due to market forces",
      B: "Under-produced relative to the social optimum",
      D: "Treated as a pure public  good"
    },
    correctAnswer: "B"
  },
  {
    id: 29,
    question: "If a market for a good with asymmetric information completely collapses (no transactions occur), it is referred to as a:",
    options: {
      A: "Partial market failure",
      C: "Monopoly of knowledge",
      B: "Complete or missing market failure",
      D: "Positive information externality"
    },
    correctAnswer: "B"
  },
  {
    id: 30,
    question: "When the production of a good generates significant external benefits, the government might implement a subsidy. The goal of this policy is to shift the:",
    options: {
      A: "Marginal Private Cost to be equal to the marginal social cost",
      B: "Marginal Private Benefit to equal the marginal social benefit",
      C: "Demand curve to the left",
      D: "Supply curve to the right of the social optimum"
    },
    correctAnswer: "B"
  },
  {
    id: 31,
    question: "In an economy with both negative externalities and public goods, the free market will generally produce:",
    options: {
      A: "More public goods and fewer negative externalities than is socially optimal",
      B: "Less public good and more negative externalities than is socially optimal",
      C: "The socially optimal level if the external cost are zero",
      D: "An efficient outcome only with significant  government intervention"
    },
    correctAnswer: "B"
  },
  {
    id: 32,
    question: "Which one of the following investment does not affect economic growth directly?",
    options: {
      A: "Building of new factories",
      B: "Investment in infrastructure",
      C: "Investment in new machinery and equipment",
      D: "Provision of education and tourism"
    },
    correctAnswer: "D"
  },
  {
    id: 33,
    question: "If the consumption function of an individual is given as C = 10 + 0.5YBir. If the individual’s disposable income for specific period was 100Birr, saving of the individual during the same period is ---------Birr.",
    options: {
      A: "50",
      B: "35",
      C: "25",
      D: "40"
    },
    correctAnswer: "B"
  },
  {
    id: 34,
    question: "Which one of the following decrease saving?",
    options: {
      A: "increase in disposable ",
      B: "Fall  in expected price",
      C: "increase income inequality",
      D: "decrease in disposable income"
    },
    correctAnswer: "D"
  },
  {
    id: 35,
    question: "Which one of the following statements correctly describes the consumption and saving linkage of households?",
    options: {
      A: "Increase in income of house hold has a negative influence on the consuming and saving behavior of the house hold",
      B: "If marginal propensity to consume (MPC) fall marginal propensity to save (MPS) must necessarily rises",
      C: "If the average propensity to consume (APC) of house hold is 0.2, then the average propensity to save (APS) for the same same household can be 0.9",
      D: "If marginal propensity to consume (MPC) of house hold is 0.5, then the marginal propensity to save (MPS) for the same house hold can be 0.7."
    },
    correctAnswer: "B"
  },
  {
    id: 36,
    question: "An increase in direct taxes results in a reduction in disposable income. How does this affect the consumption and saving functions?",
    options: {
      A: "Both consumption and saving curves shift upward simultaneously.",
      B: "Consumption decreases, saving increases, and MPC rises.",
      C: "Both consumption and saving curves shift downward because households have less income to allocate.",
      D: "Consumption remains unchanged because autonomous consumption offsets tax  effects"
    },
    correctAnswer: "C"
  },
  {
    id: 37,
    question: "If the consumption function of an individual is given as C = 200 + 0.25Y, If the individual’s disposable income for specific period was 2000Birr, Marginal propensity to consumption (MPC) is_____________.",
    options: {
      A: "0.75",
      B: " 0.4",
      C: "0.25",
      D: "0.35"
    },
    correctAnswer: "C"
  },
  {
    id: 38,
    question: "Based on question \"6\"what is the value of saving",
    options: {
      A: "400",
      B: "700",
      C: "300",
      D: "500"
    },
    correctAnswer: "C"
  },
  {
    id: 39,
    question: "A household has an average propensity to consume (APC) of 0.75. Based on this  information, which of the following interpretations is correct?",
    options: {
      A: "The household spends 75% of any additional birr received as income.",
      B: "The household spends 75% of total disposable income on consumption over agiven period.",
      C: "The household’s marginal propensity to save (MPS) must be 0.75.",
      D: "The household spends nothing out of autonomous income"
    },
    correctAnswer: "B"
  },
  {
    id: 40,
    question: "Based on question above what is the value of average propensity to save ( APS)",
    options: {
      A: "0.35%",
      B: "0.75%",
      C: "0.25%",
      D: "0.45%"
    },
    correctAnswer: "C"
  },
  {
    id: 41,
    question: "If income rises 400→500 and consumption rises 350→400, MPC is:",
    options: {
      A: "0.75",
      B: "0.3",
      C: "0.5",
      D: "0.35"
    },
    correctAnswer: "C"
  },
  {
    id: 42,
    question: "Consumption, when disposable income zero is:",
    options: {
      A: "Induced consumption",
      C: "Saving",
      B: "Autonomous investment",
      D: "Autonomous consumption"
    },
    correctAnswer: "D"
  },
  {
    id: 43,
    question: "Anything that is not consumed is considerd to be:",
    options: {
      A: "Saving",
      C: "Replacement investment",
      B: "Autonomous consumption",
      D: "Autonomous investment"
    },
    correctAnswer: "A"
  },
  {
    id: 44,
    question: "The value of MPC always lies between",
    options: {
      A: "0 and 1",
      B: "1 and 2",
      C: "−1 and 0",
      D: "2 and 3"
    },
    correctAnswer: "A"
  },
  {
    id: 45,
    question: "Factors affecting consumption includes",
    options: {
      A: "income",
      B: "wealth",
      C: "interest rate",
      D: "all of the above"
    },
    correctAnswer: "D"
  },
  {
    id: 46,
    question: "The saving function shows the relationship between",
    options: {
      A: "income and saving",
      B: "price and saving",
      C: "profit and saving",
      D: "cost and saving"
    },
    correctAnswer: "A"
  },
  {
    id: 47,
    question: "Which of the following is NOT a determinant of consumption?",
    options: {
      A: "Income level",
      B: " Interest rates",
      C: "Exchange rates",
      D: "Future expectations"
    },
    correctAnswer: "C"
  },
  {
    id: 48,
    question: "Which of the following statements is true?",
    options: {
      A: "MPS is higher for poor people than for rich people",
      B: "MPS is lower for poor people than for rich people",
      C: "MPC and MPS are not related",
      D: "APC and APS can be greater than 1"
    },
    correctAnswer: "B"
  },
  {
    id: 49,
    question: "Which of the following best defines the primary scope of macroeconomics?",
    options: {
      A: "The study of how individual households and firms make decisions.",
      B: "The analysis of price determination for a specific product in a single market.",
      C: "The study of the behavior and performance of an economy as a whole.",
      D: "The investigation of competitive strategies used by large corporations."
    },
    correctAnswer: "C"
  },
  {
    id: 50,
    question: "Which set of variables represent the primary focus areas of macroeconomic analysis?",
    options: {
      A: "Consumer preferences, firm output, and marginal utility.",
      B: "National income, unemployment and inflation.",
      C: "Opportunity cost, supply of a single good, and demand for a single good.",
      D: "Individual labor supply and business marketing budgets."
    },
    correctAnswer: "B"
  },
  {
    id: 51,
    question: "Which of the following is considered a core macroeconomic objective for most governments?",
    options: {
      A: "Maximizing the profit of private technology firms.",
      B: "Achieving stable economic growth and low unemployment.",
      C: "Setting the price for all consumer electronics.",
      D: "Eliminating the need for international trade."
    },
    correctAnswer: "B"
  },
  {
    id: 52,
    question: "When a central bank increases interest rates to combat inflation, what is the most likely short-term “trade-off” or challenge?",
    options: {
      A: "Increased consumer spending",
      B: "A slowdown in GDP growth",
      C: "Lower unemployment rates",
      D: "A decrease in the exchange rate."
    },
    correctAnswer: "B"
  },
  {
    id: 53,
    question: "“Cost-Push” inflation is typically driven by:",
    options: {
      A: "Excessive government spending",
      B: "Rising production costs, such as energy or raw materials.",
      C: "An increase in the total money supply",
      D: "High levels of consumer demand."
    },
    correctAnswer: "B"
  },
  {
    id: 54,
    question: "A “Balance of payments” deficit specifically refers to a challenge where:",
    options: {
      A: "Government spending exceeds tax revenue.",
      B: "The value of imports and capital outflows exceeds exports and inflows.",
      C: "The central bank has run out of physical currency.",
      D: "Banks have more liabilities than assets."
    },
    correctAnswer: "B"
  },
  {
    id: 55,
    question: "The “Natural Rate of Unemployment” includes which of the following?",
    options: {
      A: "Frictional and cyclical unemployment.",
      B: "Cyclical and structural unemployment.",
      C: "Frictional and structural unemployment.",
      D: "Only cyclical unemployment."
    },
    correctAnswer: "C"
  },
  {
    id: 56,
    question: "What is the main challenge of using “Expansionary Fiscal Policy” (increasing spending or cutting taxes)?",
    options: {
      A: "It can lead to deflation.",
      B: "It may increase the national budget deficit.",
      C: "It always causes a rise in the value of the currency.",
      D: "It reduces the total money supply."
    },
    correctAnswer: "B"
  },
  {
    id: 57,
    question: "According to the classical school, what primary mechanism ensures the economy is always self-correcting to full employment?",
    options: {
      A: "Government fiscal intervention",
      B: "Flexible prices and wages",
      C: "Managing the money supply at a constant rate",
      D: "Sticky price levels."
    },
    correctAnswer: "B"
  },
  {
    id: 58,
    question: "In the Keynesian model, “sticky” wages and prices imply that:",
    options: {
      A: "Markets clear instantly during a recession.",
      B: "The economy may remain in equilibrium at less than full employment.",
      C: "Inflation is the only serious economic problem.",
      D: "Government intervention is always harmful."
    },
    correctAnswer: "B"
  },
  {
    id: 59,
    question: "The Monetarist school, led by Milton Friedman, argues that inflation is primarily caused by:",
    options: {
      A: "Excess government spending",
      B: "Excessive growth in the money supply",
      C: "Supply-side shocks like oil price increases",
      D: "Low consumer confidence."
    },
    correctAnswer: "B"
  },
  {
    id: 60,
    question: "The Real Business Cycle (RBC) theory attributes economic fluctuations primarily to:",
    options: {
      A: "Changes in the money supply",
      B: "Unstable consumer demand",
      C: "Shocks to technology and productivity.",
      D: "Ineffective fiscal policy."
    },
    correctAnswer: "C"
  },
  {
    id: 61,
    question: "The “Liquidity Preference” theory, which explains the demand for money, was a major contribution of which economist?",
    options: {
      A: "Milton Friedman",
      B: "Adam Smith",
      C: "John Maynard Keynes",
      D: "David Ricardo"
    },
    correctAnswer: "C"
  },
  {
    id: 62,
    question: "Which of the following best defines aggregate demand (AD) in an open economy?",
    options: {
      A: "The total supply of goods and services produced within a country.",
      B: "The sum of consumption, investment, government spending, and net exports.",
      C: "The total demand for money by households and firms.",
      D: "The total value of all final goods and services exported to other countries."
    },
    correctAnswer: "B"
  },
  {
    id: 63,
    question: "Which of the following would cause a movement along the aggregate demand curve rather than a shift of the curve?",
    options: {
      A: "An increase in the overall price level.",
      B: "A decrease in personal income tax rates.",
      C: "An increase in government infrastructure spending.",
      D: "A rise in consumer confidence about future income."
    },
    correctAnswer: "A"
  },
  {
    id: 64,
    question: "Why does the aggregate demand curve typically slope downward?",
    options: {
      A: "The substitution effect and income effect.",
      B: "The wealth effect, the interest rate effect, and the exchange rate effect.",
      C: "Decreasing returns to scale in production.",
      D: "Sticky wages and prices in the short run."
    },
    correctAnswer: "B"
  },
  {
    id: 65,
    question: "If the government increases spending on public services while keeping taxes constant, what is the likely impact on the AD curve?",
    options: {
      A: "It will shift to the left.",
      B: "It will shift to the right.",
      C: "There will be a downward movement along the curve.",
      D: "The curve will become vertical."
    },
    correctAnswer: "B"
  },
  {
    id: 66,
    question: "A rise in the value of a country’s currency (appreciation) most likely results in:",
    options: {
      A: "An outward shift of SRAS because imported components become cheaper.",
      B: "An inward shift of SRAS because exports become more expensive.",
      C: "A movement up along the existing SRAS curve.",
      D: "No change in aggregate supply."
    },
    correctAnswer: "B"
  },
  {
    id: 67,
    question: "In the long run, the aggregate supply (LRAS) curve is vertical because:",
    options: {
      A: "Wages and other resource prices eventually adjust to match changes in the price level.",
      B: "Government regulations prevent prices from changing.",
      C: "Output is always at its absolute maximum capacity.",
      D: "Producers are unresponsive to any economic incentives."
    },
    correctAnswer: "A"
  },
  {
    id: 68,
    question: "Which of the following would NOT cause a shift in the aggregate supply curve?",
    options: {
      A: "An increase in labor productivity.",
      B: "A decline in the price of imported raw materials.",
      C: "An increase in the general price level.",
      D: "A change in business taxes."
    },
    correctAnswer: "C"
  },
  {
    id: 69,
    question: "If the economy experiences “stagflation” (cost-push inflation), which shift has occurred?",
    options: {
      A: "Aggregate demand shifted to the right.",
      B: "Long-run aggregate supply shifted to the right.",
      C: "Short-run aggregate supply shifted to the left.",
      D: "Short-run aggregate supply shifted to the right."
    },
    correctAnswer: "C"
  },
  {
    id: 70,
    question: "Technological advancements generally affect aggregate supply by:",
    options: {
      A: "Shifting the SRAS curve to the left due to higher training costs.",
      B: "Shifting both the SRAS and LRAS curves to the right by increasing productivity.",
      C: "Increasing the slope of the curve.",
      D: "Having no effect on the long-run potential of the economy."
    },
    correctAnswer: "B"
  },
  {
    id: 71,
    question: "Short-run macroeconomic equilibrium occurs specifically where:",
    options: {
      A: "The AD curve intersects the Long-Run Aggregate Supply (LRAS) curve.",
      B: "The Short-Run Aggregate Supply (SRAS) curve intersects the LRAS curve.",
      C: "The AD curve intersects the SRAS curve.",
      D: "Potential GDP is exactly equal to actual GDP."
    },
    correctAnswer: "C"
  },
  {
    id: 72,
    question: "If the government decides to decrease personal income taxes, how will it affect the AD-AS equilibrium?",
    options: {
      A: "AD shifts left, lowering both the price level and real GDP.",
      B: "AD shifts right, increasing both the price level and real GDP.",
      C: "SRAS shifts right due to lower business costs.",
      D: "No change occurs in the short run."
    },
    correctAnswer: "B"
  },
  {
    id: 73,
    question: "In the long run, the aggregate supply curve is vertical because:",
    options: {
      A: "Prices and wages are “sticky” and do not adjust.",
      B: "The economy’s potential output is determined by resources and technology, not the price level.",
      C: "Government laws intervene to keep prices stable.",
      D: "Aggregate demand always equals aggregate supply in the long run."
    },
    correctAnswer: "B"
  },
  {
    id: 74,
    question: "A sudden and significant increase in the price of imported oil would most likely cause:",
    options: {
      A: "A rightward shift of the AD curve.",
      B: "A leftward shift of the SRAS curve (stagflation).",
      C: "A movement upward along the SRAS curve.",
      D: "A rightward shift of the LRAS curve."
    },
    correctAnswer: "B"
  },
  {
    id: 75,
    question: "Which of the following best describes the condition under which a “market failure” occurs?",
    options: {
      A: "When a business is unable to make a profit and is forced to close down.",
      B: "When the free market fails to allocate resources efficiently to maximize social welfare.",
      C: "When the government intervenes in a market by setting price ceilings.",
      D: "When there is intense competition between many small firms in an industry."
    },
    correctAnswer: "B"
  },
  {
    id: 76,
    question: "What are the two primary characteristics that define a “pure” public good?",
    options: {
      A: "Excludable and rival",
      B: "Non-excludable and rival",
      C: "Excludable and non-rival",
      D: "Non-excludable and non-rival"
    },
    correctAnswer: "D"
  },
  {
    id: 77,
    question: "Which of the following is the best example of a pure public good?",
    options: {
      A: "A congested city highway",
      B: "A subscription-based streaming service",
      C: "National defense",
      D: "A public library book"
    },
    correctAnswer: "C"
  },
  {
    id: 78,
    question: "How does the market typically respond to the provision of public goods without government intervention?",
    options: {
      A: "It provides the socially optimal amount.",
      B: "It overproduces the good due to high demand.",
      C: "It underproduces or fails to provide the good at all.",
      D: "It creates a natural monopoly."
    },
    correctAnswer: "C"
  },
  {
    id: 79,
    question: "When a negative externality exists in a market, which of the following is true?",
    options: {
      A: "The market equilibrium quantity is greater than the socially optimal quantity.",
      B: "The market equilibrium quantity is less than the socially optimal quantity.",
      C: "The social marginal cost is less than the private marginal cost.",
      D: "The market will naturally reach an efficient outcome."
    },
    correctAnswer: "A"
  },
  {
    id: 80,
    question: "What is the economic term for the sum of private costs and external costs?",
    options: {
      A: "Marginal private cost",
      B: "Marginal social cost",
      C: "Marginal external benefits",
      D: "Marginal social benefits"
    },
    correctAnswer: "B"
  },
  {
    id: 81,
    question: "How can a government internalize a negative externality produced by a firm?",
    options: {
      A: "By providing a subsidy to the firm",
      B: "By lowering taxes on the firm’s products",
      C: "By imposing a corrective (Pigouvian) tax equal to the external cost",
      D: "By allowing the firm to ignore its impact on third parties"
    },
    correctAnswer: "C"
  },
  {
    id: 82,
    question: "Which of the following is an example of “signaling” used to reduce asymmetric information?",
    options: {
      A: "An insurance company requiring a physical exam before issuing a policy",
      B: "A used car seller offering a comprehensive long-term warranty",
      C: "A government imposing a tax on luxury goods",
      D: "A bank increasing interest rates for all borrowers"
    },
    correctAnswer: "B"
  },
  {
    id: 83,
    question: "If a consumer is misled by a product’s packaging because it fails to mention correct usage procedures, which specific right has been violated?",
    options: {
      A: "Right to Choose",
      C: "Right to be Heard",
      B: "Right to Information",
      D: "Right to Consumer Education"
    },
    correctAnswer: "B"
  },
  {
    id: 84,
    question: "According to updated 2025 consumer standards, what is the generally recognized limitation period for filing a formal consumer complaint after a dispute arises?",
    options: {
      A: "6 months",
      B: "1 year",
      C: "2 years",
      D: "5 years"
    },
    correctAnswer: "C"
  },
  {
    id: 85,
    question: "Which of the following individuals would NOT be considered a “consumer” under the Act?",
    options: {
      A: "A person who buys goods for personal use through an online platform.",
      B: "A person who uses goods with the approval of the original buyer.",
      C: "A person who obtains goods for resale or commercial purposes.",
      D: "A person who avails a service for which payment is deferred."
    },
    correctAnswer: "C"
  },
  {
    id: 86,
    question: "Which of the following is NOT typically a goal of macroeconomic policy?",
    options: {
      A: "Stable prices (low inflation)",
      C: "Maximizing short-term corporate profits",
      B: "Sustainable economic growth",
      D: "Low unemployment"
    },
    correctAnswer: "C"
  },
  {
    id: 87,
    question: "What is the primary goal of contractionary fiscal policy?",
    options: {
      A: "Stimulating economic growth",
      C: "Increasing government spending",
      B: "Reducing inflationary pressure",
      D: "Lowering interest rates"
    },
    correctAnswer: "B"
  },
  {
    id: 88,
    question: "If the government increases infrastructure spending and lowers taxes to stimulate the economy, it is implementing:",
    options: {
      A: "Expansionary fiscal policy",
      C: "Expansionary monetary policy",
      B: "Contractionary fiscal policy",
      D: "Contractionary monetary policy"
    },
    correctAnswer: "A"
  },
  {
    id: 89,
    question: "Fiscal policy is typically controlled by:",
    options: {
      A: "Central banks",
      C: "Commercial banks",
      B: "Government finance ministries",
      D: "International monetary institutions"
    },
    correctAnswer: "B"
  },
  {
    id: 90,
    question: "What is the primary objective of most modern central banks when conducting monetary policy?",
    options: {
      A: "Reducing government debt",
      C: "Price stability (controlling inflation)",
      B: "Maximizing corporate profits",
      D: "Balancing the national budget"
    },
    correctAnswer: "C"
  },
  {
    id: 91,
    question: "n response to a severe economic recession, which combination of actions would represent an expansionary monetary policy?",
    options: {
      A: "Increasing interest rates and selling government bonds",
      B: "Decreasing the reserve requirement and buying government bonds",
      C: "Increasing the reserve requirement and increasing taxes",
      D: "Raising the discount rate and decreasing government spending"
    },
    correctAnswer: "B"
  },
  {
    id: 92,
    question: "In an effort to cool down an overheating economy, a central bank might implement:",
    options: {
      A: "Expansionary monetary policy",
      B: "Contractionary monetary policy",
      C: "Expansionary fiscal policy",
      D: "Contractionary fiscal policy."
    },
    correctAnswer: "B"
  },
  {
    id: 93,
    question: "According to labor market theory, how does the introduction of a national minimum wage above the equilibrium level affect a perfectly competitive labour market?",
    options: {
      A: "It increases the quantity of labour demanded by firms",
      B: "It has no effect on employment levels",
      C: "It creates a surplus of labor, typically leading to higher unemployment in that sector",
      D: "It shifts the labour supply curve to the left"
    },
    correctAnswer: "C"
  },
  {
    id: 94,
    question: "If the government intentionally lowers the value of its domestic currency in a fixed exchange rate system, this policy action is called:",
    options: {
      A: "Depreciation",
      B: "Appreciation",
      C: "Devaluation",
      D: "Revaluation"
    },
    correctAnswer: "C"
  },
  {
    id: 95,
    question: "A “Managed Floating” exchange rate system is best described as?",
    options: {
      A: "A system where the rate is fixed to the price of gold.",
      B: "A system where the rate is determined entirely by market forces without any intervention.",
      C: "A system where market forces determine the rate but the central bank intervenes to moderate extreme fluctuation.",
      D: "A system where the government changes the rate every day based on inflation."
    },
    correctAnswer: "C"
  },
  {
    id: 96,
    question: "Which of the following is a likely objective of government intervention in a currency devaluation policy?",
    options: {
      A: "To make imports cheaper for domestic consumer",
      B: "To make domestic export more competitive in the international market",
      C: "To increase the purchasing power of the domestic currency abroad.",
      D: "To discourage foreign tourists from visiting the country."
    },
    correctAnswer: "B"
  },
  {
    id: 97,
    question: "What is the primary difference between a fixed and a flexible exchange rate system?",
    options: {
      A: "Fixed exchange rates are set by market supply and demand, while flexible exchange rates are set by the government.",
      B: "Fixed rates are determined by the government or central bank, while flexible rates are determined by market forces.",
      C: "Fixed rates apply only to imports while flexible rates apply to exports.",
      D: "Fixed rates are used in developed countries and flexible rates are used in developing countries."
    },
    correctAnswer: "B"
  },
  {
    id: 98,
    question: "Which of the following best describes the relationship between investment (I) and the interest rate (r)?",
    options: {
      A: "As interest rates rise, investment increases.",
      B: "As interest rates rise, investment decreases.",
      C: "Investment is completely independent of interest rates.",
      D: "Interest rates only affect consumption, not investment."
    },
    correctAnswer: "B"
  },
  {
    id: 99,
    question: "According to the theory of comparative advantage, nations should trade with each other because:",
    options: {
      A: "It allows a country to produce everything it needs by itself.",
      B: "It ensures that both countries have equal wealth.",
      C: "It allows countries to specialize in producing goods with lower opportunity costs.",
      D: "It prevents countries from buying goods from other nations."
    },
    correctAnswer: "C"
  },
  {
    id: 100,
    question: "In the context of finance and the banking system, what is the \"Balance of Payments\" (BoP)?",
    options: {
      A: "A record of all transactions between a country and the rest of the world.",
      B: "The total amount of money a government borrows in a year.",
      C: "The difference between the highest and lowest interest rates in a bank.",
      D: "A report on the total consumption of a single household."
    },
    correctAnswer: "A"
  }
];
