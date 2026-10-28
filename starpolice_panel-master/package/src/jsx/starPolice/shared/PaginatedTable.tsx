import { Children, Fragment, cloneElement, isValidElement, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";

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
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index).filter(
    (index) => index === 0 || index === pageCount - 1 || Math.abs(index - currentPage) <= 1,
  );

  return (
    <section className="spa-table-panel">
      <div className={`${className} spa-table-scroll`} tabIndex={0} aria-label="Scrollable table">
        {content}
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
