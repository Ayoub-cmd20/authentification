import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { authRouter } from "./auth.routes.js";
import { institutionRouter } from "./institution.routes.js";
import { publicRouter } from "./public.routes.js";
import { studentRouter } from "./student.routes.js";
import { superAdminRouter } from "./superAdmin.routes.js";
import { paymentsRouter } from "./payments.routes.js";
import { ministryRouter } from "./ministry.routes.js";
import { blockchainRouter } from "./blockchain.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/institution", institutionRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/super-admin", superAdminRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/ministry", ministryRouter);
apiRouter.use("/blockchain", blockchainRouter);
