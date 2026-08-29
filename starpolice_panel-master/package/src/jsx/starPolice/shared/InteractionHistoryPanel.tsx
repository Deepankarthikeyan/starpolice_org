import { useEffect, useMemo, useState } from "react";
import { PerformanceSearchField } from "../admin/PerformanceSearchField";
import { api } from "../api";
import { notify } from "../toast";
import type { ChatMessage, UserRole } from "../types";
import {
  historyThreadLabel,
  resolveHistoryMessageNavigation,
  type InteractionHistoryChannelFilter,
  type InteractionHistorySortDir,
  type InteractionHistorySortKey,
} from "./interactionHistoryHelpers";
import { InteractionSortPicker } from "./InteractionSortPicker";
import { InteractionFilterSelect } from "./InteractionFilterSelect";

const HISTORY_SORT_OPTIONS = [
  { key: "createdAt", dir: "desc" as const, label: "Date (Newest first)" },
  { key: "createdAt", dir: "asc" as const, label: "Date (Oldest first)" },
  { key: "senderName", dir: "asc" as const, label: "Sender (A → Z)" },
  { key: "senderName", dir: "desc" as const, label: "Sender (Z → A)" },
];

type InteractionHistoryPanelProps = {
  viewerRole: UserRole;
  onOpenMessage?: (message: ChatMessage) => void;
};

function parseSortValue(value: string): { sortKey: InteractionHistorySortKey; sortDir: InteractionHistorySortDir } {
  const [sortKey, sortDir] = value.split(":");
  return {
    sortKey: sortKey === "senderName" ? "senderName" : "createdAt",
    sortDir: sortDir === "asc" ? "asc" : "desc",
  };
}

export function InteractionHistoryPanel({ viewerRole, onOpenMessage }: InteractionHistoryPanelProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:desc");
  const [channelFilter, setChannelFilter] = useState<InteractionHistoryChannelFilter>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const { sortKey, sortDir } = parseSortValue(sortValue);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getMessageHistory({
        search: debouncedSearch.trim() || undefined,
        sort: sortDir,
        sortKey,
        channel: channelFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setMessages(data);
    } catch (error) {
      notify.error(error, "Failed to load interaction history");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory().catch(console.error);
  }, [debouncedSearch, sortValue, channelFilter, fromDate, toDate]);

  const resultCountLabel = useMemo(() => {
    if (loading) return "Loading messages...";
    if (messages.length === 0) return "No messages match your search or filters.";
    return `${messages.length} message${messages.length === 1 ? "" : "s"} found`;
  }, [loading, messages.length]);

  return (
    <div className="spa-interaction-history">
      <div className="spa-interaction-history-toolbar">
        <div className="spa-interaction-history-controls">
          <PerformanceSearchField
            value={search}
            onChange={setSearch}
            placeholder="Search messages, senders, chat type..."
            ariaLabel="Search interaction history"
          />
          <InteractionSortPicker
            options={HISTORY_SORT_OPTIONS}
            value={sortValue}
            onChange={setSortValue}
            ariaLabel="Sort interaction history"
          />
        </div>

        <div className="spa-interaction-history-filters row g-3">
          <div className="col-md-4">
            <InteractionFilterSelect
              id="interaction-history-channel"
              label="Chat type"
              value={channelFilter}
              onChange={(value) => setChannelFilter(value as InteractionHistoryChannelFilter)}
              options={[
                { value: "", label: "All chats" },
                { value: "group", label: "Group only" },
                { value: "private", label: "Private only" },
              ]}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted mb-1" htmlFor="interaction-history-from">
              From date
            </label>
            <input
              id="interaction-history-from"
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted mb-1" htmlFor="interaction-history-to">
              To date
            </label>
            <input
              id="interaction-history-to"
              type="date"
              className="form-control"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </div>

        <div className="spa-interaction-history-meta">
          <p className="text-muted small mb-0">{resultCountLabel}</p>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => loadHistory().catch(console.error)}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="spa-interaction-history-list">
        {loading && messages.length === 0 ? (
          <p className="text-muted mb-0 px-3 py-4">Loading interaction history...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted mb-0 px-3 py-4">No messages match your search or filters.</p>
        ) : (
          messages.map((item) => {
            const canOpen = Boolean(resolveHistoryMessageNavigation(item, viewerRole));
            return (
              <button
                key={item.id}
                type="button"
                className={`spa-interaction-history-item${canOpen ? "" : " is-static"}`}
                onClick={() => {
                  if (canOpen) onOpenMessage?.(item);
                }}
                disabled={!canOpen || !onOpenMessage}
              >
                <div className="spa-interaction-history-item-head">
                  <div>
                    <strong>{item.senderName}</strong>
                    <span className="spa-interaction-history-thread">{historyThreadLabel(item)}</span>
                  </div>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
                <p className="spa-interaction-history-message mb-0">{item.message}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
