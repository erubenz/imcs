import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function SelectField({ label, value, onChange, options, name }) {
  return (
    <FormControl fullWidth size="small" margin="normal">
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={onChange} name={name}>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
