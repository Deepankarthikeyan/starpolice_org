import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
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
import {
  formatReviewDate,
  formatReviewTime,
  formatRoleLabel,
  getDayThreadKey,
  getDayThreadMessages,
  getMessageDateKey,
  getReviewAnchorSenderKey,
  getReviewSenderInitials,
  isReviewMessageOnRight,
} from "../shared/chatReviewHelpers";

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

type ChatDaySummary = {
  key: string;
  date: string;
  latestMessage: ChatMessage;
  messageCount: number;
};

function buildDaySummaries(messages: ChatMessage[]) {
  const grouped = new Map<string, ChatMessage[]>();

  for (const message of messages) {
    const key = getDayThreadKey(message);
    const bucket = grouped.get(key) || [];
    bucket.push(message);
    grouped.set(key, bucket);
  }

  const summaries: ChatDaySummary[] = [];
  for (const [key, bucket] of grouped.entries()) {
    const sorted = [...bucket].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
    summaries.push({
      key,
      date: getMessageDateKey(sorted[0]?.createdAt),
      latestMessage: sorted[0],
      messageCount: bucket.length,
    });
  }

  return summaries.sort(
    (left, right) =>
      new Date(right.latestMessage.createdAt).getTime() - new Date(left.latestMessage.createdAt).getTime()
  );
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
  const [activeDayThreadKey, setActiveDayThreadKey] = useState<string | null>(null);

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
        channel: channelFilter === "group" || channelFilter === "private" ? channelFilter : undefined,
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

  const daySummaries = useMemo(() => buildDaySummaries(messages), [messages]);

  const activeDayMessages = useMemo(() => {
    if (!activeDayThreadKey) return [];
    return getDayThreadMessages(messages, activeDayThreadKey);
  }, [messages, activeDayThreadKey]);

  const activeSummary = daySummaries.find((summary) => summary.key === activeDayThreadKey) || null;
  const reviewAnchorSenderKey = useMemo(
    () => getReviewAnchorSenderKey(activeDayMessages),
    [activeDayMessages]
  );

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
          <div className="spa-chat-review-filters row g-3 align-items-end mb-3">
            <div className="col-md-6 col-lg-3">
              <label className="form-label small text-muted mb-1" htmlFor="chat-review-search">
                Search
              </label>
              <PerformanceSearchField
                id="chat-review-search"
                value={search}
                onChange={setSearch}
                placeholder="Search message or sender..."
                ariaLabel="Search message or sender"
              />
            </div>
            <div className="col-md-6 col-lg-2">
              <InteractionFilterSelect
                id="chat-review-channel"
                label="Channel"
                value={channelFilter}
                options={CHANNEL_OPTIONS}
                onChange={setChannelFilter}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="form-label small text-muted mb-1">Sort by</label>
              <InteractionSortPicker options={SORT_OPTIONS} value={sortValue} onChange={setSortValue} />
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label small text-muted mb-1" htmlFor="chat-review-from">
                From
              </label>
              <input
                id="chat-review-from"
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label small text-muted mb-1" htmlFor="chat-review-to">
                To
              </label>
              <input
                id="chat-review-to"
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-muted mb-0">Loading chat history...</p>
          ) : daySummaries.length === 0 ? (
            <p className="text-muted mb-0">No messages found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Sender Role</th>
                    <th>Receiver Role</th>
                    <th>Sender Name</th>
                    <th>Receiver Name</th>
                    <th>Channel</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {daySummaries.map((summary) => {
                    const message = summary.latestMessage;
                    return (
                      <tr key={summary.key}>
                        <td className="text-nowrap">{formatReviewDate(message.createdAt)}</td>
                        <td className="text-nowrap">{formatReviewTime(message.createdAt)}</td>
                        <td>{formatRoleLabel(message.senderRole)}</td>
                        <td>{formatRoleLabel(message.receiverRole)}</td>
                        <td>{message.senderName || "—"}</td>
                        <td>{message.receiverName || "—"}</td>
                        <td className="text-capitalize">{message.channel}</td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setActiveDayThreadKey(summary.key)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal show={Boolean(activeDayThreadKey)} onHide={() => setActiveDayThreadKey(null)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            Chat on {activeSummary ? formatReviewDate(activeSummary.latestMessage.createdAt) : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeSummary && (
            <p className="text-muted small">
              {formatRoleLabel(activeSummary.latestMessage.senderRole)} {activeSummary.latestMessage.senderName}
              {" → "}
              {formatRoleLabel(activeSummary.latestMessage.receiverRole)} {activeSummary.latestMessage.receiverName}
              {" · "}
              <span className="text-capitalize">{activeSummary.latestMessage.channel}</span>
              {" · "}
              {activeDayMessages.length} message{activeDayMessages.length === 1 ? "" : "s"}
            </p>
          )}
          {activeDayMessages.length === 0 ? (
            <p className="text-muted mb-0">No messages for this day.</p>
          ) : (
            <div className="spa-chat-review-thread">
              <div className="spa-messenger-feed spa-chat-review-feed">
                {activeDayMessages.map((message) => {
                  const onRight = isReviewMessageOnRight(message, reviewAnchorSenderKey);
                  const initials = getReviewSenderInitials(message.senderName);
                  return (
                    <div
                      key={message.id}
                      className={`spa-messenger-row ${onRight ? "is-mine" : "is-other"}`}
                    >
                      {!onRight && (
                        <div className="spa-messenger-msg-avatar" aria-hidden="true">{initials}</div>
                      )}
                      <div className={`spa-messenger-bubble ${onRight ? "is-mine" : "is-other"}`}>
                        <div className="spa-messenger-bubble-name">
                          {message.senderName}
                          <span className="text-muted fw-normal ms-1">({formatRoleLabel(message.senderRole)})</span>
                        </div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{message.message}</div>
                        <small>
                          {formatReviewDate(message.createdAt)} {formatReviewTime(message.createdAt)}
                        </small>
                      </div>
                      {onRight && (
                        <div className="spa-messenger-msg-avatar is-mine" aria-hidden="true">{initials}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatReview;
