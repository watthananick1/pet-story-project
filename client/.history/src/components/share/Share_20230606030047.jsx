import "./share.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import React, { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

import { Avatar, Chip, Autocomplete, TextField, Grid } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { PermMedia, Cancel, Send as SendIcon } from "@mui/icons-material";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputBase from "@mui/material/InputBase";

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
        tagpet: selectedTags,
        img: fileUrls,
        comment: [],
        status: privacy,
      };

      await axios.post("/api/posts", newPost);
      setFiles([]);
      setTypeData(null);
      setSelectedTags([]);
      desc.current.value = "";

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
        const res = await axios.get("/api/typePets");
        setTypePets(res.data);
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

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      // Check if the maximum limit has been reached
      if (selectedTags.length >= MAX_TAGS_LIMIT) {
        return; // Ignore the click if the limit is reached
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <Grid container alignItems="center">
            <Grid item xs={3} sm={3} md={3}>
              <Avatar
                aria-label="recipe"
                src={user.profilePicture}
                sx={{ width: "39px", height: "39px", mr: 1 }}
              />

              <Autocomplete
                id="privacy-select"
                autoFocus
                disableCloseOnSelect
                fullWidth
                selectOnFocus
                autoHighlight
                options={privacyOptions}
                defaultValue={privacyOptions[0]}
                getOptionLabel={(option) => option.label}
                onChange={handlePrivacyChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    size="small"
                    sx={{ color: "#6309DE" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={2} sm={2} md={2}>
              <TextField
                fullWidth
                placeholder={`What's on your mind, ${user.firstName}?`}
                className="shareInput"
                variant="standard"
                size="small"
                rows={4}
                multiline
                inputRef={desc}
              />
            </Grid>
          </Grid>
        </div>
        <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item >
            <form className="shareBottom" onSubmit={submitHandler}>
              <div className="shareOptions">
                <div className="shareOption">
                  <label htmlFor="file" className="shareOptionLabel">
                    <PermMedia htmlColor="tomato" className="shareIcon" />
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
              <div className="shareTags"></div>
              <div className="shareBottomOptions">
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
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
          <Grid item>
          <Autocomplete
                  multiple
                  id="type-pets-select"
                  options={typePets}
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
          </Grid>
          <Grid item>
          </Grid>
          <Grid item>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
