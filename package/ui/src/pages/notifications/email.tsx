import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { useRecoilValue } from "recoil";
import Loading from "../../components/loading";
import useFormData from "../../hooks/use-form-data";
import useStargateClient from "../../hooks/use-stargate-client";
import { keplrState } from "../../state/cosmos";
import { selectedDensState } from "../../state/howlpack";
import Email from "./components/email";
import SelectEventType from "./components/select-event-type";
import { notification, constants } from "@howlpack/howlpack-shared";
import { useNavigate } from "react-router-dom";
import useGetNotification from "../../hooks/use-get-notification";

export default function EmailNotifications() {
  const keplr = useRecoilValue(keplrState);
  const { client } = useStargateClient();
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const { formState, setFormState } = useFormData({});
  const navigate = useNavigate();

  const { data: notifications } = useGetNotification();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const fn_void = useCallback(() => {}, []);

  const emailNotification = useMemo(() => {
    return notifications?.find((n: any) => n.email)?.email;
  }, [notifications]);

  useEffect(() => {
    if (!emailNotification) {
      return;
    }

    const event_types = Object.values(
      constants.EVENT_TYPES as { [x: string]: string }
    ).reduce(
      (acc, k) => ({
        ...acc,
        [k]: notification.hasPreference(emailNotification.preferences, k),
      }),
      {}
    );

    setFormState((s) => s.set("event_types", event_types));
    setFormState((s) => s.set("email", emailNotification.masked_addr));
  }, [emailNotification, setFormState]);

  if (!client || notifications == null) {
    return <Loading></Loading>;
  }

  return (
    <Fragment>
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Typography variant="h6">
          Email preferences for {selectedDens}
        </Typography>

        <Divider sx={{ mt: 1, mb: 4 }} />
        <Box sx={{ maxWidth: "450px" }}>
          <Email formData={formState} onChange={fn_void} disabled />
        </Box>

        <Box>
          <SelectEventType
            formData={formState}
            onChange={fn_void}
            label={"Currently subscribed to these events"}
            disabled
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={async () => {
              navigate("./update", {
                state: formState.toJSON(),
              });
            }}
            disableElevation
          >
            Change settings
          </Button>
          <Button
            color="secondary"
            variant="text"
            sx={{ mt: 2 }}
            onClick={async () => {}}
            disableElevation
          >
            Unsubscribe from all
          </Button>
        </Box>
      </Card>
    </Fragment>
  );
}
