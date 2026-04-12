/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAttendance } from "@/hooks/useAttendance";
import { useBranches } from "@/hooks/useBranches";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, Settings, FileDown, FileSpreadsheet, UserCheck, UserX, AlertTriangle } from "lucide-react";

const Attendance = () => {
  const { t, isRTL } = useLanguage();
  const { records, loadRecords, clockIn, clockOut, getMonthlySummary, getUsers, shiftStart, lateThreshold, saveSettings } = useAttendance();
  const { branches } = useBranches();

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [viewDate, setViewDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ shiftStart, lateThreshold: String(lateThreshold) });

  const users = useMemo(() => getUsers(), [getUsers]);
  const monthlySummary = useMemo(() => getMonthlySummary(viewMonth), [getMonthlySummary, viewMonth]);

  useEffect(() => { loadRecords({ date: viewDate }); }, [loadRecords, viewDate]);

  const handleClockIn = () => {
    if (!selectedUser) { toast({ title: t("selectEmployee"), variant: "destructive" }); return; }
    const ok = clockIn(selectedUser, selectedBranch || undefined);
    if (ok) {
      toast({ title: t("clockedIn") });
      loadRecords({ date: viewDate });
    } else {
      toast({ title: t("clockInFailed"), description: t("alreadyClockedOrLate"), variant: "destructive" });
    }
  };

  const handleClockOut = (id: string) => {
    clockOut(id);
    toast({ title: t("clockedOut") });
    loadRecords({ date: viewDate });
  };

  const handleSaveSettings = () => {
    saveSettings(settingsForm.shiftStart, parseInt(settingsForm.lateThreshold) || 60);
    toast({ title: t("settingsSaved") });
    setSettingsOpen(false);
  };

  const exportMonthPDF = () => {
    const headers = [t("employee"), t("totalDays"), t("presentDays"), t("lateDays"), t("absentDays"), t("totalHours")];
    const rows = monthlySummary.map((s) => [s.user_name, String(s.total_days), String(s.present_days), String(s.late_days), String(s.absent_days), String(s.total_hours)]);
    exportToPDF(`${t("monthlyAttendance")} — ${viewMonth}`, headers, rows, isRTL);
  };

  const statusColor = (s: string) => s === "present" ? "secondary" : s === "late" ? "outline" : "destructive";

  return (
    <AppLayout title={t("attendance")} subtitle={t("attendanceDesc")}
      actions={<Button variant="outline" size="sm" onClick={() => { setSettingsForm({ shiftStart, lateThreshold: String(lateThreshold) }); setSettingsOpen(true); }}><Settings className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("settings")}</Button>}>
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">{t("dailyAttendance")}</TabsTrigger>
          <TabsTrigger value="monthly">{t("monthlyReport")}</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Clock In/Out Panel */}
          <Card><CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[150px]">
                <Label className="text-xs">{t("employee")}</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder={t("selectEmployee")} /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Label className="text-xs">{t("branch")}</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder={t("selectBranch")} /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleClockIn} className="gap-1.5"><LogIn className="h-4 w-4" /> {t("clockIn")}</Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">{t("shiftStarts")}: {shiftStart} — {t("lateAfter")}: {lateThreshold} {t("minutes")}</p>
          </CardContent></Card>

          {/* Date picker */}
          <div className="flex items-center gap-2">
            <Input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="w-[180px] h-8 text-xs" />
            <span className="text-sm text-muted-foreground">{records.length} {t("records")}</span>
          </div>

          <Card className="card-pharma overflow-hidden"><Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("employee")}</TableHead>
              <TableHead className="text-xs">{t("branch")}</TableHead>
              <TableHead className="text-xs">{t("clockIn")}</TableHead>
              <TableHead className="text-xs">{t("clockOut")}</TableHead>
              <TableHead className="text-xs">{t("duration")}</TableHead>
              <TableHead className="text-xs">{t("status")}</TableHead>
              <TableHead className="text-xs text-end">{t("actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
              ) : records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm font-medium">{r.user_name}</TableCell>
                  <TableCell className="text-xs">{r.branch_name || "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(r.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-xs">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                  <TableCell className="text-xs">{r.duration_minutes != null ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : "—"}</TableCell>
                  <TableCell><Badge variant={statusColor(r.status)} className="text-[10px]">
                    {r.status === "late" && <AlertTriangle className="h-2.5 w-2.5 ltr:mr-0.5 rtl:ml-0.5" />}
                    {t(r.status as any)}
                  </Badge></TableCell>
                  <TableCell className="text-end">
                    {!r.clock_out && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleClockOut(r.id)}>
                      <LogOut className="h-3 w-3" /> {t("clockOut")}
                    </Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input type="month" value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className="w-[180px] h-8 text-xs" />
            <Button variant="outline" size="sm" onClick={exportMonthPDF} className="gap-1"><FileDown className="h-3.5 w-3.5" /> PDF</Button>
            <Button variant="outline" size="sm" onClick={() => {
              const headers = [t("employee"), t("totalDays"), t("presentDays"), t("lateDays"), t("absentDays"), t("totalHours")];
              const rows = monthlySummary.map((s) => [s.user_name, String(s.total_days), String(s.present_days), String(s.late_days), String(s.absent_days), String(s.total_hours)]);
              exportToCSV(headers, rows, `attendance_${viewMonth}`);
            }} className="gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center"><UserCheck className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-xs text-muted-foreground">{t("presentDays")}</p><p className="text-xl font-bold">{monthlySummary.reduce((s, m) => s + m.present_days, 0)}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-xs text-muted-foreground">{t("lateDays")}</p><p className="text-xl font-bold">{monthlySummary.reduce((s, m) => s + m.late_days, 0)}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><UserX className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-xs text-muted-foreground">{t("absentDays")}</p><p className="text-xl font-bold">{monthlySummary.reduce((s, m) => s + m.absent_days, 0)}</p></CardContent></Card>
          </div>

          <Card className="card-pharma overflow-hidden"><Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("employee")}</TableHead>
              <TableHead className="text-xs text-end">{t("totalDays")}</TableHead>
              <TableHead className="text-xs text-end">{t("presentDays")}</TableHead>
              <TableHead className="text-xs text-end">{t("lateDays")}</TableHead>
              <TableHead className="text-xs text-end">{t("absentDays")}</TableHead>
              <TableHead className="text-xs text-end">{t("totalHours")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {monthlySummary.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
              ) : monthlySummary.map((s) => (
                <TableRow key={s.user_id}>
                  <TableCell className="text-sm font-medium">{s.user_name}</TableCell>
                  <TableCell className="text-end text-xs">{s.total_days}</TableCell>
                  <TableCell className="text-end text-xs text-success">{s.present_days}</TableCell>
                  <TableCell className="text-end text-xs text-warning">{s.late_days}</TableCell>
                  <TableCell className="text-end text-xs text-destructive">{s.absent_days}</TableCell>
                  <TableCell className="text-end text-xs font-medium">{s.total_hours}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{t("attendanceSettings")}</DialogTitle><DialogDescription>{t("configureAttendance")}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">{t("shiftStartTime")}</Label><Input type="time" value={settingsForm.shiftStart} onChange={(e) => setSettingsForm({ ...settingsForm, shiftStart: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">{t("lateThreshold")} ({t("minutes")})</Label><Input type="number" min={1} value={settingsForm.lateThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, lateThreshold: e.target.value })} className="mt-1" /></div>
            <Button onClick={handleSaveSettings} className="w-full">{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Attendance;
