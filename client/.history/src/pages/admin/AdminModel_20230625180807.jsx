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
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              {isUser ? (
                <>
                  <Image onClick={handleClickOpenCover}>
                    <ImageTitle>
                      <LocalSeeIcon
                        fontSize="small"
                        sx={{
                          color: "#6200E8",
                          m: 1,
                        }}
                      />
                      <span>Change</span>
                      <ImageMarked className="MuiImageMarked-root" />
                    </ImageTitle>
                    <ImageBackdrop className="ImageBackdrop" />
                  </Image>
                  <Badge
                    overlap="circular"
                    sx={{
                      top: "-100px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="profileUserImg"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <label htmlFor="avatar-upload">
                        <IconButton
                          onClick={handleClickOpen}
                          color="white"
                          aria-label="Change Avatar"
                          component="span"
                          sx={{
                            backgroundColor: "white",
                            border: "0.5px solid #E2D7F0",
                            borderRadius: "50%",
                          }}
                        >
                          <LocalSeeIcon
                            fontSize="small"
                            sx={{
                              color: "#6200E8",
                            }}
                          />
                        </IconButton>
                      </label>
                    }
                  >
                    <Avatar
                      alt="Profile Picture"
                      src={user.profilePicture || "/assets/person/noAvatar.png"}
                      style={{ width: "150px", height: "150px" }}
                    />
                  </Badge>
                </>
              ) : (
                <>
                  <img
                    className="profileCoverImg"
                    src={
                      user.coverPicture
                        ? user.coverPicture
                        : "/assets/person/noCover.png"
                    }
                    alt=""
                  />
                  <Avatar
                    className="profileUserImg"
                    alt="Profile Picture"
                    src={user.profilePicture || "/assets/person/noAvatar.png"}
                    style={{ width: "150px", height: "150px" }}
                  />
                </>
              )}
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user.firstName} {user.lastName}
              </h4>
              <span className="profileInfoDesc">{user?.desc}</span>
            </div>
          </div>
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
      </div>
    </>
  );
}
