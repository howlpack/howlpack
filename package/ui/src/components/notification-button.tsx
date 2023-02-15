import { Button } from "@mui/material";

export default function NotificationButton() {
  async function regWorker() {
    const publicKey =
      "BPHPIpyeYggMtOUBe9lnbs6HwGD4f6pc-uy0c8g-mSfs914E-GdEaiZniK48mKJisKFQDj6jWV22F852RG7anzc";

    navigator.serviceWorker.register("sw.js", { scope: "/" });

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        })
        .then(
          (sub) => {
            fetch("/mypush", {
              method: "POST",
              body: JSON.stringify(sub),
              headers: { "content-type": "application/json" },
            })
              .then((res) => res.text())
              .then((txt) => console.log(txt))
              .catch((err) => console.error(err));
          },

          (err) => console.error(err)
        );
    });
  }

  function enable() {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (Notification.permission === "granted") {
          regWorker().catch((err) => console.error(err));
        } else {
          alert("Please allow notifications.");
        }
      });
    }

    // (A2) GRANTED
    else if (Notification.permission === "granted") {
      regWorker().catch((err) => console.error(err));
    }

    // (A3) DENIED
    else {
      alert("Please allow notifications.");
    }
  }
  return <Button onClick={enable}>Notification</Button>;
}
