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
  formatLeadFollowUpDate,
  fullLeadName,
  leadCreatedInDateRange,
  LEAD_COURSE_OPTIONS,
  LEAD_FORM_DISPOSITION_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  formatLeadCourse,
  leadRecordMatchesCourseFilter,
  leadRecordMatchesSearch,
  leadRecordMatchesStatusFilter,
  isLeadFollowUpOverdue,
  recordToForm,
  statusBadgeClass,
  statusLabel,
  type LeadCourse,
  type LeadFormState,
  type LeadRecord,
  type LeadStatus,
} from "./leadDefaults";
import { downloadLeadMobileNumbersCsv } from "./leadExport";

function Field({ label, children, optional, required }: { label: string; children: React.ReactNode; optional?: boolean; required?: boolean }) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> (Required)</span>}
        {optional && <span className="text-muted"> (Optional)</span>}
      </label>
      {children}
    </div>
  );
}

function ListFilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="spa-list-filter-field h-100">
      <label className="form-label spa-list-filter-label">{label}</label>
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
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [editingStatus, setEditingStatus] = useState<LeadStatus | null>(null);
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

  const searchQuery = search.trim();

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter || courseFilter || dateFromFilter || dateToFilter,
  );

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCourseFilter("");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!leadRecordMatchesStatusFilter(lead.status, statusFilter)) return false;
      if (!leadRecordMatchesCourseFilter(lead.course, courseFilter)) return false;
      if (!leadCreatedInDateRange(lead.createdAt, dateFromFilter, dateToFilter)) return false;
      return leadRecordMatchesSearch(lead, searchQuery);
    });
  }, [leads, searchQuery, statusFilter, courseFilter, dateFromFilter, dateToFilter]);

  const onDownloadMobileNumbers = () => {
    const withMobile = filteredLeads.filter((lead) => lead.mobileNumber.trim());
    if (withMobile.length === 0) {
      notify.warning("No mobile numbers in the current list to export.");
      return;
    }
    const datePart = new Date().toISOString().slice(0, 10);
    downloadLeadMobileNumbersCsv(withMobile, `lead-mobile-numbers-${datePart}.csv`);
    notify.success(`Downloaded ${withMobile.length} mobile number(s).`);
  };

  const setField = <K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyLeadForm());
    setEditingId(null);
    setEditingStatus(null);
    setShowForm(false);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyLeadForm());
    setEditingId(null);
    setEditingStatus(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (lead: LeadRecord) => {
    setForm(recordToForm(lead));
    setEditingId(lead.id);
    setEditingStatus(lead.status);
    setShowForm(true);
    setError("");
  };

  const formLocked = editingStatus === "converted" || editingStatus === "rejected";

  const applyLeadDisposition = async (leadId: string, payload: LeadFormState) => {
    if (editingStatus === "converted") return;
    const { leadDisposition, rejectionReason } = payload;
    if (leadDisposition === "rejected") {
      await api.updateLeadStatus(leadId, "rejected", rejectionReason);
      return;
    }
    if (leadDisposition === "follow_up") {
      await api.updateLeadStatus(leadId, "follow_up");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: LeadFormState = {
        ...form,
        nextFollowUpDate: form.leadDisposition === "follow_up" ? form.nextFollowUpDate : "",
        followUpNotes: form.leadDisposition === "follow_up" ? form.followUpNotes : "",
        rejectionReason: form.leadDisposition === "rejected" ? form.rejectionReason : "",
      };
      if (payload.leadDisposition === "follow_up" && !payload.followUpNotes.trim()) {
        setError("Please enter follow-up notes.");
        setLoading(false);
        return;
      }

      if (editingId) {
        await api.updateLead(editingId, payload);
        await applyLeadDisposition(editingId, payload);
        notify.success("Lead updated successfully.");
      } else {
        const created = await api.createLead(payload);
        await applyLeadDisposition(created.id, payload);
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
                      disabled={formLocked}
                    />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Lead status">
                    <select
                      className="form-select"
                      value={form.leadDisposition}
                      disabled={formLocked}
                      onChange={(e) => {
                        const value = e.target.value as LeadFormState["leadDisposition"];
                        setForm((prev) => ({
                          ...prev,
                          leadDisposition: value,
                          nextFollowUpDate: value === "follow_up" ? prev.nextFollowUpDate : "",
                          followUpNotes: value === "follow_up" ? prev.followUpNotes : "",
                          rejectionReason: value === "rejected" ? prev.rejectionReason : "",
                        }));
                      }}
                    >
                      <option value="">Select status</option>
                      {LEAD_FORM_DISPOSITION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Next Follow-up Date" optional>
                    <input
                      type="date"
                      className="form-control"
                      value={form.nextFollowUpDate}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, nextFollowUpDate: nextDate, followUpNotes: nextDate !== prev.nextFollowUpDate ? "" : prev.followUpNotes }));
                      }}
                      disabled={form.leadDisposition !== "follow_up" || formLocked}
                    />
                  </Field>
                </div>
                {form.leadDisposition === "rejected" && (
                  <div className="col-md-4">
                    <Field label="Rejection reason" optional>
                      <input
                        className="form-control"
                        value={form.rejectionReason}
                        onChange={(e) => setField("rejectionReason", e.target.value)}
                        disabled={formLocked}
                        placeholder="Why was this lead rejected?"
                      />
                    </Field>
                  </div>
                )}
                {form.leadDisposition === "follow_up" && (
                  <div className="col-12">
                    <Field label="Follow-up Notes" required>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.followUpNotes}
                        onChange={(e) => setField("followUpNotes", e.target.value)}
                        disabled={formLocked}
                        required
                        onInvalid={(e) => e.currentTarget.setCustomValidity("Please enter follow-up notes.")}
                        onInput={(e) => e.currentTarget.setCustomValidity("")}
                        placeholder={form.nextFollowUpDate ? "Enter the follow-up message for this date" : "Add notes about this follow-up"}
                      />
                    </Field>
                  </div>
                )}
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
          <div className="d-flex flex-wrap align-items-center gap-3">
            <h4 className="card-title mb-0">Lead List</h4>
            <span className="badge spa-leads-person-count bg-primary">
              Total persons: {filteredLeads.length} / {leads.length}
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={onDownloadMobileNumbers}
              disabled={filteredLeads.every((lead) => !lead.mobileNumber.trim())}
            >
              Download mobile numbers (CSV)
            </button>
            <button type="button" className="btn btn-primary" onClick={startCreate}>
              Add Lead
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3 align-items-end spa-leads-filters">
            <div className="col-12 col-md-6 col-lg-3">
              <ListFilterField label="Search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name, ID, email, mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </ListFilterField>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <ListFilterField label="Course">
                <select
                  className="form-select"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value as "" | LeadCourse)}
                >
                  <option value="">All courses</option>
                  {LEAD_COURSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </ListFilterField>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <ListFilterField label="From">
                <input
                  type="date"
                  className="form-control"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </ListFilterField>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <ListFilterField label="To">
                <input
                  type="date"
                  className="form-control"
                  value={dateToFilter}
                  min={dateFromFilter || undefined}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </ListFilterField>
            </div>
            <div className="col-6 col-md-3 col-lg-3">
              <ListFilterField label="Status">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "" | LeadStatus)}
                >
                  <option value="">All statuses</option>
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </ListFilterField>
            </div>
            <div className="col-6 col-md-3 col-lg-auto">
              <ListFilterField label=" ">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear filters
                </button>
              </ListFilterField>
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
                        {formatLeadCourse(lead.course)}
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass(lead.status)}`}>
                          {statusLabel(lead.status)}
                        </span>
                        {lead.status === "follow_up" && lead.nextFollowUpDate && (
                          <div className="mt-1"><span className={"badge " + (isLeadFollowUpOverdue(lead.nextFollowUpDate) ? "bg-danger" : "bg-info text-dark")}>
                            {isLeadFollowUpOverdue(lead.nextFollowUpDate) ? "Overdue" : "Follow-up"}: {formatLeadFollowUpDate(lead.nextFollowUpDate)}
                          </span></div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
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
