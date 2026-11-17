/**
 * Business Model Simulator — hypothetical projections only.
 * Students are never charged: revenue comes from school and university
 * subscriptions, CSR / sponsored programme management fees and institutional
 * licences. All values are in AED.
 */
export interface BizInput {
  clients: number; // institutional subscribers at month 0
  price: number; // subscription per institution per month (AED)
  programs: number; // sponsored programmes at month 0
  programFee: number; // management fee per programme per month (AED)
  opex: number; // fixed operating expenses per month (AED)
  requestsPerClient: number; // verified requests per institution per month
  verificationCost: number; // variable cost per verified request (AED)
  cac: number; // customer acquisition cost per new institution (AED)
  licences?: number; // institutional licences (e.g. nonprofits, university offices) at month 0
  licenceFee?: number; // licence fee per month (AED)
}

export type Scenario = "conservative" | "moderate" | "optimistic";
export const SCENARIOS: Record<Scenario, { label: string; growth: number; churn: number; description: string }> = {
  conservative: { label: "Conservative", growth: 0.03, churn: 0.02, description: "3% monthly new institutions, 2% monthly churn" },
  moderate: { label: "Moderate", growth: 0.06, churn: 0.015, description: "6% monthly new institutions, 1.5% monthly churn" },
  optimistic: { label: "Optimistic", growth: 0.1, churn: 0.01, description: "10% monthly new institutions, 1% monthly churn" },
};

export interface MonthRow {
  month: number;
  clients: number;
  programs: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulative: number;
}

const r0 = (n: number) => Math.round(n);

export function project(input: BizInput, scenario: Scenario, months = 24): MonthRow[] {
  const { growth, churn } = SCENARIOS[scenario];
  const rows: MonthRow[] = [];
  let clients = Math.max(input.clients, 0);
  let programs = Math.max(input.programs, 0);
  let licences = Math.max(input.licences ?? 0, 0);
  let cumulative = 0;
  for (let m = 1; m <= months; m++) {
    const added = clients * growth;
    clients = clients + added - clients * churn;
    programs = programs * (1 + growth / 2); // sponsored programmes follow institutions, more slowly
    licences = licences * (1 + growth / 2);
    const revenue = clients * input.price + programs * input.programFee + licences * (input.licenceFee ?? 0);
    const costs = input.opex + clients * input.requestsPerClient * input.verificationCost + added * input.cac;
    const profit = revenue - costs;
    cumulative += profit;
    rows.push({ month: m, clients: Math.round(clients * 10) / 10, programs: Math.round(programs * 10) / 10, revenue: r0(revenue), costs: r0(costs), profit: r0(profit), cumulative: r0(cumulative) });
  }
  return rows;
}

export function summary(input: BizInput, scenario: Scenario) {
  const licenceRevenue = (input.licences ?? 0) * (input.licenceFee ?? 0);
  const mrr = input.clients * input.price + input.programs * input.programFee + licenceRevenue;
  const variable = input.clients * input.requestsPerClient * input.verificationCost;
  const costs = input.opex + variable; // month-0 run rate, before acquisition spend
  const contribution = input.price - input.requestsPerClient * input.verificationCost; // per institution per month
  const programRevenue = input.programs * input.programFee;
  const breakEvenClients = contribution > 0 ? Math.max(Math.ceil((input.opex - programRevenue - licenceRevenue) / contribution), 0) : null;
  const rows = project(input, scenario);
  const breakEvenMonth = rows.find((r) => r.profit >= 0)?.month ?? null;
  return { mrr: r0(mrr), arr: r0(mrr * 12), costs: r0(costs), profit: r0(mrr - costs), contribution: r0(contribution), breakEvenClients, breakEvenMonth, rows };
}
