import { useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import {
  classStatusBadge,
  classStatusLabel,
  formatPercent,
  type StaffPerformanceDetail,
} from "../admin/staffPerformanceDefaults";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const StaffMyPerformance = () => {
  const { auth } = useContext(ThemeContext);
  const [detail, setDetail] = useState<StaffPerformanceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.role !== "staff") return;
    api
      .getMyStaffPerformanceDetail()
      .then(setDetail)
      .catch((err) => notify.error(err, "Failed to load your performance."))
      .finally(() => setLoading(false));
  }, [auth?.role]);

  if (auth?.role !== "staff") {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="My Performance" pageContent="" />
        <div className="alert alert-warning">This page is for staff members only.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="My Performance" pageContent="" />

      {loading ? (
        <p className="text-muted">Loading your performance...</p>
      ) : !detail ? (
        <p className="text-muted">No performance data available.</p>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Class Attendance</p>
                  <h4>{formatPercent(detail.staff.classAttendancePercent)}</h4>
                  <small className="text-muted">
                    {detail.staff.classesAttended}/{detail.staff.classesAssigned} classes
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Uploads</p>
                  <h4>{detail.staff.uploadCount + detail.staff.questionCount}</h4>
                  <small className="text-muted">
                    {detail.staff.uploadCount} materials · {detail.staff.questionCount} questions
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Attendance Marked</p>
                  <h4>{detail.staff.attendanceMarked}</h4>
                  <small className="text-muted">Student records marked by you</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Overall Activity</p>
                  <h4>{formatPercent(detail.staff.activityScore)}</h4>
                  <small className="text-muted">{detail.staff.messagesSent} messages sent</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <h5 className="card-title mb-0">My Scheduled Classes</h5>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">My Recent Uploads</h5>
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
        </>
      )}
    </>
  );
};

export default StaffMyPerformance;
