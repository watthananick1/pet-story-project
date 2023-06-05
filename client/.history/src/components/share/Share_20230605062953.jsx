import "./share.css";
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import React, { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

import {
  Avatar,
  Chip,
  Autocomplete,
  TextField
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {
  PermMedia,
  Cancel,
  Send as SendIcon,
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

export default function Share({ onNewPost }) {
  const { user } = useContext(AuthContext);
  const desc = useRef();
  const [typePets, setTypePets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState('normal');
  
  const privacyOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Private', value: 'private' },
    { label: 'Followers', value: 'followers' },
  ];
  


  const onSortEnd = ({ oldIndex, newIndex }) => {
    setFiles(arrayMove(files, oldIndex, newIndex));
  };
  
  //++++++++++ on Click Button +++++++++++
  
  const handlePrivacyChange = (event, value) => {
    if (value) {
      setPrivacy(value.value);
    } else {
      setPrivacy('normal'); // Default to normal if no option is selected
    }
  };  
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 6); // Limit to 6 files
  
    // File size limits
    const imageMaxSize = 5 * 1024 * 1024; // 5 MB in bytes
    const videoMaxSize = 100 * 1024 * 1024; // 100 MB in bytes
  
    // Validate file sizes
    const validFiles = selectedFiles.filter((file) => {
      if (file.type.startsWith('image/') && file.size <= imageMaxSize) {
        return true; // Valid image file
      }
      if (file.type.startsWith('video/') && file.size <= videoMaxSize) {
        return true; // Valid video file
      }
      setError("The file size exceeds the specified size.");
      return false; // Invalid file
    });

    setFiles(validFiles);

    console.log('Valid files:', validFiles);
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
        status: 'normal'
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
      setError(
        "Failed to upload files or create a new post. Please try again."
      );
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
  
  //----------- ITEM OF SHARE ------------------------

  const SortableItem = SortableElement(({ item, index }) => {
  if (item.type === 'image') {
    setTypeData('image');
    return (
      <div className="shareImgItem">
        <img src={item.url} alt="Gallery Image" className="shareImg" />
        <Cancel className="shareCancelImg" onClick={() => removeFile(index)} />
      </div>
    );
  } else if (item.type === 'video') {
    setTypeData('video');
    return (
      <div className="shareVideoItem">
        <video src={item.url} className="shareVideo" controls />
        <Cancel className="shareCancelImg" onClick={() => removeFile(index)} />
      </div>
    );
  } else {
    return null; // Exclude unsupported file types
  }
});

console.log(typeData);

const SortableList = SortableContainer(({ items }) => (
  <div className="shareImgContainer">
    {items.map((item, index) => (
      <div key={index}>
        <SortableItem item={item} index={index} />
        <p>{index}</p>
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
  
  //--------------- Tag Pet ----------------------------------
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <Avatar
            aria-label="recipe"
            src={user.profilePicture}
            sx={{ width: "39px", height: "39px", mr: 1 }}
          ></Avatar>
          
          <input
            placeholder={" What's in your mind " + user.firstName + "?"}
            className="shareInput"
            ref={desc}
          />
        </div>
        <hr className="shareHr" />
        {files && files.length > 0 && (
          <SortableList
            items={files.map((file) => {
              if (file.type.startsWith('image/')) {
                return { type: 'image', url: URL.createObjectURL(file) };
              } else if (file.type.startsWith('video/')) {
                return { type: 'video', url: URL.createObjectURL(file) };
              } else {
                return null; // Exclude unsupported file types
              }
            }).filter((item) => item !== null)} // Filter out null items
            onSortEnd={onSortEnd}
            useDragHandle={true}
            axis="xy"
          />
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="tomato" className="shareIcon" />
              <span className="shareOptionText">Photo or Video</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg,.mp4"
                multiple
                onChange={handleFileChange}
              />
            </label>
            <div className="shareOption">
              {typePets && typePets.length > 0 && (
                <div className="tagContainer">
                  {typePets.map((typePet) => (
                    <Chip
                      key={typePet.id_TypePet}
                      label={typePet.nameType}
                      sx={{mr: 1}}
                      clickable
                      color={selectedTags.includes(typePet.nameType) ? "primary" : "default"}
                      onClick={() => handleTagClick(typePet.nameType)}
                      className="topChip"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <LoadingButton
            size="small"
            type="submit"
            sx={{ backgroundColor: "#6200E8" }}
            endIcon={<SendIcon />}
            loading={loading}
            loadingPosition="end"
            variant="contained"
          >
            <span>Share</span>
          </LoadingButton>
        </form>
      </div>
    </div>
  );  
}
