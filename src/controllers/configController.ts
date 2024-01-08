import { Response } from "express";
import { RequestCustom } from "../../types/express";
import cronConfig from "../models/cronConfig";
import { myCache } from "../app";
import cron from "node-cron";
import { updateAllBlogsCache, updateBlogCount } from "./blogController";
import { updateAllUsersCache } from "./userController";

export const postConfig = async (req: RequestCustom, res: Response) => {
  try {
    const { updateCache, updateCountBlog, updateCountUser } = req.body;
    if (!updateCache || !updateCountBlog || !updateCountUser) {
      return res.json({ message: "Please fill all input !!" });
    }
    if (
      cron.validate(updateCache) != true ||
      cron.validate(updateCountBlog) != true ||
      cron.validate(updateCountUser) != true
    ) {
      return res.json({ message: "Please correct the cron extension !!" });
    }
    await cronConfig.deleteMany();
    await cronConfig.create({
      updateCache: updateCache,
      updateCountBlog: updateCountBlog,
      updateCountUser: updateCountUser,
    });

    return res.json({
      message: "Update config successfully !!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    const schedule = await cronConfig.find();
    if (schedule) {
      cron.schedule(schedule[0].updateCache, async () => {
        await updateAllBlogsCache();
      });
      cron.schedule(schedule[0].updateCountBlog, async () => {
        await updateBlogCount();
      });
      cron.schedule(schedule[0].updateCountUser, async () => {
        await updateAllUsersCache();
      });
    } else {
      cron.schedule(process.env.updateCache!, async () => {
        await updateAllBlogsCache();
      });

      cron.schedule(process.env.updateCountBlog!, async () => {
        await updateBlogCount();
      });

      cron.schedule(process.env.updateCountUser!, async () => {
        await updateAllUsersCache();
      });
    }
  }
};
