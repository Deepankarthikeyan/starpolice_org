import { FormEvent, useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { ManagedUser, Subject } from "../types";

type ScheduledClassRecord = {
  id: string;
  scheduledAt: string;
  subjectName: string;
  staffName: string;
};

type WhatsAppBroadcast = {
  message: string;
  staff: { name: string; link: string | null };
  students: Array<{ studentId: string; name: string; link: string }>;
};

const ScheduleClass = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:schedule");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staffMembers, setStaffMembers] = useState<ManagedUser[]>([]);
  const [records, setRecords] = useState<ScheduledClassRecord[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState<WhatsAppBroadcast | null>(null);

  const loadData = async () => {
    const [subjectList, staffList, scheduled] = await Promise.all([
      api.getSubjects(),
      api.getUsers("staff"),
      api.getScheduledClasses(),
    ]);
    setSubjects(subjectList.filter((item) => item.isActive));
    setStaffMembers(staffList.filter((item) => item.isActive));
    setRecords(scheduled);
  };

  useEffect(() => {
    if (!canManage) return;
    loadData().catch(console.error);
  }, [canManage]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!scheduledAt || !subjectId || !staffId) {
      notify.error("Please fill in date & time, subject, and faculty.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.createScheduledClass({
        scheduledAt,
        subjectId,
        staffId,
      });
      notify.success("Class scheduled. Notifications sent to students and staff.");
      if (result.whatsapp) {
        setWhatsapp(result.whatsapp);
      }
      setScheduledAt("");
      setSubjectId("");
      setStaffId("");
      await loadData();
    } catch (error) {
      notify.error(error, "Failed to schedule class.");
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Schedule Class" pageContent="" />
        <div className="alert alert-warning">You do not have permission to schedule classes.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Schedule Class" pageContent="" />

      <div className="row">
        <div className="col-xl-5">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Schedule Class</h4>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Faculty / Staff</label>
                  <select
                    className="form-select"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                  >
                    <option value="">Select staff member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Scheduling..." : "Schedule Class"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Recent Scheduled Classes</h4>
            </div>
            <div className="card-body">
              {records.length === 0 ? (
                <p className="text-muted mb-0">No classes scheduled yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>{new Date(record.scheduledAt).toLocaleString()}</td>
                          <td>{record.subjectName}</td>
                          <td>{record.staffName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal show={Boolean(whatsapp)} onHide={() => setWhatsapp(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>WhatsApp Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {whatsapp && (
            <>
              <p className="text-muted">
                In-app notifications were sent automatically. Use the links below to broadcast class details on WhatsApp.
              </p>
              <pre className="bg-light p-3 rounded small">{whatsapp.message}</pre>
              {whatsapp.staff.link && (
                <div className="mb-3">
                  <a
                    href={whatsapp.staff.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success btn-sm"
                  >
                    <i className="fab fa-whatsapp me-1" />
                    WhatsApp {whatsapp.staff.name} (Faculty)
                  </a>
                </div>
              )}
              {whatsapp.students.length > 0 && (
                <div className="table-responsive" style={{ maxHeight: 320 }}>
                  <table className="table table-sm table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>ID</th>
                        <th>WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatsapp.students.map((student) => (
                        <tr key={student.studentId}>
                          <td>{student.name}</td>
                          <td>{student.studentId}</td>
                          <td>
                            <a
                              href={student.link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-success btn-sm"
                            >
                              Send
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ScheduleClass;
