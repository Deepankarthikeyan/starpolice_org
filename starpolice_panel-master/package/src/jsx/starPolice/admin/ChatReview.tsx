import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { ChatMessage } from "../types";
import { PerformanceSearchField } from "./PerformanceSearchField";
import { InteractionFilterSelect } from "../shared/InteractionFilterSelect";
import { InteractionSortPicker } from "../shared/InteractionSortPicker";

const SORT_OPTIONS = [
  { key: "createdAt", dir: "desc" as const, label: "Date (Newest first)" },
  { key: "createdAt", dir: "asc" as const, label: "Date (Oldest first)" },
  { key: "senderName", dir: "asc" as const, label: "Sender (A → Z)" },
  { key: "senderName", dir: "desc" as const, label: "Sender (Z → A)" },
];

const CHANNEL_OPTIONS = [
  { value: "", label: "All chats" },
  { value: "group", label: "Group only" },
  { value: "private", label: "Private only" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const ChatReview = () => {
  const { auth } = useContext(ThemeContext);
  const canReview = hasPermission(auth, "admin:chat-review");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:desc");
  const [channelFilter, setChannelFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const { sortKey, sortDir } = useMemo(() => {
    const [key, dir] = sortValue.split(":");
    return {
      sortKey: (key === "senderName" ? "senderName" : "createdAt") as "createdAt" | "senderName",
      sortDir: (dir === "asc" ? "asc" : "desc") as "asc" | "desc",
    };
  }, [sortValue]);

  const loadMessages = useCallback(async () => {
    if (!canReview) return;
    setLoading(true);
    try {
      const data = await api.getChatReview({
        search: debouncedSearch.trim() || undefined,
        sort: sortDir,
        sortKey,
        channel: (channelFilter === "group" || channelFilter === "private" ? channelFilter : undefined),
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setMessages(data);
    } catch (error) {
      notify.error(error, "Failed to load chat history.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [canReview, debouncedSearch, sortDir, sortKey, channelFilter, fromDate, toDate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadMessages().catch(console.error);
  }, [loadMessages]);

  if (!canReview) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Chat Review" pageContent="" />
        <div className="alert alert-warning">Chat review is available to superadmin only.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Chat Review" pageContent="" />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="card-title mb-0">Platform Chat History</h4>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => loadMessages()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <PerformanceSearchField value={search} onChange={setSearch} placeholder="Search message or sender..." />
            </div>
            <div className="col-md-3">
              <InteractionFilterSelect
                id="chat-review-channel"
                label="Channel"
                value={channelFilter}
                options={CHANNEL_OPTIONS}
                onChange={setChannelFilter}
              />
            </div>
            <div className="col-md-3">
              <InteractionSortPicker options={SORT_OPTIONS} value={sortValue} onChange={setSortValue} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-1">From</label>
              <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted mb-1">To</label>
              <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <p className="text-muted mb-0">Loading chat history...</p>
          ) : messages.length === 0 ? (
            <p className="text-muted mb-0">No messages found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sender</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Channel</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="text-nowrap">{formatDate(message.createdAt)}</td>
                      <td>{message.senderName || "—"}</td>
                      <td className="text-capitalize">{message.senderRole || "—"}</td>
                      <td>{message.senderEmail || "—"}</td>
                      <td className="text-capitalize">{message.channel}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{message.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatReview;
