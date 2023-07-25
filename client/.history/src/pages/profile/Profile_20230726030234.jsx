import "./profile.css";
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

export default function Profile() {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const { firstName } = useParams();
  const [open, setOpen] = useState(false);
  const [openCover, setOpenCover] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const token = Cookies.get("token");
  const dataUser = JSON.parse(localStorage.getItem("user"));
  const path = process.env.REACT_APP_PATH_ID;

  useEffect(() => {
    setIsUser(firstName === dataUser?.firstName);
    // console.log("firstName", firstName);
    // console.log("UfirstName", dataUser.firstName);
  }, [firstName, dataUser]);

  useEffect(() => {
    // Create a query for the user document based on the member_id
    const userRef = firestore
      .collection("Users")
      .where("member_id", "==", dataUser.member_id);
  
    // Subscribe to the snapshot listener for the user document
    const unsubscribeUser = userRef.onSnapshot((userSnapshot) => {
      // Check if the user document exists
      if (!userSnapshot.empty) {
        // Get the first document in the snapshot
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
  
        // Update the user state with the new data
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: userData.profilePicture,
          coverPicture: userData.coverPicture,
        }));
  
        // Update the user object in the localStorage
        const updatedUser = {
          ...dataUser,
          profilePicture: userData.profilePicture,
          coverPicture: userData.coverPicture,
        };
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
      } else {
        // Handle the case when no user document matches the query
        console.log("No matching user document found.");
      }
    });
  
    // Cleanup function: unsubscribe from the snapshot listener
    return () => {
      unsubscribeUser();
    };
  }, [open]);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${path}/api/users/user/${firstName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res?.data[0]);
        console.log("data", res?.data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [firstName]);

  const Image = styled("div")(({ theme }) => ({
    position: "relative",
    button: 150,
    width: "100%",
    height: 250,
    backgroundImage: `url("${
      user.coverPicture ? user.coverPicture : "/assets/person/noCover.png"
    }")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: "pointer",
    "&:hover $ImageBackdrop": {
      opacity: 0,
    },
    "&:hover $ImageMarked": {
      opacity: 0,
    },
    "&:hover $ImageTitle": {
      border: "4px solid currentColor",
    },
  }));

  const ImageTitle = styled(Typography)(({ theme }) => ({
    position: "relative",
    padding: theme.spacing(2),
    fontWeight: "bold",
    color: theme.palette.common.white,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  }));

  const ImageBackdrop = styled("div")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  }));

  const ImageMarked = styled("span")(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  }));

  if (Object.keys(user).length === 0) {
    return (
      <div className="loadingWrapper">
        <ReactLoading
          type="spin"
          color="#6200E8"
          height={"10%"}
          width={"10%"}
        />
      </div>
    );
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickOpenCover = () => {
    setOpenCover(true);
  };

  console.log(isUser);

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
