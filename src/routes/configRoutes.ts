import express from "express";
import { authorize } from "../middleware/authorize";
import { postConfig } from "../controllers/configController";

const router = express.Router();

/**
 * @swagger
 * /config/admin/config:
 *   post:
 *     summary: Update configuration settings
 *     description: |
 *       Update configuration settings for cron jobs.
 *
 *       #### Cron Schedule Format
 *       ```
 *       # ┌────────────── second (optional)
 *       # │ ┌──────────── minute
 *       # │ │ ┌────────── hour
 *       # │ │ │ ┌──────── day of month
 *       # │ │ │ │ ┌────── month
 *       # │ │ │ │ │ ┌──── day of week
 *       # │ │ │ │ │ │
 *       # │ │ │ │ │ │
 *       # * * * * * *
 *       ```
 *       - `second`: Seconds (optional)
 *       - `minute`: Minutes
 *       - `hour`: Hours
 *       - `day of month`: Day of the month
 *       - `month`: Month
 *       - `day of week`: Day of the week
 *
 *     tags:
 *       - Configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updateCache:
 *                 type: string
 *                 description: Whether to update cache in cron job.
 *               updateCountBlog:
 *                 type: string
 *                 description: Whether to update the count of blogs in cron job.
 *               updateCountUser:
 *                 type: string
 *                 description: Whether to update the count of users in cron job.
 *     responses:
 *       '200':
 *         description: Configuration updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: Update config successfully !!
 *       '400':
 *         description: Bad Request. Missing required input.
 *         content:
 *           application/json:
 *             example:
 *               message: Please fill all input !!
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */
router.post("/admin/config", authorize(["admin"]), postConfig);
export default router;
