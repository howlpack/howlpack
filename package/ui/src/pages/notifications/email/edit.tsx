import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useGetNotification from "../../../hooks/use-get-notification";
import EmailForm from "../components/email-form";

export default function EmailUpdate() {
  const navigate = useNavigate();
  const { data: notifications } = useGetNotification();
  const emailNotification = useMemo(() => {
    return notifications?.find((n: any) => n.email)?.email;
  }, [notifications]);

  useEffect(() => {
    if (!emailNotification) {
      navigate("/notifications/email/create");
    }
  }, [emailNotification, navigate]);

  return <EmailForm />;
}
