import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill';

declare global {
  interface Date {
    toTemporalInstant: typeof toTemporalInstant;
  }
}
Date.prototype.toTemporalInstant = toTemporalInstant;

interface Project {
  id: string;
  estimated_hours: number;
  budget: number;
  start_date: Temporal.Instant;
  status: 'created' | 'running';
}

interface Festangestellter {
  id: string;
  lohn_monat: number;
  stunden_monat: number;
  name: string;
  job: Job;
}
const seniorDev: Job = { multiplier: 1.5, job_title: 'Senior Dev' };
const juniorDev: Job = { multiplier: 0.5, job_title: 'Junior Dev' };

interface Freelancer {
  id: string;
  lohn_stunde: number;
  stunden_monat: number;
  name: string;
  job: Job;
}

const exampleProject: Project = {
  id: '1',
  estimated_hours: 24 * 30 * 4, // 6 months
  budget: 50000,
  start_date: Temporal.Now.instant(),
  status: 'created',
};

// Beispiel Festangestellte
const festangestellte: Festangestellter[] = [
  {
    id: '1',
    lohn_monat: 3000,
    stunden_monat: 40 * 4,
    name: 'Max Musterman',
    job: seniorDev,
  },
  {
    id: '2',
    lohn_monat: 4000,
    stunden_monat: 38 * 4,
    name: 'Anna Weber',
    job: { job_title: 'Backend Developer', multiplier: 1.3 },
  },
  /*     {
            id: "3",
            lohn_monat: 3500,
            stunden_monat: 42,
            name: 'Paul Fischer',
            job: { job_title: 'Quality Assurance Engineer', multiplier: 1.1 },
        },
        {
            id: "4",
            lohn_monat: 3800,
            stunden_monat: 40,
            name: 'Julia Meier',
            job: { job_title: 'Database Administrator', multiplier: 1.2 },
        },
        {
            id: "5",
            lohn_monat: 4200,
            stunden_monat: 36,
            name: 'Michael Richter',
            job: { job_title: 'Network Engineer', multiplier: 1.4 },
        },
        {
            id: "6",
            lohn_monat: 3900,
            stunden_monat: 37,
            name: 'Sophie Lehmann',
            job: { job_title: 'IT Support Specialist', multiplier: 1.15 },
        }, */
];
const freelancer: Freelancer[] = [
  {
    id: '1',
    lohn_stunde: 50,
    stunden_monat: 20 * 4,
    name: 'Max Musterman',
    job: { job_title: 'UX Designer', multiplier: 1.5 },
  },
  {
    id: '2',
    lohn_stunde: 40,
    stunden_monat: 25 * 4,
    name: 'Anna Schmidt',
    job: { job_title: 'Frontend Developer', multiplier: 1.8 },
  },
  {
    id: '3',
    lohn_stunde: 60,
    stunden_monat: 15 * 4,
    name: 'John Doe',
    job: { job_title: 'Data Scientist', multiplier: 2.0 },
  },
  {
    id: '4',
    lohn_stunde: 55,
    stunden_monat: 18 * 4,
    name: 'Sophie Müller',
    job: { job_title: 'Graphic Designer', multiplier: 1.7 },
  },
  {
    id: '5',
    lohn_stunde: 70,
    stunden_monat: 22 * 4,
    name: 'Chris Wagner',
    job: { job_title: 'Mobile App Developer', multiplier: 1.9 },
  },
  {
    id: '6',
    lohn_stunde: 45,
    stunden_monat: 30 * 4,
    name: 'Lena Bauer',
    job: { job_title: 'SEO Specialist', multiplier: 1.6 },
  },
  {
    id: '7',
    lohn_stunde: 65,
    stunden_monat: 25 * 4,
    name: 'David Klein',
    job: { job_title: 'Game Developer', multiplier: 2.2 },
  },
  {
    id: '8',
    lohn_stunde: 75,
    stunden_monat: 15 * 4,
    name: 'Laura Schneider',
    job: { job_title: 'AI Researcher', multiplier: 2.5 },
  },
  {
    id: '9',
    lohn_stunde: 60,
    stunden_monat: 20 * 4,
    name: 'Markus Hoffmann',
    job: { job_title: 'DevOps Engineer', multiplier: 2.0 },
  },
  {
    id: '10',
    lohn_stunde: 80,
    stunden_monat: 18 * 4,
    name: 'Elena Wolf',
    job: { job_title: 'UI/UX Designer', multiplier: 2.3 },
  },
  // Weitere Freelancer hinzufügen...
];

function getWorkValue(free: Freelancer) {
  return free.job.multiplier * free.lohn_stunde;
}

