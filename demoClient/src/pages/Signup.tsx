import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpApi } from "../api/auth.api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function signUp() {
    const { status }=await signUpApi(email, name, password);
    if(status==="success"){
        navigate("/login");
    }else{
        alert("Signup failed");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="border p-6 w-80 rounded">
        <h2 className="text-lg font-bold mb-4">Sign up</h2>

        <input
          className="border p-2 w-full mb-2"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />    

        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signUp}
          className="bg-black text-white w-full p-2"
        >
          Sign Up
        </button>
        <p className="text-sm mt-2">Already have an account? <Link to="/login" className="text-blue-500 hover:cursor-pointer">Login!</Link></p>
      </div>
    </div>
  );
}
