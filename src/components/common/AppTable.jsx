import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Box } from "@mui/material";

export default function AppTable({ columns, data, renderActions }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
	<Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col}>{col}</TableCell>
          ))}
          {renderActions && <TableCell>Actions</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col}>{row[col]}</TableCell>
            ))}
            {renderActions && (
              <TableCell>{renderActions(row)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
	</Box>
  );
}
