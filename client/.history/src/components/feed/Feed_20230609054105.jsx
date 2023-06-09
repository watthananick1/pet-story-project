import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ReactLoading from "react-loading";

export default function Feed({ firstName, onProfile }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());

  //++++++++++++++++++ fetch Data +++++++++++++++++++

  useEffect(() => {}, [firstName, onProfile]);

  useEffect(() => {
    const source = axios.CancelToken.source();
  
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/posts/${user.member_id}/date`, {
          cancelToken: source.token,
        });
        setPosts(res.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };
  
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/posts/user/${firstName}`);
        setPosts(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (onProfile) {
      fetchUserPosts();
    } else {
      fetchPosts();
    }
  
    return () => {
      source.cancel("Component unmounted");
      console.log("Component unmounted", source);
    };
  }, [user.member_id, firstName, onProfile]);
  
  //++++++++++ function Re-Load New Post +++++++++++

  const handleNewPost = () => {
    setTimestamp(Date.now());
    setLoading(true);
  };

  return (
    <div className="feed">
      <div className="feedWrapper">
        {!firstName || firstName === user?.firstName ? (
          <Share onNewPost={handleNewPost} />
        ) : null}
        {loading ? (
          <div className="loadingWrapper">
            <ReactLoading
              type="spin"
              color="#6200E8"
              height={"10%"}
              width={"10%"}
            />
          </div>
        ) : (
          <>
            {posts.map((p, i) => (
              <Post key={i} post={p} indexPost={i} /> // No need to pass the callback function
            ))}
          </>
        )}
      </div>
    </div>
  );
}
