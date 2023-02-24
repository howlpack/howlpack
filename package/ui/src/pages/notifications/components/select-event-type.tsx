import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { ChangeEvent } from "react";
import { constants } from "@howlpack/howlpack-shared";

const labels: { [x: string]: string } = {
  [constants.EVENT_TYPES.NEW_FOLLOWER]: "New Follower",
  [constants.EVENT_TYPES.NEW_REPLY]: "New Reply",
  [constants.EVENT_TYPES.NEW_LIKE]: "New Like(s)",
};

export default function SelectEventType({
  formData,
  onChange,
}: {
  formData: any;
  onChange: any;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event, (target: any) => target.checked);
  };

  return (
    <FormControl sx={{ my: 3 }} component="fieldset" variant="standard">
      <legend>
        <Typography variant="caption">
          Select events you want to receive
        </Typography>
      </legend>
      <FormGroup>
        {Object.values(constants.EVENT_TYPES).map((e, ix) => (
          <FormControlLabel
            key={ix}
            control={
              <Checkbox
                checked={formData.getIn(["event_types", e])}
                onChange={handleChange}
                name={"event_types." + e}
              />
            }
            label={labels[e as string]}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}
