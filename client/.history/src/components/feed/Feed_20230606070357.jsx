import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ReactLoading from 'react-loading';

export default function Feed({ firstName }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());
  
  //++++++++++++++++++ fetch Data +++++++++++++++++++

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/api/posts/${user.member_id}/date`, {
          cancelToken: source.token,
          // params: { timestamp } // Pass the timestamp as a query parameter
        });
        setPosts(
          res.data.sort((p1, p2) => {
            const date1 = new Date(p1.createdAt.seconds * 1000 + p1.createdAt.nanoseconds / 1000000);
            const date2 = new Date(p2.createdAt.seconds * 1000 + p2.createdAt.nanoseconds / 1000000);
            return date2.getTime() - date1.getTime();
          })
        );
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled:', err.message);
        } else {
          console.log(err);
        }
        setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      source.cancel('Component unmounted');
      console.log('Component unmounted', source);
    };
  }, [user.member_id, timestamp]);
  
  //++++++++++ function Re-Load New Post +++++++++++

  const handleNewPost = () => {
    setTimestamp(Date.now());
    setLoading(true);
  };

  return (
    <div className="feed">
      <div className="feedWrapper">
        {!firstName || firstName === user?.firstName ? <Share onNewPost={handleNewPost} /> : null}
        {loading ? (
          <div className="loadingWrapper">
            <ReactLoading type="spin" color="#6200E8" height={'10%'} width={'10%'} />
          </div>
        ) : (
          <>
            {posts.map((p, i) => (
              <Post key={p.id} post={p} indexPost /> // No need to pass the callback function
            ))}
          </>
        )}
      </div>
    </div>
  );
}

