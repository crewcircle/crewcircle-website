/**
 * DigitalOcean billing integration.
 * Fetches account balance and droplet costs.
 * Requires DO_API_TOKEN env var with read scope.
 */
import { createServiceClient } from "@crewcircle/database";

const DO_API = "https://api.digitalocean.com/v2";

interface DOBalance {
  month_to_date_balance: string;
  account_balance: string;
  month_to_date_usage: string;
  generated_at: string;
}

export async function fetchDOBalance(): Promise<DOBalance | null> {
  const token = process.env.DO_API_TOKEN;
  if (!token) return null;

  const res = await fetch(`${DO_API}/customers/my/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data as DOBalance;
}

export async function getDOEstimatedMonthly(): Promise<number> {
  const balance = await fetchDOBalance();
  if (!balance) return 0;

  return parseFloat(balance.month_to_date_balance) || 0;
}
