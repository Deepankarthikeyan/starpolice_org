import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import {
  emptyLeadForm,
  formatLeadCreatedDate,
  fullLeadName,
  leadCreatedOnDate,
  LEAD_COURSE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_FILTER_OPTIONS,
  recordToForm,
  statusBadgeClass,
  statusLabel,
  type LeadCourse,
  type LeadFormState,
  type LeadRecord,
  type LeadStatus,
} from "./leadDefaults";
import { downloadLeadMobileNumbersSheet } from "./leadExport";

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label}
        {optional && <span className="text-muted"> (Optional)</span>}
      </label>
      {children}
    </div>
  );
}

const Leads = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:leads");

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [form, setForm] = useState<LeadFormState>(emptyLeadForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | LeadStatus>("");
  const [courseFilter, setCourseFilter] = useState<"" | LeadCourse>("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadLeads = async () => {
    const data = await api.getLeads();
    setLeads(data);
  };

  useEffect(() => {
    if (!canManage) return;
    loadLeads().catch(console.error);
  }, [canManage]);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter || courseFilter || dateFilter
  );

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter && lead.status !== statusFilter) return false;
      if (courseFilter && lead.course !== courseFilter) return false;
      if (!leadCreatedOnDate(lead.createdAt, dateFilter)) return false;
      if (!query) return true;
      const name = fullLeadName(lead).toLowerCase();
      return (
        lead.leadId.toLowerCase().includes(query) ||
        name.includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.mobileNumber.includes(query) ||
        lead.course.toLowerCase().includes(query)
      );
    });
  }, [leads, search, statusFilter, courseFilter, dateFilter]);

  const onDownloadMobileNumbers = () => {
    const withMobile = filteredLeads.filter((lead) => lead.mobileNumber.trim());
    if (withMobile.length === 0) {
      notify.warning("No mobile numbers in the current list to export.");
      return;
    }
    const datePart = new Date().toISOString().slice(0, 10);
    downloadLeadMobileNumbersSheet(withMobile, `lead-mobile-numbers-${datePart}.xls`);
    notify.success(`Downloaded ${withMobile.length} mobile number(s).`);
  };

  const setField = <K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyLeadForm());
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyLeadForm());
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (lead: LeadRecord) => {
    setForm(recordToForm(lead));
    setEditingId(lead.id);
    setShowForm(true);
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await api.updateLead(editingId, form);
        notify.success("Lead updated successfully.");
      } else {
        await api.createLead(form);
        notify.success("Lead created successfully.");
      }
      await loadLeads();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save lead.";
      setError(message);
      notify.error(err, "Failed to save lead.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (lead: LeadRecord) => {
    if (!window.confirm(`Delete lead ${lead.leadId} (${fullLeadName(lead)})?`)) return;
    setLoading(true);
    try {
      await api.deleteLead(lead.id);
      await loadLeads();
      if (editingId === lead.id) resetForm();
      notify.success("Lead deleted successfully.");
    } catch (err) {
      notify.error(err, "Failed to delete lead.");
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = async (lead: LeadRecord, nextStatus: LeadStatus) => {
    if (lead.status === nextStatus) return;

    if (nextStatus === "converted") {
      if (!window.confirm(`Convert ${fullLeadName(lead)} to a student onboarding record?`)) return;
      setLoading(true);
      try {
        const result = await api.convertLeadToStudent(lead.id);
        await loadLeads();
        notify.success(`Lead converted. Student ID: ${result.studentId}`);
      } catch (err) {
        notify.error(err, "Failed to convert lead.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (nextStatus === "rejected") {
      const reason = window.prompt("Rejection reason (optional):") ?? "";
      setLoading(true);
      try {
        await api.updateLeadStatus(lead.id, nextStatus, reason);
        await loadLeads();
        notify.success("Lead marked as rejected.");
      } catch (err) {
        notify.error(err, "Failed to update status.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      await api.updateLeadStatus(lead.id, nextStatus);
      await loadLeads();
      notify.success("Lead status updated.");
    } catch (err) {
      notify.error(err, "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Leads" pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage leads.</div>
      </>
    );
  }

  if (showForm) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Leads" pageContent="" />
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h4 className="mb-0">{editingId ? "Edit Lead" : "Add Lead"}</h4>
          <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
            Back to Lead List
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="card-title mb-0">Contact Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <Field label="First Name">
                    <input
                      className="form-control"
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Middle Name" optional>
                    <input
                      className="form-control"
                      value={form.middleName}
                      onChange={(e) => setField("middleName", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Last Name">
                    <input
                      className="form-control"
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Email" optional>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Mobile Number">
                    <input
                      className="form-control"
                      value={form.mobileNumber}
                      onChange={(e) => setField("mobileNumber", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Alternate Mobile" optional>
                    <input
                      className="form-control"
                      value={form.alternateMobileNumber}
                      onChange={(e) => setField("alternateMobileNumber", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="City" optional>
                    <input
                      className="form-control"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="State" optional>
                    <input
                      className="form-control"
                      value={form.state}
                      onChange={(e) => setField("state", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Source">
                    <select
                      className="form-select"
                      value={form.source}
                      onChange={(e) => setField("source", e.target.value as LeadFormState["source"])}
                    >
                      {LEAD_SOURCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <h5 className="card-title mb-0">Course Interest</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <Field label="Course" optional>
                    <select
                      className="form-select"
                      value={form.course}
                      onChange={(e) => setField("course", e.target.value)}
                    >
                      <option value="">Select course</option>
                      {form.course &&
                        !LEAD_COURSE_OPTIONS.some((item) => item.value === form.course) && (
                          <option value={form.course}>{form.course}</option>
                        )}
                      {LEAD_COURSE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Batch" optional>
                    <input
                      className="form-control"
                      value={form.batch}
                      onChange={(e) => setField("batch", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Previous Qualification" optional>
                    <input
                      className="form-control"
                      value={form.previousQualification}
                      onChange={(e) => setField("previousQualification", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-8">
                  <Field label="Career Goal" optional>
                    <input
                      className="form-control"
                      value={form.careerGoal}
                      onChange={(e) => setField("careerGoal", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Next Follow-up Date" optional>
                    <input
                      type="date"
                      className="form-control"
                      value={form.nextFollowUpDate}
                      onChange={(e) => setField("nextFollowUpDate", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-12">
                  <Field label="Follow-up Notes" optional>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.followUpNotes}
                      onChange={(e) => setField("followUpNotes", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Lead" : "Save Lead"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Leads" pageContent="" />

      <div className="card spa-leads-card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h4 className="card-title mb-0">Lead List</h4>
            <div className="small text-muted mt-1">
              <span className="me-3">
                Total persons: <strong>{leads.length}</strong>
              </span>
              <span>
                {hasActiveFilters ? (
                  <>
                    Filtered persons: <strong>{filteredLeads.length}</strong>
                  </>
                ) : (
                  <>
                    Showing: <strong>{filteredLeads.length}</strong>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={onDownloadMobileNumbers}
              disabled={filteredLeads.every((lead) => !lead.mobileNumber.trim())}
            >
              Download mobile numbers (Excel)
            </button>
            <button type="button" className="btn btn-primary" onClick={startCreate}>
              Add Lead
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-12 col-lg-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, ID, email, mobile, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4 col-lg-2">
              <select
                className="form-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value as "" | LeadCourse)}
              >
                <option value="">All Courses</option>
                {LEAD_COURSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 col-lg-2">
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                aria-label="Filter by date"
              />
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "" | LeadStatus)}
              >
                <option value="">All Statuses</option>
                {LEAD_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped align-middle spa-leads-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No leads yet. Click Add Lead to create one.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none spa-lead-link"
                          onClick={() => startEdit(lead)}
                        >
                          {lead.leadId}
                        </button>
                      </td>
                      <td>{formatLeadCreatedDate(lead.createdAt)}</td>
                      <td>{fullLeadName(lead)}</td>
                      <td>
                        <div>{lead.mobileNumber || "—"}</div>
                        <small className="text-muted">{lead.email || "—"}</small>
                      </td>
                      <td>
                        {LEAD_COURSE_OPTIONS.find((item) => item.value === lead.course)?.label ||
                          lead.course ||
                          "—"}
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass(lead.status)}`}>
                          {statusLabel(lead.status)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <select
                            className="form-select form-select-sm spa-lead-status-select"
                            defaultValue=""
                            disabled={lead.status === "converted" || lead.status === "rejected" || loading}
                            onChange={(e) => {
                              const value = e.target.value as LeadStatus;
                              if (!value) return;
                              onStatusChange(lead, value);
                              e.currentTarget.value = "";
                            }}
                          >
                            <option value="">{statusLabel(lead.status)} — Update...</option>
                            {lead.status === "new" && <option value="follow_up">Follow Up</option>}
                            {lead.status !== "rejected" && lead.status !== "converted" && (
                              <option value="rejected">Rejected</option>
                            )}
                            {lead.status !== "converted" && lead.status !== "rejected" && (
                              <option value="converted">Convert to Student</option>
                            )}
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(lead)}
                            disabled={lead.status === "converted"}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(lead)}
                            disabled={lead.status === "converted"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leads;
