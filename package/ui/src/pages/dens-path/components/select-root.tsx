import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { toBaseToken } from "../../../lib/token";
import { PathTLD } from "../../../types/types";

export const pathTLDs: PathTLD[] = [
  {
    denom: "JUNO",
    name: "username",
    price: "1000000",
  },
  {
    denom: "JUNO",
    name: "name",
    price: "1000000",
  },
  {
    denom: "JUNO",
    name: "user",
    price: "1000000",
  },
];

export default function SelectRoot({
  formData,
  onChange,
  label,
  disabled = false,
}: {
  formData: any;
  onChange: any;
  label?: string;
  disabled?: boolean;
}) {
  const handleChange = (event: any) => {
    onChange(event, (target: any) => target.value);
  };

  return (
    <FormControl
      sx={{ width: "100%" }}
      component="fieldset"
      variant="outlined"
      disabled={disabled}
    >
      <InputLabel id="root-domain-label">TLD</InputLabel>
      <Select
        label="TLD"
        name="TLD"
        value={formData.get("TLD")}
        onChange={handleChange}
        renderValue={(selected) => <Typography>{selected}</Typography>}
        MenuProps={{
          sx: {
            minWidth: "500px",
          },
          elevation: 1,
        }}
      >
        {pathTLDs.map((e, ix) => (
          <MenuItem key={e.name} value={e.name}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography>{e.name}</Typography>
              <Chip
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ m: 0 }}
                label={
                  toBaseToken(BigInt(e.price)).toLocaleString() + " " + e.denom
                }
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
