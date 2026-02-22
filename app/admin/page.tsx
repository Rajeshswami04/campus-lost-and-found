import { 
  Users, Package, Clock, RefreshCcw, 
  MoreHorizontal, Eye, CheckCircle, XCircle, Trash2 
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 p-6 space-y-8">
      
      {/* 1️⃣ System Overview (Top Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Users" count="1,284" icon={<Users className="text-blue-400" />} />
        <SummaryCard title="Total Items" count="452" icon={<Package className="text-indigo-400" />} />
        <SummaryCard title="Open Items" count="89" icon={<Clock className="text-amber-400" />} />
        <SummaryCard title="Pending Claims" count="12" icon={<RefreshCcw className="text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* 2️⃣ Manage Items (The Core Admin Power) */}
        <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Manage Items</h2>
            <Button variant="outline" className="border-slate-700 text-slate-300">Export Report</Button>
          </div>
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Item Title</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Reporter (Roll)</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ItemTableRow title="MacBook Pro" type="Lost" roll="2024CS01" status="Open" />
              <ItemTableRow title="Black Wallet" type="Found" roll="2024ME42" status="Claimed" />
            </TableBody>
          </Table>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3️⃣ Manage Claims */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Pending Claims</h2>
            </div>
            <div className="p-4 space-y-4">
              <ClaimRequestRow name="iPhone 15" roll="22BIT04" msg="It has a blue cover." />
              <ClaimRequestRow name="Rolex Watch" roll="22BCE11" msg="Back is scratched." />
            </div>
          </section>

          {/* 4️⃣ Manage Users */}
          <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">User Controls</h2>
            </div>
            <div className="p-4 space-y-4">
              <UserRow roll="2021CS11" status="Active" verified={true} />
              <UserRow roll="2023EC05" status="Blocked" verified={false} />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

// --- Sub-Components (Styled for Midnight Blue) ---

function SummaryCard({ title, count, icon }: any) {
  return (
    <Card className="bg-[#111827] border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <div className="p-2 bg-slate-800 rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{count}</div>
      </CardContent>
    </Card>
  );
}

function ItemTableRow({ title, type, roll, status }: any) {
  return (
    <TableRow className="border-slate-800 hover:bg-slate-800/30">
      <TableCell className="font-medium text-slate-200">{title}</TableCell>
      <TableCell>
        <Badge className={type === "Lost" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}>
          {type}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-400">{roll}</TableCell>
      <TableCell>
        <span className="text-xs text-slate-300 px-2 py-1 rounded bg-slate-800 border border-slate-700">{status}</span>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">View</Button>
      </TableCell>
    </TableRow>
  );
}

function ClaimRequestRow({ name, roll, msg }: any) {
  return (
    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center">
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-xs text-slate-400">By {roll} • "{msg}"</p>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10"><CheckCircle size={18} /></Button>
        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/10"><XCircle size={18} /></Button>
      </div>
    </div>
  );
}

function UserRow({ roll, status, verified }: any) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">{roll.slice(-2)}</div>
        <div>
          <p className="text-sm font-medium text-white">{roll}</p>
          <p className="text-[10px] text-slate-500">{verified ? "✓ Verified" : "✗ Unverified"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={status === "Active" ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"}>
          {status}
        </Badge>
        <Button size="icon" variant="ghost" className="text-slate-500 hover:text-white"><MoreHorizontal size={18} /></Button>
      </div>
    </div>
  );
}