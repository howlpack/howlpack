import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Howlpack.social</h1>
      Receive ✉️ email or 🪝 webhook notifications on
      <ul style={{ textAlign: "left" }}>
        <li>new replies</li>
        <li>new followers</li>
        <li>likes</li>
      </ul>
      <a href="https://beta.howl.social/howlpack">howl</a> |{" "}
      <a href="https://twitter.com/howlpack">twitter</a> |{" "}
      <a href="https://github.com/howlpack/howlpack/">github</a>
      <p className="read-the-docs">
        Be sure to check{" "}
        <a href="https://beta.howl.social" target={"_blank"} rel="noreferrer">
          howl.social
        </a>{" "}
        first.
      </p>
    </div>
  );
}

export default App;
