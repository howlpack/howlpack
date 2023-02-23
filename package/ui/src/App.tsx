import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RecoilRoot } from "recoil";
import KeplrWatcher from "./components/keplr-watcher";
import AppLayout from "./layout/app";

import FAQ from "./pages/faq";
import { EmailNotifications } from "./pages/notifications";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/notifications" replace /> },
      {
        path: "faq",
        element: <FAQ />,
      },
      {
        path: "notifications",
        children: [
          {
            index: true,
            element: <Navigate to="email" replace />,
          },
          { path: "email", element: <EmailNotifications /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <RecoilRoot>
      <KeplrWatcher />
      <RouterProvider router={router} />
    </RecoilRoot>
  );
}

export default App;
