import { Box, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import Card from "../common/Card";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";

// Generic table shell reused by Containers/Images/Volumes/Services/Stacks —
// each page just passes its own columns + rows + row-action renderer,
// instead of six near-identical table implementations.
export default function ResourceTable({ title, columns, rows, loading, emptyTitle, emptyDescription, action, renderRowActions }) {
  return (
    <Card sx={{ p: 0, overflow: "hidden" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2} borderBottom="1px solid" borderColor="divider">
        <Box fontWeight={700}>{title}</Box>
        {action}
      </Box>

      {loading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key}>{c.label}</TableCell>
              ))}
              {renderRowActions && <TableCell align="right" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.id || row.name || i} hover>
                {columns.map((c) => (
                  <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                ))}
                {renderRowActions && <TableCell align="right">{renderRowActions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
