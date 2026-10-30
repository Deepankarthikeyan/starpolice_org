import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import type { DashboardStats, StaffDashboardStats } from "../types";
import type { LeadRecord } from "./leadDefaults";
import { formatLeadFollowUpDate, fullLeadName, leadFollowUpBadgeClass, leadFollowUpLabel, leadFollowUpTiming } from "./leadDefaults";

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AdminDashboard = () => {
  const { auth } = useContext(ThemeContext);
  const isStaff = auth?.panel === "staff" && auth?.role === "staff";
  const canManageLeads = hasPermission(auth, "admin:leads");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staffStats, setStaffStats] = useState<StaffDashboardStats | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    if (isStaff) {
      api.getStaffDashboardStats().then(setStaffStats).catch(console.error);
      return;
    }
    api.getDashboardStats().then(setStats).catch(console.error);
    if (canManageLeads) api.getLeads().then(setLeads).catch(console.error);
  }, [isStaff, canManageLeads]);

  const allFollowUps = leads.filter((lead) => lead.status === "follow_up" && lead.nextFollowUpDate);
  const overdue = allFollowUps.filter((lead) => leadFollowUpTiming(lead.nextFollowUpDate) === "expired");
  const dueToday = allFollowUps.filter((lead) => leadFollowUpTiming(lead.nextFollowUpDate) === "today");
  const dueTomorrow = allFollowUps.filter((lead) => leadFollowUpTiming(lead.nextFollowUpDate) === "tomorrow");
  const followUpCard = (title: string, items: LeadRecord[], badgeClass: string) => (
    <div className="col-xl-4"><div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center"><h4 className="card-title mb-0">{title}</h4><span className={"badge spa-followup-count " + badgeClass}>{items.length}</span></div>
      <div className="card-body">
        {items.length === 0 ? <p className="text-muted mb-0">No {title.toLowerCase()}.</p> : items.slice(0, 5).map((lead) => (
          <div key={lead.id} className="d-flex justify-content-between gap-3 py-2 border-bottom"><div className="min-w-0"><div className="fw-semibold">{fullLeadName(lead)}</div><small className="text-muted d-block text-truncate">{lead.followUpNotes || "No notes"}</small></div><span className={"badge align-self-start " + leadFollowUpBadgeClass(lead.nextFollowUpDate)}>{leadFollowUpLabel(lead.nextFollowUpDate)}: {formatLeadFollowUpDate(lead.nextFollowUpDate)}</span></div>
        ))}
        <Link to="/admin/leads" className="btn btn-sm btn-outline-primary mt-3">View leads</Link>
      </div>
    </div></div>
  );

  if (isStaff) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Dashboard" pageContent="" />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted mb-0">Your performance summary based on classes, uploads, and attendance activity.</p>
          <Link to="/staff/my-performance" className="btn btn-sm btn-outline-primary">View full performance</Link>
        </div>
        <div className="row spa-dashboard-stat-grid g-2 g-md-3">
          <div className="col-6 col-xl-3">
            <div className="card spa-stat-metric-card">
              <div className="card-body">
                <h6 className="text-muted">My Uploads</h6>
                <h2>{(staffStats?.uploadCount ?? 0) + (staffStats?.questionCount ?? 0)}</h2>
              </div>
            </div>
          </div>
          <div className="col-6 col-xl-3">
            <div className="card spa-stat-metric-card">
              <div className="card-body">
                <h6 className="text-muted">Classes Attended</h6>
                <h2>{staffStats?.classesAttended ?? 0}</h2>
                <small className="text-muted">of {staffStats?.classesAssigned ?? 0} assigned</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-xl-3">
            <div className="card spa-stat-metric-card">
              <div className="card-body">
                <h6 className="text-muted">Class Attendance %</h6>
                <h2>{formatPercent(staffStats?.classAttendancePercent)}</h2>
              </div>
            </div>
          </div>
          <div className="col-6 col-xl-3">
            <div className="card spa-stat-metric-card">
              <div className="card-body">
                <h6 className="text-muted">Attendance Marked</h6>
                <h2>{staffStats?.attendanceMarked ?? 0}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title mb-0">Upcoming Classes</h4>
              </div>
              <div className="card-body">
                {!staffStats?.upcomingClasses?.length ? (
                  <p className="text-muted mb-0">No upcoming classes assigned.</p>
                ) : (
                  staffStats.upcomingClasses.map((classItem) => (
                    <div key={classItem.id} className="d-flex justify-content-between py-2 border-bottom">
                      <div>
                        <div className="fw-semibold">{classItem.subject}</div>
                        <small className="text-muted">{formatDateTime(classItem.scheduledAt)}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title mb-0">My Recent Uploads</h4>
              </div>
              <div className="card-body">
                {!staffStats?.recentUploads?.length ? (
                  <p className="text-muted mb-0">No uploads yet.</p>
                ) : (
                  staffStats.recentUploads.map((upload) => (
                    <div key={upload.id} className="d-flex justify-content-between py-2 border-bottom">
                      <div>
                        <div className="fw-semibold">{upload.name}</div>
                        <small className="text-muted">
                          {upload.date} • {FILE_CATEGORY_LABELS[upload.category]}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Dashboard" pageContent="" />
      <div className="row spa-dashboard-stat-grid g-2 g-md-3">
        <div className="col-6 col-xl-3">
          <div className="card spa-stat-metric-card">
            <div className="card-body">
              <h6 className="text-muted">Total Uploads</h6>
              <h2>{stats?.totalUploads ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card spa-stat-metric-card">
            <div className="card-body">
              <h6 className="text-muted">Active Days</h6>
              <h2>{stats?.activeDays ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card spa-stat-metric-card">
            <div className="card-body">
              <h6 className="text-muted">Student Messages</h6>
              <h2>{stats?.studentMessages ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card spa-stat-metric-card">
            <div className="card-body">
              <h6 className="text-muted">Admin Replies</h6>
              <h2>{stats?.adminReplies ?? 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {canManageLeads && <div className="row g-3 mb-3">
        {followUpCard("Today Follow-ups", dueToday, "bg-warning text-dark")}
        {followUpCard("Expired Due", overdue, "bg-danger")}
        {followUpCard("Tomorrow Follow-ups", dueTomorrow, "bg-success")}
      </div>}

      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Upload Categories</h4>
            </div>
            <div className="card-body">
              {Object.entries(FILE_CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="d-flex justify-content-between py-2 border-bottom">
                  <span>{label}</span>
                  <strong>{stats?.categoryCounts?.[key] ?? 0}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Recent Uploads</h4>
            </div>
            <div className="card-body">
              {!stats?.recentUploads?.length ? (
                <p className="text-muted mb-0">No uploads yet. Use Daywise Upload to add materials.</p>
              ) : (
                stats.recentUploads.map((upload) => (
                  <div key={upload.id} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <div className="fw-semibold">{upload.name}</div>
                      <small className="text-muted">
                        {upload.date} • {FILE_CATEGORY_LABELS[upload.category]}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
