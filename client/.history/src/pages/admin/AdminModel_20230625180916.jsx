import "./adminModel.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import Cookies from "js-cookie";
import { Avatar, Badge, IconButton, Typography } from "@mui/material";
import LocalSeeIcon from "@mui/icons-material/LocalSee";
import { styled } from "@mui/material/styles";
import FormDialogImage from "../../components/dialogModel/dialogModel";
import FilePreviewerCover from "../../components/dialogModel/dialogModelCover";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { AuthContext } from "../../context/AuthContext";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

export default function AdminModel() {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const { firstName } = useParams();
  const [open, setOpen] = useState(false);
  const [openCover, setOpenCover] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const token = Cookies.get("token");
  const dataUser = JSON.parse(localStorage.getItem("user"));

  

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        
          <div className="profileRightBottom">
            <Feed firstName={firstName} onProfile={true} />
            <Rightbar user={user} />
          </div>
          {open ? (
            <>
              <FormDialogImage onClose={() => setOpen(false)} />
            </>
          ) : null}
          {openCover ? (
            <>
              <FilePreviewerCover onClose={() => setOpenCover(false)} />
            </>
          ) : null}
        </div>
    </>
  );
}
