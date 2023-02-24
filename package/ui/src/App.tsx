import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";
import { RecoilRoot } from "recoil";
import KeplrWatcher from "./components/keplr-watcher";
import Loading from "./components/loading";
import AppLayout from "./layout/app";
import rollbar from "./lib/rollbar";
import WithKeplr from "./layout/with-keplr";
import WithDENS from "./layout/with-dens";

const FAQ = lazy(() => import("./pages/faq"));
const EmailNotifications = lazy(() => import("./pages/notifications/email"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/notifications" replace /> },
      {
        path: "faq",
        element: (
          <Suspense fallback={<Loading />}>
            <FAQ />
          </Suspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <WithKeplr>
            <WithDENS />
          </WithKeplr>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="email" replace />,
          },
          {
            path: "email",
            element: (
              <Suspense fallback={<Loading />}>
                <EmailNotifications />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {},
});

function App() {
  return (
    <RollbarProvider instance={rollbar}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <KeplrWatcher />
            <RouterProvider router={router} />
          </ErrorBoundary>
        </QueryClientProvider>
      </RecoilRoot>
    </RollbarProvider>
  );
}

export default App;
