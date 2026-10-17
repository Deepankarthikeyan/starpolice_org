import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import { PerformanceSearchField } from "./PerformanceSearchField";
import { PerformanceSortPicker } from "./PerformanceSortPicker";
import {
  classStatusBadge,
  classStatusLabel,
  formatPercent,
  type StaffClassHistoryItem,
  type StaffPerformanceDetail,
  type StaffPerformanceSummary,
} from "./staffPerformanceDefaults";

type SortKey =
  | "name"
  | "uploadCount"
  | "classesAttended"
  | "classAttendancePercent"
  | "attendanceMarked"
  | "activityScore";

type PerformanceSection = "classes" | "uploads" | "overall";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const StaffPerformance = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:staff-performance");

  const [staffList, setStaffList] = useState<StaffPerformanceSummary[]>([]);
  const [detail, setDetail] = useState<StaffPerformanceDetail | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("activityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<PerformanceSection>("overall");
  const [savingClassId, setSavingClassId] = useState<string | null>(null);

  const loadStaff = async () => {
    setListLoading(true);
    try {
      const data = await api.getStaffPerformanceStaff();
      setStaffList(data);
    } catch (err) {
      notify.error(err, "Failed to load staff performance.");
      setStaffList([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    loadStaff().catch(console.error);
  }, [canManage]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = staffList;
    if (query) {
      rows = rows.filter((staff) =>
        [staff.name, staff.email, ...(staff.subjectNames || [])].join(" ").toLowerCase().includes(query)
      );
    }
    rows = [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return rows;
  }, [staffList, search, sortKey, sortDir]);

  const sortOptions = [
    { key: "activityScore", dir: "desc" as const, label: "Activity Score (High to Low)" },
    { key: "classAttendancePercent", dir: "desc" as const, label: "Class Attendance % (High to Low)" },
    { key: "uploadCount", dir: "desc" as const, label: "Uploads (High to Low)" },
    { key: "classesAttended", dir: "desc" as const, label: "Classes Attended (High to Low)" },
    { key: "name", dir: "asc" as const, label: "Name (A-Z)" },
  ];

  const openStaff = async (userId: string) => {
    setLoading(true);
    try {
      const data = await api.getStaffPerformanceDetail(userId);
      setDetail(data);
      setActiveSection("overall");
    } catch (err) {
      notify.error(err, "Failed to load staff performance detail.");
    } finally {
      setLoading(false);
    }
  };

  const markClassAttendance = async (
    classItem: StaffClassHistoryItem,
    status: "present" | "absent" | "late"
  ) => {
    if (!detail) return;
    setSavingClassId(classItem.id);
    try {
      const updated = await api.saveStaffClassAttendance(detail.staff.userId, {
        scheduledClassId: classItem.id,
        status,
      });
      setDetail(updated);
      await loadStaff();
      notify.success("Class attendance updated.");
    } catch (err) {
      notify.error(err, "Failed to update class attendance.");
    } finally {
      setSavingClassId(null);
    }
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Staff Performance" pageContent="" />
        <div className="alert alert-warning">Only superadmin and admin can review staff performance.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Staff Performance" pageContent="" />

      {!detail ? (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h4 className="card-title mb-0">Staff Performance Overview</h4>
            <div className="d-flex gap-2">
              <PerformanceSortPicker
                options={sortOptions}
                value={`${sortKey}:${sortDir}`}
                onChange={(value) => {
                  const [key, dir] = value.split(":") as [SortKey, "asc" | "desc"];
                  setSortKey(key);
                  setSortDir(dir);
                }}
              />
              <PerformanceSearchField value={search} onChange={setSearch} placeholder="Search staff..." />
            </div>
          </div>
          <div className="card-body">
            {listLoading ? (
              <p className="text-muted mb-0">Loading staff...</p>
            ) : !filteredStaff.length ? (
              <p className="text-muted mb-0">No staff found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Subjects</th>
                      <th className="text-end">Classes</th>
                      <th className="text-end">Attended</th>
                      <th className="text-end">Uploads</th>
                      <th className="text-end">Attendance Marked</th>
                      <th className="text-end">Class %</th>
                      <th className="text-end">Activity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff) => (
                      <tr key={staff.userId}>
                        <td>
                          <div className="fw-semibold">{staff.name}</div>
                          <small className="text-muted">{staff.email}</small>
                        </td>
                        <td>{staff.subjectNames?.join(", ") || "—"}</td>
                        <td className="text-end">{staff.classesAssigned}</td>
                        <td className="text-end">{staff.classesAttended}</td>
                        <td className="text-end">{staff.uploadCount + staff.questionCount}</td>
                        <td className="text-end">{staff.attendanceMarked}</td>
                        <td className="text-end">{formatPercent(staff.classAttendancePercent)}</td>
                        <td className="text-end">
                          <span className="badge bg-primary">{formatPercent(staff.activityScore)}</span>
                        </td>
                        <td>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => openStaff(staff.userId)}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="card mb-3">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="card-title mb-0">{detail.staff.name}</h4>
                <small className="text-muted">{detail.staff.email}</small>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDetail(null)}>
                Back to list
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <button
                    type="button"
                    className={`card w-100 text-start ${activeSection === "classes" ? "border-primary" : ""}`}
                    onClick={() => setActiveSection("classes")}
                  >
                    <div className="card-body">
                      <p className="text-muted mb-1">Class Attendance</p>
                      <h4>{formatPercent(detail.staff.classAttendancePercent)}</h4>
                      <small className="text-muted">
                        {detail.staff.classesAttended}/{detail.staff.classesAssigned} classes
                      </small>
                    </div>
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    type="button"
                    className={`card w-100 text-start ${activeSection === "uploads" ? "border-primary" : ""}`}
                    onClick={() => setActiveSection("uploads")}
                  >
                    <div className="card-body">
                      <p className="text-muted mb-1">Uploads</p>
                      <h4>{detail.staff.uploadCount + detail.staff.questionCount}</h4>
                      <small className="text-muted">
                        {detail.staff.uploadCount} materials · {detail.staff.questionCount} questions
                      </small>
                    </div>
                  </button>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1">Attendance Marked</p>
                      <h4>{detail.staff.attendanceMarked}</h4>
                      <small className="text-muted">Student attendance records</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <button
                    type="button"
                    className={`card w-100 text-start ${activeSection === "overall" ? "border-primary" : ""}`}
                    onClick={() => setActiveSection("overall")}
                  >
                    <div className="card-body">
                      <p className="text-muted mb-1">Overall Activity</p>
                      <h4>{formatPercent(detail.staff.activityScore)}</h4>
                      <small className="text-muted">{detail.staff.messagesSent} messages sent</small>
                    </div>
                  </button>
                </div>
              </div>

              {(activeSection === "classes" || activeSection === "overall") && (
                <div className="card mb-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Scheduled Classes & Attendance</h5>
                  </div>
                  <div className="card-body">
                    {!detail.classHistory.length ? (
                      <p className="text-muted mb-0">No classes assigned yet.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Subject</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.classHistory.map((classItem) => (
                              <tr key={classItem.id}>
                                <td>{formatDateTime(classItem.scheduledAt)}</td>
                                <td>{classItem.subject}</td>
                                <td>
                                  <span className={classStatusBadge(classItem.status)}>
                                    {classStatusLabel(classItem.status)}
                                  </span>
                                </td>
                                <td>
                                  {classItem.isPast && (
                                    <div className="d-flex gap-1">
                                      {(["present", "late", "absent"] as const).map((status) => (
                                        <button
                                          key={status}
                                          type="button"
                                          className={`btn btn-sm ${classItem.status === status ? "btn-primary" : "btn-outline-secondary"}`}
                                          disabled={savingClassId === classItem.id}
                                          onClick={() => markClassAttendance(classItem, status)}
                                        >
                                          {classStatusLabel(status)}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeSection === "uploads" || activeSection === "overall") && (
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Recent Uploads</h5>
                  </div>
                  <div className="card-body">
                    {!detail.recentUploads.length ? (
                      <p className="text-muted mb-0">No uploads yet.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Name</th>
                              <th>Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.recentUploads.map((upload) => (
                              <tr key={upload.id}>
                                <td>{upload.date}</td>
                                <td>{upload.title || upload.name}</td>
                                <td className="text-capitalize">{upload.category}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default StaffPerformance;
