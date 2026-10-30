import { Children, Fragment, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";

type PaginatedTableProps = {
  children: ReactNode;
  className?: string;
  pageSizeOptions?: number[];
};

function flattenRows(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenRows((child.props as { children?: ReactNode }).children);
    }
    return [child];
  });
}

function isEmptyStateRow(row: ReactNode): boolean {
  if (!isValidElement(row) || row.type !== "tr") return false;
  const cells = Children.toArray((row.props as { children?: ReactNode }).children);
  if (cells.length !== 1 || !isValidElement(cells[0]) || cells[0].type !== "td") return false;
  return Boolean((cells[0].props as { colSpan?: number }).colSpan);
}

function dataRows(children: ReactNode): ReactNode[] {
  const rows = flattenRows(children);
  return rows.length === 1 && isEmptyStateRow(rows[0]) ? [] : rows;
}

function paginateTable(node: ReactNode, start: number, end: number): ReactNode {
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  const tag = typeof element.type === "string" ? element.type : "";
  if (tag === "tbody") {
    const rows = flattenRows(element.props.children);
    const visibleRows = rows.length === 1 && isEmptyStateRow(rows[0]) ? rows : rows.slice(start, end);
    return cloneElement(element, {}, visibleRows);
  }
  if (!element.props.children) return node;
  return cloneElement(element, {}, Children.map(element.props.children, (child) => paginateTable(child, start, end)));
}

type HorizontalScrollMetrics = { left: number; max: number; viewport: number };

function RowScrollbar({ metrics, onScrollTo }: { metrics: HorizontalScrollMetrics; onScrollTo: (value: number) => void }) {
  if (metrics.max <= 0) return null;
  const value = Math.round((metrics.left / metrics.max) * 1000);
  const thumbWidth = Math.max(18, Math.min(metrics.viewport, (metrics.viewport * metrics.viewport) / (metrics.viewport + metrics.max)));
  return (
    <input
      type="range"
      min={0}
      max={1000}
      value={value}
      onChange={(event) => onScrollTo(Number(event.target.value))}
      className="spa-row-scrollbar-range"
      style={{ width: metrics.viewport, "--spa-row-scroll-thumb": thumbWidth + "px" } as CSSProperties}
      aria-label="Scroll the table horizontally"
    />
  );
}

function addRowScrollbars(node: ReactNode, columnCount: number, metrics: HorizontalScrollMetrics, onScrollTo: (value: number) => void): ReactNode {
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  const tag = typeof element.type === "string" ? element.type : "";
  if (tag === "tbody") {
    const rows = flattenRows(element.props.children);
    if (rows.length === 1 && isEmptyStateRow(rows[0])) return node;
    const rowsWithControls = rows.reduce<ReactNode[]>((result, row, index) => {
      if (!isValidElement(row) || row.type !== "tr") { result.push(row); return result; }
      result.push(row,
        <tr key={"row-scrollbar-" + index} className="spa-row-scrollbar-row">
          <td colSpan={columnCount}><RowScrollbar metrics={metrics} onScrollTo={onScrollTo} /></td>
        </tr>,
      );
      return result;
    }, []);
    return cloneElement(element, {}, rowsWithControls);
  }
  if (!element.props.children) return node;
  return cloneElement(element, {}, Children.map(element.props.children, (child) => addRowScrollbars(child, columnCount, metrics, onScrollTo)));
}

function tableColumnCount(table: ReactNode): number {
  if (!isValidElement(table)) return 1;
  const tableChildren = Children.toArray((table.props as { children?: ReactNode }).children);
  const thead = tableChildren.find((child) => isValidElement(child) && child.type === "thead");
  if (!isValidElement(thead)) return 1;
  const row = Children.toArray((thead.props as { children?: ReactNode }).children).find((child) => isValidElement(child) && child.type === "tr");
  if (!isValidElement(row)) return 1;
  return Children.toArray((row.props as { children?: ReactNode }).children).reduce<number>((count, cell) => count + (isValidElement(cell) ? Number((cell.props as { colSpan?: number }).colSpan || 1) : 0), 0);
}


export default function PaginatedTable({ children, className = "table-responsive", pageSizeOptions = [10, 25, 50, 100] }: PaginatedTableProps) {
  const table = Children.toArray(children).find((child) => isValidElement(child) && child.type === "table");
  const rowCount = useMemo(() => {
    if (!isValidElement(table)) return 0;
    const tbody = Children.toArray((table.props as { children?: ReactNode }).children)
      .find((child) => isValidElement(child) && child.type === "tbody");
    return isValidElement(tbody) ? dataRows((tbody.props as { children?: ReactNode }).children).length : 0;
  }, [table]);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 10);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * pageSize;
  const end = Math.min(start + pageSize, rowCount);

  useEffect(() => setPage(0), [pageSize, rowCount]);

  const content = isValidElement(table) ? paginateTable(table, start, end) : children;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollMetrics, setScrollMetrics] = useState<HorizontalScrollMetrics>({ left: 0, max: 0, viewport: 0 });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const update = () => {
      const nextMetrics = { left: container.scrollLeft, max: Math.max(0, container.scrollWidth - container.clientWidth), viewport: container.clientWidth };
      setScrollMetrics((current) => current.left === nextMetrics.left && current.max === nextMetrics.max && current.viewport === nextMetrics.viewport ? current : nextMetrics);
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(container);
    if (container.firstElementChild) observer?.observe(container.firstElementChild);
    return () => { container.removeEventListener("scroll", update); window.removeEventListener("resize", update); observer?.disconnect(); };
  }, [content]);

  const scrollToPosition = (value: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    container.scrollLeft = (value / 1000) * max;
  };
  const visibleContent = addRowScrollbars(content, tableColumnCount(table), scrollMetrics, scrollToPosition);

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index).filter(
    (index) => index === 0 || index === pageCount - 1 || Math.abs(index - currentPage) <= 1,
  );

  return (
    <section className="spa-table-panel">
      <div ref={scrollRef} className={`${className} spa-table-scroll`} tabIndex={0} aria-label="Scrollable table">
        {visibleContent}
      </div>
      <div className="spa-table-pagination">
        <label className="spa-table-page-size">
          <span>Rows per page</span>
          <select className="form-select form-select-sm" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
            {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span className="spa-table-count">{rowCount === 0 ? "0 results" : `Showing ${start + 1}–${end} of ${rowCount}`}</span>
        <nav className="spa-table-pages" aria-label="Table pages">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage(0)} disabled={currentPage === 0} aria-label="First page">«</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} aria-label="Previous page">‹</button>
          {pageNumbers.map((number, index) => (
            <span className="spa-table-page-item" key={number}>
              {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="spa-table-ellipsis">…</span>}
              <button type="button" className={`btn btn-sm ${number === currentPage ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>{number + 1}</button>
            </span>
          ))}
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage >= pageCount - 1} aria-label="Next page">›</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage(pageCount - 1)} disabled={currentPage >= pageCount - 1} aria-label="Last page">»</button>
        </nav>
      </div>
    </section>
  );
}
