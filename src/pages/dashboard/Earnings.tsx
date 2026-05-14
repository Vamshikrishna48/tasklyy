import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Earnings = () => {
  const { payments, profile } = useApp();

  const totalEarned = payments.filter((p) => p.type === "earned" && p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalSpent = payments.filter((p) => p.type === "spent" && p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const inEscrow = payments.filter((p) => p.status === "escrow").reduce((s, p) => s + p.amount, 0);
  
  const balance = profile?.wallet_balance ?? 0;

  const pieData = [
    { name: "Available", value: balance, color: "hsl(160 84% 39%)" },
    { name: "In Escrow", value: inEscrow, color: "hsl(45 93% 47%)" },
  ];

  const monthlyData = payments.length > 0
    ? Object.values(
        payments.reduce((acc, p) => {
          const month = new Date(p.date).toLocaleString("en-US", { month: "short" });
          if (!acc[month]) acc[month] = { month, earned: 0, spent: 0 };
          if (p.type === "earned" && p.status === "completed") acc[month].earned += p.amount;
          if (p.type === "spent" && p.status === "completed") acc[month].spent += p.amount;
          return acc;
        }, {} as Record<string, { month: string; earned: number; spent: number }>)
      )
    : [];

  const stats = [
    { label: "Available Balance", value: `₹${balance}`, icon: DollarSign, color: "text-primary", desc: "Ready to withdraw" },
    { label: "Total Earned", value: `₹${totalEarned}`, icon: TrendingUp, color: "text-primary", desc: "All time" },
    { label: "Total Spent", value: `₹${totalSpent}`, icon: ArrowUpRight, color: "text-accent", desc: "On posted jobs" },
    { label: "In Escrow", value: `₹${inEscrow}`, icon: Lock, color: "text-muted-foreground", desc: "Pending completion" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Earnings & Payments</h1>
        <p className="text-muted-foreground">Track your income and spending</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
                <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Monthly Breakdown</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(value: number) => [`₹${value}`]} />
                  <Bar dataKey="earned" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} name="Earned" />
                  <Bar dataKey="spent" fill="hsl(16 85% 61%)" radius={[4, 4, 0, 0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                No transactions yet. Start earning to see your breakdown!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Balance Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={4}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₹${value}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}: ₹{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Transaction History</h2>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${p.type === "earned" ? "bg-primary/10" : "bg-accent/10"}`}>
                    {p.type === "earned" ? (
                      <ArrowDownLeft className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{p.jobTitle}</div>
                    <div className="text-xs text-muted-foreground">{p.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={p.status === "escrow" ? "secondary" : "outline"} className="text-xs">
                    {p.status === "escrow" ? "Escrow" : "Done"}
                  </Badge>
                  <span className={`font-display text-sm font-bold ${p.type === "earned" ? "text-primary" : "text-accent"}`}>
                    {p.type === "earned" ? "+" : "-"}₹{p.amount}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
