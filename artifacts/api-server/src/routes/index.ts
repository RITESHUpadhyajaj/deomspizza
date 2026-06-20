import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import bannersRouter from "./banners";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import favoritesRouter from "./favorites";
import settingsRouter from "./settings";
import couponsRouter from "./coupons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(bannersRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(favoritesRouter);
router.use(settingsRouter);
router.use(couponsRouter);

export default router;
