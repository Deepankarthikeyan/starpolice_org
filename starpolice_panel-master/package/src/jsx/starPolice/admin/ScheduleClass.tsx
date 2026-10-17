import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { ManagedUser, Subject } from "../types";
import {
  emptyScheduleClassForm,
  type ScheduledClassRecord,
  type ScheduleClassFormState,
} from "./scheduleDefaults";

function formatScheduledAt(value: string) {
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

const ScheduleClass = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:schedule");

  const [form, setForm] = useState<ScheduleClassFormState>(emptyScheduleClassForm());
  const [classes, setClasses] = useState<ScheduledClassRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsAppLinks, setWhatsAppLinks] = useState<{
    message: string;
    studentLinks: Array<{ name: string; phone: string; url: string }>;
    facultyLink: { name: string; phone: string; url: string } | null;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classData, subjectData, staffData] = await Promise.all([
        api.getScheduledClasses(),
        api.getSubjects(),
        api.getUsers("staff"),
      ]);
      setClasses(classData);
      setSubjects(subjectData);
      setStaff(staffData);
    } catch (err) {
      notify.error(err, "Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    loadData().catch(console.error);
  }, [canManage]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.scheduledAt || !form.subjectId || !form.facultyId) {
      notify.error("Date & time, subject, and faculty are required.");
      return;
    }

    setSaving(true);
    try {
      const created = await api.createScheduledClass({
        scheduledAt: form.scheduledAt,
        subject: form.subject.trim(),
        subjectId: form.subjectId || undefined,
        facultyId: form.facultyId,
        notes: form.notes.trim(),
      });
      notify.success("Class scheduled. Notifications sent to students and faculty.");
      setForm(emptyScheduleClassForm());
      await loadData();

      const links = await api.getScheduledClassWhatsAppLinks(created.id);
      setWhatsAppLinks(links);
    } catch (err) {
      notify.error(err, "Failed to schedule class.");
    } finally {
      setSaving(false);
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
        <div className="col-lg-5">
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
                    value={form.scheduledAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={form.subjectId}
                    onChange={(e) => {
                      const subject = subjects.find((item) => item.id === e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        subjectId: e.target.value,
                        subject: subject?.name || "",
                      }));
                    }}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Faculty / Staff</label>
                  <select
                    className="form-select"
                    value={form.facultyId}
                    onChange={(e) => setForm((prev) => ({ ...prev, facultyId: e.target.value }))}
                    required
                  >
                    <option value="">Select faculty</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Scheduling..." : "Schedule Class"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          {whatsAppLinks && (
            <div className="card mb-3 border-success">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">WhatsApp Broadcast</h5>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setWhatsAppLinks(null)}>
                  Close
                </button>
              </div>
              <div className="card-body">
                <pre className="bg-light p-3 rounded small mb-3">{whatsAppLinks.message}</pre>
                {whatsAppLinks.facultyLink && (
                  <a
                    href={whatsAppLinks.facultyLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success btn-sm me-2 mb-2"
                  >
                    WhatsApp Faculty ({whatsAppLinks.facultyLink.name})
                  </a>
                )}
                <div className="d-flex flex-wrap gap-2">
                  {whatsAppLinks.studentLinks.slice(0, 20).map((link) => (
                    <a
                      key={link.phone}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-success btn-sm"
                    >
                      {link.name || link.phone}
                    </a>
                  ))}
                </div>
                {whatsAppLinks.studentLinks.length > 20 && (
                  <p className="text-muted small mt-2 mb-0">
                    Showing first 20 student WhatsApp links. All students received in-app notifications.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Scheduled Classes</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <p className="text-muted mb-0">Loading...</p>
              ) : classes.length === 0 ? (
                <p className="text-muted mb-0">No classes scheduled yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((item) => (
                        <tr key={item.id}>
                          <td>{formatScheduledAt(item.scheduledAt)}</td>
                          <td>{item.subject}</td>
                          <td>{item.facultyName}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={async () => {
                                try {
                                  const links = await api.getScheduledClassWhatsAppLinks(item.id);
                                  setWhatsAppLinks(links);
                                } catch (err) {
                                  notify.error(err, "Failed to load WhatsApp links.");
                                }
                              }}
                            >
                              WhatsApp
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
        </div>
      </div>
    </>
  );
};

export default ScheduleClass;