interface Job {
  job_title: string;
  multiplier: number;
}
interface Distribution {
  projekt_id: string;
  used_budget: number;
  estimated_end_date: Temporal.Instant;
  start_date: Temporal.Instant;
  festangestellte: Festangestellter[];
  freelancer: Freelancer[];
}

function balance(
  project: Project,
  festangestelllte: Festangestellter[],
  freelancer: Freelancer[],
  targetDate: Temporal.Instant
): Distribution {
  let remainingBudget = project.budget;
  const sortedFestangestellte = festangestelllte.toSorted(
    (a, b) => b.lohn_monat - a.lohn_monat
  );
  const filledUpFest = fillArrayTill(
    sortedFestangestellte,
    remainingBudget,
    []
  );
  let monthlyHours = filledUpFest.acc.reduce(
    (prev, current) => prev + current.stunden_monat,
    0
  );
  const monthlyCost = filledUpFest.acc.reduce(
    (prev, current) => prev + current.lohn_monat,
    0
  );
  const sortedFreelancer = freelancer.toSorted(
    (b, a) => getWorkValue(a) - getWorkValue(b)
  );
  const estimated_end_date = getEstimatedEndDate(
    monthlyHours,
    project.start_date,
    project.estimated_hours
  );
  const tillTime = project.start_date.until(estimated_end_date, {
    largestUnit: 'hour',
  });
  const result: Distribution = {
    estimated_end_date,
    festangestellte: filledUpFest.acc,
    freelancer: [],
    projekt_id: project.id,
    start_date: project.start_date,
    used_budget: monthlyCost,
  };
  if (tillTime.hours <= 0) {
    const festCost = tillTime.months * monthlyCost;
    result.used_budget += festCost;
    return result;
  }
  const targetDateMonths = project.start_date.until(targetDate).months + 1;
  const minFestCost = monthlyCost * targetDateMonths;
  const minFestHours = monthlyHours * targetDateMonths;
  remainingBudget -= minFestCost;
  if (remainingBudget > 0) {
    let newestimated_end_date = getEstimatedEndDate(
      monthlyHours,
      project.start_date,
      project.estimated_hours - minFestHours
    );
    let newtillTime = project.start_date
      .until(newestimated_end_date)
      .round({ smallestUnit: 'hour' });
    while (remainingBudget > 0 && newtillTime.hours > 0) {
      const free = sortedFreelancer.shift();
      if (!free)
        throw new Error(
          'Not enought freelancer for target date and budget ' +
            JSON.stringify({ target_date: targetDate, budget: project.budget })
        );
      const freeCost = free.lohn_stunde * free.stunden_monat * targetDateMonths;
      if (remainingBudget - freeCost < 0) break; // TODO add option overdraw
      result.freelancer.push(free);
      remainingBudget -= freeCost;
      monthlyHours += free.stunden_monat * targetDateMonths;
      newestimated_end_date = getEstimatedEndDate(
        monthlyHours,
        project.start_date,
        project.estimated_hours - minFestHours
      );
      newtillTime = project.start_date
        .until(newestimated_end_date)
        .round({ smallestUnit: 'hour' });
    }
    result.used_budget = project.budget - remainingBudget;
    return result;
  }

  throw new Error(
    'Can not meet target date with budget' +
      JSON.stringify({ target_date: targetDate, budget: project.budget })
  );
}

function fillArrayTill(
  sorted_festangestellte: Festangestellter[],
  remaining_budget: number,
  acc: Festangestellter[]
) {
  if (sorted_festangestellte.length <= 0) return { remaining_budget, acc };
  const [expensiver, ...rest] = sorted_festangestellte;
  if (remaining_budget <= 0 || remaining_budget < expensiver.lohn_monat)
    return { remaining_budget, acc };
  acc.push(expensiver);
  return fillArrayTill(rest, remaining_budget - expensiver.lohn_monat, acc);
}

function getEstimatedEndDate(
  monthlyHours: number,
  start_date: Temporal.Instant,
  estimated_hours: number
) {
  //const montlyDuration: Temporal.Duration = Temporal.Duration.from({ hours: monthlyHours })
  let endDate = Temporal.Instant.from(start_date);
  let n = Math.ceil(estimated_hours / monthlyHours);
  while (n > 0) {
    endDate = endDate.add({ hours: monthlyHours });
    n -= 1;
  }
  return endDate;
}

const ret = balance(
  exampleProject,
  festangestellte,
  freelancer,
  Temporal.Now.instant().add({ hours: 24 * 30 * 2 })
);
console.log(JSON.stringify(ret, null, 2));
