import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ReactLoading from 'react-loading';

export default function Feed({ firstName, onLoading }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (onLoading !== undefined || null) {
      setLoading(false);
    }
    const source = axios.CancelToken.source();
  
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts/" + user.member_id, {
          cancelToken: source.token
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
  }, [user.member_id, firstName, loading]); // Include 'posts' as a dependency
  
  const handleNewPost = () => {
    // Logic for adding a new post
    // After the new post is added, you can set the 'loading' state to true
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
            {posts.map((p) => (
              <Post key={p.id} post={p} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
