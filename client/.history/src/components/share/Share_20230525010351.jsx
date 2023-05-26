import "./share.css";
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import {
  PermMedia,
  Cancel,
} from "@material-ui/icons";
import {
  Avatar,
  TextField,
  Button,
  Chip,
  
} from "@mui/material";
import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import ReactLoading from 'react-loading';

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

export default function Share({ setPosts }) {
  const { user } = useContext(AuthContext);
  const desc = useRef();
  const [typePets, setTypePets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setFiles(arrayMove(files, oldIndex, newIndex));
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
      return false; // Invalid file
    });
  
    // Set files only once with the filtered validFiles array
    setFiles(validFiles);
    
    // You can perform additional validations or checks on the validFiles array here
    console.log('Valid files:', validFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    setLoading(true); // Set loading state to true
  
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
        comment: []
      };
  
      await axios.post("/api/posts", newPost);
      setFiles([]); // Clear the files array
      setTypeData(null); // Reset the typeData state
      setSelectedTags([]); // Reset the selectedTags state
      desc.current.value = ""; // Clear the input field
  
      // Reload the posts
      const res = await axios.get("/api/posts/" + user.member_id);
      setPosts(
        res.data.sort((p1, p2) => {
          const date1 = new Date(
            p1.createdAt.seconds * 1000 + p1.createdAt.nanoseconds / 1000000
          );
          const date2 = new Date(
            p2.createdAt.seconds * 1000 + p2.createdAt.nanoseconds / 1000000
          );
          return date2.getTime() - date1.getTime();
        })
      );
    } catch (err) {
      console.log(err);
      setError(
        "Failed to upload files or create a new post. Please try again."
      );
    } finally {
      setLoading(false); // Set loading state to false
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
  
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  console.log(selectedTags);
  

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <Avatar
            aria-label="recipe"
            src={user.profilePicture}
            style={{ width: "39px", height: "39px" }}
          ></Avatar>
          <input
            placeholder={"What's in your mind " + user.firstName + "?"}
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
          
          <button className="shareButton" type="submit" disabled={loading}>
            {loading ? (
             <>
              <ReactLoading type="spin" color="#6200E8" height={20} width={20} />
           </>) 
           : ("Share")}
          </button>
        </form>
      </div>
    </div>
  );  
}