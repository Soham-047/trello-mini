import React, { useContext, useState } from "react";
import axios from "axios";

import globalContext from "../../context/globalContext";
import { backendUrl } from "../../static/js/const";
import { useForm } from "react-hook-form";

const LoginForm = ({ setErrMsgs }) => {
  const { register, handleSubmit, watch } = useForm();
  const userName = watch("username", "");
  const userPassword = watch("password", "");
  const { login } = useContext(globalContext);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    const url = `${backendUrl}/token/`;
    setLoading(true);

    try {
      // Normalize payload (trim username)
      const payload = {
        username: data.username?.trim(),
        password: data.password ?? "",
      };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      // If your globalContext login expects the token object, pass it
      if (res?.data) {
        // Save tokens locally if present (keeps parity with your other code)
        if (res.data.access) localStorage.setItem("access", res.data.access);
        if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);
        if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));

        login(res.data);
      } else {
        setErrMsgs({
          signup: false,
          err: true,
          msgs: { Error: "Empty response from server" },
        });
      }
    } catch (err) {
      console.error("Login error:", err);

      // Network / connection error (no response)
      if (!err.response) {
        setErrMsgs({
          signup: false,
          err: true,
          msgs: { Connection: "Refused", Server: "Maybe Down" },
        });
      } else {
        // Server responded with error status
        if (err.response.status === 401) {
          setErrMsgs({
            signup: false,
            err: true,
            msgs: { Invalid: "Invalid username or password" },
          });
        } else if (err.response.data) {
          // Pass server validation errors back to UI
          setErrMsgs({
            signup: false,
            err: true,
            msgs: err.response.data,
          });
        } else {
          setErrMsgs({
            signup: false,
            err: true,
            msgs: { Error: "Unexpected server error" },
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = userName.trim() !== "" && userPassword.trim() !== "" && !loading;

  return (
    <div className="login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="login-fieldset">
          <input
            className="sidebar-input border--gray border--onHoverBlue"
            type="text"
            name="username"
            placeholder="Username or email"
            ref={register({ required: true })}
          />
          <input
            className="sidebar-input border--gray border--onHoverBlue"
            type="password"
            name="password"
            placeholder="Password"
            ref={register({ required: true })}
          />

          {canSubmit ? (
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          ) : (
            <button className="btn btn--disabled" disabled>
              Login
            </button>
          )}
        </fieldset>
      </form>
    </div>
  );
};

export default LoginForm;