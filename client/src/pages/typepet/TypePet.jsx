import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import "./typepet.css";

export default function TypePet(props) {
  const [typePets, setTypePets] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const history = useHistory();

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

  const handleSelect = (typePetId) => {
    if (selectedTypes.includes(typePetId)) {
      setSelectedTypes(prevState => prevState.filter((id) => id !== typePetId));
    } else {
      setSelectedTypes(prevState => [...prevState, typePetId]);
    }
  };
  
  const isButtonPressed = (typePetId) => selectedTypes.includes(typePetId);
  
  console.log(selectedTypes);
  
  const handleSubmit = async (e) => {
    try {
      const userId = localStorage.getItem('Uid');
      // const userId = props.location.state.user.id; // get the user ID from the props
      console.log(userId);
      await axios.put(`/users/${userId}/typePets`, { typePets: selectedTypes });
      setSelectedTypes([]);
      localStorage.removeItem('Uid');
      history.push("/");
    } catch (err) {
      console.log(err);
    }
  };
  

  return (
    <div className="typePet">
      <div className="typePetContainerCard">
        <h1>What type of pet are you interested in?</h1>
        <div className="typePetContainer">
          {typePets.map((typePet) => (
            typePet.status !== false ? (
              <div
                className="typePetCard"
                key={typePet.id_TypePet}
                style={{ backgroundImage: `url(${typePet.imgPet})` }}
              >
                <div className="typePetCardBody">
                  <button
                    className={`typePetButton ${isButtonPressed(typePet.nameType) ? 'pressed' : ''}`}
                    onClick={() => handleSelect(typePet.nameType)}
                  >
                    {isButtonPressed(typePet.nameType) ? (
                      <>
                        <span className="checkmark">&#10003;</span>
                        <span className="typePetButtonText">{typePet.nameType}</span>
                      </>
                    ) : (
                      `+ ${typePet.nameType}`
                    )}
                  </button>
                </div>
              </div>
            ) : null
          ))}
        </div>
        <button className="typePetButtonSubmit" onClick={() => handleSubmit()}>
          Next
        </button>
      </div>
    </div>
  );
}
