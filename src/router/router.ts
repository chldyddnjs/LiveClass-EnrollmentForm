import { lazyImport } from "./helper.ts";
import { createBrowserRouter } from "react-router-dom";

const LoadingPage        = lazyImport(() => import("../pages/LoadingPage.tsx"),             "LoadingPage");
const CourseListPage     = lazyImport(() => import("../pages/course/CourseListPage.tsx"),    "CourseListPage");
const CourseDetailPage   = lazyImport(() => import("../pages/course/CourseDetailPage.tsx"), "CourseDetailPage");
const EnrollPage         = lazyImport(() => import("../pages/enroll/EnrollPage.tsx"),        "EnrollPage");
const Step2Page          = lazyImport(() => import("../pages/enroll/Step2Page.tsx"),         "Step2Page");
const Step3Page          = lazyImport(() => import("../pages/enroll/Step3Page.tsx"),         "Step3Page");
const EnrollCompletePage = lazyImport(() => import("../pages/enroll/EnrollCompletePage.tsx"),"EnrollCompletePage");
const NotFoundPage       = lazyImport(() => import("../pages/NotFoundPage.tsx"),             "NotFoundPage");

const Router = createBrowserRouter([
    {
        path: "/",
        Component: CourseListPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/courses/:id",
        Component: CourseDetailPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/courses/:courseId/enroll",
        Component: EnrollPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/enroll/step2",
        Component: Step2Page,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/enroll/step3",
        Component: Step3Page,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/enroll/complete",
        Component: EnrollCompletePage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "*",
        Component: NotFoundPage,
        HydrateFallback: LoadingPage,
    },
]);

export default Router;