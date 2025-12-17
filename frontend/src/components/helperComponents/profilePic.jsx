import { FaUserCircle } from "react-icons/fa";
import { getBaseURL } from "../../../utils/api";

export default function ProfilePic({ profilePic, size = 40, className = "" }) {
  return profilePic ? (
    <img
      src={`${getBaseURL()}${profilePic}`}
      alt="Profile"
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <FaUserCircle size={size} className={className} />
  );
}
