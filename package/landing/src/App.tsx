import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Howlpack.social</h1>
      <p className="info">
        The Howlpack project is not officially affiliated with the Howl project.
        We are simply fans of the Howl project and aim to build upon their
        innovative work and ideas.
      </p>
      <p>
        Howlpack is a supplementary add-on for the Howl project. It extends the
        functionality and enhances the user experience of the original Howl
        project, allowing users to further customize and optimize their
        experience.
      </p>
      <p>
        Howlpack provides ✉️ email or 🪝 webhook notifications when:
        <ul style={{ textAlign: "left", width: "50%", margin: "20px auto" }}>
          <li>A new follower is gained</li>
          <li>A new reply is received </li>
          <li>A new like is received</li>
          <li>A new howl is posted by a followed creator</li>
          <li>... and as usual much more coming</li>
        </ul>
      </p>
      <a
        href="https://beta.howl.social/howlpack"
        target={"_blank"}
        rel="noreferrer"
      >
        howl
      </a>{" "}
      |{" "}
      <a href="https://twitter.com/howlpack" target={"_blank"} rel="noreferrer">
        twitter
      </a>{" "}
      |{" "}
      <a
        href="https://github.com/howlpack/howlpack/"
        target={"_blank"}
        rel="noreferrer"
      >
        github
      </a>
      <p className="read-the-docs">
        Be sure to check{" "}
        <a href="https://beta.howl.social" target={"_blank"} rel="noreferrer">
          howl.social
        </a>{" "}
        first.
      </p>
      <p className="read-the-docs">
        Howlpack is currently under development and we are working diligently to
        deliver it to you as soon as possible. Stay tuned for updates on the
        release date and new features.
      </p>
    </div>
  );
}

export default App;
