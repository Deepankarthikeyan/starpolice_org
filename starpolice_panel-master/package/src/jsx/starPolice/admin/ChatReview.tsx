import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { ChatMessage } from "../types";
import { PerformanceSearchField } from "./PerformanceSearchField";

function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const ChatReview = () => {
  const { auth } = useContext(ThemeContext);
  const canReview = hasPermission(auth, "admin:chat-review");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<"" | "group" | "private">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getChatReviewMessages({
        search: search.trim() || undefined,
        channel: channel || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 1000,
      });
      setMessages(data);
    } catch (err) {
      notify.error(err, "Failed to load chat history.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canReview) return;
    loadMessages().catch(console.error);
  }, [canReview]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(
      (message) =>
        message.message.toLowerCase().includes(query) ||
        message.senderName.toLowerCase().includes(query) ||
        message.senderEmail.toLowerCase().includes(query)
    );
  }, [messages, search]);

  if (!canReview) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Chat Review" pageContent="" />
        <div className="alert alert-warning">Only superadmin can review platform chat history.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Chat Review" pageContent="" />

      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Platform Chat Review</h4>
          <p className="text-muted small mb-0">Full chat history with sender details across all conversations.</p>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <PerformanceSearchField value={search} onChange={setSearch} placeholder="Search message or sender..." />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value as "" | "group" | "private")}>
                <option value="">All chats</option>
                <option value="group">Group</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-primary w-100" onClick={() => loadMessages()} disabled={loading}>
                {loading ? "Loading..." : "Apply Filters"}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-muted mb-0">Loading chat history...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-muted mb-0">No messages found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Sender</th>
                    <th>Role</th>
                    <th>Channel</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message.id}>
                      <td className="text-nowrap">{formatMessageDate(message.createdAt)}</td>
                      <td>
                        <div className="fw-semibold">{message.senderName}</div>
                        <small className="text-muted">{message.senderEmail}</small>
                      </td>
                      <td className="text-capitalize">{message.senderRole}</td>
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
