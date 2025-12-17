import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "../../utils/api";

export default function UserName() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async () => {
    setMessage("");

    if (!username) {
      setMessage("Username needed");
      return;
    }

    if (username.length > 20) {
      setMessage("Username cannot exceed 20 characters");
      return;
    }

    if (/\s/.test(username)) {
      setMessage("Username cannot contain spaces");
      return;
    }

    if (!/^[A-Za-z0-9._]+$/.test(username)) {
      setMessage("Only letters, numbers, '.' and '_' are allowed");
      return;
    }

    try {
      const res = await fetch(`${getBaseURL()}/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      console.log(data.message);
      if(!res.ok){
        setMessage(data.error);
        console.log(data.error);
        return;
      }
      
      navigate("/homepage");
    } catch (err) {
      console.log(err);
      setMessage("Server error, please try again later");
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-center">Enter your username</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full px-4 py-2 border rounded ${message ? "border-red-500" : "border-gray-300"}`}
        />
        {message && <p className=" mr-auto text-sm text-red-500 m-1">{message}</p>}
        {errors && <p className="m-1 text-red-500 text-sm">{data.errors}</p>}
        <button onClick={handleSubmit} className="bg-blue-500 m-3 max-w-[110px] py-1 px-5 rounded-2xl text-white font-bold">Submit</button>
      </div>
    </div>
  );
}
