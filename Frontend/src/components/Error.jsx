import "./error.css";

function Error() {

  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for doesn't exist.</p>

      <a href="/">Go Back Home</a>
    </div>
  );
}

export default Error;