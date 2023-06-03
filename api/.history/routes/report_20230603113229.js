import { Router } from 'express';
import {
  appFirebase, 
  auth, 
  db, 
  storage,
  FieldValue
} from "../routes/firebase.js";

const router = Router();

// Report User
router.post("/reportUser", async (req, res) => {
    try {
      const reporterId = req.body.reporter_id;
      const reportedUserId = req.body.reported_user_id;
      const comments = req.body.comments;
      const status = req.body.status;
  
      const reportRef = db.collection("Report_User").doc();
      const reportId = reportRef.id;
      const reportSnapshot = await reportRef.get();
  
      const reportedUserRef = db.collection("Users").doc(reportedUserId);
      const reportedUserSnapshot = await reportedUserRef.get();
  
      if (!reportedUserSnapshot.exists) {
        res.status(404).json({ message: "Reported user not found" });
        return;
      } else {
        const reportData = {
          report_id: reportId,
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          comments: comments,
          status: status
        };
  
        // Save report data to the report document
        await reportRef.set(reportData);
  
        res.status(200).json({ message: "User reported successfully" });
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Failed to report user", error: err });
    }
  });
  

// Get report for a Post
router.get("/reportPost", async (req, res) => {
    try {
      const reportRef = db.collection("Report_Post");
      const reportSnapshot = await reportRef.get();
  
      if (reportSnapshot.empty) {
        res.status(404).json({ message: "No report found for the post" });
        return;
      }
  
      const reports = [];
      reportSnapshot.forEach((doc) => {
        const reportData = doc.data();
        reports.push(reportData);
      });
  
      res.status(200).json(reports);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Failed to get report for the post", error: err });
    }
  });
  

export default router;