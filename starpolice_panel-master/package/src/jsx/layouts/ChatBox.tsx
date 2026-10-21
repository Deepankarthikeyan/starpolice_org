import { useState } from "react";
import { Link } from "react-router-dom";
import Notes from "../components/chatBox/Notes";
import Alerts from "../components/chatBox/Alerts";
import Chat from "../components/chatBox/Chat";

// Define types for the props
interface ChatBoxProps {
  onClick: () => void;
  toggle?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onClick, toggle }) => {
  const [toggleTab, settoggleTab] = useState<string>(
    window.location.hash.slice(1) ? window.location.hash.slice(1) : "chat"
  );

  const dataToggle = [
    { href: "#notes", name: "Notes" },
    { href: "#alerts", name: "Alerts" },
    { href: "#chat", name: "Chat" },
  ];

  const isOpen = toggle === "chatbox";

  return (
    <div className={`chatbox ${isOpen ? "active" : ""}`}>
      <div className="chatbox-close" onClick={onClick} aria-hidden="true" />
      {isOpen && (
        <button
          type="button"
          className="spa-chatbox-backdrop"
          aria-label="Close notes panel"
          onClick={onClick}
        />
      )}
      <div className="spa-chatbox-shell">
        <div className="spa-chatbox-topbar">
          <span className="spa-chatbox-topbar-title">Notes &amp; alerts</span>
          <button type="button" className="spa-chatbox-close-btn" aria-label="Close" onClick={onClick}>
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
        <div className="custom-tab-1">
        <ul className="nav nav-tabs">
          {dataToggle.map((data, i) => (
            <li className="nav-item" key={i}>
              <Link
                className={`nav-link ${
                  toggleTab === data.name.toLocaleLowerCase() ? "active" : ""
                }`}
                data-toggle="tab"
                to={`${data.href}`}
                onClick={() => settoggleTab(data.name.toLocaleLowerCase())}
              >
                {data.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="tab-content">
          <Chat toggle={toggle} toggleTab={toggleTab} toggleChatBox={toggle === "chatbox"} />
          <Notes toggle={toggle} toggleTab={toggleTab} toggleChatBox={toggle === "chatbox"} />
          <Alerts toggle={toggle} toggleTab={toggleTab} toggleChatBox={toggle === "chatbox"} />
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
