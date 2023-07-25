import "./share.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import React, { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import Cookies from "js-cookie";

import {
  Avatar,
  Chip,
  Autocomplete,
  TextField,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  PermMedia,
  Cancel,
  Send as SendIcon,
  PhotoCameraBack as PhotoCameraBackIcon,
} from "@mui/icons-material";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const path = process.env.REACT_APP_PATH_ID;

export default function Share({ onNewPost }) {
  const { user } = useContext(AuthContext);
  const desc = useRef();
  const [typePets, setTypePets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [typeData, setTypeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState("normal");
  const MAX_TAGS_LIMIT = 3;
  const token = Cookies.get("token");

  const privacyOptions = [
    { label: "สาธารณะ", value: "normal" },
    { label: "ส่วนตัว", value: "private" },
    { label: "เฉพาะผู้ติดตาม", value: "followers" },
  ];

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setFiles(arrayMove(files, oldIndex, newIndex));
  };

  const handlePrivacyChange = (event, value) => {
    if (value) {
      setPrivacy(value.value);
    } else {
      setPrivacy("normal"); // Default to normal if no option is selected
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 6); // Limit to 6 files

    // File size limits
    const imageMaxSize = 5 * 1024 * 1024; // 5 MB in bytes
    const videoMaxSize = 100 * 1024 * 1024; // 100 MB in bytes

    // Validate file sizes
    const validFiles = selectedFiles.filter((file) => {
      if (file.type.startsWith("image/") && file.size <= imageMaxSize) {
        return true; // Valid image file
      }
      if (file.type.startsWith("video/") && file.size <= videoMaxSize) {
        return true; // Valid video file
      }
      return false; // Invalid file
    });

    setFiles(validFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    const storageRef = storage.ref();
    const filePromises = files.map((file) => {
      const fileName = Date.now() + file.name;
      const fileRef = storageRef.child(`${user.member_id}/${fileName}`);
      return fileRef.put(file);
    });

    const socket = io.connect(process.env.PATH_ID); // Fix the environment variable name

    try {
      const uploadSnapshots = await Promise.all(filePromises);

      const fileUrls = await Promise.all(
        uploadSnapshots.map((snapshot) => snapshot.ref.getDownloadURL())
      );

      const newPost = {
        title: typeData,
        content: desc.current.value,
        member_id: user.member_id,
        likes: [],
        tagpet: selectedTags.map((tag) => tag.nameType),
        img: fileUrls,
        comment: [],
        status: privacy,
      };

      const res = await axios.post(`${path}/api/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles([]);
      setTypeData(null);
      setSelectedTags([]);
      desc.current.value = "";
      socket.emit("newPost", res.data); // Emit the "newPost" event with data
      if (onNewPost) {
        onNewPost();
      }
    } catch (err) {
      console.log(err);
      // Handle error here and display appropriate message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getTypePets = async () => {
      try {
        const res = await axios.get(`${path}/api/typePets`);
        const data = res.data;
        const typePets = data.map((item, index) => ({
          id: index,
          nameType: item.nameType,
        }));
        setTypePets(typePets);
      } catch (err) {
        console.log(err);
      }
    };
    getTypePets();
  }, []);

  const SortableItem = SortableElement(({ item, index }) => {
    if (item.type === "image") {
      setTypeData("image");
      return (
        <div className="shareImgItem">
          <img src={item.url} alt="Gallery Image" className="shareImg" />
          <Cancel
            className="shareCancelImg"
            onClick={() => removeFile(index)}
          />
        </div>
      );
    } else if (item.type === "video") {
      setTypeData("video");
      return (
        <div className="shareVideoItem">
          <video src={item.url} className="shareVideo" controls />
          <Cancel
            className="shareCancelImg"
            onClick={() => removeFile(index)}
          />
        </div>
      );
    } else {
      return null; // Exclude unsupported file types
    }
  });

  const SortableList = SortableContainer(({ items }) => (
    <div className="shareImgContainer">
      {items.map((item, index) => (
        <div key={index}>
          {" "}
          {/* Assign a unique key to each child element */}
          <SortableItem item={item} index={index} />
        </div>
      ))}
    </div>
  ));

  function arrayMove(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
      let k = newIndex - array.length + 1;
      while (k--) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array;
  }

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <Grid container alignItems="center">
            <Grid item xs={6} sm={6} md={3}>
              <Avatar
                aria-label="recipe"
                src={user.profilePicture}
                sx={{ width: "39px", height: "39px", mr: 1 }}
              />
              <Autocomplete
                id="margin-none"
                autoFocus
                disableCloseOnSelect
                fullWidth
                selectOnFocus
                autoHighlight
                options={privacyOptions}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                defaultValue={privacyOptions.find(
                  (option) => option.value === "normal"
                )}
                getOptionLabel={(option) => option.label}
                onChange={handlePrivacyChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    size="small"
                    sx={{ color: "#6309DE", m: 1 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextField
                fullWidth
                placeholder={`What's on your mind, ${user.firstName}?`}
                className="shareInput"
                variant="standard"
                size="small"
                rows={3}
                multiline
                inputRef={desc}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <form className="shareBottom" onSubmit={submitHandler}>
                {/* Share options */}
                <div className="shareOptions">
                  <div className="shareOption">
                    <label htmlFor="file" className="shareOptionLabel">
                      <PhotoCameraBackIcon />
                      {/* <PermMedia htmlColor="tomato" className="shareIcon" /> */}
                      <br></br>
                      <span className="shareOptionText">Photo or Video</span>
                      <input
                        style={{ display: "none" }}
                        type="file"
                        id="file"
                        accept=".png,.jpeg,.jpg,.gif,.mp4,.mov"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                {/* Share images */}
                <div className="shareImg">
                  <SortableList
                    items={files.map((file, index) => ({
                      type: file.type.startsWith("image/") ? "image" : "video",
                      url: URL.createObjectURL(file),
                    }))}
                    onSortEnd={onSortEnd}
                    axis="xy"
                    distance={1}
                  />
                </div>
                {/* Share tags */}
                <div className="shareTags">
                  <Autocomplete
                    multiple
                    sx={{ m: 1 }}
                    id="type-pets-select"
                    options={typePets}
                    // defaultValue={typePets[0]}
                    getOptionLabel={(option) => option.nameType}
                    onChange={(event, value) => setSelectedTags(value)}
                    value={selectedTags}
                    limitTags={MAX_TAGS_LIMIT} // Set the limit for the number of tags
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type Pets"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </div>
                {/* Share button */}
                <div className="shareBottomOptions">
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    sx={{ backgroundColor: "#6309DE" }}
                    startIcon={<SendIcon />}
                    className="shareButton"
                    disabled={loading}
                    loading={loading}
                  >
                    Share
                  </LoadingButton>
                </div>
              </form>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}
